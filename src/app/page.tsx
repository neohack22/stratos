"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TalentMap } from "@/components/TalentMap";
import { LoadingSearch } from "@/components/LoadingSearch";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter your hiring requirements");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch('/api/match-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements: searchQuery.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchResults(null);
    setError(null);
    setSearchQuery("");
  };

  if (searchResults) {
    return <TalentMap results={searchResults} onReset={resetSearch} />;
  }

  if (isSearching) {
    return <LoadingSearch query={searchQuery} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Image
            src="/stratos-logo.svg"
            alt="Stratos"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
          <Button variant="outline" className="border-gray-300">Sign In</Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            Talent-Map
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              for Tech Hiring
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover and match with top GitHub developers using AI-powered analysis. 
            Find the perfect talent for your tech team in seconds.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                placeholder="Describe your ideal candidate"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 px-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 shadow-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl disabled:opacity-50"
              >
                Search Talent
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Example Searches */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <button
              onClick={() => setSearchQuery("Senior Full-stack developer with React and Node.js experience")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              Full-stack Developer
            </button>
            <button
              onClick={() => setSearchQuery("Machine Learning engineer with Python and TensorFlow expertise")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              ML Engineer
            </button>
            <button
              onClick={() => setSearchQuery("DevOps engineer with Kubernetes and AWS experience")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              DevOps Engineer
            </button>
            <button
              onClick={() => setSearchQuery("Mobile developer with React Native and Flutter skills")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              Mobile Developer
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Talent Map</h3>
              <p className="text-gray-600">
                Visualize developer profiles in an interactive map showing skill proximity and match scores
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze thousands of GitHub profiles to find perfect matches
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Profiles</h3>
              <p className="text-gray-600">
                Complete developer profiles with contact info, skills, and project analysis
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-500">
        <p>&copy; 2024 Stratos. Revolutionizing tech talent discovery.</p>
      </footer>
    </div>
  );
}
