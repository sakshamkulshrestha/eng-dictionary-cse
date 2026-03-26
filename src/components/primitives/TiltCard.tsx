import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function TiltCard({ children, className, onClick, interactive = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the raw mouse values
  const springConfig = { damping: 20, stiffness: 300 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Map mouse position to rotation logic
  // Max rotation is 5 degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={interactive ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      } : {}}
      whileHover={interactive ? { scale: 1.01 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      className={cn(
        "neo-card",
        interactive && "neo-card-interactive",
        className
      )}
    >
      {/* Optional: subtle radial gradient follow for glow effect inside the card boundaries */}
      {interactive && (
         <motion.div 
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at 50% 50%, rgba(255,255,255,0.05), transparent 40%)`
            }}
         />
      )}
      <div 
        style={{ transform: interactive ? 'translateZ(20px)' : 'none' }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
}
