"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface ProfileDashboardProps {
  username: string;
  requirements: string;
  onBack: () => void;
}

export function ProfileDashboard({ username, requirements, onBack }: ProfileDashboardProps) {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/analyze-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            requirements,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        setAnalysis(data.analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    analyzeProfile();
  }, [username, requirements]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" className="border-gray-300">
                ← Back to Results
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Analyzing Profile</h1>
                <p className="text-sm text-gray-600">@{username}</p>
              </div>
            </div>
            <Image src="/stratos-logo.svg" alt="Stratos" width={32} height={32} className="h-8 w-auto" />
          </div>
        </header>

        {/* Loading Content */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Deep Analysis in Progress</h2>
            <div className="space-y-2 text-gray-600">
              <p>🔍 Analyzing repositories and code quality...</p>
              <p>📊 Evaluating technical skills and experience...</p>
              <p>🎯 Matching against job requirements...</p>
              <p>📝 Generating comprehensive insights...</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">This may take 15-30 seconds</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="outline" className="border-gray-300">
              ← Back to Results
            </Button>
            <Image src="/stratos-logo.svg" alt="Stratos" width={32} height={32} className="h-8 w-auto" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              Back to Results
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" className="border-gray-300">
              ← Back to Results
            </Button>
            <div className="flex items-center space-x-3">
              <Image
                src={analysis.developer.avatar}
                alt={analysis.developer.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{analysis.developer.name}</h1>
                <p className="text-sm text-gray-600">@{analysis.developer.username}</p>
              </div>
            </div>
          </div>
          <Image src="/stratos-logo.svg" alt="Stratos" width={32} height={32} className="h-8 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Developer Info & Best Repo */}
          <div className="space-y-6">
            {/* Developer Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>👤</span>
                  <span>Developer Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Image
                    src={analysis.developer.avatar}
                    alt={analysis.developer.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-gray-200"
                  />
                  <h3 className="text-lg font-semibold">{analysis.developer.name}</h3>
                  <p className="text-gray-600">@{analysis.developer.username}</p>
                </div>
                
                {analysis.developer.bio && (
                  <p className="text-sm text-gray-700 text-center italic">&apos;{analysis.developer.bio}&apos;</p>
                )}
                
                {analysis.developer.location && (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <span className="mr-1">📍</span>
                    {analysis.developer.location}
                  </div>
                )}
                
                <div className="flex justify-center">
                  <a
                    href={analysis.developer.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    View GitHub Profile
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Best Matching Repository */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏆</span>
                  <span>Best Matching Repository</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{analysis.bestMatchingRepo.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{analysis.bestMatchingRepo.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                      {analysis.bestMatchingRepo.language}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">⭐</span>
                      {analysis.bestMatchingRepo.stars}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {analysis.bestMatchingRepo.topics.slice(0, 5).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={analysis.bestMatchingRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Repository
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Code Quality */}
          <div className="space-y-6">
            {/* Code Quality Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Code Quality Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${getScoreColor(analysis.codeQualityAnalysis.overallScore)}`}>
                    Overall Score: {analysis.codeQualityAnalysis.overallScore}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Code Structure</h5>
                    <p className="text-sm text-gray-600">{analysis.codeQualityAnalysis.codeStructure}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Documentation</h5>
                    <p className="text-sm text-gray-600">{analysis.codeQualityAnalysis.documentation}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Test Coverage</h5>
                    <p className="text-sm text-gray-600">{analysis.codeQualityAnalysis.testCoverage}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Best Practices</h5>
                    <p className="text-sm text-gray-600">{analysis.codeQualityAnalysis.bestPractices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills Assessment */}
          <div className="space-y-6">
            {/* Skills Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛠️</span>
                  <span>Skills Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Technical Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillsAssessment.technicalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Project Complexity</h5>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.skillsAssessment.projectComplexity === 'Advanced' ? 'bg-green-100 text-green-800' :
                    analysis.skillsAssessment.projectComplexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.skillsAssessment.projectComplexity}
                  </span>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Experience Level</h5>
                  <p className="text-sm text-gray-600">{analysis.skillsAssessment.experienceLevel}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Specializations</h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillsAssessment.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📁</span>
              <span>Project Portfolio ({analysis.projectSummary.totalProjects} total projects)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.projectSummary.notableProjects.map((project, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <p className="text-xs text-gray-500 mb-2">{project.impact}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}