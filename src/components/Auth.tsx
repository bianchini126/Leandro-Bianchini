import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  AlertTriangle, 
  Lock, 
  ChevronRight, 
  Fingerprint,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { cn } from '../utils/cn';
import { dbService } from '../services/dbService';
import { auth as firebaseAuth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { UserData, View } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserData, token: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  moderateImage: (base64: string) => Promise<{ safe: boolean; reason?: string }>;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, loading, setLoading }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authRole, setAuthRole] = useState<'student' | 'trainer'>('student');
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cref, setCref] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pass: string) => {
    return {
      minLength: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      get isValid() {
        return this.minLength && this.hasUpper && this.hasLower && this.hasNumber && this.hasSpecial;
      }
    };
  };

  const passwordChecks = validatePassword(password);

  const handleAuth = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      if (authMode === 'login') {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const uid = userCredential.user.uid;
        const userData = await dbService.getUser(uid);
        
        if (userData) {
          onAuthSuccess(userData, "firebase-auth-session");
        } else {
          setAuthError('Perfil não encontrado. Entre em contato com o suporte.');
        }
      } else if (authMode === 'signup') {
        if (!name || (authRole === 'trainer' && !cref)) {
          setAuthError('Preencha todos os campos obrigatórios.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const uid = userCredential.user.uid;
        
        const newUser: UserData = {
          id: Date.now(),
          name,
          email,
          isPremium: authRole === 'trainer' ? true : false,
          isAdmin: false,
          role: authRole,
          experience_level: 'Iniciante'
        };
        
        await dbService.createUser(uid, newUser);
        onAuthSuccess(newUser, "firebase-auth-session");
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setAuthError('E-mail ou senha incorretos.');
      } else if (e.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está em uso.');
      } else {
        setAuthError('Erro na autenticação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError('Insira seu e-mail para recuperar a senha.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      alert('E-mail de redefinição enviado com sucesso!');
      setAuthMode('login');
    } catch (e) {
      setAuthError('Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[80vh] flex flex-col items-center justify-center space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-forge-orange rounded-3xl mx-auto flex items-center justify-center cyan-glow mb-4">
          <Zap size={40} className="text-black" />
        </div>
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic text-white">
          IRONPULSE <span className="text-forge-orange">AI</span>
        </h1>
        <p className="text-white/40 font-medium font-display uppercase tracking-widest text-xs">Forje sua melhor versão com IA</p>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 border border-white/10 shadow-2xl">
        <div className="flex bg-forge-zinc p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => { setAuthMode('login'); setAuthError(null); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black uppercase transition-all", 
              authMode === 'login' ? "bg-forge-orange text-black" : "text-white/40 hover:text-white"
            )}
          >
            LOGIN
          </button>
          <button 
            onClick={() => { setAuthMode('signup'); setAuthError(null); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black uppercase transition-all", 
              authMode === 'signup' ? "bg-forge-orange text-black" : "text-white/40 hover:text-white"
            )}
          >
            CADASTRO
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
              >
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{authError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {authMode === 'signup' && (
            <div className="space-y-4">
              <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setAuthRole('student')}
                  className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all", authRole === 'student' ? "bg-forge-orange text-black" : "text-white/40")}
                >
                  SOU ALUNO
                </button>
                <button 
                  onClick={() => setAuthRole('trainer')}
                  className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all", authRole === 'trainer' ? "bg-forge-orange text-black" : "text-white/40")}
                >
                  SOU PERSONAL
                </button>
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" placeholder="Seu Nome" 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-forge-orange outline-none transition-all placeholder:text-white/20"
                />
              </div>

              {authRole === 'trainer' && (
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" placeholder="CREF (ex: 123456-G/SP)" 
                    value={cref} onChange={e => setCref(e.target.value)}
                    className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-forge-orange outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="email" placeholder="E-mail" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-forge-orange outline-none transition-all placeholder:text-white/20"
            />
          </div>
          
          {authMode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 pl-12 pr-12 text-white focus:border-forge-orange outline-none transition-all placeholder:text-white/20"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {authMode === 'signup' && password.length > 0 && (
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Segurança da Senha</p>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn("flex items-center gap-1 text-[8px] font-bold", passwordChecks.minLength ? "text-emerald-500" : "text-white/10")}>
                  <CheckCircle2 size={10} /> 8+ chars
                </div>
                <div className={cn("flex items-center gap-1 text-[8px] font-bold", passwordChecks.hasUpper ? "text-emerald-500" : "text-white/10")}>
                  <CheckCircle2 size={10} /> Maiúscula
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            {authMode === 'login' && (
              <button 
                onClick={() => setAuthMode('forgot')}
                className="text-[10px] font-black uppercase tracking-widest text-forge-orange"
              >
                Esqueci a Senha
              </button>
            )}
            {authMode === 'forgot' && (
              <button 
                onClick={() => setAuthMode('login')}
                className="text-[10px] font-black uppercase tracking-widest text-white/40"
              >
                Voltar para Login
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={authMode === 'forgot' ? handleForgotPassword : handleAuth}
          disabled={loading || (authMode === 'signup' && !passwordChecks.isValid)}
          className="w-full py-5 bg-white text-black rounded-2xl font-display font-black text-lg hover:bg-forge-orange transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? (
             <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <span>{authMode === 'login' ? 'ENTRAR' : authMode === 'signup' ? 'CRIAR CONTA' : 'RECUPERAR'}</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>

      <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">Ambiente Seguro & Firebase Cloud</p>
    </motion.div>
  );
};
