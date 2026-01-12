
import React, { useState } from 'react';
import { findBusinesses } from './services/geminiService';
import { SearchResult, Business } from './types';
import BusinessCard from './components/BusinessCard';

const App: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!industry.trim() && !location.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const searchData = await findBusinesses(industry, location);
      setResult(searchData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch business information. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const quickSearches = [
    { industry: "IT Software", location: "Cyberjaya" },
    { industry: "Restaurants", location: "Jalan Alor, KL" },
    { industry: "Manufacturing", location: "Shah Alam" },
    { industry: "Law Firms", location: "Penang" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
          <i className="fa-solid fa-briefcase text-3xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Malaysia Business Directory
        </h1>
        <p className="text-gray-500 text-lg">
          Find companies by industry, location, and get direct contact details.
        </p>
      </header>

      {/* Search Bar - Multi Input */}
      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="What? (Industry e.g. Bakery)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          
          <div className="hidden md:block w-px bg-gray-100 my-2"></div>

          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="Where? (Street or Area)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-solid fa-location-dot"></i>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed transition-all text-lg"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i> Finding...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-gray-400 uppercase font-bold self-center mr-2">Try:</span>
          {quickSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIndustry(item.industry);
                setLocation(item.location);
                setTimeout(() => handleSearch(), 10);
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              {item.industry} in {item.location}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-12">
        {isSearching && (
          <div className="flex flex-col items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-building text-blue-200 animate-pulse"></i>
              </div>
            </div>
            <p className="mt-6 text-gray-500 font-medium tracking-wide">Querying Malaysian Business Records...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl max-w-2xl mx-auto shadow-sm animate-shake">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                <i className="fa-solid fa-exclamation"></i>
              </div>
              <div>
                <h4 className="font-bold text-red-800">Search Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main Content: Results */}
              <div className="lg:col-span-8 space-y-8">
                {/* AI Summary */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Executive Summary</h2>
                  </div>
                  <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {result.text.split('```json')[0]}
                  </div>
                </section>

                {/* Grid of parsed businesses */}
                {result.businesses.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <i className="fa-solid fa-building-circle-check text-green-500"></i>
                        Matching Businesses ({result.businesses.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {result.businesses.map((biz, idx) => (
                        <BusinessCard key={idx} business={biz} />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar: Sources */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl sticky top-8">
                  <div className="flex items-center gap-3 mb-6">
                    <i className="fa-solid fa-fingerprint text-blue-400"></i>
                    <h3 className="text-xl font-bold">Data Grounding</h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    This information is synthesized from real-time web search results, business directories, and local maps records.
                  </p>

                  <div className="space-y-4">
                    {result.sources.length > 0 ? (
                      result.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.web?.uri || source.maps?.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/10"
                        >
                          <div className="text-sm font-bold text-blue-300 truncate group-hover:text-blue-200 flex items-center gap-2">
                             <i className="fa-solid fa-globe text-[10px]"></i>
                             {source.web?.title || source.maps?.title || "Verification Link"}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate mt-1 font-mono">
                            {source.web?.uri || source.maps?.uri}
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-gray-500 text-sm italic">
                        No external citations generated for this specific query.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black text-center">
                    Powered by Google Search
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {!result && !isSearching && !error && (
          <div className="py-32 text-center">
            <div className="mb-8 relative inline-block">
               <i className="fa-solid fa-map-location-dot text-8xl text-gray-100"></i>
               <i className="fa-solid fa-magnifying-glass text-3xl text-blue-500 absolute -bottom-2 -right-2"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Find Companies in Seconds</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter an industry and a location in Malaysia to discover company names, precise addresses, phone numbers, and emails.
            </p>
          </div>
        )}
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <div className="flex justify-center gap-6 mb-4 text-gray-400 text-lg">
          <i className="fa-brands fa-facebook hover:text-blue-600 cursor-pointer transition-colors"></i>
          <i className="fa-brands fa-linkedin hover:text-blue-700 cursor-pointer transition-colors"></i>
          <i className="fa-brands fa-x-twitter hover:text-black cursor-pointer transition-colors"></i>
        </div>
        <p className="text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Malaysia Business Finder Pro. Built with Gemini AI.
        </p>
      </footer>
    </div>
  );
};

export default App;
