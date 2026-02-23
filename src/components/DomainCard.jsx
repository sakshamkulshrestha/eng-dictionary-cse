import React from 'react';

export default function DomainCard({ title, icon, count, onClick }) {
  return (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-gray-600 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">{count} entries</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Explore key terms in {title}.</p>
    </div>
  );
}