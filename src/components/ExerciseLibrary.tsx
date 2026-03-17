import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Play, Dumbbell } from 'lucide-react';
import { cn } from '../utils/cn';

interface ExerciseLibraryProps {
  user: any;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  setView: (view: any) => void;
  exerciseSearch: string;
  setExerciseSearch: (search: string) => void;
  apiExercises: any[];
  CATEGORY_IMAGES: any;
  PINTEREST_GIFS: any;
  EXERCISE_LIBRARY: any;
  CATEGORIES: any[];
  setSelectedVideoUrl: (url: string) => void;
  setVideoModalTitle: (title: string) => void;
  setIsVideoModalOpen: (open: boolean) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  user,
  selectedCategory,
  setSelectedCategory,
  setView,
  exerciseSearch,
  setExerciseSearch,
  apiExercises,
  CATEGORY_IMAGES,
  PINTEREST_GIFS,
  EXERCISE_LIBRARY,
  CATEGORIES,
  setSelectedVideoUrl,
  setVideoModalTitle,
  setIsVideoModalOpen,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={() => {
            if (selectedCategory) setSelectedCategory(null);
            else setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
          }}
          className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
          {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Biblioteca de Exercícios'}
        </h2>
        <div className="w-12" />
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "relative group overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-500",
                "bg-gradient-to-br border border-white/10",
                cat.color
              )}
            >
              <div className="relative z-10">
                <div className="mb-4 bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-display font-black uppercase tracking-tight">{cat.name}</h3>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Ver Exercícios</p>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Dumbbell size={80} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input 
              type="text"
              placeholder="Buscar exercício..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-forge-orange transition-colors"
            />
          </div>

          <div className="grid gap-4">
            {[
              ...apiExercises.map(ex => ({
                name: ex.name,
                videoUrl: ex.video_url,
                image: CATEGORY_IMAGES[selectedCategory || ''] || CATEGORY_IMAGES['chest'],
                isApi: true
              })),
              ...(EXERCISE_LIBRARY[selectedCategory || ''] || [])
                .filter(ex => !apiExercises.some(apiEx => apiEx.name.toLowerCase() === ex.name.toLowerCase()))
                .filter(ex => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
            ].map((ex, i) => (
                <div key={i} className="glass-card p-4 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-forge-orange/30 transition-all">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                    <img 
                      src={PINTEREST_GIFS[selectedCategory || '']?.[ex.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % (PINTEREST_GIFS[selectedCategory || '']?.length || 1)] || ex.image} 
                      alt={ex.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-black uppercase tracking-tight text-lg">{ex.name}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Foco: {CATEGORIES.find(c => c.id === selectedCategory)?.name}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-white/40 uppercase">Vídeo HD</span>
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-white/40 uppercase">Técnica</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedVideoUrl(ex.videoUrl || `https://www.youtube.com/results?search_query=Fitness+Online+${encodeURIComponent(ex.name)}`);
                      setVideoModalTitle(ex.name);
                      setIsVideoModalOpen(true);
                    }}
                    className="w-12 h-12 bg-forge-orange/10 text-forge-orange rounded-2xl flex items-center justify-center hover:bg-forge-orange hover:text-black transition-all shadow-lg shadow-forge-orange/5"
                  >
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
