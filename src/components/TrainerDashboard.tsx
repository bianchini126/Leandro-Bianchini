import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, User, ChevronRight, Plus, X, Save } from 'lucide-react';
import { cn } from '../utils/cn';
import { dbService } from '../services/dbService';

interface TrainerDashboardProps {
  onSelectStudent: (studentEmail: string) => void;
  apiExercises: any[];
  user: any;
}

export function TrainerDashboard({ onSelectStudent, user }: TrainerDashboardProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.email) fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      const data = await dbService.getStudents(user.email);
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestStudent = async () => {
    try {
      setLoading(true);
      alert("No Firebase, os alunos devem se cadastrar e vincular ao seu email de Personal Trainer.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  const [isPrescribing, setIsPrescribing] = useState(false);
  const [selectedForPrescription, setSelectedForPrescription] = useState<any>(null);
  const [newWorkout, setNewWorkout] = useState<any>({
    fase: 'A',
    exercicios: []
  });

  const handleAddExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercicios: [...newWorkout.exercicios, { ex_id: '', nome: '', s: 3, r: '12', carga: '0kg', gif: '' }]
    });
  };

  const handleSaveWorkout = async () => {
    if (!selectedForPrescription || !selectedForPrescription.email) return;
    try {
      setLoading(true);
      await dbService.prescribeWorkout(selectedForPrescription.email, newWorkout);
      setIsPrescribing(false);
      alert('Treino prescrito com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao prescrever treino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <header className="pt-4 flex justify-between items-end">
        <div>
          <h2 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest">Área do Personal</h2>
          <h1 className="text-4xl font-display font-extrabold mt-1">Meus Alunos</h1>
          {user?.cref && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CREF: {user.cref}</span>
              <span className={cn(
                "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                user.cref_status === 'active' ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-500/20 text-orange-500"
              )}>
                {user.cref_status === 'active' ? 'Ativo' : 'Pendente de Regularização'}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase font-black">Alunos Ativos</p>
          <p className="text-2xl font-black text-white">{students.length}</p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input 
          type="text" 
          placeholder="Buscar aluno por nome ou email..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forge-zinc border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-forge-orange outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-white/40 py-8 animate-pulse italic">Carregando dados dos alunos...</p>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map(student => {
            const lastActivity = student.last_activity ? new Date(student.last_activity) : null;
            const daysInactive = lastActivity ? Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 99;
            const isInactive = daysInactive >= 3;

            return (
              <div 
                key={student.email}
                className={cn(
                  "glass-card p-4 rounded-2xl border flex items-center justify-between transition-all group",
                  isInactive ? "border-red-500/30 bg-red-500/5" : "border-white/5 hover:border-forge-orange/30"
                )}
              >
                <div className="flex items-center gap-4 flex-1" onClick={() => onSelectStudent(student.email)}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center overflow-hidden">
                      {student.profile_image ? (
                        <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-white/40" size={24} />
                      )}
                    </div>
                    {isInactive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-forge-black flex items-center justify-center text-[8px] font-black text-white">
                        !
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-bold text-lg">{student.name}</h3>
                      {isInactive && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Inativo {daysInactive}d</span>}
                    </div>
                    <p className="text-xs text-white/40 font-mono">{student.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block mr-2">
                    <p className="text-[10px] text-white/40 uppercase font-black">Hoje</p>
                    <p className={cn(
                      "text-xs font-bold",
                      student.trained_today ? "text-emerald-400" : "text-white/20"
                    )}>
                      {student.trained_today ? '✓ OK' : '○ AUSENTE'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedForPrescription(student);
                      setIsPrescribing(true);
                    }}
                    className="w-10 h-10 bg-forge-orange text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-forge-orange/20"
                    title="Prescrever Treino"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => onSelectStudent(student.email)}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="text-white/40" size={20} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border border-white/5 border-dashed">
            <User className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest mb-6">Nenhum aluno encontrado</p>
            <button 
              onClick={handleCreateTestStudent}
              className="px-6 py-3 bg-forge-orange text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform"
            >
              CRIAR ALUNO DE DEMONSTRAÇÃO
            </button>
          </div>
        )}
      </div>

      {isPrescribing && selectedForPrescription && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6 pt-10 pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black text-forge-orange uppercase tracking-[0.2em]">Prescritor JSON v1.0</h2>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Ficha de {selectedForPrescription.name}</h1>
              </div>
              <button 
                onClick={() => setIsPrescribing(false)} 
                className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fase do Treino</label>
                  <input 
                    type="text" 
                    value={newWorkout.fase}
                    onChange={e => setNewWorkout({...newWorkout, fase: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold"
                    placeholder="Ex: A, B, Reabilitação..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                  Exercícios
                  <span>{newWorkout.exercicios.length} total</span>
                </label>
                
                {newWorkout.exercicios.map((ex: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex gap-2">
                       <input 
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white font-bold"
                        placeholder="Nome do Exercício (Ex: Bench Press)"
                        value={ex.nome}
                        onChange={e => {
                          const updated = [...newWorkout.exercicios];
                          updated[i].nome = e.target.value;
                          setNewWorkout({...newWorkout, exercicios: updated});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const updated = newWorkout.exercicios.filter((_: any, idx: number) => idx !== i);
                          setNewWorkout({...newWorkout, exercicios: updated});
                        }}
                        className="text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black mb-1">Séries</p>
                        <input 
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                          value={ex.s}
                          onChange={e => {
                            const updated = [...newWorkout.exercicios];
                            updated[i].s = parseInt(e.target.value) || 0;
                            setNewWorkout({...newWorkout, exercicios: updated});
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black mb-1">Reps</p>
                        <input 
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                          value={ex.r}
                          onChange={e => {
                            const updated = [...newWorkout.exercicios];
                            updated[i].r = e.target.value;
                            setNewWorkout({...newWorkout, exercicios: updated});
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black mb-1">Carga</p>
                        <input 
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                          value={ex.carga}
                          onChange={e => {
                            const updated = [...newWorkout.exercicios];
                            updated[i].carga = e.target.value;
                            setNewWorkout({...newWorkout, exercicios: updated});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleAddExercise}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/40 font-bold hover:border-forge-orange/40 hover:text-forge-orange transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  ADICIONAR EXERCÍCIO
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveWorkout}
              disabled={loading || newWorkout.exercicios.length === 0}
              className="w-full py-5 bg-forge-orange text-black rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-forge-orange/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save size={24} />
              {loading ? 'SALVANDO...' : 'FINALIZAR PRESCRIÇÃO'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
