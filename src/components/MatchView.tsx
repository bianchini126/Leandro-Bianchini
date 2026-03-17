import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, MapPin, ChevronRight, RotateCcw, MessageCircle, UserPlus } from 'lucide-react';

interface MatchViewProps {
  setView: (view: any) => void;
  user: any;
  selectedGym: any;
  setSelectedGym: (gym: any) => void;
  nearbyGyms: any[];
  handleFindGyms: () => void;
  isFindingGyms: boolean;
  matches: any[];
  handleSearchMatch: (gymName: string) => void;
  isSearchingMatch: boolean;
  setChatMessages: (messages: any) => void;
  setMatches: (matches: any) => void;
}

export const MatchView: React.FC<MatchViewProps> = ({
  setView,
  user,
  selectedGym,
  setSelectedGym,
  nearbyGyms,
  handleFindGyms,
  isFindingGyms,
  matches,
  handleSearchMatch,
  isSearchingMatch,
  setChatMessages,
  setMatches,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
    >
      <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Voltar ao Início
      </button>

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-yellow-400 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)] mb-4">
          <Users size={40} className="text-black" />
        </div>
        <h2 className="text-5xl font-display font-black italic tracking-tighter uppercase text-yellow-400">Match de Treino</h2>
        <p className="text-white/60 max-w-lg mx-auto">Encontre parceiros de treino na sua academia com o mesmo nível e objetivo que você.</p>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-yellow-400" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold">Localizar Academia</h4>
              <p className="text-sm text-white/40">Selecione onde você está treinando agora</p>
            </div>
          </div>
          {selectedGym && (
            <button 
              onClick={() => { setSelectedGym(null); setMatches([]); }}
              className="text-xs font-bold text-yellow-400 uppercase tracking-widest hover:underline"
            >
              Trocar
            </button>
          )}
        </div>

        {!selectedGym ? (
          <div className="space-y-4">
            {nearbyGyms.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {nearbyGyms.map((gym, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSelectedGym(gym);
                      handleSearchMatch(gym.title);
                    }}
                    className="w-full flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-yellow-400/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                        <MapPin size={18} className="text-yellow-400" />
                      </div>
                      <div>
                        <span className="text-base font-bold block">{gym.title}</span>
                        <span className="text-xs text-white/40">Tocar para selecionar</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-yellow-400 transition-colors" />
                  </button>
                ))}
                <button 
                  onClick={handleFindGyms}
                  className="w-full py-4 text-xs text-white/40 font-bold uppercase tracking-widest hover:text-white transition-colors border border-dashed border-white/10 rounded-2xl"
                >
                  Não encontrou sua academia? Atualizar
                </button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                  <MapPin size={32} className="text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-white/60">Para encontrar parceiros, precisamos saber em qual academia você está.</p>
                </div>
                <button 
                  onClick={handleFindGyms}
                  disabled={isFindingGyms}
                  className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                >
                  {isFindingGyms ? (
                    <><RotateCcw size={20} className="animate-spin" /> BUSCANDO...</>
                  ) : (
                    <>BUSCAR ACADEMIAS PRÓXIMAS <MapPin size={20} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-400/10 p-4 rounded-2xl border border-yellow-400/20 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-black" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Academia Selecionada</p>
                <p className="text-lg font-bold">{selectedGym.title}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold uppercase tracking-widest text-white/40">Atletas Disponíveis</h5>
                <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded-md uppercase animate-pulse">Online Agora</span>
              </div>

              {isSearchingMatch ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-yellow-400/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                  </div>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest animate-pulse">Cruzando Perfis...</p>
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {matches.map(m => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={m.id} 
                      className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {m.image && <img src={m.image} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-400/20" />}
                          {!m.image && (
                            <div className="w-12 h-12 rounded-full bg-white/5 border-2 border-yellow-400/20 flex items-center justify-center">
                              <Users size={20} className="text-white/20" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
                        </div>
                        <div>
                          <p className="text-base font-bold">{m.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-yellow-400 uppercase">{m.level}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-white/40 uppercase">{m.goal}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setChatMessages([{ role: 'model', text: `Olá! Vi que você também treina na ${selectedGym.title}. Bora fechar um treino?` }]);
                            setView('coach');
                          }}
                          className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                          <MessageCircle size={20} />
                        </button>
                        <button className="w-10 h-10 bg-yellow-400 text-black rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-yellow-400/20">
                          <UserPlus size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center glass-card rounded-3xl border border-dashed border-white/10 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                    <Users size={24} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm italic">Nenhum parceiro encontrado nesta academia no momento. Tente novamente mais tarde!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
