'use client';

import { useState } from 'react';
import { Search, Clock, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

interface Timestamp {
  start: number;
  text: string;
}

interface Result {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  timestamps: Timestamp[];
}

export default function LeonNoelSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isSearching, setIsSearching] = useState(false);

 const handleSearch = async () => {
  if (!query.trim()) return;

  setIsSearching(true);
  
  try {
    console.log('Searching for:', query);
    
    const response = await fetch('http://localhost:8000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received results:', data);
    setResults(data.results);
  } catch (error) {
    console.error('Search error:', error);
    alert('Failed to search. Make sure backend is running on http://localhost:8000');
    setResults([]);
  } finally {
    setIsSearching(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Search Section */}
      <div className={`flex flex-col items-center justify-center transition-all duration-500 ${results.length > 0 ? 'pt-12 pb-8' : 'min-h-[calc(100vh-80px)]'}`}>
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center px-4">
          100Devs Resource Site
        </h1>
        
        <div className="w-full max-w-3xl px-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search Leon's videos..."
              className="w-full px-6 py-4 pr-14 text-lg bg-zinc-900 border-2 border-zinc-700 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-full transition-colors"
            >
              <Search className={`w-5 h-5 ${isSearching ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        {isSearching && (
          <p className="mt-6 text-zinc-400 animate-pulse">Searching videos...</p>
        )}
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="mb-6">
            <p className="text-zinc-400">Found {results.length} relevant videos</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div key={result.id} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300">
                <div className="relative aspect-video bg-zinc-800">
                  <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                    {result.title}
                  </h3>

                  <div className="space-y-2">
                    {result.timestamps.map((timestamp, idx) => {
                      const youtubeUrl = `https://youtube.com/watch?v=${result.videoId}&t=${timestamp.start}s`;
                      return (
                        <a key={idx} href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 p-2 rounded hover:bg-zinc-800 transition-colors group">
                          <Clock className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-blue-400">
                                {formatTime(timestamp.start)}
                              </span>
                              <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-sm text-zinc-300 line-clamp-2">
                              {timestamp.text}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && results.length === 0 && query && (
        <div className="text-center px-4 pb-16">
          <p className="text-zinc-400">No results found. Try a different search term.</p>
        </div>
      )}
      <Footer />
    </div>
  );
}