import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, PlusCircle, Info, CheckCircle2, Dumbbell, Zap, Crown, Maximize2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface WorkoutGeneratorProps {
  user: any;
  setView: (view: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  filteredExercises: string[];
  handleAddManualExercise: (ex: string) => void;
  biotype: string;
  setBiotype: (b: any) => void;
  muscleGroups: string[];
  selectedMuscles: string[];
  toggleMuscle: (m: string) => void;
  handleGenerateWorkout: () => void;
  loading: boolean;
  generationCount: number;
  currentWorkout: any;
  setCurrentWorkout: (w: any) => void;
  MUSCLE_VIDEOS: any;
}

export const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({
  user,
  setView,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  filteredExercises,
  handleAddManualExercise,
  biotype,
  setBiotype,
  muscleGroups,
  selectedMuscles,
  toggleMuscle,
  handleGenerateWorkout,
  loading,
  generationCount,
  currentWorkout,
  setCurrentWorkout,
  MUSCLE_VIDEOS,
}) => {
  return (
    <motion.div
      key="generator"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar
      </button>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-extrabold">Gerador de Treino</h1>
        <p className="text-white/60">Selecione um ou mais músculos para combinar.</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="flex items-center gap-3 bg-forge-zinc p-4 rounded-2xl border border-white/5 focus-within:border-forge-orange/50 transition-all">
            <Search size={20} className="text-white/20" />
            <input 
              type="text" 
              placeholder="Pesquisar exercício específico..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/20 font-medium"
            />
          </div>
          
          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-forge-zinc border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
              >
                {filteredExercises.length > 0 ? filteredExercises.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleAddManualExercise(ex)}
                    className="w-full p-4 text-left hover:bg-white/5 border-b border-white/5 last:border-none flex items-center justify-between group"
                  >
                    <span className="font-medium group-hover:text-forge-orange transition-colors">{ex}</span>
                    <PlusCircle size={16} className="text-white/20 group-hover:text-forge-orange" />
                  </button>
                )) : (
                  <div className="p-4 text-center text-white/40 text-sm">Nenhum exercício encontrado.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40">Seu Biotipo</label>
            <button 
              onClick={() => setView('biotypes')}
              className="text-[10px] text-forge-orange font-bold flex items-center gap-1 hover:underline"
            >
              <Info size={12} /> O QUE É ISSO?
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { type: 'Ectomorfo', desc: 'Magro, metabolismo acelerado, dificuldade em ganhar peso.' },
              { type: 'Mesomorfo', desc: 'Atlético, ganha músculos e perde gordura com facilidade.' },
              { type: 'Endomorfo', desc: 'Estrutura larga, metabolismo lento, facilidade em ganhar peso.' }
            ].map((item) => {
              const b = item.type;
              return (
                <button
                  key={b}
                  onClick={() => setBiotype(b)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all text-left flex items-center justify-between",
                    biotype === b 
                      ? "bg-forge-orange/10 border-forge-orange text-white" 
                      : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">{b}</span>
                    <span className="text-xs text-white/40">{item.desc}</span>
                  </div>
                  {biotype === b && <CheckCircle2 size={20} className="text-forge-orange shrink-0 ml-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40">Grupos Musculares</label>
            <span className="text-xs text-forge-orange font-bold">{selectedMuscles.length} selecionados</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {muscleGroups.map((m) => (
              <div key={m} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMuscle(m)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left font-medium relative overflow-hidden",
                    selectedMuscles.includes(m) 
                      ? "bg-forge-orange border-forge-orange text-black font-bold cyan-glow" 
                      : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20"
                  )}
                >
                  <span className="relative z-10">{m}</span>
                  {selectedMuscles.includes(m) && (
                    <motion.div 
                      layoutId="pulse-bg"
                      className="absolute inset-0 bg-white/30"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
                    />
                  )}
                  <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Dumbbell size={48} />
                  </div>
                </motion.button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentWorkout({
                      title: `Anatomia: ${m}`,
                      muscleGroup: m,
                      level: 'Técnico',
                      exercises: [{
                        name: `Execução Correta: ${m}`,
                        sets: '-', reps: '-', rest: '-',
                        notes: `Visualize a anatomia e execução correta para o grupo: ${m}`,
                        videoUrl: MUSCLE_VIDEOS[m] || MUSCLE_VIDEOS['Default']
                      }],
                      tips: ['Foque na contração muscular', 'Mantenha a postura']
                    });
                    setView('workout-detail');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-forge-orange hover:text-black"
                  title="Ver Vídeo"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            disabled={selectedMuscles.length === 0 || loading || generationCount >= (user?.isPremium ? 4 : 2)}
            onClick={handleGenerateWorkout}
            className="w-full py-5 bg-white text-black rounded-2xl font-display font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-forge-orange hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>FORJAR TREINO COMBINADO <Zap size={20} /></>
            )}
          </button>
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-white/40 font-bold uppercase tracking-widest">
              Treinos gerados hoje: <span className={generationCount >= (user?.isPremium ? 4 : 2) ? "text-red-500" : "text-forge-orange"}>{generationCount}/{user?.isPremium ? 4 : 2}</span>
            </span>
            {!user?.isPremium && generationCount >= 2 && (
              <button onClick={() => setView('vip')} className="text-xs text-yellow-500 font-bold hover:underline flex items-center gap-1">
                <Crown size={12} /> SEJA VIP PARA GERAR MAIS
              </button>
            )}
          </div>
        </div>

        {currentWorkout && currentWorkout.exercises.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setView('workout-detail')}
            className="w-full py-4 bg-forge-zinc border border-forge-orange/30 text-forge-orange rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-forge-orange/10 transition-all"
          >
            VER TREINO ATUAL ({currentWorkout.exercises.length} EXERCÍCIOS) <ChevronRight size={18} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
