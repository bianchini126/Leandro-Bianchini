import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Info, Star } from 'lucide-react';

interface FeedbackViewProps {
  setView: (view: any) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ setView }) => {
  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar ao Perfil
      </button>

      <div>
        <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">Feedback</h2>
        <p className="text-white/60">Sua opinião ajuda a forjar um app melhor.</p>
      </div>
      
      <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Avaliação</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} className="p-2 text-forge-orange hover:scale-110 transition-transform">
                <Star size={32} fill={s <= 4 ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">O que podemos melhorar?</label>
          <textarea 
            className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-forge-orange transition-all h-32 resize-none"
            placeholder="Sugestões, bugs ou elogios..."
          />
        </div>

        <button 
          onClick={() => {
            alert("Feedback enviado com sucesso! Obrigado.");
            setView('profile');
          }}
          className="w-full py-4 bg-forge-orange text-black rounded-2xl font-display font-extrabold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-forge-orange/20"
        >
          ENVIAR FEEDBACK <Send size={20} />
        </button>
      </div>

      <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-4">
        <h4 className="font-bold flex items-center gap-2"><Info size={18} className="text-forge-orange" /> Por que seu feedback importa?</h4>
        <p className="text-white/40 text-sm leading-relaxed">
          Estamos em constante evolução. Futuras atualizações incluirão histórico de treinos, integração com smartwatches e novos modos de IA.
        </p>
      </div>
    </motion.div>
  );
};
