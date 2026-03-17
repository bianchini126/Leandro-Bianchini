import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap } from 'lucide-react';

interface FoodAnalysisModalProps {
  foodAnalysis: any;
  setFoodAnalysis: (val: any) => void;
  lastFoodImage: string | null;
  onClose: () => void;
}

export const FoodAnalysisModal: React.FC<FoodAnalysisModalProps> = ({
  foodAnalysis,
  setFoodAnalysis,
  lastFoodImage,
  onClose,
}) => {
  const exportReport = () => {
    if (!foodAnalysis) return;
    window.print();
  };

  const shareWhatsApp = () => {
    if (!foodAnalysis) return;
    const text = `*🍎 RELATÓRIO NUTRICIONAL - IRONPULSE AI*%0A%0A` +
      `*Total:* ${foodAnalysis.totalCalories} kcal%0A` +
      `*Proteínas:* ${foodAnalysis.macros.protein}g%0A` +
      `*Carboidratos:* ${foodAnalysis.macros.carbs}g%0A` +
      `*Gorduras:* ${foodAnalysis.macros.fats}g%0A` +
      `*Fibras:* ${foodAnalysis.macros.fiber}g%0A` +
      `*Açúcares:* ${foodAnalysis.macros.sugar}g%0A%0A` +
      `*📋 ALIMENTOS:*%0A${foodAnalysis.foodItems.map((item: string) => `- ${item}`).join('%0A')}%0A%0A` +
      `*💡 DICA DO COACH:*%0A"${foodAnalysis.tips}"%0A%0A` +
      `_Gerado por IronPulse AI_`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {foodAnalysis && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-card w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(242,125,38,0.2)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-forge-orange p-8 text-black">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Análise Nutricional</h3>
                  <p className="font-bold text-sm uppercase tracking-widest opacity-60">IA Nutrition Scanner</p>
                </div>
                <button onClick={onClose} className="bg-black/10 p-2 rounded-full hover:bg-black/20 transition-colors">
                  <X size={24} />
                </button>
              </div>
              {lastFoodImage && (
                <div className="mb-6 rounded-2xl overflow-hidden border-2 border-black/10 aspect-video">
                  <img src={lastFoodImage} alt="Comida analisada" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-6xl font-display font-black tracking-tighter">
                {foodAnalysis.totalCalories} <span className="text-xl uppercase">kcal</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Proteínas</span>
                  <span className="text-xl font-display font-black text-blue-400">{foodAnalysis.macros.protein}g</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Carbos</span>
                  <span className="text-xl font-display font-black text-green-400">{foodAnalysis.macros.carbs}g</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Gorduras</span>
                  <span className="text-xl font-display font-black text-yellow-400">{foodAnalysis.macros.fats}g</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-white/40">Fibras</span>
                  <span className="text-sm font-bold text-emerald-400">{foodAnalysis.macros.fiber}g</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-white/40">Açúcares</span>
                  <span className="text-sm font-bold text-red-400">{foodAnalysis.macros.sugar}g</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Alimentos Identificados</h4>
                <div className="flex flex-wrap gap-2">
                  {foodAnalysis.foodItems.map((item: string, i: number) => (
                    <span key={i} className="bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-forge-orange/10 p-6 rounded-3xl border border-forge-orange/20">
                <div className="flex items-start gap-3">
                  <Zap className="text-forge-orange shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-forge-orange mb-1">Dica do Coach</h4>
                    <p className="text-white/80 text-sm leading-relaxed italic">"{foodAnalysis.tips}"</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  VOLTAR
                </button>
                <button 
                  onClick={exportReport}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-forge-orange transition-colors shadow-lg active:scale-95"
                >
                  PDF/PRINT
                </button>
                <button 
                  onClick={shareWhatsApp}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
                >
                  WHATSAPP
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
