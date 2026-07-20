import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface LibraryFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: { id: string; name: string }[];
}

export default function LibraryFilters({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
}: LibraryFiltersProps) {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search practices, maps, and recordings..."
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500/50 rounded-xl py-3 pl-10 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Category Dropdown (Mobile) / Chips Header (Desktop) - handled below */}
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${selectedCategory === 'all'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                >
                    All Resources
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${selectedCategory === category.id
                                ? 'bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Quick Links / Breadcrumbs if needed */}
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600">
                <span className="flex items-center gap-1"><Filter size={10} /> Jump To:</span>
                <button
                    onClick={() => document.getElementById('knowledge-graph')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-purple-400 transition-colors"
                >
                    Practice Map
                </button>
                <span className="opacity-20">•</span>
                <button
                    onClick={() => document.getElementById('audio-practices')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-amber-400 transition-colors"
                >
                    Audios
                </button>
                <span className="opacity-20">•</span>
                <button
                    onClick={() => document.getElementById('video-library')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-purple-400 transition-colors"
                >
                    Videos
                </button>
            </div>
        </div>
    );
}
