import React, { useState, useEffect, useRef } from 'react';
import { Material } from '../types';
import { Button } from './Button';
import { Play, Pause, FastForward, EyeOff } from 'lucide-react';

interface BlindListeningProps {
  material: Material;
  onComplete: () => void;
}

export const BlindListening: React.FC<BlindListeningProps> = ({ material, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synth = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Setup TTS
    const u = new SpeechSynthesisUtterance(material.content);
    u.rate = 1.0; 
    u.pitch = 1.0;
    
    // Attempt to find a US English voice
    const voices = synth.current.getVoices();
    const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    if (usVoice) u.voice = usVoice;

    u.onend = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    u.onboundary = (event) => {
       // Estimate progress based on char index
       const len = material.content.length;
       const percent = (event.charIndex / len) * 100;
       setProgress(percent);
    };

    utterance.current = u;

    // Cleanup
    return () => {
      synth.current.cancel();
    };
  }, [material.content]);

  const togglePlay = () => {
    if (isPlaying) {
      synth.current.pause();
    } else {
      if (synth.current.paused) {
        synth.current.resume();
      } else {
        if (utterance.current) synth.current.speak(utterance.current);
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <EyeOff className="text-tiktok-cyan" /> Blind Listening
        </h2>
        <span className="text-sm text-gray-500">Step 1/5</span>
      </div>

      <div className="bg-tiktok-dark rounded-3xl p-8 relative overflow-hidden min-h-[300px] flex items-center justify-center border border-tiktok-gray">
        {/* Visualizer Animation (Simulated) */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
             {[...Array(20)].map((_, i) => (
               <div 
                 key={i} 
                 className="w-2 bg-tiktok-pink rounded-full animate-pulse-fast"
                 style={{ 
                   height: `${Math.random() * 60 + 20}%`,
                   animationDelay: `${Math.random() * 0.5}s`
                 }}
               />
             ))}
          </div>
        )}

        {/* Mosaic Text */}
        <div className="relative z-10 w-full">
           <p className="blur-text text-xl leading-relaxed text-justify select-none font-medium">
             {material.content}
           </p>
           <div className="absolute inset-0 flex items-center justify-center">
             <p className="text-gray-500 font-mono text-sm uppercase tracking-widest bg-black/80 px-4 py-2 rounded-lg border border-gray-800 backdrop-blur-sm">
               Listen Carefully
             </p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-tiktok-cyan transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-6">
          <button 
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-tiktok-pink text-white flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(254,44,85,0.4)]"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
        </div>
      </div>

      <div className="pt-8 text-center">
        <Button 
          variant="secondary" 
          onClick={() => {
            synth.current.cancel();
            onComplete();
          }}
          className="group"
        >
          Proceed to Dictation <FastForward className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};