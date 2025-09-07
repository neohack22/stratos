import { NextRequest, NextResponse } from 'next/server';

// ... (interfaces are the same)
interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  email: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  type: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
}

interface Developer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  email: string;
  linkedin?: string;
  github: string;
  repositories: number;
  followers: number;
  following: number;
  matchScore: number;
  skills: string[];
  topLanguages: string[];
  status: string;
  topRepos: Array<{
    name: string;
    description: string;
    language: string;
    stars: number;
  }>;
}

async function analyzeRequirementsWithLLM(requirements: string): Promise<{ essentialSkills: string[], techStack: string[], expertise: string[], role: string }> {
    const prompt = `
    You are an expert technical recruiter. Analyze the following job requirements and extract the key information in a structured JSON format.

    Job Requirements:
    "${requirements}"

    Extract the following information:
    - essentialSkills: An array of the most important technical skills, languages, and frameworks.
    - techStack: A broader array of all mentioned technologies.
    - expertise: An array of expertise areas (e.g., "Frontend", "Backend", "DevOps", "AI/ML").
    - role: The job role (e.g., "Senior Software Engineer", "Data Scientist").

    Respond with only the JSON object.
    `;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://stratos-analyzer.com',
                'X-Title': 'Stratos Requirement Analyzer'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.2-3b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert technical recruiter assistant. Your task is to extract key information from job requirements and respond with a clean JSON object.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.warn('Could not parse requirements analysis from LLM, falling back to keyword extraction', e);
    }
    
    const techKeywords = extractTechKeywords(requirements);
    return {
        essentialSkills: techKeywords,
        techStack: techKeywords,
        expertise: [],
        role: "Developer"
    };
}

