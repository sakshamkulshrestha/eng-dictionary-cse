import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function SkeletonLoader({ className, lines = 1 }: { className?: string, lines?: number }) {
  return (
    <div className={clsx("w-full flex flex-col gap-4", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="relative w-full overflow-hidden bg-[var(--hover)] border border-[var(--border)] h-32 p-6 flex flex-col justify-between">
          <div className="w-1/4 h-3 bg-[var(--border)] mb-4"></div>
          <div className="w-3/4 h-6 bg-[var(--border)] mb-2"></div>
          <div className="w-full h-4 bg-[var(--border)] opacity-50"></div>
          
          <motion.div
            className="absolute inset-0 z-10 w-full h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(229, 254, 64, 0.05), transparent)' // subtle neo-green shimmer
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.2, 
              ease: "linear",
              delay: i * 0.1
            }}
          />
        </div>
      ))}
    </div>
  );
}
