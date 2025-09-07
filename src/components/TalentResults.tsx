"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

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

interface TalentResultsProps {
  results: {
    success: boolean;
    developers: Developer[];
    query: string;
    totalAnalyzed: number;
  };
  onReset: () => void;
}

export function TalentResults({ results, onReset }: TalentResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onReset}
              variant="outline"
              className="border-gray-300"
            >
              ← New Search
            </Button>
            
            {/* Requirements Matched Badge */}
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <span className="text-green-600">🎯</span>
              <div>
                <span className="text-sm font-semibold text-green-700">Requirements Matched</span>
                <p className="text-xs text-green-600 truncate max-w-xs">{results.query}</p>
              </div>
            </div>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Talent Search Results</h1>
              <p className="text-xs text-gray-600">
                Found {results.developers.length} developers from {results.totalAnalyzed.toLocaleString()} profiles
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Image 
              src="/stratos-logo.svg" 
              alt="Stratos" 
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">Stratos</span>
          </div>
        </div>
      </header>

      {/* Results Grid - Full Window Width */}
      <main className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-4">
          {results.developers.map((dev, index) => (
            <Card 
              key={dev.id}
              className="hover:shadow-lg transition-all duration-200 bg-white"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Image
                      src={dev.avatar}
                      alt={dev.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-2 border-gray-200"
                    />
                    {/* Rank Badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {dev.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-2">@{dev.username}</p>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${getScoreColor(dev.matchScore)} rounded-full mr-2`}></div>
                      <span className={`text-sm font-semibold ${getScoreTextColor(dev.matchScore)}`}>
                        {dev.matchScore}% match
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Bio */}
                {dev.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{dev.bio}</p>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">{dev.repositories}</div>
                    <div className="text-xs text-gray-500">Repos</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">{dev.followers}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">{dev.following}</div>
                    <div className="text-xs text-gray-500">Following</div>
                  </div>
                </div>
                
                {/* Top Languages */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Top Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {dev.topLanguages.slice(0, 4).map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Repositories */}
                {dev.topRepos && dev.topRepos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Notable Projects</h4>
                    <div className="space-y-2">
                      {dev.topRepos.slice(0, 2).map((repo, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">{repo.name}</span>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="mr-1">⭐</span>
                              {repo.stars}
                            </div>
                          </div>
                          {repo.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">{repo.description}</p>
                          )}
                          {repo.language && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                              {repo.language}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Location */}
                {dev.location && (
                  <div className="flex items-center text-xs text-gray-600 mb-3">
                    <span className="mr-1">📍</span>
                    {dev.location}
                  </div>
                )}
                
                {/* Contact Links */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      GitHub
                    </a>
                    {dev.linkedin && (
                      <a
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        LinkedIn
                      </a>
                    )}
                    {dev.email && (
                      <a
                        href={`mailto:${dev.email}`}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                {dev.status && (
                  <div className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 text-center">
                    {dev.status}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
