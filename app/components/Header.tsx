'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);
  const [editorsDropdownOpen, setEditorsDropdownOpen] = useState(false);

  const closeAllDropdowns = () => {
    setLearningDropdownOpen(false);
    setSocialDropdownOpen(false);
    setEditorsDropdownOpen(false);
  };

  const socialLinks = [
    { name: 'Website', url: 'https://leonnoel.com/' },
    { name: 'Twitter', url: 'https://leonnoel.com/twitter' },
    { name: 'YouTube', url: 'https://leonnoel.com/youtube' },
    { name: 'Twitch', url: 'https://www.twitch.tv/learnwithleon' }
  ];

  const codeEditors = [
    { name: 'VS Code', url: 'https://code.visualstudio.com/' },
    { name: 'Atom', url: 'https://atom.io/' }
  ];

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
              
              {/* Leon's Links Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setSocialDropdownOpen(!socialDropdownOpen);
                    setLearningDropdownOpen(false);
                    setEditorsDropdownOpen(false);
                  }} 
                  className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Leon's Links
                  <ChevronDown className={`w-4 h-4 transition-transform ${socialDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {socialDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {socialLinks.map((link) => (
                      <a 
                        key={link.name}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Editors Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setEditorsDropdownOpen(!editorsDropdownOpen);
                    setLearningDropdownOpen(false);
                    setSocialDropdownOpen(false);
                  }} 
                  className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Code Editors
                  <ChevronDown className={`w-4 h-4 transition-transform ${editorsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {editorsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {codeEditors.map((editor) => (
                      <a 
                        key={editor.name}
                        href={editor.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block px-4 py-2 hover:bg-zinc-700 transition-colors"
                      >
                        {editor.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Learning Resources Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setLearningDropdownOpen(!learningDropdownOpen);
                    setSocialDropdownOpen(false);
                    setEditorsDropdownOpen(false);
                  }} 
                  className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Learning Resources
                  <ChevronDown className={`w-4 h-4 transition-transform ${learningDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {learningDropdownOpen && (
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

              <a 
                href="https://discord.gg/100devs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                Discord
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Close dropdowns when clicking outside */}
      {(learningDropdownOpen || socialDropdownOpen || editorsDropdownOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
      )}
    </>
  );
}