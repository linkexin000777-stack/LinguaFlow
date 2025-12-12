import React, { useState } from 'react';
import { Material, WordAnalysis, GrammarAnalysis } from '../types';
import { explainWordInChinese, analyzeGrammarInChinese } from '../services/geminiService';
import { X, Search, Book, Sparkles, MoveRight } from 'lucide-react';
import { Button } from './Button';

interface ReviewAnalysisProps {
  material: Material;
  onComplete: () => void;
}

export const ReviewAnalysis: React.FC<ReviewAnalysisProps> = ({ material, onComplete }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<WordAnalysis | null>(null);
  const [grammarAnalysis, setGrammarAnalysis] = useState<GrammarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingType, setAnalyzingType] = useState<'word' | 'grammar' | null>(null);

  const words = material.content.split(/\s+/);

  const handleWordClick = async (word: string) => {
    // Remove punctuation
    const cleanWord = word.replace(/[.,!?;:"()]/g, "");
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setAnalyzingType('word');
    setIsLoading(true);
    setWordAnalysis(null);
    setGrammarAnalysis(null); // Close grammar panel if open

    const result = await explainWordInChinese(cleanWord, material.content.substring(0, 200)); // Pass context
    setWordAnalysis(result);
    setIsLoading(false);
  };

  const handleGrammarCheck = async () => {
    setAnalyzingType('grammar');
    setIsLoading(true);
    setWordAnalysis(null); // Close word panel
    setGrammarAnalysis(null);

    // Analyze first sentence or random one for demo, ideally user highlights text
    // Here we analyze the FIRST sentence of the text for demonstration
    const sentence = material.content.match(/[^.!?]+[.!?]+/g)?.[0] || material.content;
    const result = await analyzeGrammarInChinese(sentence);
    setGrammarAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="relative flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Deep Dive</h2>
        <Button size="sm" onClick={onComplete}>Next: Shadowing <MoveRight className="w-4 h-4 ml-2"/></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Text Area */}
        <div className="lg:col-span-2 overflow-y-auto pr-2 pb-20">
          <div className="bg-tiktok-dark p-6 rounded-2xl border border-gray-800 leading-loose text-lg">
            {words.map((word, idx) => (
              <span 
                key={idx} 
                onClick={() => handleWordClick(word)}
                className="cursor-pointer hover:text-tiktok-cyan hover:bg-tiktok-cyan/10 rounded px-0.5 transition-colors inline-block"
              >
                {word}{' '}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex gap-4">
             <Button variant="secondary" onClick={handleGrammarCheck} className="w-full">
               <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Analyze Grammar (First Sentence)
             </Button>
          </div>
        </div>

        {/* Analysis Panel (Sticky/Sidebar) */}
        <div className="lg:col-span-1 border-l border-gray-800 pl-0 lg:pl-6 overflow-y-auto">
           {(analyzingType) && (
             <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 h-full animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-tiktok-pink font-bold uppercase tracking-widest text-sm">
                    {analyzingType === 'word' ? 'Dictionary' : 'Grammar AI'}
                  </h3>
                  <button onClick={() => setAnalyzingType(null)}><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-700 rounded w-full"></div>
                  </div>
                ) : (
                  <>
                    {analyzingType === 'word' && wordAnalysis && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-3xl font-bold text-white">{wordAnalysis.word}</h4>
                          <span className="text-tiktok-cyan font-mono text-sm">{wordAnalysis.partOfSpeech}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
                          <p className="text-lg">{wordAnalysis.definition}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase mb-1">Example</p>
                          <p className="text-gray-300 italic">"{wordAnalysis.example}"</p>
                        </div>
                      </div>
                    )}

                    {analyzingType === 'grammar' && grammarAnalysis && (
                      <div className="space-y-4">
                        <div className="bg-black/40 p-3 rounded-lg border-l-2 border-tiktok-cyan">
                          <p className="text-sm italic text-gray-300">"{grammarAnalysis.sentence}"</p>
                        </div>
                        <div className="prose prose-invert prose-sm">
                          <p>{grammarAnalysis.explanation}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
             </div>
           )}
           
           {!analyzingType && (
             <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 p-6 border-2 border-dashed border-gray-800 rounded-xl">
               <Book className="w-12 h-12 opacity-50" />
               <p className="text-center text-sm">Click any word to see its Chinese definition, or use the Grammar button.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};