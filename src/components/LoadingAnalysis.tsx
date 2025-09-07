"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoadingAnalysis() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
            Analyzing Repository...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center text-gray-300">
              <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              Fetching repository data from GitHub...
            </div>
            <div className="flex items-center text-gray-300">
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full mr-3 animation-delay-200"></div>
              Analyzing code structure and technologies...
            </div>
            <div className="flex items-center text-gray-300">
              <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full mr-3 animation-delay-400"></div>
              Matching against job requirements...
            </div>
            <div className="flex items-center text-gray-300">
              <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full mr-3 animation-delay-600"></div>
              Generating insights and recommendations...
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">
              This may take 30-60 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
