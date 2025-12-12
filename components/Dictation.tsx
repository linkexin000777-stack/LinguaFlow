import React, { useState, useEffect, useRef } from 'react';
import { Material, Sentence } from '../types';
import { Button } from './Button';
import { RotateCcw, Check, ArrowRight, Volume2 } from 'lucide-react';

interface DictationProps {
  material: Material;
  onComplete: (sentences: Sentence[]) => void;
}

export const Dictation: React.FC<DictationProps> = ({ material, onComplete }) => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Split content into sentences on mount
  useEffect(() => {
    // Regex to split by . ! ? but keep delimiter. Simplified for demo.
    const rawSentences = material.content.match(/[^.!?]+[.!?]+/g) || [material.content];
    const mapped = rawSentences.map((s, i) => ({
      id: i,
      text: s.trim(),
      isComplete: false,
      userDraft: ''
    }));
    setSentences(mapped);
  }, [material.content]);

  const currentSentence = sentences[currentIndex];

  const playSentence = () => {
    if (!currentSentence) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentSentence.text);
    u.rate = 0.9; // Slightly slower for dictation
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang === 'en-US');
    if (usVoice) u.voice = usVoice;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (currentSentence && !showResult) {
      playSentence();
      inputRef.current?.focus();
    }
  }, [currentIndex, currentSentence, showResult]);

  const checkAnswer = () => {
    // Save draft
    const updated = [...sentences];
    updated[currentIndex].userDraft = inputValue;
    updated[currentIndex].isComplete = true; // Mark as done regardless of accuracy for this step
    setSentences(updated);
    setShowResult(true);
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setInputValue('');
      setShowResult(false);
    } else {
      onComplete(sentences);
    }
  };

  if (!currentSentence) return <div className="p-10 text-center">Loading sentences...</div>;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-tiktok-pink">Dictation</span> Mode
        </h2>
        <span className="text-sm font-mono text-tiktok-cyan">
          {currentIndex + 1} / {sentences.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-900 rounded-full h-1.5">
        <div 
          className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink h-1.5 rounded-full transition-all" 
          style={{ width: `${((currentIndex) / sentences.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Controls */}
        <div className="flex justify-center">
          <button 
            onClick={playSentence}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-20 h-20 rounded-full border-2 border-tiktok-cyan flex items-center justify-center group-hover:bg-tiktok-cyan/10 transition-colors">
              <Volume2 className="w-8 h-8 text-tiktok-cyan" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Replay</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={showResult}
            placeholder="Type what you hear..."
            className={`w-full bg-tiktok-dark border-2 rounded-xl p-6 text-lg focus:outline-none transition-colors min-h-[120px] resize-none ${
              showResult 
                ? 'border-gray-700 text-gray-400' 
                : 'border-gray-700 focus:border-tiktok-pink text-white'
            }`}
          />
        </div>

        {/* Comparison Result */}
        {showResult && (
          <div className="bg-gray-900/50 p-6 rounded-xl border border-tiktok-cyan/30 animate-fade-in">
            <h3 className="text-xs text-tiktok-cyan uppercase tracking-widest mb-2">Original Text</h3>
            <p className="text-xl font-medium">{currentSentence.text}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-800">
               <p className="text-sm text-gray-400">Your input:</p>
               <p className="text-lg line-through decoration-tiktok-pink/50 opacity-70">{sentences[currentIndex].userDraft}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        {!showResult ? (
          <>
            <Button variant="secondary" onClick={() => { setInputValue(''); setShowResult(true); }} className="flex-1">
              Skip
            </Button>
            <Button onClick={checkAnswer} className="flex-[2]">
              Check <Check className="w-5 h-5 ml-2" />
            </Button>
          </>
        ) : (
          <Button onClick={nextSentence} fullWidth className="bg-tiktok-cyan text-black hover:bg-[#1DE4DE]">
            {currentIndex === sentences.length - 1 ? 'Finish' : 'Next Sentence'} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};