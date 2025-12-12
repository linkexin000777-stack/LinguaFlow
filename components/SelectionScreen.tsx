import React, { useState } from 'react';
import { Material } from '../types';
import { generateMaterials } from '../services/geminiService';
import { Button } from './Button';
import { BookOpen, Radio, Tv, Loader2, PlayCircle } from 'lucide-react';

interface SelectionScreenProps {
  onSelect: (material: Material) => void;
}

const CATEGORIES = [
  { id: 'News', label: 'Global News', icon: <Radio className="w-6 h-6" />, desc: 'BBC, CNN, Economist' },
  { id: 'Textbook', label: 'Textbooks', icon: <BookOpen className="w-6 h-6" />, desc: 'New Concept English' },
  { id: 'Speech', label: 'Speeches', icon: <Tv className="w-6 h-6" />, desc: 'TED Talks' },
];

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [generatedMaterials, setGeneratedMaterials] = useState<Material[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = async (catId: string) => {
    setSelectedCategory(catId);
    setLoading(true);
    setGeneratedMaterials([]);
    
    // Simulate difficulty selection or just default to Intermediate for demo
    const materials = await generateMaterials(catId, 'Intermediate');
    setGeneratedMaterials(materials);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-tiktok-cyan">Lingua</span><span className="text-tiktok-pink">Flow</span>
        </h1>
        <p className="text-tiktok-gray text-lg">Choose your learning source</p>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className="flex flex-col items-center p-8 bg-tiktok-dark border border-tiktok-gray rounded-2xl hover:border-tiktok-cyan hover:scale-105 transition-all duration-300 group"
            >
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-tiktok-cyan/20 text-tiktok-cyan mb-4 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{cat.label}</h3>
              <p className="text-sm text-gray-400 text-center">{cat.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
           <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="mb-4">
             ← Back to Categories
           </Button>

           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <Loader2 className="w-12 h-12 text-tiktok-pink animate-spin" />
               <p className="text-gray-400">Generating AI Materials...</p>
             </div>
           ) : (
             <div className="grid gap-4">
               {generatedMaterials.map((mat) => (
                 <div key={mat.id} className="bg-tiktok-dark border border-tiktok-gray p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-tiktok-pink transition-colors group">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-tiktok-cyan/10 text-tiktok-cyan text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                          {mat.difficulty}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          ⏱ {mat.duration}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-tiktok-pink transition-colors">{mat.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{mat.content.substring(0, 100)}...</p>
                    </div>
                    <Button onClick={() => onSelect(mat)} className="shrink-0">
                      Start <PlayCircle className="w-4 h-4 ml-2" />
                    </Button>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};