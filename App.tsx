
import React, { useState, useEffect } from 'react';
import { findBusinesses } from './services/geminiService';
import { SearchResult, Business } from './types';
import BusinessCard from './components/BusinessCard';

const App: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  useEffect(() => {
    // 检测 API KEY 是否已经配置
    if (!process.env.API_KEY || process.env.API_KEY === '') {
      setIsKeyMissing(true);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!industry.trim() && !location.trim()) return;
    if (isKeyMissing) {
      setError("API Key is missing. Please set the API_KEY environment variable in your deployment settings.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const searchData = await findBusinesses(industry, location);
      setResult(searchData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch business information.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* API Key Missing Warning */}
      {isKeyMissing && (
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xl"></i>
            <div>
              <h3 className="font-bold text-amber-800">Deployment Config Required</h3>
              <p className="text-amber-700 text-sm">
                The <code>API_KEY</code> environment variable is missing. If you are on Netlify, go to <b>Site Configuration > Build & deploy > Environment variables</b> to add it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
          <i className="fa-solid fa-map-location-dot text-3xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Malaysia Business Finder
        </h1>
        <p className="text-gray-500 text-lg">
          Locate companies by street, area, or industry across Malaysia.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="Industry (e.g. Legal, Dental)"
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
              placeholder="Street or Area (e.g. SS15, Jalan Alor)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-solid fa-location-dot"></i>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || isKeyMissing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg shrink-0"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i> Searching...
              </span>
            ) : (
              "Find Businesses"
            )}
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="space-y-12">
        {isSearching && (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Scanning Malaysian business records...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl max-w-2xl mx-auto shadow-sm">
            <div className="flex items-start gap-4">
              <i className="fa-solid fa-circle-xmark text-red-500 text-xl mt-1"></i>
              <div>
                <h4 className="font-bold text-red-800">Search Failed</h4>
                <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-8">
              {/* AI Summary */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-comment-dots text-blue-500"></i>
                  Area Overview
                </h2>
                <div className="text-gray-700 leading-relaxed text-lg prose prose-blue max-w-none">
                  {result.text.split('```json')[0]}
                </div>
              </section>

              {/* Business Results */}
              {result.businesses.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-green-500"></i>
                    Results for {location || 'Malaysia'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.businesses.map((biz, idx) => (
                      <BusinessCard key={idx} business={biz} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Grounding Info */}
            <aside className="lg:col-span-4">
              <div className="bg-slate-900 text-white p-8 rounded-3xl sticky top-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-blue-400"></i>
                  Data Sources
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Verified using real-time Google Search data to ensure business details are up to date.
                </p>
                <div className="space-y-3">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.web?.uri || source.maps?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-sm font-semibold text-blue-300 truncate">
                        {source.web?.title || source.maps?.title || "Verification Source"}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-1">
                        {source.web?.uri || source.maps?.uri}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {!result && !isSearching && !error && (
          <div className="text-center py-20 opacity-40">
            <i className="fa-solid fa-city text-9xl text-gray-200"></i>
            <p className="mt-6 text-xl text-gray-500 font-medium">Search to see company records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
