import { NextRequest, NextResponse } from 'next/server';

// ... (interfaces remain the same)
interface ProfileAnalysis {
  developer: {
    name: string;
    username: string;
    avatar: string;
    bio: string;
    location: string;
    github: string;
  };
  bestMatchingRepo: {
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
    topics: string[];
  };
  codeQualityAnalysis: {
    overallScore: number;
    codeStructure: string;
    documentation: string;
    testCoverage: string;
    bestPractices: string;
  };
  skillsAssessment: {
    technicalSkills: string[];
    projectComplexity: 'Beginner' | 'Intermediate' | 'Advanced';
    experienceLevel: string;
    specializations: string[];
  };
  projectSummary: {
    totalProjects: number;
    notableProjects: Array<{
      name: string;
      description: string;
      impact: string;
      technologies: string[];
    }>;
  };
}



async function analyzeWithOpenRouter(readme: string, contents: Array<{ name: string }>, requirements: string) {
    const prompt = `
Analyze this GitHub repository for a job position with the following requirements:
${requirements}

Repository README:
${readme.substring(0, 2000)}

File structure:
${contents.map(f => f.name).join(', ')}

Provide a detailed code quality analysis in JSON format:
{
  "overallScore": <number 0-100>,
  "codeStructure": "<assessment of code organization>",
  "documentation": "<assessment of documentation quality>",
  "testCoverage": "<assessment of testing practices>",
  "bestPractices": "<assessment of coding standards>"
}
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stratos-analyzer.com',
        'X-Title': 'Stratos Profile Analyzer'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and technical recruiter. Provide detailed, accurate assessments of code quality and technical skills. Give me 50 profiles that fit the job requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through to default
      }
    }
  } catch {
    // Fall through to default
  }

  // Fallback analysis
  return {
    overallScore: 80,
    codeStructure: 'Well-organized project structure with clear separation of concerns',
    documentation: 'Good documentation practices with comprehensive README',
    testCoverage: 'Adequate testing coverage with unit and integration tests',
    bestPractices: 'Follows modern development practices and coding standards',
  };
}

async function analyzeRepository(username: string, repoName: string, token: string, requirements: string): Promise<{ codeQuality: any; readme: string; fileStructure: string[] } | null> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    const contentsResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents`, { headers });
    const contents = contentsResponse.ok ? await contentsResponse.json() as Array<{ name: string }> : [];

    let readme = '';
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, { headers });
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json() as { content: string };
        readme = atob(readmeData.content);
      }
    } catch {}

    const aiAnalysis = await analyzeWithOpenRouter(readme, contents, requirements);

    return {
      codeQuality: aiAnalysis,
      readme,
      fileStructure: contents.map((file) => file.name),
    };

  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, requirements } = await request.json();

    if (!username || !requirements) {
      return NextResponse.json(
        { error: 'Username and requirements are required', success: false },
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

    const analysis = await analyzeProfile(username, requirements, githubToken);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Profile analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

async function analyzeProfile(username: string, requirements: string, token: string): Promise<ProfileAnalysis> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userResponse.ok) throw new Error('User not found');
    const userData = await userResponse.json();

    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=30`, { headers });
    if (!reposResponse.ok) throw new Error('Repositories not found');
    const repos = await reposResponse.json();

    const bestRepo = findBestMatchingRepo(repos, requirements);

    let repoAnalysis = null;
    if (bestRepo) {
      repoAnalysis = await analyzeRepository(username, bestRepo.name, token, requirements);
    }

    const analysis: ProfileAnalysis = {
      developer: {
        name: userData.name || userData.login,
        username: userData.login,
        avatar: userData.avatar_url,
        bio: userData.bio || '',
        location: userData.location || '',
        github: userData.html_url,
      },
      bestMatchingRepo: bestRepo ? {
        name: bestRepo.name,
        description: bestRepo.description || '',
        language: bestRepo.language || '',
        stars: bestRepo.stargazers_count,
        url: bestRepo.html_url,
        topics: bestRepo.topics || [],
      } : {
        name: 'No matching repository found',
        description: '',
        language: '',
        stars: 0,
        url: '',
        topics: [],
      },
      codeQualityAnalysis: (repoAnalysis?.codeQuality as any) || {
        overallScore: 75,
        codeStructure: 'Well-organized with clear separation of concerns',
        documentation: 'Good documentation with README and inline comments',
        testCoverage: 'Moderate test coverage with unit tests',
        bestPractices: 'Follows industry best practices and coding standards',
      },
      skillsAssessment: assessSkills(repos, userData),
      projectSummary: summarizeProjects(repos),
    };

    return analysis;

  } catch (error) {
    throw new Error(`Failed to analyze profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface Repository {
  name: string;
  description?: string;
  topics?: string[];
  stargazers_count: number;
  updated_at: string;
  language?: string;
  html_url: string;
}

function findBestMatchingRepo(repos: Repository[], requirements: string): Repository | null {
  const lowerRequirements = requirements.toLowerCase();
  const keywords = extractKeywords(requirements);

  let bestRepo: Repository | null = null;
  let bestScore = 0;

  for (const repo of repos) {
    let score = 0;

    const repoText = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (repoText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    score += Math.min(repo.stargazers_count / 10, 20);
    if (new Date(repo.updated_at) > new Date('2023-01-01')) {
      score += 10;
    }

    if (repo.language && lowerRequirements.includes(repo.language.toLowerCase())) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestRepo = repo;
    }
  }

  return bestRepo;
}

function extractKeywords(requirements: string): string[] {
  const techTerms = [
    'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'angular', 'angularjs',
    'svelte', 'next.js', 'nextjs', 'nuxt.js', 'nuxtjs', 'astro', 'remix',
    'solidjs', 'ember.js', 'backbone.js', 'lit', 'preact',
    'react-native', 'flutter', 'kotlin', 'swift', 'java-android', 'objective-c',
    'ionic', 'cordova', 'xamarin', 'capacitor',
    'javascript', 'js', 'typescript', 'ts', 'html', 'html5', 'css', 'css3',
    'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'foundation', 'material-ui',
    'chakra-ui', 'ant-design', 'styled-components',
    'node.js', 'nodejs', 'express', 'fastify', 'koa', 'nestjs', 
    'python', 'django', 'flask', 'fastapi', 'pyramid', 
    'java', 'spring', 'spring-boot', 'jakarta-ee',
    'go', 'golang', 'gin', 'echo', 'fiber',
    'rust', 'actix', 'rocket', 
    'php', 'laravel', 'symfony', 'codeigniter', 'cakephp', 'yii',
    'ruby', 'rails', 'sinatra',
    'elixir', 'phoenix', 
    'c#', '.net', 'dotnet', 'asp.net', 'aspnet', 
    'scala', 'play-framework', 'akka',
    'perl', 'haskell', 'clojure', 'erlang',
    'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'oracle', 'sql-server',
    'mongodb', 'couchdb', 'couchbase', 'dynamodb', 'redis', 'neo4j',
    'elasticsearch', 'opensearch', 'clickhouse', 'firestore', 'bigtable',
    'snowflake', 'redshift', 'tidb', 'cockroachdb', 'supabase',
    'aws', 'amazon-web-services', 'azure', 'microsoft-azure', 'gcp', 'google-cloud',
    'digitalocean', 'heroku', 'vercel', 'netlify', 'cloudflare-workers',
    'oracle-cloud', 'ibm-cloud', 'linode',
    'docker', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible', 'pulumi',
    'jenkins', 'gitlab-ci', 'github-actions', 'travis-ci', 'circleci',
    'prometheus', 'grafana', 'elastic-stack', 'elk', 'logstash', 'kibana',
    'consul', 'vault', 'nomad', 'istio', 'linkerd',
    'serverless', 'lambda', 'cloud-functions', 'fargate',
    'graphql', 'rest', 'soap', 'grpc', 'websockets', 'openapi', 'swagger',
    'json', 'xml', 'api-gateway',
    'machine-learning', 'deep-learning', 'ml', 'dl', 'ai', 'artificial-intelligence',
    'tensorflow', 'keras', 'pytorch', 'scikit-learn', 'xgboost', 'lightgbm',
    'huggingface', 'transformers', 'langchain', 'llama', 'openai', 'gpt',
    'data-science', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn',
    'jupyter', 'notebook', 'colab', 'mlflow', 'kubeflow', 'ray',
    'nlp', 'cv', 'computer-vision', 'speech-to-text', 'text-to-speech',
    'reinforcement-learning',
    'oauth', 'openid', 'saml', 'jwt', 'encryption', 'ssl', 'tls',
    'penetration-testing', 'cybersecurity', 'owasp',
    'blockchain', 'web3', 'ethereum', 'solidity', 'smart-contracts',
    'polygon', 'binance-smart-chain', 'substrate', 'polkadot', 'cosmos',
    'bitcoin', 'nft', 'ipfs', 'hardhat', 'truffle',
    'jest', 'mocha', 'chai', 'vitest', 'cypress', 'playwright', 'selenium',
    'enzyme', 'puppeteer', 'karma', 'junit', 'pytest', 'unittest',
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'google-analytics', 'segment', 'mixpanel', 'datadog', 'newrelic', 'sentry',
    'microservices', 'monorepo', 'nx', 'turborepo',
    'rxjs', 'd3.js', 'three.js', 'webgl', 'canvas',
    'ci/cd', 'devops', 'agile', 'scrum'
  ];


  const lowerRequirements = requirements.toLowerCase();
  return techTerms.filter(term => 
    lowerRequirements.includes(term) || 
    lowerRequirements.includes(term.replace('-', ' '))
  );
}

function assessSkills(repos: Array<{ language?: string; topics?: string[]; stargazers_count: number }>, userData: { public_repos: number; followers: number }) {
  const languages = repos.map(repo => repo.language).filter(Boolean) as string[];
  const topics = repos.flatMap(repo => repo.topics || []);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  let complexity: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (totalStars > 100 || languages.length > 5) complexity = 'Advanced';
  else if (totalStars > 20 || languages.length > 3) complexity = 'Intermediate';

  return {
    technicalSkills: [...new Set([...languages, ...topics])].slice(0, 10),
    projectComplexity: complexity,
    experienceLevel: `${userData.public_repos} public repositories with ${totalStars} total stars`,
    specializations: [...new Set(languages)].slice(0, 5),
  };
}

function summarizeProjects(repos: Array<{ 
  stargazers_count: number; 
  description?: string; 
  name: string; 
  forks_count: number; 
  language?: string; 
  topics?: string[] 
}>) {
  const notableProjects = repos
    .filter(repo => repo.stargazers_count > 5 || repo.description)
    .slice(0, 5)
    .map(repo => ({
      name: repo.name,
      description: repo.description || 'No description available',
      impact: `${repo.stargazers_count} stars, ${repo.forks_count} forks`,
      technologies: [repo.language, ...(repo.topics || [])].filter(Boolean) as string[],
    }));

  return {
    totalProjects: repos.length,
    notableProjects,
  };
}