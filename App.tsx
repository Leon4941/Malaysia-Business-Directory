import React, { useState } from 'react';
import { findBusinesses } from './services/geminiService';
import { SearchResult } from './types';
import BusinessCard from './components/BusinessCard';

const App: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);

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
      console.error("App Error:", err);
      
      if (err.message === "QUOTA_EXHAUSTED") {
        setError(
          <div className="space-y-3">
            <p className="font-bold text-lg">⚠️ Google 服务暂时繁忙 (429)</p>
            <p className="text-sm">您的 API 免费配额已达到本分钟上限。请执行以下操作：</p>
            <div className="bg-white/50 p-3 rounded-lg border border-amber-200 mt-2">
              <ol className="list-decimal list-inside text-xs space-y-1 text-amber-900">
                <li><b>等待 60 秒</b>：免费版每分钟有请求次数限制，稍等即可恢复。</li>
                <li><b>检查频率</b>：请勿连续快速点击搜索按钮。</li>
                <li><b>升级方案</b>：如果需要大量搜索，建议在 Google AI Studio 开启付费模式（Pay-as-you-go）。</li>
              </ol>
            </div>
            <button 
              onClick={() => handleSearch()} 
              className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors"
            >
              一分钟后重试
            </button>
          </div>
        );
      } else if (err.message === "AUTH_FAILED" || err.message === "MISSING_API_KEY") {
        setError("认证失败。请检查 Netlify 的环境变量 API_KEY 是否配置正确。");
      } else {
        setError("连接服务器失败，请检查网络或稍后再试。");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
          <i className="fa-solid fa-building-circle-check text-3xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          马来西亚企业搜索
        </h1>
        <p className="text-gray-500 text-lg">搜索全马街道的公司名称、行业与联系电话</p>
      </header>

      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="行业 (如: 律师, 餐饮, 物流)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          
          <div className="flex-1 relative group">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-4 rounded-xl outline-none focus:bg-blue-50 transition-all text-lg border border-transparent focus:border-blue-200"
              placeholder="街道/地区 (如: SS15, Puchong)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fa-solid fa-map-pin"></i>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:bg-gray-300 disabled:shadow-none shrink-0"
          >
            {isSearching ? <i className="fa-solid fa-spinner animate-spin"></i> : "立即查找"}
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {isSearching && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-gray-500 text-lg animate-pulse font-medium">正在使用实时搜索功能扫描该区域商业记录...</p>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-r-2xl max-w-2xl mx-auto shadow-sm">
            <div className="flex gap-5">
              <i className="fa-solid fa-circle-exclamation text-amber-600 text-2xl"></i>
              <div className="text-amber-900">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-info-circle text-blue-500"></i>
                  查询简报
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">{result.text.split('```json')[0]}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.businesses.map((biz, idx) => (
                  <BusinessCard key={idx} business={biz} />
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-slate-900 text-white p-8 rounded-3xl sticky top-8 shadow-2xl">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-link text-blue-400"></i>
                  原始资料来源
                </h3>
                <div className="space-y-4">
                  {result.sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.web?.uri || s.maps?.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="text-sm text-blue-300 font-medium group-hover:text-blue-200 truncate">
                        {s.web?.title || s.maps?.title || "商业参考来源"}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-1 group-hover:text-slate-400">
                        {s.web?.uri || s.maps?.uri}
                      </div>
                    </a>
                  ))}
                  {result.sources.length === 0 && (
                    <p className="text-xs text-slate-500 italic">暂无外部链接</p>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[10px] text-slate-500 leading-tight">
                    注：搜索结果基于 Google 实时公开索引数据。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;