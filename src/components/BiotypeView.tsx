import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface BiotypeSectionProps {
  title: string;
  color: string;
  description: string;
  difficulty: string;
  advantage: string;
  training: string;
}

export const BiotypeSection: React.FC<BiotypeSectionProps> = ({ 
  title, 
  color, 
  description, 
  difficulty, 
  advantage, 
  training 
}) => {
  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
      <h3 className={cn("text-xl font-display font-black uppercase tracking-tighter", color)}>{title}</h3>
      <div className="space-y-3">
        <div className="text-white/80 text-sm leading-relaxed">
          <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Características</span>
          {description}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-white/80 text-xs leading-relaxed">
            <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Dificuldade</span>
            {difficulty}
          </div>
          <div className="text-white/80 text-xs leading-relaxed">
            <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Vantagem</span>
            {advantage}
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="text-white/80 text-xs leading-relaxed">
            <span className="text-forge-orange font-bold uppercase text-[10px] tracking-widest block mb-1">Foco de Treino</span>
            {training}
          </div>
        </div>
      </div>
    </div>
  );
};

interface BiotypeViewProps {
  setView: (view: any) => void;
  biotype: string;
  setBiotype: (biotype: any) => void;
}

export const BiotypeView: React.FC<BiotypeViewProps> = ({ setView, biotype, setBiotype }) => {
  return (
    <motion.div
      key="biotypes"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <button onClick={() => setView('generator')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="space-y-2">
        <h1 className="text-4xl font-display font-extrabold tracking-tighter">Biotipos Corporais</h1>
        <p className="text-white/60">Entenda sua genética para otimizar seus resultados.</p>
      </div>

      <div className="p-6 bg-forge-orange/10 rounded-3xl border border-forge-orange/20">
        <p className="text-sm text-white/80 leading-relaxed">
          Existem três tipos principais de biotipo corporal definidos pela genética. Eles influenciam o metabolismo, a facilidade de ganhar massa muscular e o acúmulo de gordura. Compreender o seu tipo ajuda a otimizar o treino e a alimentação.
        </p>
      </div>

      <div className="space-y-6">
        <BiotypeSection 
          title="Ectomorfo (Magro)"
          color="text-blue-400"
          description="Metabolismo acelerado, ossos finos, estrutura delgada e ombros estreitos."
          difficulty="Ganhar peso e massa muscular (hipertrofia)."
          advantage="Facilidade para manter baixo percentual de gordura."
          training="Intensidade alta, tempo de descanso maior (1-2 min). Focar em exercícios compostos (supino, agachamento, terra). Treinos curtos e intensos."
        />
        <BiotypeSection 
          title="Mesomorfo (Atlético)"
          color="text-forge-orange"
          description="Estrutura óssea larga, ombros largos, cintura estreita e aparência musculosa."
          difficulty="Baixa. Ganha músculos e perde gordura com facilidade."
          advantage="Corpo ideal para atividades de força e definição."
          training="Equilíbrio entre musculação intensa e cardio. Responde bem a variedade de estímulos (ABC, volume moderado a alto)."
        />
        <BiotypeSection 
          title="Endomorfo (Arredondado)"
          color="text-emerald-400"
          description="Metabolismo lento, tendência a acumular gordura, estrutura óssea larga."
          difficulty="Perder gordura (emagrecer)."
          advantage="Alta facilidade para ganhar massa muscular e força."
          training="Musculação intensa + HIIT/Cardio constante. Descanso menor (30-60s). Dica: Evitar açúcares e industrializados."
        />
      </div>

      <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-widest text-forge-orange">Outros Tipos de Treino</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Hipertrofia</p>
            <p className="text-[10px] text-white/40">3 a 5 séries de 8 a 12 repetições com carga progressiva.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Força (Powerlifting)</p>
            <p className="text-[10px] text-white/40">Cargas máximas (1-5 repetições) para força absoluta.</p>
          </div>
        </div>
        <p className="text-white/40 text-[10px] leading-relaxed italic pt-2 border-t border-white/5">
          * A maioria das pessoas é uma mistura de dois tipos. A chave é a consistência e o ajuste conforme a resposta do seu corpo.
        </p>
      </div>
    </motion.div>
  );
};
