import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Check, RotateCcw, Award, ArrowRight } from 'lucide-react';
import { Concept } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: Concept[];
}

export function QuizModal({ isOpen, onClose, concepts }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<{
    concept: Concept;
    options: string[];
  }[]>([]);

  useEffect(() => {
    if (isOpen && concepts.length > 0) {
      const shuffled = [...concepts].sort(() => 0.5 - Math.random()).slice(0, 5);
      const questions = shuffled.map(concept => {
        const otherOptions = concepts
          .filter(c => c.id !== concept.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(c => c.term);
        
        const options = [concept.term, ...otherOptions].sort(() => 0.5 - Math.random());
        return { concept, options };
      });
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  }, [isOpen, concepts]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === quizQuestions[currentQuestionIndex].concept.term;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-paper border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-border flex items-center justify-between bg-ink/[0.02]">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-gold" />
            <h2 className="text-h2 serif font-bold">Lexicon Challenge</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-12">
          {!showResult ? (
            quizQuestions.length > 0 ? (
              <div className="space-y-12">
                <div className="flex justify-between items-end">
                  <span className="text-small uppercase tracking-widest font-bold text-ink-muted">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <div className="h-1 w-32 bg-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-small uppercase tracking-widest font-bold text-gold">Identify the term:</h3>
                  <p className="text-h2 serif italic leading-relaxed text-ink">
                    "{quizQuestions[currentQuestionIndex].concept.definition_short}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizQuestions[currentQuestionIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={cn(
                        "p-6 border border-border text-left transition-all duration-300 group relative overflow-hidden",
                        selectedAnswer === option && (isCorrect ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50"),
                        selectedAnswer && option === quizQuestions[currentQuestionIndex].concept.term && "border-emerald-500 bg-emerald-50",
                        !selectedAnswer && "hover:border-ink hover:shadow-lg hover:-translate-y-1"
                      )}
                    >
                      <span className="text-small font-bold uppercase tracking-widest relative z-10">
                        {option}
                      </span>
                      {selectedAnswer === option && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {isCorrect ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RotateCcw className="w-12 h-12 text-border animate-spin mb-4" />
                <p className="text-ink-muted italic">Preparing the challenge...</p>
              </div>
            )
          ) : (
            <div className="text-center space-y-8 py-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                className="inline-block p-6 bg-gold/10 rounded-full mb-4"
              >
                <Award className="w-20 h-20 text-gold" />
              </motion.div>
              <div>
                <h3 className="text-display display mb-2">Inquiry Complete</h3>
                <p className="text-h2 serif italic text-ink-muted">
                  You have mastered {score} out of {quizQuestions.length} principles.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    const shuffled = [...concepts].sort(() => 0.5 - Math.random()).slice(0, 5);
                    const questions = shuffled.map(concept => {
                      const otherOptions = concepts
                        .filter(c => c.id !== concept.id)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)
                        .map(c => c.term);
                      
                      const options = [concept.term, ...otherOptions].sort(() => 0.5 - Math.random());
                      return { concept, options };
                    });
                    setQuizQuestions(questions);
                    setCurrentQuestionIndex(0);
                    setScore(0);
                    setShowResult(false);
                    setSelectedAnswer(null);
                    setIsCorrect(null);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-ink text-paper text-small font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-4 border border-border text-small font-bold uppercase tracking-widest hover:border-ink transition-colors"
                >
                  Return to Lexicon
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
