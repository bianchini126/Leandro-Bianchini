import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, User, ChevronRight, Dumbbell } from 'lucide-react';
import { cn } from '../utils/cn';

interface TrainerDashboardProps {
  token: string;
  onSelectStudent: (studentId: number) => void;
}

export function TrainerDashboard({ token, onSelectStudent }: TrainerDashboardProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/trainer/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestStudent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/trainer/create-test-student', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchStudents();
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <header className="pt-4">
        <h2 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest">Área do Personal</h2>
        <h1 className="text-4xl font-display font-extrabold mt-1">Meus Alunos</h1>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input 
          type="text" 
          placeholder="Buscar aluno..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forge-zinc border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-forge-orange outline-none"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-white/40 py-8">Carregando alunos...</p>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div 
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-forge-orange/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center overflow-hidden">
                  {student.profile_image ? (
                    <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-white/40" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <p className="text-xs text-white/40">{student.email}</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-forge-orange/20 transition-colors">
                <Dumbbell className="text-white/40 group-hover:text-forge-orange transition-colors" size={20} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border border-white/5 border-dashed">
            <User className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest mb-6">Nenhum aluno encontrado</p>
            <button 
              onClick={handleCreateTestStudent}
              className="px-6 py-3 bg-forge-orange text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Adicionar Aluno de Teste
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
