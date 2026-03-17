import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Zap, 
  Info, 
  Star, 
  Bot, 
  Dumbbell, 
  ChevronRight,
  Users,
  Award
} from 'lucide-react';
import { cn } from '../utils/cn';
import { QuadroExercicio } from './QuadroExercicio';
import { GymBro } from './GymBro';

interface DashboardProps {
  user: any;
  customWorkout: any;
  dailyTip: string;
  achievements: any[];
  workoutHistory: any[];
  ACHIEVEMENTS_LIST: any[];
  STATIC_EXERCISES: any[];
  handleStartCustomWorkout: () => void;
  setCurrentWorkout: (workout: any) => void;
  setView: (view: any) => void;
  token: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  customWorkout,
  dailyTip,
  achievements,
  workoutHistory,
  ACHIEVEMENTS_LIST,
  STATIC_EXERCISES,
  handleStartCustomWorkout,
  setCurrentWorkout,
  setView,
  token,
}) => {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* 1. Welcome Header - Personalization & Streak */}
      <header className="flex justify-between items-end pt-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest">Bem-vindo de volta</h2>
          </div>
          <h1 className="text-4xl font-display font-extrabold mt-1">{user?.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-right">
            <span className="text-[10px] font-bold uppercase text-white/40 block">Status</span>
            <span className={cn("text-xs font-bold uppercase", user?.isPremium ? "text-yellow-400" : "text-forge-orange")}>
              {user?.isPremium ? "Elite IronPulse" : "Membro Standard"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-forge-zinc flex items-center justify-center border border-white/10 cyan-glow overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <Flame className="text-forge-orange" />
            )}
          </div>
        </div>
      </header>



      {/* Custom Workout from Trainer - Enhanced with QuadroExercicio */}
      {customWorkout && (
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
                < Award size={16} /> Prescrição Profissional
              </h3>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase mt-1">Treino {customWorkout.fase}</h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase font-black">Personal</p>
              <p className="text-sm font-bold text-white uppercase">{customWorkout.personal_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customWorkout.exercicios.map((ex: any, idx: number) => (
              <QuadroExercicio 
                key={idx}
                nome={ex.nome}
                series={ex.s}
                repeticoes={ex.r}
                carga={ex.carga}
                urlGif={ex.gif}
                concluido={false}
                onConcluir={() => {}}
              />
            ))}
          </div>

          <button 
            onClick={handleStartCustomWorkout}
            className="w-full py-5 bg-emerald-500 text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
          >
            MODO TREINO COMPLETO
          </button>
        </section>
      )}

      {/* 2. Primary Action - The most important thing */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-forge-orange to-orange-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <button 
          onClick={() => setView('generator')}
          className="relative w-full glass-card p-5 rounded-[2rem] border border-white/10 flex items-center justify-between overflow-hidden"
        >
          <div className="space-y-1 text-left">
            <h3 className="text-xl font-display font-black italic tracking-tighter uppercase">Iniciar Treino de Hoje</h3>
            <p className="text-white/40 text-xs">Gere sua rotina em segundos.</p>
          </div>
          <div className="w-12 h-12 bg-forge-orange rounded-xl flex items-center justify-center shadow-lg shadow-forge-orange/20">
            <Zap size={24} className="text-black" />
          </div>
        </button>
      </div>

      {/* 3. Daily Tip - Engagement */}
      <section className="space-y-4">
        <div className="bg-gradient-to-br from-forge-zinc to-forge-black p-4 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Info size={40} />
          </div>
          <div className="relative z-10 space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-forge-orange">Dica de Hoje</h4>
            <p className="text-white/80 text-xs italic">
              "{dailyTip}"
            </p>
          </div>
        </div>
      </section>

      {/* GYM BRO — Destaque para TODOS os usuários */}
      <section>
        <h3 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest flex items-center gap-2 mb-3">
          <Users size={14} /> Parceiro de Treino
        </h3>
        <GymBro token={token} user={user} />
      </section>

      {/* 5. Rewards Section - Moved down */}
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
            <Star size={14} className="text-forge-orange" />
            Recompensas
          </h3>
          <button 
            onClick={() => setView('rewards')}
            className="text-[10px] font-bold text-forge-orange hover:underline uppercase tracking-widest"
          >
            Ver Todas ({achievements.length}/{ACHIEVEMENTS_LIST.length})
          </button>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ACHIEVEMENTS_LIST.map((achievement, idx) => {
              const isUnlocked = achievements.some(a => a.type === achievement.type);
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500",
                    isUnlocked 
                      ? "bg-forge-orange/20 border border-forge-orange/50 grayscale-0" 
                      : "bg-white/5 border border-white/5 grayscale opacity-30"
                  )}
                  title={achievement.title}
                >
                  {achievement.icon}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. History & VIP (Moved to bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Últimos Treinos</h3>
            <button onClick={() => setView('generator')} className="text-[10px] font-bold text-forge-orange hover:text-white transition-colors uppercase tracking-widest">Ver Todos</button>
          </div>
          <div className="space-y-2">
            {workoutHistory.length > 0 ? workoutHistory.slice(0, 2).map((w, i) => (
              <div key={i} className="glass-card p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-forge-orange/30 transition-all cursor-pointer" onClick={() => { setCurrentWorkout(w); setView('workout-detail'); }}>
                <div>
                  <h4 className="font-bold text-xs">{w.title}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-mono">{w.muscleGroup}</p>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-forge-orange transition-colors" size={14} />
              </div>
            )) : (
              <div className="p-4 text-center glass-card rounded-xl border border-white/5 border-dashed">
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Nenhum treino gerado ainda.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Coach AI & Nutrição</h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Bot className="text-emerald-400" size={16} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold">Dúvidas sobre dieta?</h4>
              </div>
            </div>
            <button 
              onClick={() => setView('coach')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase transition-colors"
            >
              Falar com Coach
            </button>
          </div>

          <div className="glass-card p-4 rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-black uppercase tracking-tight text-yellow-400 drop-shadow-md">Recursos VIP</h4>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">Desbloqueie seu potencial máximo</p>
              </div>
            </div>
            <button 
              onClick={() => setView('vip')}
              className="w-full py-2.5 bg-yellow-400 text-black rounded-lg text-xs font-black uppercase hover:bg-white transition-colors shadow-lg shadow-yellow-400/20"
            >
              Acessar Área VIP
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
