import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function DomainCard({ title, count, onClick }) {
  return (
    <div onClick={onClick} className="group border-t border-black dark:border-white pt-8 pb-12 cursor-pointer hover:opacity-50 transition-all duration-500">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">{count} Terms</span>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0" />
      </div>
      <h3 className="text-4xl font-black tracking-tighter leading-none">{title}</h3>
    </div>
  );
}