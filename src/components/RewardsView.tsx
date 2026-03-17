import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface RewardsViewProps {
  setView: (view: any) => void;
  user: any;
  achievements: any[];
  ACHIEVEMENTS_LIST: any[];
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  setView,
  user,
  achievements,
  ACHIEVEMENTS_LIST,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar ao Início
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">Suas Conquistas</h2>
          <p className="text-white/40">Forje sua lenda através da constância.</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-display font-black text-forge-orange">{achievements?.length || 0}</span>
          <span className="text-white/20 font-display font-black text-xl">/{ACHIEVEMENTS_LIST.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS_LIST.map((achievement, idx) => {
          const isUnlocked = achievements?.some(a => a.type === achievement.type);
          const unlockedData = achievements?.find(a => a.type === achievement.type);
          
          return (
            <div 
              key={idx} 
              className={cn(
                "glass-card p-5 rounded-3xl border flex items-center gap-5 transition-all duration-500",
                isUnlocked 
                  ? "border-forge-orange/30 bg-forge-orange/5" 
                  : "border-white/5 opacity-40 grayscale"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0",
                isUnlocked ? "bg-forge-orange/20" : "bg-white/5"
              )}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className={cn("font-bold text-lg", isUnlocked ? "text-white" : "text-white/60")}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-white/40 leading-tight mb-2">{achievement.description}</p>
                {isUnlocked && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-forge-orange uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Desbloqueado em {new Date(unlockedData?.unlocked_at || '').toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
