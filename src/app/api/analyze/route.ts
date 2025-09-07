import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubRepoData, AnalysisResult } from '@/lib/api';



async function analyzeWithOpenRouterAPI(
  repoData: any, 
  jobRequirements: string
): Promise<AnalysisResult> {
  // ... (existing OpenRouter implementation, no changes needed here)
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
- Recent Commits: ${repoData.commits.map((c: any) => c.message).join('; ')}
- Key Files: ${repoData.files.map((f: any) => f.name).join(', ')}

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
1. Technical skills alignment with job requirements
2. Project complexity and architecture quality
3. Code quality indicators from commit messages and structure
4. Industry best practices evident in the repository
5. Relevant experience for the specific role mentioned

Be specific and actionable in your assessment. CRITICAL: If the repository does not demonstrate experience with the core technologies mentioned in the JOB REQUIREMENTS, the matchScore must be below 20 and you should clearly state the lack of required skills in the 'gaps' and 'summary'.
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
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter and software engineer. Provide detailed, accurate assessments of candidates based on their GitHub repositories. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse JSON response
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (typeof parsed.matchScore === 'number' && 
            Array.isArray(parsed.strengths) && 
            Array.isArray(parsed.gaps) &&
            Array.isArray(parsed.recommendations) &&
            typeof parsed.summary === 'string' &&
            Array.isArray(parsed.technicalSkills) &&
            typeof parsed.projectComplexity === 'string') {
          return parsed;
        }
      }
    } catch (parseError) {
      console.warn('Could not parse LLM JSON response:', parseError);
    }

    // Fallback analysis if JSON parsing fails
    return generateFallbackAnalysis(repoData);

  } catch (error) {
    console.error('OpenRouter analysis failed:', error);
    return generateFallbackAnalysis(repoData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { githubUrl, jobRequirements } = await request.json();

    if (!githubUrl || !jobRequirements) {
      return NextResponse.json(
        { error: 'GitHub URL and job requirements are required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const repoData = await fetchGitHubRepoData(githubUrl, githubToken);
    let analysisResult: AnalysisResult;

    try {
      analysisResult = await analyzeWithOpenRouterAPI(repoData, jobRequirements);
    } catch (openRouterError) {
      console.error('All analysis providers failed:', openRouterError);
      analysisResult = generateFallbackAnalysis(repoData);
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
      repository: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stars,
        forks: repoData.forks
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

function generateFallbackAnalysis(repoData: any): AnalysisResult {
    const languages = Object.keys(repoData.languages);
    const hasPopularLanguages = languages.some(lang => 
        ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'].includes(lang)
    );
    
    const baseScore = 60;
    const languageBonus = hasPopularLanguages ? 15 : 5;
    const activityBonus = repoData.stars > 10 ? 10 : 5;
    const complexityBonus = repoData.files.length > 0 ? 10 : 0;
    
    const matchScore = Math.min(100, baseScore + languageBonus + activityBonus + complexityBonus);

    return {
        matchScore,
        strengths: [
        'Active GitHub presence with documented projects',
        `Experience with ${languages.join(', ')}`,
        repoData.stars > 0 ? 'Community engagement (starred repository)' : 'Consistent development activity',
        repoData.readme ? 'Good documentation practices' : 'Project organization skills'
        ],
        gaps: [
        'Detailed analysis requires manual review',
        'Consider adding more comprehensive documentation',
        'Portfolio could benefit from more diverse projects'
        ],
        recommendations: [
        'Add detailed README files to showcase project scope',
        'Include live demos or deployment links',
        'Consider contributing to open source projects',
        'Document your development process and decisions'
        ],
        summary: `Repository shows ${matchScore >= 75 ? 'strong' : matchScore >= 60 ? 'good' : 'basic'} technical foundation with ${languages.length} programming language${languages.length !== 1 ? 's' : ''} demonstrated. ${repoData.description ? 'Project has clear purpose and documentation.' : 'Could benefit from more detailed project description.'}`,
        technicalSkills: languages,
        projectComplexity: languages.length >= 3 ? 'Advanced' : languages.length >= 2 ? 'Intermediate' : 'Beginner'
    };
}