// GitHub API and LLM integration utilities

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  readme: string;
  files: Array<{
    name: string;
    content: string;
    language: string;
  }>;
  commits: Array<{
    message: string;
    date: string;
  }>;
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
  technicalSkills: string[];
  projectComplexity: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Extract GitHub username and repo from URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
}

// Fetch GitHub repository data
export async function fetchGitHubRepoData(url: string, token: string): Promise<GitHubRepo> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo } = parsed;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    // Fetch basic repo info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    // Fetch languages
    const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers
    });
    const languages = languagesResponse.ok ? await languagesResponse.json() : {};

    // Fetch README
    let readme = '';
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers
      });
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        readme = atob(readmeData.content);
      }
    } catch (error) {
      console.warn('Could not fetch README:', error);
    }

    // Fetch recent commits
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, {
      headers
    });
    const commits = commitsResponse.ok ? await commitsResponse.json() : [];

    // Fetch key files (package.json, requirements.txt, etc.)
    const files: Array<{ name: string; content: string; language: string }> = [];
    const keyFiles = ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml', 'Gemfile'];
    
    for (const fileName of keyFiles) {
      try {
        const fileResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
          headers
        });
        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          files.push({
            name: fileName,
            content: atob(fileData.content),
            language: getLanguageFromFile(fileName)
          });
        }
      } catch {
        // File doesn't exist, continue
      }
    }

    return {
      name: repoData.name,
      description: repoData.description || '',
      language: repoData.language || '',
      languages,
      topics: repoData.topics || [],
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      readme,
      files,
      commits: commits.slice(0, 5).map((commit: { commit: { message: string; author: { date: string } } }) => ({
        message: commit.commit.message,
        date: commit.commit.author.date
      }))
    };
  } catch (error) {
    throw new Error(`Failed to fetch GitHub data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getLanguageFromFile(fileName: string): string {
  const extensions: Record<string, string> = {
    'package.json': 'JavaScript/Node.js',
    'requirements.txt': 'Python',
    'Cargo.toml': 'Rust',
    'go.mod': 'Go',
    'pom.xml': 'Java',
    'Gemfile': 'Ruby'
  };
  return extensions[fileName] || 'Unknown';
}

// Analyze repository with blackbox.ai LLM
export async function analyzeWithLLM(repoData: GitHubRepo, jobRequirements: string): Promise<AnalysisResult> {
  const prompt = `
You are an expert technical recruiter and software engineer. Analyze the following GitHub repository against the job requirements and provide a detailed assessment.

REPOSITORY DATA:
- Name: ${repoData.name}
- Description: ${repoData.description}
- Primary Language: ${repoData.language}
- Languages Used: ${Object.keys(repoData.languages).join(', ')}
- Topics/Tags: ${repoData.topics.join(', ')}
- Stars: ${repoData.stars}
- Forks: ${repoData.forks}
- README Preview: ${repoData.readme.substring(0, 1000)}...
- Recent Commits: ${repoData.commits.map(c => c.message).join('; ')}
- Key Files: ${repoData.files.map(f => f.name).join(', ')}

JOB REQUIREMENTS:
${jobRequirements}

Please provide a comprehensive analysis in the following JSON format:
{
  "matchScore": <number between 0-100>,
  "strengths": [<array of candidate's strengths based on the repo>],
  "gaps": [<array of skills/requirements not evident in the repo>],
  "recommendations": [<array of suggestions for improvement>],
  "summary": "<brief overall assessment>",
  "technicalSkills": [<array of technical skills demonstrated>],
  "projectComplexity": "<Beginner|Intermediate|Advanced>"
}

Focus on:
1. Technical skills alignment
2. Project complexity and architecture
3. Code quality indicators
4. Industry best practices
5. Relevant experience for the role
`;

  try {
    const response = await fetch('https://api.blackbox.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BLACKBOX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'blackbox',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter and software engineer. Provide detailed, accurate assessments of candidates based on their GitHub repositories.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse JSON response
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse LLM JSON response, using fallback', parseError);
    }

    // Fallback analysis if JSON parsing fails
    return {
      matchScore: 75,
      strengths: ['Active GitHub presence', 'Diverse technology stack'],
      gaps: ['Analysis pending - please try again'],
      recommendations: ['Continue building projects', 'Add more documentation'],
      summary: 'Repository shows good technical foundation with room for growth.',
      technicalSkills: Object.keys(repoData.languages),
      projectComplexity: 'Intermediate' as const
    };

  } catch (apiError) {
    throw new Error(`LLM analysis failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }
}

// Alternative LLM analysis using OpenRouter (backup option)
export async function analyzeWithOpenRouter(repoData: GitHubRepo, jobRequirements: string): Promise<AnalysisResult> {
  const prompt = `
Analyze this GitHub repository against job requirements:

Repository: ${repoData.name}
Description: ${repoData.description}
Languages: ${Object.keys(repoData.languages).join(', ')}
Topics: ${repoData.topics.join(', ')}

Job Requirements: ${jobRequirements}

Provide analysis as JSON with matchScore (0-100), strengths array, gaps array, recommendations array, summary string, technicalSkills array, and projectComplexity (Beginner/Intermediate/Advanced).
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stratos-analyzer.com',
        'X-Title': 'Stratos GitHub Analyzer'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: Record<string, unknown> = await response.json();
    const analysisText = (data.choices as Array<{ message: { content: string } }>)[0].message.content;
    
    // Parse JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse LLM response');

  } catch (apiError) {
    throw new Error(`OpenRouter analysis failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }
}
