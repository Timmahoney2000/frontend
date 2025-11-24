'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <header className="bg-zinc-900 border-b border-zinc-800">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <a 
                href="https://100devs.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                100Devs
              </a>
              <a 
                href="https://www.youtube.com/results?search_query=leon+noel+100devs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                YouTube
              </a>
              <a 
                href="https://www.youtube.com/results?search_query=leon+noel+100devs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                Discord
              </a>
              
              {/* Dropdown Menu */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Learning Resources
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 min-w-[240px] z-50">
                    <a 
                      href="https://www.coursera.org/learn/learning-how-to-learn" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      Learning How to Learn
                    </a>
                    <a 
                      href="https://www.freecodecamp.org" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      freeCodeCamp
                    </a>
                    <a 
                      href="https://www.theodinproject.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      The Odin Project
                    </a>
                    <a 
                      href="https://www.udemy.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      Udemy
                    </a>
                    <a 
                      href="https://www.udacity.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      Udacity
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </>
  );
}