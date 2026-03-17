import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface LegalViewProps {
  setView: (view: any) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ setView }) => {
  return (
    <motion.div
      key="legal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="space-y-2">
        <h1 className="text-4xl font-display font-extrabold tracking-tighter">Termos e Privacidade</h1>
        <p className="text-white/60">Transparência e conformidade legal (LGPD).</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <h3 className="text-xl font-display font-bold text-forge-orange">1. Proteção de Dados (LGPD)</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            O IronPulse AI está em conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais (nome, e-mail, biotipo) são utilizados exclusivamente para personalizar sua experiência de treino. Não compartilhamos seus dados com terceiros.
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <h3 className="text-xl font-display font-bold text-forge-orange">2. Web Rádio e Direitos Autorais</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            As estações de rádio integradas são transmissões públicas via internet. O IronPulse AI atua apenas como um agregador de links. O uso comercial dessas transmissões em ambientes públicos pode exigir licenciamento específico (como o ECAD no Brasil).
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <h3 className="text-xl font-display font-bold text-forge-orange">3. Isenção de Responsabilidade</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Os treinos gerados pela IA são sugestões baseadas em algoritmos. Sempre consulte um profissional de educação física e um médico antes de iniciar qualquer atividade física intensa.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
