"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResult } from "@/lib/api";

interface AnalysisResultsProps {
  results: AnalysisResult;
  repositoryName: string;
}

export function AnalysisResults({ results, repositoryName }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Advanced": return "text-purple-400";
      case "Intermediate": return "text-blue-400";
      case "Beginner": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 space-y-6">
      {/* Header Card */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center justify-between">
            Analysis Results for {repositoryName}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Match Score:</span>
              <span className={`text-3xl font-bold ${getScoreColor(results.matchScore)}`}>
                {results.matchScore}%
              </span>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            {results.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <span className="mr-2">✅</span>
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.strengths.map((strength, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-green-400 mr-2 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Gaps */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <span className="mr-2">⚠️</span>
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.gaps.map((gap, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-red-400 mr-2 mt-1">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center">
              <span className="mr-2">🛠️</span>
              Technical Skills Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results.technicalSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-600/30"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <span className="text-gray-400">Project Complexity: </span>
              <span className={`font-semibold ${getComplexityColor(results.projectComplexity)}`}>
                {results.projectComplexity}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <span className="mr-2">💡</span>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Match Score Visualization */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Match Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Overall Compatibility</span>
              <span className={`font-bold ${getScoreColor(results.matchScore)}`}>
                {results.matchScore}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  results.matchScore >= 80
                    ? "bg-gradient-to-r from-green-500 to-green-400"
                    : results.matchScore >= 60
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                    : "bg-gradient-to-r from-red-500 to-red-400"
                }`}
                style={{ width: `${results.matchScore}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-red-400 font-semibold">0-59%</div>
                <div className="text-gray-400">Needs Work</div>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold">60-79%</div>
                <div className="text-gray-400">Good Match</div>
              </div>
              <div>
                <div className="text-green-400 font-semibold">80-100%</div>
                <div className="text-gray-400">Excellent Match</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
