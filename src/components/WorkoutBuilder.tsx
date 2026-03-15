import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, Dumbbell } from 'lucide-react';
import { cn } from '../utils/cn';

interface WorkoutBuilderProps {
  token: string;
  studentId: number;
  onBack: () => void;
  staticExercises: { id: number; name: string; muscle: string }[];
}

export function WorkoutBuilder({ token, studentId, onBack, staticExercises }: WorkoutBuilderProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<number | ''>('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [rest, setRest] = useState('60');

  useEffect(() => {
    fetchWorkout();
  }, [studentId]);

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/trainer/workout/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.exercicios) {
          setExercises(data.exercicios);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    const newEx = {
      ex: Number(selectedExercise),
      s: Number(sets),
      r: reps,
      d: Number(rest)
    };
    setExercises([...exercises, newEx]);
    setSelectedExercise('');
  };

  const handleRemoveExercise = (index: number) => {
    const newExs = [...exercises];
    newExs.splice(index, 1);
    setExercises(newExs);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/trainer/workout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ studentId, exercicios: exercises })
      });
      if (res.ok) {
        alert('Treino salvo com sucesso!');
        onBack();
      } else {
        alert('Erro ao salvar treino.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro na conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <header className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest">Construtor de Treino</h2>
            <h1 className="text-2xl font-display font-extrabold mt-1">Montar Treino</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-forge-orange text-black rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Dumbbell className="text-forge-orange" size={20} />
          Adicionar Exercício
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Exercício</label>
            <select 
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-forge-zinc border border-white/5 rounded-xl p-4 text-white focus:border-forge-orange outline-none appearance-none"
            >
              <option value="">Selecione um exercício...</option>
              {staticExercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Séries</label>
            <input 
              type="number" 
              value={sets}
              onChange={e => setSets(e.target.value)}
              className="w-full bg-forge-zinc border border-white/5 rounded-xl p-4 text-white focus:border-forge-orange outline-none"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Repetições</label>
            <input 
              type="text" 
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="w-full bg-forge-zinc border border-white/5 rounded-xl p-4 text-white focus:border-forge-orange outline-none"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Descanso (s)</label>
            <input 
              type="number" 
              value={rest}
              onChange={e => setRest(e.target.value)}
              className="w-full bg-forge-zinc border border-white/5 rounded-xl p-4 text-white focus:border-forge-orange outline-none"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleAddExercise}
              disabled={!selectedExercise}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg uppercase tracking-widest text-white/60">Lista de Exercícios</h3>
        
        {loading ? (
          <p className="text-center text-white/40 py-8">Carregando treino...</p>
        ) : exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((ex, idx) => {
              const staticEx = staticExercises.find(s => s.id === ex.ex);
              return (
                <div key={idx} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-forge-orange/10 rounded-xl flex items-center justify-center text-forge-orange font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{staticEx?.name || 'Exercício Desconhecido'}</h4>
                      <p className="text-sm text-white/60">
                        {ex.s} séries x {ex.r} reps • {ex.d}s descanso
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveExercise(idx)}
                    className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border border-white/5 border-dashed">
            <Dumbbell className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest">Nenhum exercício adicionado</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
