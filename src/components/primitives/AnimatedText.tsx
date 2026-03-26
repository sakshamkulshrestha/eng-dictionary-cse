import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: React.ElementType;
  animationType?: 'chars' | 'words' | 'lines';
  delayOffset?: number;
}

export default function AnimatedText({ 
  text, 
  className, 
  el: Wrapper = 'p',

  animationType = 'words',
  delayOffset = 0
}: AnimatedTextProps) {
  // Split the text conditionally
  const items = animationType === 'chars' ? text.split('') : text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: animationType === 'chars' ? 0.02 : 0.05,
        delayChildren: delayOffset
      }
    }
  };

  const item: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      skewY: 6
    },
    visible: { 
      opacity: 1, 
      y: 0,
      skewY: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
        mass: 0.8
      }
    }
  };

  return (
    <Wrapper className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="inline-block"
      >
        {items.map((word, index) => (
          <motion.span 
            key={index} 
            variants={item}
            className="inline-block"
            // Adding margin to words, none to chars
            style={{ marginRight: animationType === 'words' && index !== items.length - 1 ? '0.25em' : '0' }}
          >
            {word === ' ' && animationType === 'chars' ? '\u00A0' : word}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
}
