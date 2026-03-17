import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Play, Info, PlusCircle, X, BookOpen, RotateCcw, Zap, Dumbbell } from 'lucide-react';
import ReactPlayer from 'react-player';
import { cn } from '../utils/cn';

// Types (should eventually move to a shared types file)
interface PerformedSet {
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  videoUrl?: string;
  imageUrl?: string;
  overview?: string;
  instructions?: string[];
  exerciseTips?: string[];
  equipments?: string[];
}

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  muscleGroup: string;
  onStartRest: () => void;
  logs: PerformedSet[];
  onUpdateLogs: (sets: PerformedSet[]) => void;
  CATEGORY_IMAGES: Record<string, string>;
  PINTEREST_GIFS: Record<string, string[]>;
  EXERCISE_LIBRARY: Record<string, any[]>;
}

const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function StatBox({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-forge-zinc/50 p-2 rounded-xl border border-white/5 text-center">
      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1 flex items-center justify-center gap-1">
        {icon} {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export function VideoModal({ url, isOpen, onClose, title }: { url: string, isOpen: boolean, onClose: () => void, title: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="w-full h-full pt-16">
          <ReactPlayer 
            {...({
              url: url,
              width: "100%",
              height: "100%",
              controls: true,
              playing: true
            } as any)}
          />
        </div>
      </motion.div>
    </div>
  );
}

export function ExerciseDetailsModal({ exercise, isOpen, onClose }: { exercise: WorkoutExercise | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-forge-zinc rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-forge-zinc/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">{exercise.name}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {exercise.overview && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Info size={14} /> Visão Geral
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">{exercise.overview}</p>
            </section>
          )}

          {exercise.instructions && exercise.instructions.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Instruções
              </h4>
              <div className="space-y-3">
                {exercise.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-forge-orange/20 text-forge-orange flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {exercise.exerciseTips && exercise.exerciseTips.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Zap size={14} /> Dicas do Especialista
              </h4>
              <ul className="space-y-2">
                {exercise.exerciseTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="text-forge-orange mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {exercise.equipments && exercise.equipments.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Dumbbell size={14} /> Equipamentos
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.equipments.map((eq, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60">
                    {eq}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  index, 
  muscleGroup, 
  onStartRest,
  logs,
  onUpdateLogs,
  CATEGORY_IMAGES,
  PINTEREST_GIFS,
  EXERCISE_LIBRARY
}) => {
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5s safety timeout
    return () => clearTimeout(timer);
  }, []);
  
  const addSet = () => {
    const lastSet = logs[logs.length - 1];
    onUpdateLogs([...logs, { 
      reps: lastSet?.reps || 10, 
      weight: lastSet?.weight || 0 
    }]);
  };

  const removeSet = (idx: number) => {
    onUpdateLogs(logs.filter((_, i) => i !== idx));
  };

  const updateSet = (idx: number, field: keyof PerformedSet, value: number) => {
    const newLogs = [...logs];
    newLogs[idx] = { ...newLogs[idx], [field]: value };
    onUpdateLogs(newLogs);
  };

  const normalizedName = normalizeText(exercise.name);
  const libraryImage = Object.values(EXERCISE_LIBRARY).flat().find(ex => {
    const libName = normalizeText(ex.name);
    return normalizedName.includes(libName) || libName.includes(normalizedName);
  })?.image;
  
  const categoryKey = Object.keys(CATEGORY_IMAGES).find(key => {
    const groupMap: Record<string, string[]> = {
      chest: ['chest', 'peito', 'peitoral'],
      back: ['back', 'costas', 'dorsal'],
      legs: ['legs', 'pernas', 'quadriceps', 'isquios'],
      calves: ['panturrilha', 'calves'],
      shoulders: ['shoulders', 'ombros', 'deltoides'],
      biceps: ['biceps'],
      triceps: ['triceps'],
      abs: ['abs', 'abdomen', 'core', 'abdominal'],
      arms: ['arms', 'bracos', 'antebreco']
    };
    return groupMap[key]?.some(term => normalizeText(muscleGroup).includes(term));
  }) || 'chest';

  const pinterestGifs = PINTEREST_GIFS[categoryKey] || PINTEREST_GIFS['chest'];
  const nameHash = exercise.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gifUrl = pinterestGifs[nameHash % pinterestGifs.length];

  const imageUrl = exercise.imageUrl || libraryImage || gifUrl || CATEGORY_IMAGES[categoryKey] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 1) }}
        className={cn(
          "glass-card p-5 rounded-3xl border transition-all relative overflow-hidden group/card",
          completed ? "border-emerald-500/30 bg-emerald-500/5 opacity-60" : "border-white/5"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-forge-orange font-mono text-xs font-bold tracking-tighter">EX {index + 1}</span>
              {completed && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Concluído</span>}
            </div>
            <h4 className="text-lg font-display font-bold leading-tight">{exercise.name}</h4>
          </div>
          <button 
            onClick={() => {
              setCompleted(!completed);
              if (!completed) onStartRest();
            }}
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-all shrink-0",
              completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 text-white/40 hover:border-white/60 hover:bg-white/5"
            )}
          >
            <CheckCircle2 size={20} />
          </button>
        </div>

        <div className="mb-4 relative group overflow-hidden rounded-2xl bg-forge-zinc aspect-video flex items-center justify-center border border-white/5 shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-forge-zinc z-10">
              <div className="w-8 h-8 border-2 border-forge-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <img 
            src={imageUrl} 
            alt={exercise.name}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              (e.target as HTMLImageElement).src = CATEGORY_IMAGES[categoryKey] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';
            }}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />
          <div className="absolute inset-0 pointer-events-none border-4 border-forge-orange/20 mix-blend-overlay group-hover:border-forge-orange/40 transition-all z-20" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatBox label="Séries" value={exercise.sets} />
          <StatBox label="Reps" value={exercise.reps} />
          <StatBox label="Descanso" value={exercise.rest} icon={<Clock size={12} />} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => setIsVideoModalOpen(true)}
            className="py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Play size={12} fill="currentColor" /> Vídeo
          </button>
          <button 
            onClick={() => setIsDetailsModalOpen(true)}
            className="py-3 bg-forge-orange/10 border border-forge-orange/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forge-orange/20 text-forge-orange transition-all"
          >
            <Info size={12} /> Detalhes
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Registrar Séries</h5>
            <button onClick={addSet} className="text-[10px] font-bold text-forge-orange hover:underline flex items-center gap-1">
              <PlusCircle size={12} /> ADICIONAR SÉRIE
            </button>
          </div>
          <div className="space-y-2">
            {logs.map((set, sIdx) => (
              <div key={sIdx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white/20 w-4">{sIdx + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Reps</span>
                    <input 
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(sIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-white/10 focus:border-forge-orange transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Peso (kg)</span>
                    <input 
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(sIdx, 'weight', parseInt(e.target.value) || 0)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-white/10 focus:border-forge-orange transition-colors"
                    />
                  </div>
                </div>
                <button onClick={() => removeSet(sIdx)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-forge-zinc/30 p-3.5 rounded-2xl border border-white/5 group-hover/card:border-white/10 transition-colors">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-forge-orange shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs leading-relaxed italic">"{exercise.notes}"</p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (logs.length === 0) addSet();
            onStartRest();
          }}
          className="w-full mt-4 py-4 bg-forge-orange text-black rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-[0.98] shadow-lg shadow-forge-orange/10"
        >
          CONCLUIR SÉRIE <CheckCircle2 size={18} />
        </button>
      </motion.div>

      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        url={exercise.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)}+execucao`} 
        title={exercise.name} 
      />

      <ExerciseDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        exercise={exercise} 
      />
    </>
  );
};
