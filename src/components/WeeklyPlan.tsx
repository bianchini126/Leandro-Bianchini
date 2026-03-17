import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';

interface WeeklyPlanProps {
  weeklyPlan: any;
  handleLoadWeeklyPlan: () => void;
  setView: (view: any) => void;
  setSelectedMuscles: (muscles: string[]) => void;
  user: any;
}

export const WeeklyPlan: React.FC<WeeklyPlanProps> = ({
  weeklyPlan,
  handleLoadWeeklyPlan,
  setView,
  setSelectedMuscles,
  user,
}) => {
  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="space-y-2">
        <h1 className="text-4xl font-display font-extrabold">Plano Semanal</h1>
        <p className="text-white/60">Sua jornada de 7 dias forjada pela IA.</p>
      </div>

      {!weeklyPlan || !weeklyPlan.plan ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 bg-forge-zinc rounded-2xl flex items-center justify-center animate-pulse">
            <Calendar className="text-forge-orange/20" size={32} />
          </div>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Nenhum plano carregado.</p>
          <button onClick={handleLoadWeeklyPlan} className="text-forge-orange font-bold text-sm underline">Gerar Plano Agora</button>
        </div>
      ) : (
        <div className="space-y-4">
          {weeklyPlan.plan.map((day: any, i: number) => (
            <div key={i} className="glass-card p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-forge-orange/30 transition-all">
              <div className="space-y-1">
                <span className="text-forge-orange text-xs font-bold uppercase tracking-widest">{day.day}</span>
                <h4 className="text-xl font-display font-bold">{day.focus}</h4>
                <p className="text-white/40 text-sm">{day.description}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedMuscles([day.focus.split(' ')[0]]);
                  setView('generator');
                }}
                className="w-10 h-10 rounded-full bg-forge-zinc flex items-center justify-center group-hover:bg-forge-orange transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
