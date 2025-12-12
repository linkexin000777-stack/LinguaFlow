import React, { useState } from 'react';
import { SelectionScreen } from './components/SelectionScreen';
import { BlindListening } from './components/BlindListening';
import { Dictation } from './components/Dictation';
import { ReviewAnalysis } from './components/ReviewAnalysis';
import { ShadowingRecording } from './components/ShadowingRecording';
import { Button } from './components/Button';
import { Material, AppStep, Sentence } from './types';
import { Home } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECTION);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);

  const handleSelectMaterial = (material: Material) => {
    setCurrentMaterial(material);
    setStep(AppStep.BLIND_LISTENING);
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.SELECTION:
        return <SelectionScreen onSelect={handleSelectMaterial} />;
      
      case AppStep.BLIND_LISTENING:
        if (!currentMaterial) return null;
        return (
          <BlindListening 
            material={currentMaterial} 
            onComplete={() => setStep(AppStep.DICTATION)} 
          />
        );

      case AppStep.DICTATION:
        if (!currentMaterial) return null;
        return (
          <Dictation 
            material={currentMaterial} 
            onComplete={(sentences) => {
              // Store sentences if we wanted to track detailed progress
              console.log("Dictation done", sentences);
              setStep(AppStep.REVIEW);
            }} 
          />
        );

      case AppStep.REVIEW:
        if (!currentMaterial) return null;
        return (
          <ReviewAnalysis 
            material={currentMaterial} 
            onComplete={() => setStep(AppStep.SHADOWING)} 
          />
        );

      case AppStep.SHADOWING:
        if (!currentMaterial) return null;
        return (
          <ShadowingRecording 
            material={currentMaterial} 
            onComplete={() => setStep(AppStep.SUMMARY)} 
          />
        );

      case AppStep.SUMMARY:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-fade-in p-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-tiktok-cyan to-tiktok-pink rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(254,44,85,0.5)]">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold">Session Complete!</h1>
            <p className="text-gray-400 max-w-md">
              Great job practicing {currentMaterial?.title}. You've practiced listening, writing, vocabulary, grammar, and speaking.
            </p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-8">
               <div className="bg-gray-900 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-tiktok-cyan">100%</div>
                 <div className="text-xs text-gray-500">Completion</div>
               </div>
               <div className="bg-gray-900 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-white">~15m</div>
                 <div className="text-xs text-gray-500">Duration</div>
               </div>
               <div className="bg-gray-900 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-tiktok-pink">A+</div>
                 <div className="text-xs text-gray-500">Est. Grade</div>
               </div>
            </div>
            <Button onClick={() => {
              setCurrentMaterial(null);
              setStep(AppStep.SELECTION);
            }}>
              Choose New Material
            </Button>
          </div>
        );

      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-tiktok-pink selection:text-white">
      {/* Header */}
      {step !== AppStep.SELECTION && step !== AppStep.SUMMARY && (
        <header className="p-4 border-b border-gray-900 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-tiktok-pink flex items-center justify-center font-bold">L</div>
            <span className="font-bold hidden md:block">LinguaFlow</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
             <span>{currentMaterial?.title}</span>
             <button onClick={() => setStep(AppStep.SELECTION)} className="hover:text-white">
               <Home className="w-5 h-5" />
             </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderStep()}
      </main>
    </div>
  );
};

export default App;