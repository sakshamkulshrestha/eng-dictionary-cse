import React from 'react';

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={`shrink-0 ${className || ''}`}
    >
      <defs>
        <linearGradient id="cse-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1020" />
          <stop offset="100%" stopColor="#1C243B" />
        </linearGradient>
        <linearGradient id="cse-mark-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E5FE40" />
          <stop offset="100%" stopColor="#B6D90E" />
        </linearGradient>
      </defs>

      <rect x="6" y="6" width="84" height="84" rx="24" fill="url(#cse-mark-bg)" />
      <rect x="18" y="18" width="60" height="60" rx="18" fill="none" stroke="#2F3C62" strokeWidth="2" />

      <path
        d="M30 58L40 38C41.6 34.8 46.1 34.8 47.7 38L57.7 58"
        fill="none"
        stroke="url(#cse-mark-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41 53H55"
        fill="none"
        stroke="url(#cse-mark-accent)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle cx="63.5" cy="34" r="5.5" fill="#7CD6FF" />
      <circle cx="29.5" cy="34" r="4.5" fill="#7CD6FF" opacity="0.75" />
      <path d="M34 34H58" stroke="#7CD6FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}
