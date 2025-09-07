"use client";

interface LoadingSearchProps {
  query: string;
}

export function LoadingSearch({ query }: LoadingSearchProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Stratos</span>
        </div>
      </header>

      {/* Loading Content */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Spinning Circle */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            <div className="w-full h-full border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Searching for Talent...
        </h2>

        {/* Query Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-gray-600 text-sm mb-2">Searching for:</p>
          <p className="text-gray-900 font-medium">{query}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 text-left">
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
            Analyzing thousands of GitHub profiles...
          </div>
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 animate-pulse animation-delay-200"></div>
            Matching skills and experience...
          </div>
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-3 animate-pulse animation-delay-400"></div>
            Calculating compatibility scores...
          </div>
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3 animate-pulse animation-delay-600"></div>
            Preparing talent map visualization...
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          This may take 30-60 seconds to analyze all profiles...
        </p>
      </div>
    </div>
  );
}
