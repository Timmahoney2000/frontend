'use client';

import { X, Bookmark, Trash2, ExternalLink } from 'lucide-react';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: any[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function BookmarksPanel({ 
  isOpen, 
  onClose, 
  bookmarks, 
  onRemove, 
  onClearAll 
}: BookmarksPanelProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col border border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">My Bookmarks</h2>
            <span className="text-sm text-gray-400">({bookmarks.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
              <p className="text-gray-400">No bookmarks yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Click the bookmark icon on any timestamp to save it
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-1">
                        {bookmark.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {bookmark.text}
                      </p>
                      
                     <a   href={`https://youtube.com/watch?v=${bookmark.videoId}&t=${bookmark.timestamp}s`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <span className="font-mono">{formatTime(bookmark.timestamp)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => onRemove(bookmark.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}