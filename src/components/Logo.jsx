import React from 'react';
import { BookHeart } from 'lucide-react';

export default function Logo({ onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform origin-left group"
    >
      <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] bg-accent flex items-center justify-center shadow-md shadow-accent/30 group-hover:shadow-lg group-hover:shadow-accent/50 transition-all duration-300 transform group-hover:-translate-y-0.5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
        <BookHeart className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-white relative z-10" strokeWidth={2.5} />
      </div>
      <span className="text-[20px] sm:text-[22px] font-black tracking-[-0.03em] text-black dark:text-white">
        Engineered
      </span>
    </div>
  );
}