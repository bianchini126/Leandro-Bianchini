import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Dumbbell, Zap, CheckCircle2 } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';

interface WorkoutDetailProps {
  currentWorkout: any;
  loading: boolean;
  handleGenerateWorkout: () => void;
  setView: (view: any) => void;
  selectedMuscles: string[];
  activeWorkoutLogs: Record<string, any[]>;
  setActiveWorkoutLogs: (logs: any) => void;
  startTimer: (seconds: number) => void;
  setWorkoutLogs: (logs: any) => void;
  unlockAchievement: (type: string) => void;
  user: any;
  CATEGORY_IMAGES: any;
  PINTEREST_GIFS: any;
  EXERCISE_LIBRARY: any;
}

export const WorkoutDetail: React.FC<WorkoutDetailProps> = ({
  currentWorkout,
  loading,
  handleGenerateWorkout,
  setView,
  selectedMuscles,
  activeWorkoutLogs,
  setActiveWorkoutLogs,
  startTimer,
  setWorkoutLogs,
  unlockAchievement,
  user,
  CATEGORY_IMAGES,
  PINTEREST_GIFS,
  EXERCISE_LIBRARY,
}) => {
  return (
    <motion.div
      key="workout-detail-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      {!currentWorkout ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 bg-forge-zinc rounded-2xl flex items-center justify-center animate-pulse">
            <Dumbbell className="text-forge-orange/20" size={32} />
          </div>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Nenhum treino carregado.</p>
          <button onClick={() => setView('generator')} className="text-forge-orange font-bold text-sm underline">Voltar ao Gerador</button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <button onClick={() => setView('generator')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGenerateWorkout}
                disabled={loading}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-forge-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-forge-orange/20"
              >
                {loading ? <RotateCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                Regenerar
              </button>
              <div className="bg-forge-orange text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                {currentWorkout.level || 'Elite'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-display font-extrabold text-gradient">{currentWorkout.title || 'Treino IronPulse'}</h1>
            <p className="text-white/60 flex items-center gap-2">
              <Dumbbell size={16} /> Foco: {currentWorkout.muscleGroup || 'Musculação'}
            </p>
          </div>

          <div className="space-y-4">
            {Array.isArray(currentWorkout.exercises) && currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((ex: any, idx: number) => {
                if (!ex) return null;
                return (
                  <ExerciseCard 
                    key={`${ex.name}-${idx}`} 
                    exercise={ex} 
                    index={idx} 
                    muscleGroup={selectedMuscles[0] || 'Default'} 
                    onStartRest={() => startTimer(60)}
                    logs={activeWorkoutLogs[ex.name] || []}
                    onUpdateLogs={(sets) => setActiveWorkoutLogs((prev: any) => ({ ...prev, [ex.name]: sets }))}
                    CATEGORY_IMAGES={CATEGORY_IMAGES}
                    PINTEREST_GIFS={PINTEREST_GIFS}
                    EXERCISE_LIBRARY={EXERCISE_LIBRARY}
                  />
                );
              })
            ) : (
              <div className="p-10 text-center glass-card rounded-3xl border border-dashed border-white/10">
                <p className="text-white/40 text-sm">Nenhum exercício encontrado neste treino.</p>
              </div>
            )}
          </div>

          {Array.isArray(currentWorkout.tips) && currentWorkout.tips.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <Zap size={20} className="text-forge-orange" />
                Dicas de Intensidade
              </h3>
              <div className="space-y-3">
                {currentWorkout.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex gap-3 p-4 bg-forge-zinc/50 rounded-2xl border border-white/5">
                    <CheckCircle2 size={20} className="text-forge-orange shrink-0" />
                    <p className="text-white/80 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <button 
            onClick={() => {
              const performedExercises = currentWorkout.exercises.map((ex: any) => ({
                name: ex.name,
                sets: activeWorkoutLogs[ex.name] || []
              }));

              const newLog = {
                id: Math.random().toString(36).substr(2, 9),
                date: Date.now(),
                workoutTitle: currentWorkout.title || 'Treino IronPulse',
                exercises: performedExercises
              };

              setWorkoutLogs((prev: any[]) => [newLog, ...prev]);
              setActiveWorkoutLogs({});
              unlockAchievement('FIRST_WORKOUT');
              setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-6 bg-forge-orange text-black rounded-3xl font-display font-black text-xl cyan-glow hover:scale-[1.02] transition-all shadow-2xl shadow-forge-orange/20"
          >
            FINALIZAR E SALVAR TREINO 🔥
          </button>
        </>
      )}
    </motion.div>
  );
};
