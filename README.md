# 🚀 Stratos: AI-Powered Tech Talent Discovery Platform

![Stratos Logo](public/stratos-logo.svg)

Stratos revolutionizes tech talent discovery by leveraging AI to match GitHub developers with your specific hiring requirements. Visualize talent relationships through interactive maps and access detailed developer profiles - all in one platform.

## 🌟 Key Features

- **🗺️ Interactive Talent Map** - Visualize developer profiles showing skill proximity and match scores
- **🧠 AI-Powered Matching** - Advanced algorithms analyze thousands of GitHub profiles
- **📊 Detailed Profiles** - Complete developer profiles with contact info, skills, and project analysis
- **⚡ Real-time Search** - Instantly find developers based on your requirements
- **🔍 Deep Analysis** - Detailed breakdown of developer skills and experience

## 🔬 Analysis Algorithms & Matching System

### Profile Analysis Engine
Stratos employs sophisticated algorithms to analyze developer profiles and repositories:

#### **Repository Analysis**
- **Code Quality Assessment**: Analyzes project structure, documentation quality, and coding standards
- **Technology Stack Detection**: Identifies programming languages, frameworks, and tools used
- **Project Complexity Evaluation**: Assesses architectural patterns and project sophistication
- **Contribution Patterns**: Examines commit frequency, code review participation, and collaboration

#### **Skill Extraction & Matching**
- **Multi-source Skill Detection**: Extracts skills from repositories, README files, and project descriptions
- **Semantic Matching**: Uses AI to understand skill relationships and equivalencies
- **Experience Level Assessment**: Evaluates proficiency based on project complexity and usage patterns
- **Technology Trend Analysis**: Identifies modern vs. legacy technology usage

#### **Match Score Calculation**
The matching algorithm considers multiple factors:
1. **Technical Skills Alignment** (40%): Direct match with required technologies
2. **Project Quality & Complexity** (25%): Code organization and architectural decisions  
3. **Recent Activity & Engagement** (20%): Active development and community participation
4. **Experience Depth** (15%): Years of experience and project diversity

#### **Profile Scoring Methodology**
- **Base Score**: 60 points for active GitHub presence
- **Skill Bonuses**: +5 points per matching technology (up to 25 points)
- **Quality Indicators**: +10 points for well-documented projects
- **Community Engagement**: +10 points for stars, forks, and contributions
- **Recency Bonus**: +5 points for recent activity (last 12 months)

### Repository Matching Process
1. **Requirement Analysis**: AI extracts key technologies and skills from job descriptions
2. **Repository Scanning**: Searches GitHub for projects matching technology criteria
3. **Developer Profiling**: Analyzes repository owners and contributors
4. **Compatibility Scoring**: Calculates match percentage based on multiple criteria
5. **Ranking & Filtering**: Sorts candidates by relevance and filters by minimum thresholds

## 🛠️ Technology Stack

- **Frontend**: 
  - ![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js) 
  - ![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
  - ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
  - ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwind-css)

- **Visualization**:
  - ![Three.js](https://img.shields.io/badge/Three.js-0.180.0-black?logo=three.js)
  - ![Recharts](https://img.shields.io/badge/Recharts-3.1.2-FF6384)

- **AI Integration**:
  - ![OpenRouter](https://img.shields.io/badge/OpenRouter-API-FF6B6B)

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- GitHub Personal Access Token
- OpenRouter API Key

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/stratos.git

# Navigate to project directory
cd stratos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Configuration
Add your credentials to `.env`:
```env
GITHUB_TOKEN=your_github_personal_access_token
OPENROUTER_API_KEY=your_openrouter_api_key
```

#### Getting Your API Keys

**GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `public_repo` scope
3. Copy the token to your `.env` file

**OpenRouter API Key:**
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the key to your `.env` file

### Running the Application
```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 API Endpoints

### `POST /api/match-users`
Matches developers based on job requirements using AI-powered analysis.

**Request Body**:
```json
{
  "requirements": "Senior Full-stack developer with React and Node.js experience"
}
```

**Response**:
```json
{
  "success": true,
  "developers": [
    {
      "id": "12345",
      "name": "John Doe",
      "username": "johndoe",
      "matchScore": 85,
      "skills": ["React", "Node.js", "TypeScript"],
      "topLanguages": ["JavaScript", "TypeScript", "Python"],
      "github": "https://github.com/johndoe",
      "topRepos": [...]
    }
  ],
  "summary": {
    "essentialSkills": ["React", "Node.js"],
    "techStack": ["JavaScript", "TypeScript", "React", "Node.js"],
    "expertise": ["Frontend", "Backend"],
    "role": "Senior Full-stack Developer"
  }
}
```

### `POST /api/analyze-profile`
Performs deep analysis of a specific GitHub profile including code quality assessment.

**Request Body**:
```json
{
  "username": "github-username",
  "requirements": "Full-stack developer position requirements"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "developer": {
      "name": "John Doe",
      "username": "johndoe",
      "bio": "Full-stack developer passionate about React and Node.js"
    },
    "codeQualityAnalysis": {
      "overallScore": 85,
      "codeStructure": "Well-organized with clear separation of concerns",
      "documentation": "Comprehensive README and inline comments",
      "testCoverage": "Good test coverage with unit and integration tests",
      "bestPractices": "Follows modern development practices"
    },
    "skillsAssessment": {
      "technicalSkills": ["React", "Node.js", "TypeScript"],
      "projectComplexity": "Advanced",
      "experienceLevel": "5+ years based on project history"
    }
  }
}
```

### `POST /api/analyze`
Analyzes a specific GitHub repository against job requirements.

**Request Body**:
```json
{
  "githubUrl": "https://github.com/username/repository",
  "jobRequirements": "React developer with TypeScript experience"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "matchScore": 78,
    "strengths": ["Strong React expertise", "TypeScript implementation"],
    "gaps": ["Limited testing coverage", "No CI/CD pipeline"],
    "recommendations": ["Add comprehensive tests", "Implement automated deployment"],
    "summary": "Strong technical foundation with modern React patterns",
    "technicalSkills": ["React", "TypeScript", "JavaScript"],
    "projectComplexity": "Intermediate"
  },
  "repository": {
    "name": "awesome-react-app",
    "description": "A modern React application with TypeScript",
    "language": "TypeScript",
    "stars": 42,
    "forks": 8
  }
}
```

## 📸 Screenshots

| ![Search Interface](public/window.svg) | ![Talent Map](public/globe.svg) |
|----------------------------------------|---------------------------------|
| **Search Interface**                   | **Interactive Talent Map**      |

## 🤝 Contributing
Contributions are welcome! Please create an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
