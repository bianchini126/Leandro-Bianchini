import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Camera, Watch, Zap, RotateCcw, Moon, Heart, ImageIcon, Lock, Video, CheckCircle2, Share2, FileText, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface VipViewProps {
  setView: (view: any) => void;
  isWatchConnected: boolean;
  watchData: any;
  handleConnectWatch: () => void;
  handleAdaptWorkout: () => void;
  isAdaptingWorkout: boolean;
  currentWorkout: any;
  handleFoodUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzingFood: boolean;
  user: any;
  foodUsageCount: number;
}

// Botão de ação bloqueado para não-VIP
const VipActionButton = ({
  isVip,
  onClick,
  disabled,
  children,
  className,
}: {
  isVip: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  if (!isVip) {
    return (
      <button
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-yellow-400/30 bg-yellow-400/5 text-yellow-400/60 cursor-not-allowed",
          className
        )}
        disabled
      >
        <Lock size={14} />
        Exclusivo VIP — Assinar R${' '}
        <span className="font-black">29,99/mês</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
};

export const VipView: React.FC<VipViewProps> = ({
  setView,
  isWatchConnected,
  watchData,
  handleConnectWatch,
  handleAdaptWorkout,
  isAdaptingWorkout,
  currentWorkout,
  handleFoodUpload,
  isAnalyzingFood,
  user,
  foodUsageCount,
}) => {
  const isVip = user?.isPremium || user?.is_premium;
  const MAX_FOOD_USES = 2;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
    >
      <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar ao Perfil
      </button>
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-yellow-400 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)] mb-4">
          <Star size={40} className="text-black" />
        </div>
        <h2 className="text-5xl font-display font-black italic tracking-tighter uppercase text-yellow-400">IronPulse VIP</h2>
        <p className="text-white/60 max-w-lg mx-auto">Desbloqueie ferramentas exclusivas de inteligência artificial. Veja abaixo tudo que você tem acesso sendo VIP.</p>
        {isVip ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Você é VIP — Acesso Total Liberado!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
            <Lock size={14} className="text-yellow-400" />
            <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">Veja as vantagens e assine abaixo</span>
          </div>
        )}
      </div>

      {/* Lista de vantagens VIP — SEMPRE VISÍVEL */}
      <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 space-y-3">
        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-4">✦ O que você ganha sendo VIP</p>
        {[
          { icon: Watch, text: "Integração com Smartwatches (Apple Watch & Garmin)" },
          { icon: ImageIcon, text: "Nutricionista IA: tire foto do prato e receba análise completa com calorias, proteínas, carboidratos e gorduras" },
          { icon: Zap, text: "Direito a gerar 3 treinos por dia na IA sendo VIP" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={16} className="text-yellow-400" />
            </div>
            <p className="text-sm text-white/80 font-medium">{text}</p>
          </div>
        ))}
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Card 1: Treinos com IA 3x/dia — VIP only */}
        <div className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent space-y-4">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
            <Zap className="text-yellow-400" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-1">Treinos por IA</h4>
            <p className="text-sm text-white/60">Sendo VIP, você tem direito a gerar <strong className="text-white">3 treinos por dia</strong> com a IA, personalizados para o seu perfil, biótipo e nível de experiência.</p>
          </div>
          <VipActionButton
            isVip={isVip}
            onClick={() => setView('generator')}
          >
            GERAR MEU TREINO <Zap size={16} />
          </VipActionButton>
        </div>

        {/* Card 2: Smartwatch — VIP only */}
        <div className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
              <Watch className="text-yellow-400" size={24} />
            </div>
            {isWatchConnected && isVip && (
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Conectado
              </span>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold mb-1">Smartwatches</h4>
            <p className="text-sm text-white/60">Sincroniza com Apple Watch e Garmin. A IA adapta seu treino baseado no sono e batimentos.</p>
          </div>

          {isVip && isWatchConnected ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-white/40 mb-1"><Moon size={14} /><span className="text-[10px] font-bold uppercase">Sono</span></div>
                  <p className="text-sm font-bold text-yellow-400">{watchData?.sleep}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-white/40 mb-1"><Heart size={14} /><span className="text-[10px] font-bold uppercase">BPM</span></div>
                  <p className="text-sm font-bold text-red-400">{watchData?.heartRate}</p>
                </div>
              </div>
              <button
                onClick={handleAdaptWorkout}
                disabled={isAdaptingWorkout || !currentWorkout}
                className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
              >
                {isAdaptingWorkout ? <RotateCcw size={16} className="animate-spin" /> : <>ADAPTAR TREINO <Zap size={16} /></>}
              </button>
              {!currentWorkout && <p className="text-[10px] text-center text-white/20 uppercase">Gere um treino primeiro</p>}
            </div>
          ) : (
            <VipActionButton isVip={isVip} onClick={handleConnectWatch}>
              CONECTAR DISPOSITIVO
            </VipActionButton>
          )}
        </div>

        {/* Card 3: Nutricionista IA — VIP only, 2x */}
        <div className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
              <ImageIcon className="text-yellow-400" size={24} />
            </div>
            {isVip && (
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                {foodUsageCount}/{MAX_FOOD_USES} hoje
              </span>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold mb-1">Nutricionista IA</h4>
            <p className="text-sm text-white/60">Tire foto do seu prato e a IA calcula os macros (proteínas, carboidratos, calorias) automaticamente. Depois compartilhe ou salve e o arquivo é excluído.</p>
          </div>

          {isVip ? (
            <div className="space-y-3">
              <label className={cn(
                "w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all cursor-pointer",
                (isAnalyzingFood || foodUsageCount >= MAX_FOOD_USES) && "opacity-50 cursor-not-allowed"
              )}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFoodUpload}
                  disabled={isAnalyzingFood || foodUsageCount >= MAX_FOOD_USES}
                />
                {isAnalyzingFood ? (
                  <><RotateCcw size={16} className="animate-spin" /> Analisando...</>
                ) : foodUsageCount >= MAX_FOOD_USES ? (
                  'Limite atingido hoje'
                ) : (
                  <><Camera size={16} /> FOTOGRAFAR PRATO</>
                )}
              </label>
            </div>
          ) : (
            <VipActionButton isVip={isVip}>
              FOTOGRAFAR PRATO
            </VipActionButton>
          )}
        </div>
      </div>

      {/* Seção de Assinatura */}
      <div id="vip-subscribe-section" className="bg-yellow-400 text-black p-8 rounded-[2.5rem] text-center space-y-6">
        <h3 className="text-3xl font-display font-black uppercase">
          {isVip ? '✓ Você é VIP!' : 'Assine Agora'}
        </h3>
        <p className="font-medium text-lg">
          {user?.role === 'trainer' 
            ? "Painel completo de Personal Trainer: R$ 49,99/mês" 
            : "Acesso total a todas as ferramentas de IA: R$ 29,99/mês"}
        </p>
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Plano Elite IronPulse</p>
        {!isVip && (
          <button className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Tornar-se VIP
          </button>
        )}
      </div>
    </motion.div>
  );
};
