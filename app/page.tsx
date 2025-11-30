'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search, Clock, ExternalLink, Sparkles, Loader2, Bookmark, BookmarkCheck, Share2, Check, Lightbulb } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import BookmarksPanel from './components/BookmarksPanel';
import { useBookmarks } from './hooks/useBookmarks';
import { generateShareUrl, copyToClipboard, shareNative } from './utils/share';

interface Timestamp {
  start: number;
  text: string;
  score?: number;
}

interface Result {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  timestamps: Timestamp[];
}

interface SearchResponse {
  results: Result[];
  total: number;
  message?: string;
}

interface RelatedTopic {
  query: string;
  reason: string;
}

export default function LeonNoelSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);

  const { bookmarks, addBookmark, removeBookmark, isBookmarked, clearAll } = useBookmarks();

  const { completion: aiSummary, complete: generateSummary, isLoading: isSummarizing } = useCompletion({
    api: '/api/summarize',
  });

  // Add this useEffect near the top of the component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Focus search on / or Ctrl+K
    if (e.key === '/' && !isInputFocused()) {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }
    
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }
    
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      setShowBookmarks(!showBookmarks);
    }
    
    if (e.key === 'Escape') {
      setShowBookmarks(false);
      setShowLearningPath(false);
    }
  };

  const isInputFocused = () => {
    return document.activeElement?.tagName === 'INPUT' || 
           document.activeElement?.tagName === 'TEXTAREA';
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showBookmarks]);

  // Load search from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, []);


  const fetchRelatedTopics = async (searchQuery: string) => {
    try {
      const response = await fetch('/api/related-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      setRelatedTopics(data.topics || []);
    } catch (error) {
      console.error('Related topics error:', error);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setIsSearching(true);
    setError('');
    setShowLearningPath(false);
    setRelatedTopics([]);
    
    try {
      console.log('Original query:', finalQuery);
      
      const expansionResponse = await fetch('/api/expand-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery })
      });
      
      const { expandedQuery } = await expansionResponse.json();
      const searchQuery = expandedQuery || finalQuery;
      
      if (expandedQuery && expandedQuery !== finalQuery) {
        console.log('Expanded to:', expandedQuery);
      }
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      
      if (data.message) {
        setError(data.message);
      }

      setResults(data.results);

      // Update URL without reload
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(finalQuery)}`;
      window.history.pushState({}, '', newUrl);

      if (data.results.length > 0) {
        // Generate AI summary
        await generateSummary('', {
          body: {
            query: finalQuery,
            results: data.results,
          },
        });

        // Fetch related topics
        fetchRelatedTopics(finalQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const generateLearningPath = async (goal: string) => {
    setIsGeneratingPath(true);
    
    try {
      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          availableVideos: results.map(r => ({
            videoId: r.videoId,
            title: r.title
          }))
        })
      });
      
      const path = await response.json();
      console.log('Learning path response:', path);
      
      if (path && path.videos && Array.isArray(path.videos)) {
        setLearningPath(path);
        setShowLearningPath(true);
      } else {
        console.error('Invalid learning path structure:', path);
        setError('Failed to generate learning path. Please try again.');
      }
    } catch (error) {
      console.error('Learning path error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate learning path');
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = generateShareUrl(query, results);
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleBookmarkToggle = (video: Result, timestamp: Timestamp) => {
    if (isBookmarked(video.videoId, timestamp.start)) {
      const bookmark = bookmarks.find(
        b => b.videoId === video.videoId && b.timestamp === timestamp.start
      );
      if (bookmark) removeBookmark(bookmark.id);
    } else {
      addBookmark({
        videoId: video.videoId,
        title: video.title,
        timestamp: timestamp.start,
        text: timestamp.text,
      });
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      {/* Keyboard Shortcuts Info */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-600 hidden md:block">
        Press <kbd className="px-2 py-1 bg-zinc-800 rounded">/ </kbd> or{' '}
        <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl+K</kbd> to search •{' '}
        <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl+B</kbd> for bookmarks
      </div>

      <div className={`flex flex-col items-center transition-all duration-500 ${
        results.length > 0 ? 'pt-8 pb-6' : 'justify-center flex-1'
      }`}>
        <h1 className={`font-bold text-center px-4 mb-6 transition-all duration-500 ${
          results.length > 0 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl lg:text-6xl mb-8'
        }`}>
          100Devs Resource Site
        </h1>
        
        <div className="w-full max-w-3xl px-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search Leon's videos... (Press / to focus)"
              className="w-full px-6 py-3 md:py-4 pr-14 text-base md:text-lg bg-zinc-900 border-2 border-zinc-700 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 rounded-full transition-colors"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          {results.length > 0 && (
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              <button
                onClick={() => setShowBookmarks(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Bookmarks</span>
                {bookmarks.length > 0 && (
                  <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {bookmarks.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isSearching && (
          <p className="mt-4 text-zinc-400 animate-pulse text-sm md:text-base">Searching videos...</p>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm md:text-base px-4 text-center">{error}</p>
        )}
      </div>

      {(aiSummary || isSummarizing) && (
        <div className="max-w-4xl mx-auto px-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 md:p-6 border border-blue-800/30">
            <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              AI Summary
            </h3>
            <div className="text-sm md:text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
              {aiSummary}
              {isSummarizing && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />}
            </div>
          </div>
        </div>
      )}

      {/* Related Topics */}
      {relatedTopics.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mb-6 md:mb-8">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
            <h3 className="font-semibold text-sm md:text-base mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(topic.query);
                    handleSearch(topic.query);
                  }}
                  className="group flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all"
                  title={topic.reason}
                >
                  <span>{topic.query}</span>
                  <Search className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && !showLearningPath && (
        <div className="max-w-4xl mx-auto px-4 mb-6 md:mb-8">
          <button
            onClick={() => generateLearningPath(`Learn about ${query}`)}
            disabled={isGeneratingPath}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm md:text-base"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            {isGeneratingPath ? 'Generating Learning Path...' : 'Create Custom Learning Path'}
          </button>
        </div>
      )}

      {showLearningPath && learningPath && (
        <div className="max-w-4xl mx-auto px-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 md:p-6 border border-purple-800/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg md:text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <span className="line-clamp-1">{learningPath.title}</span>
              </h3>
              <button
                onClick={() => setShowLearningPath(false)}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">{learningPath.description}</p>
            <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">⏱️ {learningPath.estimatedTime}</p>
            
            <div className="space-y-3 md:space-y-4">
              {learningPath.videos.map((video: any, idx: number) => (
                <div key={idx} className="bg-black/30 rounded-lg p-3 md:p-4 border border-purple-700/30">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm md:text-base">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base mb-2">{video.title}</h4>
                      <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">{video.reason}</p>
                      
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                        {video.keyTopics.map((topic: string, i: number) => (
                          <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                      
                      
                      <a href={`https://youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs md:text-sm flex items-center gap-1"
                      >
                        Watch Video <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12 md:pb-16">
          <div className="mb-4 md:mb-6">
            <p className="text-zinc-400 text-sm md:text-base">Found {results.length} relevant videos</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300"
                onMouseEnter={() => setHoveredVideo(result.videoId)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div className="relative aspect-video bg-zinc-800">
                  <img 
                    src={result.thumbnail} 
                    alt={result.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Video Preview on Hover */}
                  {hoveredVideo === result.videoId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      
                       <a href={`https://youtube.com/watch?v=${result.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Watch Full Video
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-2 md:mb-3 line-clamp-2">
                    {result.title}
                  </h3>

                  <div className="space-y-1.5 md:space-y-2">
                    {result.timestamps.map((timestamp, idx) => (
                      <div
                       key={idx}
                        className="flex items-start gap-2 p-2 rounded hover:bg-zinc-800 transition-colors group"
                      >
                        <button
                          onClick={() => handleBookmarkToggle(result, timestamp)}
                          className="mt-0.5 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
                        >
                          {isBookmarked(result.videoId, timestamp.start) ? (
                            <BookmarkCheck className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        
                        
                        <a href={`https://youtube.com/watch?v=${result.videoId}&t=${timestamp.start}s`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-xs md:text-sm font-mono text-blue-400">
                              {formatTime(timestamp.start)}
                            </span>
                            {timestamp.score && (
                              <span className="text-xs text-gray-500">
                                ({Math.round(timestamp.score * 100)}%)
                              </span>
                            )}
                            <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                          </div>
                          <p className="text-xs md:text-sm text-zinc-300 line-clamp-2">
                            {timestamp.text}
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks Panel */}
      <BookmarksPanel
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        bookmarks={bookmarks}
        onRemove={removeBookmark}
        onClearAll={clearAll}
      />

      <Footer />
    </div>
  );
}