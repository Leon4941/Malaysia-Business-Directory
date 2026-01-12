
import React from 'react';
import { Business } from '../types';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-xl font-bold text-gray-800 leading-tight">{business.name}</h3>
        <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          {business.industry}
        </span>
      </div>
      
      <div className="space-y-3 flex-grow">
        <div className="flex items-start gap-3 text-gray-600">
          <i className="fa-solid fa-location-dot mt-1 text-red-400 w-4"></i>
          <p className="text-sm">{business.address}</p>
        </div>
        
        <div className="flex items-center gap-3 text-gray-600">
          <i className="fa-solid fa-phone text-green-500 w-4"></i>
          <p className="text-sm font-medium">{business.phone || 'N/A'}</p>
        </div>

        {business.email && (
          <div className="flex items-center gap-3 text-gray-600">
            <i className="fa-solid fa-envelope text-orange-400 w-4"></i>
            <a href={`mailto:${business.email}`} className="text-sm hover:text-blue-600 transition-colors break-all">
              {business.email}
            </a>
          </div>
        )}

        {business.website && (
          <div className="flex items-center gap-3 text-blue-500">
            <i className="fa-solid fa-globe w-4"></i>
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate">
              {business.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
        <button 
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + business.address)}`, '_blank')}
          className="text-blue-600 text-xs font-bold hover:text-blue-700 flex items-center gap-1"
        >
          View on Map <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};

export default BusinessCard;
