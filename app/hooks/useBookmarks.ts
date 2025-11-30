import { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  videoId: string;
  title: string;
  timestamp: number;
  text: string;
  savedAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem('100devs-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  }, []);

  // Save bookmarks when they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem('100devs-bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'savedAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${bookmark.videoId}_${bookmark.timestamp}_${Date.now()}`,
      savedAt: Date.now(),
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (videoId: string, timestamp: number) => {
    return bookmarks.some(b => b.videoId === videoId && b.timestamp === timestamp);
  };

  const clearAll = () => {
    setBookmarks([]);
    localStorage.removeItem('100devs-bookmarks');
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearAll,
  };
}