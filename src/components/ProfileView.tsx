import React from 'react';
import { motion } from 'motion/react';
import { User, Camera, CheckCircle2, Crown, Star, ChevronRight, Settings, Users, ShieldCheck, ArrowLeft, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '../utils/cn';

interface ProfileViewProps {
  user: any;
  setUser: (user: any) => void;
  biotype: string;
  setBiotype: (biotype: any) => void;
  level: string;
  setLevel: (level: any) => void;
  handleProfileUpdate: () => void;
  handleProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  handleSwitchRole: (role: string) => void;
  workoutLogs: any[];
  setView: (view: any) => void;
  loading: boolean;
  handlePrivacyUpdate: (invisible: boolean, level: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  setUser,
  biotype,
  setBiotype,
  level,
  setLevel,
  handleProfileUpdate,
  handleProfileImageUpload,
  handleLogout,
  handleSwitchRole,
  workoutLogs,
  setView,
  loading,
  handlePrivacyUpdate,
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-display font-extrabold">Seu Perfil</h1>
      
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-forge-zinc border-2 border-white/10 overflow-hidden shadow-2xl cyan-glow">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-forge-orange/10">
                  <User size={64} className="text-forge-orange/40" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-forge-orange rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-forge-black">
              <Camera size={20} className="text-black" />
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
            </label>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Toque na câmera para mudar a foto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40">Nome de Atleta</label>
            <input 
              type="text" 
              value={user?.name || ''}
              onChange={(e) => setUser((prev: any) => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-forge-orange transition-all"
              placeholder="Como quer ser chamado?"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40">Idade (Opcional)</label>
            <input 
              type="number" 
              value={user?.age || ''}
              onChange={(e) => setUser((prev: any) => prev ? { ...prev, age: parseInt(e.target.value) || undefined } : null)}
              className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-forge-orange transition-all"
              placeholder="Sua idade"
            />
          </div>
        </div>

        <button 
          onClick={handleProfileUpdate}
          disabled={loading}
          className="w-full py-4 bg-forge-orange text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-forge-orange/20 disabled:opacity-50"
        >
          {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
        </button>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Seu Biotipo</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { type: 'Ectomorfo', desc: 'Magro, metabolismo acelerado, dificuldade em ganhar peso.' },
              { type: 'Mesomorfo', desc: 'Atlético, ganha músculos e perde gordura com facilidade.' },
              { type: 'Endomorfo', desc: 'Estrutura larga, metabolismo lento, facilidade em ganhar peso.' }
            ].map((item) => {
              const b = item.type;
              return (
                <button
                  key={b}
                  onClick={() => setBiotype(b)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all text-left flex items-center justify-between",
                    biotype === b 
                      ? "bg-forge-orange/10 border-forge-orange text-white" 
                      : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">{b}</span>
                    <span className="text-xs text-white/40">{item.desc}</span>
                  </div>
                  {biotype === b && <CheckCircle2 size={20} className="text-forge-orange shrink-0 ml-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Seu Progresso de Peso</label>
          <div className="h-64 w-full bg-forge-zinc/30 rounded-3xl border border-white/5 p-4">
            {user?.biometrics && user.biometrics.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={user.biometrics}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#F27D26' }}
                    labelStyle={{ color: '#ffffff60' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#F27D26" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <TrendingUp size={32} className="text-white/20 mb-2" />
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Registre mais biometrias para ver o gráfico de evolução</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Nível de Experiência</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { l: 'Iniciante', desc: 'Foco em aprender a técnica e postura.', time: '0-6 meses' },
              { l: 'Praticante', desc: 'Já conhece a rotina e busca consistência.', time: '6-12 meses' },
              { l: 'Intermediário', desc: 'Domina a técnica e busca hipertrofia.', time: '1-3 anos' },
              { l: 'Avançado', desc: 'Treinos intensos e alta consciência corporal.', time: '+3 anos' },
              { l: 'Elite', desc: 'Performance máxima e atletas.', time: 'Nível Pro' }
            ].map((item) => {
              const isActive = level === item.l;
              return (
                <button
                  key={item.l}
                  onClick={() => setLevel(item.l)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all text-left flex items-center justify-between",
                    isActive 
                      ? "bg-forge-orange/10 border-forge-orange text-white" 
                      : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-2">
                      {item.l}
                    </span>
                    <span className="text-xs text-white/40">{item.desc}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-forge-orange/60">{item.time}</span>
                  </div>
                  {isActive && <CheckCircle2 size={20} className="text-forge-orange shrink-0 ml-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Privacidade (Gym Bro)</label>
          <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Ficar Invisível</p>
                <p className="text-xs text-white/40">Não aparecer nas buscas de parceiros próximos.</p>
              </div>
              <button 
                onClick={() => handlePrivacyUpdate(!user?.is_invisible, user?.privacy_level || 'full')}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  user?.is_invisible ? "bg-forge-orange" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  user?.is_invisible ? "translate-x-7" : "translate-x-1"
                )} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Modo de Exibição</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handlePrivacyUpdate(!!user?.is_invisible, 'full')}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold transition-all",
                    user?.privacy_level === 'full' ? "bg-forge-orange/10 border-forge-orange text-white" : "bg-forge-zinc border-white/5 text-white/40"
                  )}
                >
                  Completo (Nome + Foto)
                </button>
                <button 
                  onClick={() => handlePrivacyUpdate(!!user?.is_invisible, 'anonymous')}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold transition-all",
                    user?.privacy_level === 'anonymous' ? "bg-forge-orange/10 border-forge-orange text-white" : "bg-forge-zinc border-white/5 text-white/40"
                  )}
                >
                  Anônimo (Nome - Foto)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Assinatura</label>
          <button 
            onClick={() => setView('vip')}
            className={cn(
              "w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group",
              user?.isPremium 
                ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20" 
                : "bg-forge-zinc border-white/5 text-white hover:border-yellow-400/30"
            )}
          >
            <div className="flex items-center gap-3">
              <Star size={24} className={user?.isPremium ? "text-yellow-400" : "text-white/40 group-hover:text-yellow-400 transition-colors"} />
              <div>
                <span className="font-bold block">{user?.isPremium ? 'Membro VIP' : 'Plano Gratuito'}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{user?.isPremium ? 'Gerenciar Assinatura' : 'Fazer Upgrade para VIP'}</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-yellow-400 transition-colors" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40">Histórico de Treinos</label>
            <span className="text-xs text-forge-orange font-bold">{workoutLogs?.length || 0} treinos salvos</span>
          </div>
          
          <div className="space-y-3">
            {workoutLogs && workoutLogs.length > 0 ? (
              workoutLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="glass-card p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-white">{log.workoutTitle}</h5>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-forge-orange/10 text-forge-orange px-2 py-1 rounded-lg text-[10px] font-bold">
                      {log.exercises.length} EXS
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {log.exercises.map((ex: any, i: number) => (
                      <div key={i} className="flex justify-between text-[10px] text-white/60">
                        <span>{ex.name}</span>
                        <span className="font-mono">{ex.sets.length} séries</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-forge-zinc/30 rounded-3xl border border-dashed border-white/5">
                <p className="text-white/40 text-xs">Você ainda não salvou nenhum treino.</p>
              </div>
            )}
            
            {workoutLogs && workoutLogs.length > 5 && (
              <button className="w-full py-3 text-xs font-bold text-forge-orange hover:underline">
                VER HISTÓRICO COMPLETO
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-forge-orange">
              <Settings size={20} />
              <h4 className="font-bold">Configurações do App</h4>
            </div>
            <button onClick={() => setView('feedback')} className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
              Enviar Feedback
            </button>
          </div>
          <p className="text-white/40 text-sm">
            IronPulse AI v1.1.0. Desenvolvido para atletas que buscam a excelência através da tecnologia.
          </p>
          <button 
            onClick={() => setView('legal')}
            className="text-[10px] font-bold text-forge-orange uppercase tracking-widest hover:underline"
          >
            Termos e Privacidade (LGPD)
          </button>
          <div className="pt-4 space-y-3">
            <button 
              onClick={() => handleSwitchRole(user?.role === 'trainer' ? 'student' : 'trainer')}
              className="w-full p-4 bg-forge-orange/10 border border-forge-orange/20 text-forge-orange rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-forge-orange/20 transition-all"
            >
              <Users size={18} />
              {user?.role === 'trainer' ? 'MUDAR PARA ALUNO' : 'MUDAR PARA PERSONAL'}
            </button>
            {user?.isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className="w-full p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all"
              >
                <ShieldCheck size={18} />
                ACESSAR PAINEL ADMIN
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
            >
              <ArrowLeft size={18} />
              SAIR DA CONTA
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
