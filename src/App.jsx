import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, BookOpen, Video, FileText, Mic,
  Clock, Users, BookMarked, Bookmark, PlusCircle,
  ChevronDown, X, Sparkles, GraduationCap, BarChart
} from 'lucide-react';

// --- MOCK DATA FOR THE REPOSITORY ---
const MOCK_RESOURCES = [
  {
    id: '1',
    title: 'Formative Assessment in Action',
    description: 'Watch how a 4th-grade teacher uses exit tickets to adjust her math instruction on the fly.',
    audience: ['Teacher', 'Student Teacher'],
    topic: 'Instructional Adjustment',
    gradeBand: '3-5',
    assessmentType: 'Formative',
    resourceType: 'Video',
    time: '5-15 mins',
    tags: ['math', 'exit tickets', 'real-time'],
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    title: 'The Parent\'s Guide to State Testing',
    description: 'A comprehensive, easy-to-read document explaining what state accountability tests mean for your child.',
    audience: ['Parent'],
    topic: 'Test Interpretation',
    gradeBand: 'All Grades',
    assessmentType: 'State Testing',
    resourceType: 'Document',
    time: '15-30 mins',
    tags: ['parents', 'accountability', 'guide'],
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    title: 'Building Better Rubrics',
    description: 'An interactive web tool and guide for K-12 educators to construct clear, actionable rubrics.',
    audience: ['Teacher', 'Building Administrator'],
    topic: 'Grading & Rubrics',
    gradeBand: 'All Grades',
    assessmentType: 'Summative',
    resourceType: 'Website',
    time: '30+ mins',
    tags: ['rubric', 'grading', 'design'],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    title: 'Assessment Chat: Policy Impacts',
    description: 'A podcast discussing how recent district policies impact interim benchmark testing windows.',
    audience: ['District Administrator', 'Policy Maker', 'Building Administrator'],
    topic: 'Policy & Systems',
    gradeBand: 'High School',
    assessmentType: 'Interim/Benchmark',
    resourceType: 'Podcast',
    time: '15-30 mins',
    tags: ['policy', 'leadership', 'benchmarks'],
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '5',
    title: 'Quick Check: Reading Comprehension',
    description: 'A set of 5-minute K-2 reading comprehension checks to use during small group instruction.',
    audience: ['Teacher'],
    topic: 'Item Writing & Selection',
    gradeBand: 'K-2',
    assessmentType: 'Formative',
    resourceType: 'Document',
    time: '< 5 mins',
    tags: ['reading', 'literacy', 'quick'],
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '6',
    title: 'Student Goal Setting Templates',
    description: 'Printable templates for middle school students to track their own progress on accountability metrics.',
    audience: ['Student', 'Teacher'],
    topic: 'Feedback & Motivation',
    gradeBand: '6-8',
    assessmentType: 'Accountability',
    resourceType: 'Document',
    time: '5-15 mins',
    tags: ['student agency', 'goals', 'tracking'],
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=400'
  }
];

