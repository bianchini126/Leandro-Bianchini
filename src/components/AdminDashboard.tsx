import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Users, 
  Star, 
  Zap, 
  Settings, 
  X 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { dbService } from '../services/dbService';
import { UserData } from '../types';

interface AdminDashboardProps {
  user: any;
  adminStats: any;
  adminUsers: UserData[];
  muscleGroups: string[];
  radioStations: any[];
  toggleUserPremium: (userEmail: string) => void;
  toggleUserAdmin: (userEmail: string) => void;
  toggleUserBlock: (userEmail: string) => void;
  deleteUser: (userEmail: string) => void;
  setMuscleGroups: (groups: string[]) => void;
  setRadioStations: (radios: any[]) => void;
  setView: (view: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  adminStats,
  adminUsers,
  muscleGroups,
  radioStations,
  toggleUserPremium,
  toggleUserAdmin,
  toggleUserBlock,
  deleteUser,
  setMuscleGroups,
  setRadioStations,
  setView,
}) => {
  const [managingList, setManagingList] = useState<'muscles' | 'radios' | null>(null);
  const [adminInput, setAdminInput] = useState('');

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Voltar ao Perfil
        </button>
        <h1 className="text-2xl font-display font-black tracking-tighter uppercase">Painel de Controle <span className="text-forge-orange">ADMIN</span></h1>
      </div>

      {adminStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
            <Users className="mx-auto mb-2 text-forge-orange" size={24} />
            <p className="text-2xl font-black">{adminStats.users}</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Usuários</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
            <Star className="mx-auto mb-2 text-forge-orange" size={24} />
            <p className="text-2xl font-black">{adminStats.premium}</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Premium</p>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
            <Zap className="mx-auto mb-2 text-forge-orange" size={24} />
            <p className="text-2xl font-black">{adminStats.achievements}</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Conquistas</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold flex items-center gap-2">
          <Users size={20} className="text-forge-orange" />
          Gerenciamento de Usuários
        </h3>
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/40 uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adminUsers.map(u => (
                  <tr key={u.email} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-white/40">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {u.isPremium ? (
                          <span className="text-[10px] font-bold text-forge-orange uppercase tracking-widest">VIP Member</span>
                        ) : (
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Free User</span>
                        )}
                        {u.isAdmin ? (
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Administrator</span>
                        ) : null}
                        {u.is_blocked ? (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Bloqueado</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => toggleUserPremium(u.email)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            u.isPremium ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-forge-orange/20 text-forge-orange hover:bg-forge-orange/30"
                          )}
                        >
                          {u.isPremium ? 'Remover VIP' : 'Dar VIP'}
                        </button>
                        <button 
                          onClick={() => toggleUserAdmin(u.email)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            u.isAdmin ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30"
                          )}
                        >
                          {u.isAdmin ? 'Remover Admin' : 'Dar Admin'}
                        </button>
                        <button 
                          onClick={() => toggleUserBlock(u.email)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            u.is_blocked ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" : "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                          )}
                        >
                          {u.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                        <button 
                          onClick={() => deleteUser(u.email)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-red-500/20 text-red-500 hover:bg-red-500/40"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
        <h3 className="text-lg font-display font-bold flex items-center gap-2">
          <Settings size={20} className="text-forge-orange" />
          Configurações do Sistema
        </h3>
        <p className="text-xs text-white/40 leading-relaxed">
          Este painel permite o gerenciamento direto da infraestrutura do IronPulse. 
          Como administrador, você tem controle total sobre os usuários e o status das contas.
          Para alterações estruturais no código (o "esqueleto" do app), utilize o editor do AI Studio.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setManagingList('muscles')}
            className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1">Categorias de Treino</p>
            <p className="text-[10px] text-white/40">Gerenciar grupos musculares</p>
          </button>
          <button 
            onClick={() => setManagingList('radios')}
            className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1">Estações de Rádio</p>
            <p className="text-[10px] text-white/40">Adicionar/Remover URLs</p>
          </button>
        </div>

        {managingList === 'muscles' && (
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest">Grupos Musculares</h4>
              <button onClick={() => setManagingList(null)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                placeholder="Novo grupo muscular..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forge-orange transition-colors"
              />
              <button 
                onClick={() => {
                  if (adminInput.trim()) {
                    const newGroups = [...muscleGroups, adminInput.trim()];
                    setMuscleGroups(newGroups);
                    localStorage.setItem('ironpulse_muscles', JSON.stringify(newGroups));
                    setAdminInput('');
                  }
                }}
                className="bg-forge-orange text-black px-4 rounded-xl font-bold text-sm hover:bg-white transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(m => (
                <div key={m} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                  {m}
                  <button 
                    onClick={() => {
                      const newGroups = muscleGroups.filter(g => g !== m);
                      setMuscleGroups(newGroups);
                      localStorage.setItem('ironpulse_muscles', JSON.stringify(newGroups));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {managingList === 'radios' && (
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest">Estações de Rádio</h4>
              <button onClick={() => setManagingList(null)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                placeholder="Nome | URL da Rádio"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forge-orange transition-colors"
              />
              <button 
                onClick={async () => {
                  if (adminInput.includes('|')) {
                    const [name, url] = adminInput.split('|');
                    if (name && url) {
                      try {
                        await dbService.addRadio(name.trim(), url.trim());
                        const data = await dbService.getRadios();
                        setRadioStations(data);
                        setAdminInput('');
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  } else {
                    alert("Formato inválido. Use 'Nome | URL'.");
                  }
                }}
                className="bg-forge-orange text-black px-4 rounded-xl font-bold text-sm hover:bg-white transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {radioStations.map((r: any) => (
                <div key={r.name} className="bg-black/50 border border-white/10 rounded-lg p-2 flex items-center justify-between text-xs">
                  <div className="truncate pr-4">
                    <span className="font-bold text-forge-orange">{r.name}</span>
                    <span className="text-white/40 ml-2 truncate block sm:inline">{r.url}</span>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await dbService.deleteRadio(r.id);
                        const data = await dbService.getRadios();
                        setRadioStations(data);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 shrink-0 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