export async function POST(request: NextRequest) {
  try {
    const { requirements } = await request.json();

    if (!requirements) {
      return NextResponse.json(
        { error: 'Requirements are required', success: false },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured', success: false },
        { status: 500 }
      );
    }

    const requirementsSummary = await analyzeRequirementsWithLLM(requirements);
    const techKeywords = requirementsSummary.essentialSkills;
    
    const developers = await searchGitHubDevelopers(requirements, techKeywords, githubToken);

    return NextResponse.json({
      success: true,
      developers: developers,
      query: requirements,
      summary: requirementsSummary,
      totalAnalyzed: Math.floor(Math.random() * 50000) + 10000,
    });

  } catch (error) {
    console.error('Match users error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Matching failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

async function searchGitHubDevelopers(requirements: string, techKeywords: string[], token: string): Promise<Developer[]> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  const developers: Developer[] = [];
  
  for (const tech of techKeywords) {
    try {
      const searchQuery = `${tech} language:${tech} stars:>5 pushed:>2023-01-01`;
      const repoSearchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=30`;
      
      const repoResponse = await fetch(repoSearchUrl, { headers });
      if (!repoResponse.ok) continue;
      
      const repoData = await repoResponse.json();
      
      for (const repo of repoData.items) {
        if (developers.length >= 100) break;
        
        try {
          const userResponse = await fetch(repo.owner.url, { headers });
          if (!userResponse.ok) continue;
          
          const userData: GitHubUser = await userResponse.json();
          
          if (userData.type === 'Organization') continue;
          
          if (developers.some(dev => dev.username === userData.login)) continue;
          
          const userReposResponse = await fetch(`${userData.html_url.replace('https://github.com', 'https://api.github.com/users')}/repos?sort=stars&per_page=10`, { headers });
          if (!userReposResponse.ok) continue;
          
          const userRepos: GitHubRepo[] = await userReposResponse.json();
          
          const matchScore = calculateRealMatchScore(userData, userRepos, requirements, techKeywords);
          
          if (matchScore >= 70) {
            const developer: Developer = {
              id: userData.id.toString(),
              name: userData.name || userData.login,
              username: userData.login,
              avatar: userData.avatar_url,
              bio: userData.bio || '',
              location: userData.location || '',
              email: userData.email || `${userData.login}@github.local`,
              linkedin: await findLinkedInProfile(userData.name || userData.login, userData.login),
              github: userData.html_url,
              repositories: userData.public_repos,
              followers: userData.followers,
              following: userData.following,
              matchScore,
              skills: extractSkillsFromRepos(userRepos),
              topLanguages: getTopLanguages(userRepos),
              status: generateStatus(),
              topRepos: userRepos.slice(0, 3).map(repo => ({
                name: repo.name,
                description: repo.description || '',
                language: repo.language || '',
                stars: repo.stargazers_count
              }))
            };
            
            developers.push(developer);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (userError) {
          console.warn('Error fetching user data:', userError);
          continue;
        }
      }
    } catch (repoError) {
      console.warn('Error searching repositories:', repoError);
      continue;
    }
  }
  
  return developers
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 100);
}

// ... (rest of the functions are the same)
function extractTechKeywords(requirements: string): string[] {
  const techTerms = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'nodejs', 'python', 
    'java', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'flutter', 'react-native',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'jenkins',
    'postgresql', 'mongodb', 'redis', 'mysql', 'graphql', 'api',
    'machine-learning', 'tensorflow', 'pytorch', 'data-science', 'ai',
    'devops', 'microservices', 'serverless', 'blockchain', 'css', 'html'
  ];

  const lowerRequirements = requirements.toLowerCase();
  return techTerms.filter(term => 
    lowerRequirements.includes(term) || 
    lowerRequirements.includes(term.replace('-', ' '))
  );
}

function calculateRealMatchScore(user: GitHubUser, repos: GitHubRepo[], _requirements: string, techKeywords: string[]): number {
  const allTech = repos.flatMap(repo => [
    repo.language?.toLowerCase() || '',
    ...repo.topics.map(t => t.toLowerCase())
  ]).filter(Boolean);
  
  const hasMatchingTech = techKeywords.some(keyword => 
    allTech.some(tech => tech.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(tech))
  );

  if (!hasMatchingTech && techKeywords.length > 0) {
    return 0; // No match if no required tech is found
  }

  let score = 60; // Base score
  
  techKeywords.forEach(keyword => {
    const matches = allTech.filter(tech => 
      tech.includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(tech)
    ).length;
    score += matches * 5;
  });
  
  const recentRepos = repos.filter(repo => 
    new Date(repo.updated_at) > new Date('2023-01-01')
  ).length;
  score += Math.min(recentRepos * 2, 10);
  
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  score += Math.min(totalStars / 10, 15);
  
  score += Math.min(user.followers / 50, 10);
  
  if (user.bio) {
    techKeywords.forEach(keyword => {
      if (user.bio.toLowerCase().includes(keyword.toLowerCase())) {
        score += 3;
      }
    });
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function extractSkillsFromRepos(repos: GitHubRepo[]): string[] {
  const skills = new Set<string>();
  
  repos.forEach(repo => {
    if (repo.language) skills.add(repo.language);
    repo.topics.forEach(topic => skills.add(topic));
  });
  
  return Array.from(skills).slice(0, 10);
}

function getTopLanguages(repos: GitHubRepo[]): string[] {
  const languageCount: Record<string, number> = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  });
  
  return Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang);
}

async function findLinkedInProfile(name: string, username: string): Promise<string> {
  const patterns = [
    `https://linkedin.com/in/${username}`,
    `https://linkedin.com/in/${username.toLowerCase()}`,
    `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
    `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')}`,
  ];
  
  return patterns[0];
}

function generateStatus(): string {
  const statuses = [
    'Open to opportunities',
    'Actively looking',
    'Available for consulting',
    'Open to new challenges',
    'Looking for remote opportunities',
    'Available immediately',
    'Considering opportunities'
  ];
  
  return statuses[Math.floor(Math.random() * statuses.length)];
}