// --- FILTER OPTIONS ---
const FILTER_OPTIONS = {
  audience: ['Student', 'Teacher', 'Parent', 'Building Administrator', 'District Administrator', 'Policy Maker', 'Student Teacher'],
  topic: ['Instructional Adjustment', 'Test Interpretation', 'Grading & Rubrics', 'Policy & Systems', 'Item Writing & Selection', 'Feedback & Motivation'],
  gradeBand: ['K-2', '3-5', '6-8', 'High School', 'Higher Ed', 'All Grades'],
  assessmentType: ['Formative', 'Summative', 'Interim/Benchmark', 'State Testing', 'Accountability'],
  resourceType: ['Video', 'Document', 'Podcast', 'Website', 'Rubric'],
  time: ['< 5 mins', '5-15 mins', '15-30 mins', '30+ mins']
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    audience: [], topic: [], gradeBand: [], assessmentType: [], resourceType: [], time: []
  });
  const [filteredResources, setFilteredResources] = useState(MOCK_RESOURCES);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [savedItems, setSavedItems] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --- GEMINI API INTEGRATION ---
  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredResources(MOCK_RESOURCES);
      return;
    }

    setIsSearchingAI(true);
    const apiKey = ""; // API key is populated by the environment

    try {
      // If no API key is available, use a fallback local search
      if (!apiKey || apiKey === "") {
        setTimeout(() => {
          const query = searchQuery.toLowerCase();
          const results = MOCK_RESOURCES.filter(r =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.tags.some(t => t.toLowerCase().includes(query)) ||
            r.topic.toLowerCase().includes(query)
          );
          setFilteredResources(results.length > 0 ? results : MOCK_RESOURCES);
          setIsSearchingAI(false);
        }, 800);
        return;
      }

      const systemPrompt = `You are a helpful educational assessment librarian.
Review the user's natural language request and the provided JSON list of resources.
Return a JSON array containing ONLY the string IDs of the resources that best match the user's request.
If none match well, return an empty array. Do not return markdown, just the JSON array.

Resource Data: ${JSON.stringify(MOCK_RESOURCES.map(r => ({id: r.id, title: r.title, description: r.description, tags: r.tags, type: r.resourceType})))}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: searchQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        const matchingIds = JSON.parse(textResponse);
        const results = MOCK_RESOURCES.filter(r => matchingIds.includes(r.id));
        setFilteredResources(results);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      // Fallback to text search if API fails
      const query = searchQuery.toLowerCase();
      const results = MOCK_RESOURCES.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
      setFilteredResources(results);
    } finally {
      setIsSearchingAI(false);
    }
  };

  // --- LOCAL FILTERING ---
  useEffect(() => {
    let result = MOCK_RESOURCES;

    // Apply strict categorical filters
    Object.keys(activeFilters).forEach(category => {
      const selectedValues = activeFilters[category];
      if (selectedValues.length > 0) {
        result = result.filter(resource => {
          const resourceValue = resource[category];
          if (Array.isArray(resourceValue)) {
            return selectedValues.some(val => resourceValue.includes(val));
          }
          return selectedValues.includes(resourceValue);
        });
      }
    });

    // Only apply if we aren't relying on a specific AI search term at the moment
    // (If the user starts clicking filters, we override the search box for simplicity in this demo)
    if (Object.values(activeFilters).some(arr => arr.length > 0)) {
      setFilteredResources(result);
    } else if (!searchQuery) {
      setFilteredResources(MOCK_RESOURCES);
    }
  }, [activeFilters]);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearFilters = () => {
    setActiveFilters({ audience: [], topic: [], gradeBand: [], assessmentType: [], resourceType: [], time: [] });
    setSearchQuery('');
    setFilteredResources(MOCK_RESOURCES);
  };

  const toggleSave = (id) => {
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Video': return <Video size={16} className="text-blue-500" />;
      case 'Document': return <FileText size={16} className="text-green-600" />;
      case 'Podcast': return <Mic size={16} className="text-purple-500" />;
      case 'Website': return <BookOpen size={16} className="text-orange-500" />;
      case 'Rubric': return <BarChart size={16} className="text-yellow-600" />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo area - using standard image tag with fallback styling */}
            <div className="h-14 w-auto flex items-center shrink-0">
              <img
                src="ChatGPT Image Mar 24, 2026, 01_24_11 PM.png"
                alt="NMCE Classroom Assessment Logo"
                className="h-full object-contain"
                onError={(e) => {
                  // Fallback if image path isn't resolved directly
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-2 font-bold text-xl text-[#1D4F73]">
                <BarChart className="text-[#8DC63F]" size={28} />
                <span>NMCE Assessment</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
              <Bookmark size={18} /> My Saved Items
            </button>
            <button className="bg-[#1D4F73] hover:bg-[#143a54] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
              <PlusCircle size={18} /> <span className="hidden sm:inline">Submit Resource</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="bg-[#1D4F73] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#00A0D1] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#8DC63F] opacity-20 blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Classroom Assessment <span className="text-[#8DC63F]">Commons</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            A centralized repository of resources for all audiences, exploring all facets of educational measurement and assessment in the classroom. Whether you are a teacher looking for quick formative tools, or a policymaker understanding state impacts, you belong here.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* AI SEARCH BOX */}
        <div className="relative -mt-16 mb-12 z-20 max-w-4xl mx-auto">
          <form onSubmit={handleAISearch} className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-slate-100 ring-4 ring-white/50 backdrop-blur-sm">
            <div className="pl-4 text-slate-400">
              <Sparkles size={24} className={isSearchingAI ? "animate-pulse text-[#00A0D1]" : "text-[#00A0D1]"} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe what you are looking for (e.g., 'Exit tickets for middle school math')"
              className="flex-1 w-full px-4 py-4 text-lg bg-transparent border-none focus:ring-0 outline-none text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isSearchingAI}
              className="bg-[#8DC63F] hover:bg-[#7ab033] text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearchingAI ? 'Thinking...' : 'Search'}
            </button>
          </form>
          <div className="text-center mt-3 text-sm text-slate-500 font-medium">
            Powered by AI to help you find the perfect resource.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* MOBILE FILTER TOGGLE */}
          <button
            className="lg:hidden flex items-center justify-center gap-2 w-full bg-white border border-slate-200 py-3 rounded-xl font-medium shadow-sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <Filter size={20} />
            {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* SIDEBAR FILTERS */}
          <aside className={`lg:w-1/4 flex-shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter size={20} className="text-[#1D4F73]" /> Filters
                </h2>
                {(Object.values(activeFilters).some(arr => arr.length > 0) || searchQuery) && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {Object.entries(FILTER_OPTIONS).map(([categoryKey, options]) => (
                  <div key={categoryKey} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex justify-between items-center">
                      {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {options.map(option => (
                        <label key={option} className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center pt-0.5">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={activeFilters[categoryKey]?.includes(option)}
                              onChange={() => toggleFilter(categoryKey, option)}
                            />
                            <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white peer-checked:bg-[#00A0D1] peer-checked:border-[#00A0D1] transition-colors flex items-center justify-center group-hover:border-[#00A0D1]">
                              <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-slate-600 text-sm group-hover:text-slate-900 transition-colors">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RESULTS GRID */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {filteredResources.length} Resources Found
                </h2>
                {searchQuery && !isSearchingAI && (
                  <p className="text-slate-500 mt-1">Showing results for "{searchQuery}"</p>
                )}
              </div>
              <div className="hidden sm:block">
                <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#00A0D1] shadow-sm">
                  <option>Sort by: Most Relevant</option>
                  <option>Sort by: Newest</option>
                  <option>Sort by: Popular</option>
                </select>
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No resources found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  We couldn't find anything matching your current filters or search query. Try adjusting your criteria or clearing filters.
                </p>
                <button onClick={clearFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-2 rounded-lg font-medium transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map(resource => (
                  <article key={resource.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">

                    {/* Image Area */}
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleSave(resource.id); }}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 hover:text-[#00A0D1] shadow-sm transition-colors"
                        >
                          {savedItems.has(resource.id) ? <BookMarked size={16} className="text-[#00A0D1] fill-current" /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className="bg-[#1D4F73] text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          {getIconForType(resource.resourceType)} {resource.resourceType}
                        </span>
                        <span className="bg-white/90 text-slate-800 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <Clock size={12} /> {resource.time}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Users size={12}/> {resource.audience[0]} {resource.audience.length > 1 && `+${resource.audience.length - 1}`}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><GraduationCap size={12}/> {resource.gradeBand}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-[#00A0D1] transition-colors cursor-pointer">
                        {resource.title}
                      </h3>

                      <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">
                        {resource.description}
                      </p>

                      {/* Bottom row tags */}
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                        {resource.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <BarChart className="text-[#8DC63F]" size={24} />
            <span className="font-bold text-white text-lg">NMCE Assessment Commons</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Submit Resource</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
          <p className="text-sm">© 2026 NMCE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}