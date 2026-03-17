import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface QuadroExercicioProps {
  nome: string;
  series: number;
  repeticoes: string;
  carga: string;
  urlGif: string;
  concluido: boolean;
  onConcluir: () => void;
}

export function QuadroExercicio({ nome, series, repeticoes, carga, urlGif, concluido, onConcluir }: QuadroExercicioProps) {
  const [carregado, setCarregado] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-forge-zinc/40 backdrop-blur-xl rounded-[2.5rem] p-6 border transition-all relative overflow-hidden group",
        concluido ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 hover:border-white/10"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-display font-black uppercase text-white tracking-tighter leading-none">{nome}</h3>
          <p className="text-[10px] text-forge-orange font-bold uppercase mt-1 tracking-widest">Hipertrofia Otimizada</p>
        </div>
        <button 
          onClick={onConcluir}
          className={cn(
            "w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-lg",
            concluido 
              ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20" 
              : "border-white/10 text-white/20 hover:border-white/40 hover:bg-white/5"
          )}
        >
          <CheckCircle2 size={24} />
        </button>
      </div>
      
      {/* Quadro de Visualização de GIF - Performance Estrema */}
      <div className="aspect-video bg-black/40 rounded-3xl overflow-hidden relative border border-white/5 mb-6 group-hover:border-forge-orange/30 transition-colors">
        {!carregado && (
          <div className="absolute inset-0 flex items-center justify-center bg-forge-zinc/50 z-10">
            <div className="w-8 h-8 border-2 border-forge-orange border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img 
          src={urlGif || `https://media.giphy.com/media/generic/giphy.gif?q=${encodeURIComponent(nome)}`} 
          loading="lazy"
          onLoad={() => setCarregado(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
            carregado ? "opacity-100" : "opacity-0"
          )}
          alt={nome}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Carga</p>
          <p className="text-sm font-black text-white">{carga}</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Séries</p>
          <p className="text-sm font-black text-white">{series}</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Reps</p>
          <p className="text-sm font-black text-white">{repeticoes}</p>
        </div>
      </div>

      {!concluido && (
        <button 
          onClick={onConcluir}
          className="w-full mt-6 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-forge-orange transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          MARCAR COMO FEITO <Play size={14} fill="currentColor" />
        </button>
      )}
    </motion.div>
  );
}
