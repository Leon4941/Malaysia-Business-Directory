
import React, { useState } from 'react';
import { findBusinesses } from './services/geminiService';
import { SearchResult } from './types';
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
      console.error("Search Error:", err);
      let msg = err.message || "获取企业信息失败。";
      
      // 针对 API KEY 缺失或配置不同步的引导性提示
      if (msg.includes("API_KEY") || msg.includes("configuration") || msg.includes("401") || msg.includes("missing")) {
        msg = "API 密钥未生效或配置错误。\n\n请检查：\n1. Netlify 环境变量中是否已添加 API_KEY。\n2. 必须点击 'Deploy project without cache' 重新部署一次。";
      }
      
      setError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
          <i className="fa-solid fa-map-location-dot text-3xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          马来西亚企业搜索
        </h1>
        <p className="text-gray-500 text-lg">
          输入街道、地区或行业名称 &bull; 快速查找全马公司信息
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="行业 (如: 法律, 牙科, 餐饮)"
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
              placeholder="街道或地区 (如: SS15, Jalan Alor)"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg shrink-0"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i> 搜索中...
              </span>
            ) : (
              "查找公司"
            )}
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="space-y-12">
        {isSearching && (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">正在利用实时搜索数据扫描马来西亚商业记录...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl max-w-2xl mx-auto shadow-sm">
            <div className="flex items-start gap-4">
              <i className="fa-solid fa-circle-xmark text-red-500 text-xl mt-1"></i>
              <div>
                <h4 className="font-bold text-red-800">系统提示</h4>
                <p className="text-red-700 text-sm whitespace-pre-wrap mt-1 leading-relaxed">{error}</p>
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
                  区域概况
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
                    {location || '查询地点'} 的搜索结果
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
                  数据来源验证
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  信息基于 Google 实时搜索结果。您可以点击以下链接直接查看原始来源。
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
                        {source.web?.title || source.maps?.title || "官方参考链接"}
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
            <p className="mt-6 text-xl text-gray-500 font-medium">输入行业或地点，即刻发现商业机会</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
