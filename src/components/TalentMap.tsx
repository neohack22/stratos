"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileDashboard } from "@/components/ProfileDashboard";

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

interface TalentMapProps {
  results: {
    success: boolean;
    developers: Developer[];
    query: string;
    totalAnalyzed: number;
    summary: {
      essentialSkills: string[];
      techStack: string[];
      expertise: string[];
      role: string;
    };
  };
  onReset: () => void;
}

export function TalentMap({ results, onReset }: TalentMapProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

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

  // If a profile is selected, show the dashboard
  if (selectedProfile) {
    return (
      <ProfileDashboard
        username={selectedProfile}
        requirements={results.query}
        onBack={() => setSelectedProfile(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onReset}
              variant="outline"
              className="border-gray-300"
            >
              ← New Search
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl">🎯</span>
                <h1 className="text-xl font-semibold text-gray-900">Requirements Match</h1>
              </div>
              <p className="text-sm text-gray-600">
                &apos;{results.query}&apos;
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Found {results.developers.length} matches from {results.totalAnalyzed.toLocaleString()} profiles
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Image
              src="/stratos-logo.svg"
              alt="Stratos"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Full Screen Profile Grid */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.developers.map((dev) => (
              <Card 
                key={dev.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelectedProfile(dev.username)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Image
                        src={dev.avatar}
                        alt={dev.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                      />
                      {/* Match Score Badge */}
                      <div className={`absolute -top-1 -right-1 w-8 h-8 ${getScoreColor(dev.matchScore)} rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white`}>
                        {dev.matchScore}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 truncate">
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
                
                <CardContent className="pt-0 space-y-4">
                  {/* Bio */}
                  {dev.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">{dev.bio}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">{dev.repositories}</div>
                      <div className="text-xs text-gray-500">Repos</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">{dev.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">{dev.following}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>
                  
                  {/* Top Languages */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Languages</h4>
                    <div className="flex flex-wrap gap-1">
                      {dev.topLanguages.slice(0, 4).map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  {dev.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {dev.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Repositories */}
                  {dev.topRepos && dev.topRepos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Repositories</h4>
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
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {dev.location}
                    </div>
                  )}
                  
                  {/* Status */}
                  {dev.status && (
                    <div className="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 text-center font-medium">
                      {dev.status}
                    </div>
                  )}

                  {/* Contact Actions */}
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                    {/* Deep Analysis Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(dev.username);
                      }}
                      className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
                    >
                      🔍 Deep Analysis
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        GitHub
                      </a>
                      {dev.linkedin && (
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                    {dev.email && (
                      <a
                        href={`mailto:${dev.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📧 Contact
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {results.developers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No developers found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or requirements.</p>
              <Button onClick={onReset} className="bg-blue-600 hover:bg-blue-700">
                Try New Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
