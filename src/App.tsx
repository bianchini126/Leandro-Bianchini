import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Calendar, 
  Zap, 
  Activity,
  Target,
  User, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Flame,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  Info,
  MessageSquare,
  Star,
  Send,
  Timer,
  RotateCcw,
  Maximize2,
  X,
  Play,
  Youtube,
  Radio,
  Volume2,
  VolumeX,
  Music,
  Camera,
  Users,
  Bot,
  Image as ImageIcon,
  Heart,
  Share2,
  AlertTriangle,
  ExternalLink,
  Fingerprint,
  Lock,
  ShieldCheck,
  MessageCircle,
  Facebook,
  Instagram,
  Copy,
  Watch,
  Moon,
  UserPlus,
  MapPin,
  BookOpen,
  Crown
} from 'lucide-react';
import { 
  generateWorkout, 
  generateWeeklyPlan, 
  moderateImage, 
  chatWithCoach,
  getExerciseMedia,
  analyzeFoodImage,
  adaptWorkoutWithBiometrics,
  generateDailyTip,
  findNearbyGyms,
  type Workout, 
  type WorkoutExercise,
  type ChatMessage,
  type FoodAnalysis
} from './services/geminiService';
import { dbService } from './services/dbService';
import { cn } from './utils/cn';
import ReactPlayer from 'react-player';
import { TrainerDashboard } from './components/TrainerDashboard';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { STATIC_EXERCISES } from './data/exercises';
import { Auth } from './components/Auth';
import { SocialFeed, type FeedPost } from './components/SocialFeed';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutGenerator } from './components/WorkoutGenerator';
import { WorkoutDetail } from './components/WorkoutDetail';
import { RadioPlayer } from './components/RadioPlayer';
import { VideoModal, ExerciseDetailsModal } from './components/ExerciseCard';
import { WeeklyPlan } from './components/WeeklyPlan';
import { BiotypeView } from './components/BiotypeView';
import { ProfileView } from './components/ProfileView';
import { VipView } from './components/VipView';
import { RewardsView } from './components/RewardsView';
import { FeedbackView } from './components/FeedbackView';
import { LegalView } from './components/LegalView';
import { GymBro } from './components/GymBro';
import { MatchView } from './components/MatchView';
import { CoachView } from './components/CoachView';
import { FoodAnalysisModal } from './components/FoodAnalysisModal';
import { NavIcon } from './components/common/NavIcon';
import { QuickActionCard } from './components/common/QuickActionCard';
import { 
  View, 
  Level, 
  Biotype, 
  UserData, 
  WorkoutLog, 
  Achievement, 
  PerformedSet 
} from './types';
import { 
  ACHIEVEMENTS_LIST, 
  RADIO_STATIONS, 
  MUSCLE_IMAGES, 
  CATEGORY_IMAGES,
  CATEGORIES,
  MUSCLE_MAP,
  PINTEREST_GIFS
} from './constants';

const MUSCLE_VIDEOS: Record<string, string> = {
  'Peito': 'https://www.youtube.com/results?search_query=treino+de+peito+completo',
  'Costas': 'https://www.youtube.com/results?search_query=treino+de+costas+completo',
  'Pernas': 'https://www.youtube.com/results?search_query=treino+de+pernas+completo',
  'Ombros': 'https://www.youtube.com/results?search_query=treino+de+ombros+completo',
  'Braços': 'https://www.youtube.com/results?search_query=treino+de+braços+completo',
  'Tríceps': 'https://www.youtube.com/results?search_query=treino+de+triceps+completo',
  'Bíceps': 'https://www.youtube.com/results?search_query=treino+de+biceps+completo',
  'Abdômen': 'https://www.youtube.com/results?search_query=treino+de+abdomen+completo',
  'Core': 'https://www.youtube.com/results?search_query=treino+de+core+completo',
  'Default': 'https://www.youtube.com/results?search_query=treino+academia+completo'
};

const EXERCISE_LIBRARY: Record<string, { name: string, image: string, videoUrl?: string }[]> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = STATIC_EXERCISES
    .filter(ex => ex.muscle === MUSCLE_MAP[cat.id])
    .map(ex => ({
      name: ex.name,
      image: CATEGORY_IMAGES[cat.id],
      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name)}+execucao`
    }));
  return acc;
}, {} as any);

const EXERCISE_TRANSLATIONS: Record<string, string> = {
  'supino reto': 'bench press',
  'supino inclinado': 'incline bench press',
  'agachamento': 'squat',
  'levantamento terra': 'deadlift',
  'rosca direta': 'bicep curl',
  'triceps pulley': 'tricep pushdown',
  'puxada frontal': 'lat pulldown',
  'remada curvada': 'bent over row',
  'elevacao lateral': 'lateral raise',
  'desenvolvimento': 'shoulder press',
  'crucifixo': 'chest fly',
  'leg press': 'leg press',
  'extensora': 'leg extension',
  'flexora': 'leg curl',
  'panturrilha': 'calf raise',
  'abdominal': 'crunch',
  'prancha': 'plank'
};

const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState<Level>('Iniciante');
  const [biotype, setBiotype] = useState<Biotype>('Mesomorfo');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem('ironpulse_workout_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeWorkoutLogs, setActiveWorkoutLogs] = useState<Record<string, PerformedSet[]>>({});
  const [currentRadio, setCurrentRadio] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [radioStations, setRadioStations] = useState<any[]>([]);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [dailyTip, setDailyTip] = useState('Buscando sabedoria maromba com a IA...');

  useEffect(() => {
    const fetchTip = async () => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('ironpulse_daily_tip_date');
      const savedTip = localStorage.getItem('ironpulse_daily_tip');

      if (savedDate === today && savedTip) {
        setDailyTip(savedTip);
      } else {
        try {
          const newTip = await generateDailyTip();
          setDailyTip(newTip);
          localStorage.setItem('ironpulse_daily_tip', newTip);
          localStorage.setItem('ironpulse_daily_tip_date', today);
        } catch (error) {
          console.error("Failed to generate tip", error);
          setDailyTip('A constância vence o talento quando o talento não é constante.');
        }
      }
    };
    fetchTip();
  }, []);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalTitle, setVideoModalTitle] = useState('');
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<WorkoutExercise | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [apiExercises, setApiExercises] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'exercises' && selectedCategory) {
      const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name;
      if (categoryName) {
        // Fallback for exercises library since local server is going away
        setApiExercises(STATIC_EXERCISES.filter(ex => ex.muscle === categoryName));
      }
    }
  }, [view, selectedCategory]);

  useEffect(() => {
    if (view === 'exercises' && exerciseSearch.length > 2) {
      // Fallback search in static exercises
      const filtered = STATIC_EXERCISES.filter(ex => 
        normalizeText(ex.name).includes(normalizeText(exerciseSearch))
      );
      setApiExercises(filtered as any);
    }
  }, [exerciseSearch, view]);
  
  useEffect(() => {
    const fetchRadios = async () => {
      try {
        const data = await dbService.getRadios();
        if (Array.isArray(data)) setRadioStations(data);
      } catch (e) {
        console.error("Erro ao carregar rádios:", e);
      }
    };
    fetchRadios();
  }, []);

  const [muscleGroups, setMuscleGroups] = useState<string[]>(['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Tríceps', 'Bíceps', 'Abdômen']);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Eu sou seu Coach IronPulse. Como posso te ajudar com seu treino ou dieta hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);


  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (foodUsageCount >= 2) {
      alert("Você atingiu o limite de 2 análises nutricionais por dia.");
      return;
    }

    setIsAnalyzingFood(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        setLastFoodImage(reader.result as string);
        const result = await analyzeFoodImage(base64String);
        
        if (result) {
          setFoodAnalysis(result);
          setNutritionHistory(prev => [result, ...prev].slice(0, 10));
          
          if (user?.email) {
            await dbService.saveNutritionLog(user.email, result);
          }
          
          setFoodUsageCount(prev => prev + 1);
          setToast({ message: "Análise nutricional concluída!", type: 'success' });
        }
      } catch (error) {
        console.error("Food upload error:", error);
        setToast({ message: "Erro ao analisar a imagem. Tente novamente.", type: 'error' });
        setLastFoodImage(null);
      } finally {
        setIsAnalyzingFood(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConnectWatch = () => {
    setIsWatchConnected(true);
    // Simulate fetching data from a watch
    setWatchData({
      sleep: ['Ruim', 'Regular', 'Bom', 'Excelente'][Math.floor(Math.random() * 4)],
      heartRate: Math.floor(Math.random() * (90 - 55 + 1)) + 55
    });
    setToast({ message: "Smartwatch conectado com sucesso!", type: 'success' });
  };

  const enrichExercisesWithVideos = async (exercises: WorkoutExercise[]) => {
    return await Promise.all(exercises
      .filter(ex => ex && typeof ex === 'object')
      .map(async (ex) => {
        let videoUrl = ex.videoUrl;
        // Removido o enriquecimento via fetch local por enquanto para evitar erros 404
        return {
          ...ex,
          name: ex.name || 'Exercício sem nome',
          sets: ex.sets || '3',
          reps: ex.reps || '12',
          rest: ex.rest || '60s',
          notes: ex.notes || 'Foco na execução.',
          videoUrl: videoUrl || `https://www.youtube.com/results?search_query=como+fazer+${encodeURIComponent(ex.name || 'exercicio')}+corretamente`,
          imageUrl: '' 
        };
      }));
  };

  const handleAdaptWorkout = async () => {
    if (!currentWorkout || !watchData) return;
    setIsAdaptingWorkout(true);
    try {
      const adapted = await adaptWorkoutWithBiometrics(currentWorkout, watchData);
      const enrichedExercises = await enrichExercisesWithVideos(adapted.exercises);
      setCurrentWorkout({ ...adapted, exercises: enrichedExercises });
      setToast({ message: "Treino adaptado com base nos seus dados biométricos!", type: 'success' });
      setView('workout-detail');
    } catch (error) {
      console.error("Adaptation error:", error);
      setToast({ message: "Erro ao adaptar treino.", type: 'error' });
    } finally {
      setIsAdaptingWorkout(false);
    }
  };

  const handleFindGyms = () => {
    if (!navigator.geolocation) {
      setToast({ message: "Geolocalização não suportada pelo seu navegador.", type: 'error' });
      return;
    }

    setIsFindingGyms(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const gyms = await findNearbyGyms(position.coords.latitude, position.coords.longitude);
          setNearbyGyms(gyms);
          if (gyms.length === 0) {
            setToast({ message: "Nenhuma academia encontrada por perto.", type: 'success' });
          }
        } catch (error) {
          console.error("Error finding gyms:", error);
          setToast({ message: "Erro ao buscar academias.", type: 'error' });
        } finally {
          setIsFindingGyms(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setToast({ message: "Permissão de localização negada ou erro de GPS.", type: 'error' });
        setIsFindingGyms(false);
      }
    );
  };

  const handleSearchMatch = (gymName: string) => {
    setIsSearchingMatch(true);
    setTimeout(() => {
      setMatches([
        { id: 1, name: 'Ricardo Silva', level: 'Avançado', goal: 'Hipertrofia', gym: gymName, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&q=80' },
        { id: 2, name: 'Juliana Costa', level: 'Intermediário', goal: 'Definição', gym: gymName, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=100&q=80' },
        { id: 3, name: 'Marcos Oliveira', level: 'Iniciante', goal: 'Saúde', gym: gymName, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=100&q=80' }
      ]);
      setIsSearchingMatch(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const text = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    
    const response = await chatWithCoach(newMessages);
    setChatMessages([...newMessages, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };
  
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [foodUsageCount, setFoodUsageCount] = useState<number>(0);

  useEffect(() => {
    if (user && user.isPremium && user.email) {
      dbService.getNutritionUsageToday(user.email)
        .then(count => {
          setFoodUsageCount(count);
        })
        .catch(err => console.error("Erro ao buscar uso de nutrição:", err));
    }
  }, [user, view]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Rest Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showTimerNotification, setShowTimerNotification] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setShowTimerNotification(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Play a subtle notification sound if possible, or just visual
      setTimeout(() => setShowTimerNotification(false), 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  // Auto-login check
  const fetchTip = async () => {
    try {
      const tip = await generateDailyTip();
      setDailyTip(tip);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  // Update tip when coming back to dashboard
  useEffect(() => {
    if (view === 'dashboard' || view === 'profile') {
      fetchTip();
    }
  }, [view]);

  useEffect(() => {
    const savedToken = localStorage.getItem('ironpulse_token');
    const savedUser = localStorage.getItem('ironpulse_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setView(parsedUser.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
      } catch (e) {
        localStorage.removeItem('ironpulse_token');
        localStorage.removeItem('ironpulse_user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  // Strict Authentication Guard
  useEffect(() => {
    if (!user && view !== 'auth') {
      setView('auth');
    }
  }, [user, view]);

  const [customWorkout, setCustomWorkout] = useState<any>(null);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchCustomWorkout();
    }
  }, [user]);

  const fetchCustomWorkout = async () => {
    if (!user?.email) return;
    try {
      const workouts = await dbService.getWorkouts(user.email);
      if (workouts.length > 0) {
        setCustomWorkout(workouts[0]); // Pega o treino mais recente do Firestore
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAchievements = async () => {
    if (!user?.email) return;
    try {
      const data = await dbService.getAchievements(user.email);
      setAchievements(data);
    } catch (e) {
      console.error("Erro ao buscar conquistas");
    }
  };

  const unlockAchievement = async (type: string) => {
    if (!user?.email) return;
    try {
      await dbService.unlockAchievement(user.email, type);
      fetchAchievements();
    } catch (e) {
      console.error("Erro ao desbloquear conquista");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ironpulse_user');
    setView('auth');
  };

  const handleProfileUpdate = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const updatedData: Partial<UserData> = {
        name: user.name,
        age: user.age,
        profileImage: user.profileImage,
        experience_level: level
      };
      await dbService.updateUser(user.email, updatedData);
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('ironpulse_user', JSON.stringify(newUser));
      alert('Perfil atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar perfil no Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (invisible: boolean, privacyLevel: string) => {
    if (!user?.email) return;
    try {
      const updatedData: Partial<UserData> = {
        is_invisible: invisible,
        privacy_level: privacyLevel as any
      };
      await dbService.updateUser(user.email, updatedData);
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('ironpulse_user', JSON.stringify(newUser));
    } catch (e) {
      console.error("Erro ao atualizar privacidade no Firebase", e);
    }
  };

  const handleSwitchRole = async (newRole: 'student' | 'trainer') => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const updatedData: Partial<UserData> = { role: newRole };
      await dbService.updateUser(user.email, updatedData);
      
      const newUser = { ...user, role: newRole };
      setUser(newUser);
      localStorage.setItem('ironpulse_user', JSON.stringify(newUser));
      
      alert(`Você agora é um ${newRole === 'trainer' ? 'Personal' : 'Aluno'}!`);
      setView(newRole === 'trainer' ? 'trainer-dashboard' : 'dashboard');
    } catch (e) {
      console.error("Erro ao trocar de perfil no Firebase", e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const moderation = await moderateImage(base64);

      if (moderation.safe) {
        setUser({ ...user, profileImage: reader.result as string });
      } else {
        alert(`Imagem bloqueada pela IA: ${moderation.reason || 'Conteúdo inadequado.'}`);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStartCustomWorkout = () => {
    if (!customWorkout) return;

    const exercises = customWorkout.exercicios.map((ex: any) => {
      const staticEx = STATIC_EXERCISES.find(s => s.id === ex.ex);
      return {
        name: staticEx?.name || 'Exercício',
        sets: String(ex.s),
        reps: String(ex.r),
        rest: `${ex.d}s`,
        notes: 'Treino montado pelo seu personal.',
        videoUrl: `https://www.youtube.com/results?search_query=como+fazer+${encodeURIComponent(staticEx?.name || 'exercicio')}+corretamente`,
        imageUrl: ''
      };
    });

    const workout: Workout = {
      title: 'Treino do Personal',
      muscleGroup: 'Personalizado',
      level: 'Personalizado',
      exercises,
      tips: ['Siga as orientações do seu personal.', 'Mantenha a postura correta.']
    };

    setCurrentWorkout(workout);
    setView('workout-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('ironpulse_user', JSON.stringify(userData));
    setView(userData.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
  };



  const fetchAdminData = async () => {
    if (!user?.isAdmin) return;
    try {
      const users = await dbService.getAllUsers();
      setAdminUsers(users);
      setAdminStats({
        users: users.length,
        premium: users.filter(u => u.isPremium).length,
        achievements: 0 // Simplificado
      });
    } catch (e) {
      console.error("Erro ao buscar dados administrativos");
    }
  };

  useEffect(() => {
    if (view === 'admin') {
      fetchAdminData();
    }
  }, [view]);

  const toggleUserPremium = async (email: string) => {
    const u = adminUsers.find(x => x.email === email);
    if (!u) return;
    await dbService.toggleUserStatus(email, 'isPremium', !u.isPremium);
    fetchAdminData();
  };

  const toggleUserAdmin = async (email: string) => {
    const u = adminUsers.find(x => x.email === email);
    if (!u) return;
    await dbService.toggleUserStatus(email, 'isAdmin', !u.isAdmin);
    fetchAdminData();
  };

  const toggleUserBlock = async (email: string) => {
    const u = adminUsers.find(x => x.email === email);
    if (!u) return;
    await dbService.toggleUserStatus(email, 'is_blocked', !u.is_blocked);
    fetchAdminData();
  };

  const deleteUser = async (email: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    await dbService.deleteUser(email);
    fetchAdminData();
  };


  const handleGenerateWorkout = async () => {
    const maxGenerations = user?.isPremium ? 3 : 2;
    if (generationCount >= maxGenerations) {
      alert(`Você atingiu o limite diário de ${maxGenerations} treinos gerados pela IA. ${!user?.isPremium ? 'Torne-se VIP para gerar mais treinos!' : 'Volte amanhã para gerar mais treinos.'}`);
      return;
    }

    if (selectedMuscles.length === 0) {
      alert("Por favor, selecione pelo menos um grupo muscular para gerar o treino.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Iniciando geração de treino para:", selectedMuscles);
      const workout = await generateWorkout(selectedMuscles, level, biotype, user?.age, user?.experience_level);
      
      if (!workout || !workout.exercises || !Array.isArray(workout.exercises)) {
        console.error("Workout data invalid:", workout);
        throw new Error("A IA retornou um treino inválido. Tente novamente.");
      }

      setGenerationCount(prev => prev + 1);
      const exercisesWithVideos = await enrichExercisesWithVideos(workout.exercises);
      
      if (exercisesWithVideos.length === 0) {
        throw new Error("Nenhum exercício válido foi gerado pela IA.");
      }

      const finalWorkout: Workout = { 
        ...workout, 
        title: workout.title || 'Treino IronPulse',
        muscleGroup: workout.muscleGroup || selectedMuscles.join(' e '),
        level: workout.level || level,
        exercises: exercisesWithVideos, 
        tips: Array.isArray(workout.tips) ? workout.tips : [] 
      };
      
      console.log("Treino finalizado:", finalWorkout);
      setCurrentWorkout(finalWorkout);
      setWorkoutHistory(prev => [finalWorkout, ...prev].slice(0, 10));
      
      // Mudar a view imediatamente sem setTimeout para evitar race conditions
      setView('workout-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error: any) {
      console.error("Erro detalhado no handleGenerateWorkout:", error);
      alert(error.message || 'Erro ao gerar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadWeeklyPlan = async () => {
    setLoading(true);
    try {
      const plan = await generateWeeklyPlan(level, biotype, user?.age);
      if (!plan || !plan.plan) throw new Error("Plano semanal inválido retornado pela IA.");
      
      // Enrich all exercises in the weekly plan
      const enrichedPlan = {
        ...plan,
        plan: await Promise.all(plan.plan.map(async (day: any) => ({
          ...day,
          exercises: await enrichExercisesWithVideos(day.exercises || [])
        })))
      };

      setWeeklyPlan(enrichedPlan);
      setView('weekly');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao gerar plano semanal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => {
      const isSelected = prev.includes(muscle);
      return isSelected 
        ? prev.filter(m => m !== muscle) 
        : [...prev, muscle];
    });
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const [isRadioExpanded, setIsRadioExpanded] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [lastFoodImage, setLastFoodImage] = useState<string | null>(null);

  // VIP Features State
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [watchData, setWatchData] = useState<{ sleep: string, heartRate: number } | null>(null);
  const [isAdaptingWorkout, setIsAdaptingWorkout] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<any[]>([]);
  const [selectedGym, setSelectedGym] = useState<any | null>(null);
  const [isFindingGyms, setIsFindingGyms] = useState(false);

  const [nutritionHistory, setNutritionHistory] = useState<FoodAnalysis[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const ALL_TRADITIONAL_EXERCISES = Object.values(EXERCISE_LIBRARY).flat().map(ex => ex.name);

  const filteredExercises = ALL_TRADITIONAL_EXERCISES.filter(ex => 
    ex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddManualExercise = (name: string) => {
    const newEx: WorkoutExercise = {
      name,
      sets: '3',
      reps: '12',
      rest: '60s',
      notes: 'Exercício adicionado manualmente.',
      videoUrl: `https://www.youtube.com/results?search_query=Fitness+Online+${encodeURIComponent(name)}`,
      imageUrl: ''
    };

    if (currentWorkout) {
      setCurrentWorkout({
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, newEx]
      });
    } else {
      const manualWorkout: Workout = {
        title: 'Treino Customizado',
        muscleGroup: 'Misto',
        level: level,
        exercises: [newEx],
        tips: ['Treino montado manualmente por você.']
      };
      setCurrentWorkout(manualWorkout);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    setToast({ message: `"${name}" adicionado ao treino!`, type: 'success' });
  };

  useEffect(() => {
    const savedNutrition = localStorage.getItem('nutritionHistory');
    const savedWorkouts = localStorage.getItem('workoutHistory');
    if (savedNutrition) setNutritionHistory(JSON.parse(savedNutrition));
    if (savedWorkouts) setWorkoutHistory(JSON.parse(savedWorkouts));
  }, []);

  useEffect(() => {
    localStorage.setItem('nutritionHistory', JSON.stringify(nutritionHistory));
  }, [nutritionHistory]);

  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);


  return (
    <div className="min-h-screen bg-forge-black text-white selection:bg-forge-orange selection:text-white overflow-x-hidden">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-forge-orange/20 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-forge-orange border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="text-forge-orange animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">Forjando seu Treino</h2>
              <p className="text-white/40 font-mono text-xs animate-pulse uppercase tracking-widest">A IA do IronPulse está calculando sua rotina...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RadioPlayer 
        radioStations={radioStations}
        currentRadio={currentRadio}
        setCurrentRadio={setCurrentRadio}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isRadioPlaying={isRadioPlaying}
        setIsRadioPlaying={setIsRadioPlaying}
      />

      {/* Navigation Rail - Premium Floating Dock Style */}
      {user && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg md:left-6 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:w-20 md:h-auto">
          <nav className="bg-forge-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around md:flex-col md:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <NavIcon icon={<LayoutDashboard size={22} />} active={view === 'dashboard' || view === 'trainer-dashboard'} onClick={() => setView(user.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} label="Início" />
            <NavIcon icon={<BookOpen size={22} />} active={view === 'exercises'} onClick={() => setView('exercises')} label="Biblioteca" />
            <NavIcon icon={<PlusCircle size={22} />} active={view === 'generator'} onClick={() => setView('generator')} label="Gerar" />
            <NavIcon icon={<Bot size={22} />} active={view === 'coach'} onClick={() => setView('coach')} label="Coach" />
            <NavIcon icon={<Calendar size={22} />} active={view === 'weekly'} onClick={() => setView('weekly')} label="Plano" />
            <NavIcon icon={<Users size={22} />} active={view === 'feed'} onClick={() => setView('feed')} label="Social" />
            <div className="hidden md:block w-8 h-[1px] bg-white/5 mx-auto" />
            {user?.isAdmin && (
              <NavIcon icon={<ShieldCheck size={22} className="text-cyan-400" />} active={view === 'admin'} onClick={() => setView('admin')} label="Admin" />
            )}
            <NavIcon icon={<Star size={22} />} active={view === 'vip'} onClick={() => setView('vip')} label="VIP" />
            <NavIcon icon={<User size={22} />} active={view === 'profile'} onClick={() => setView('profile')} label="Perfil" />
          </nav>
        </div>
      )}

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {timerActive && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xs"
          >
            <div className="bg-forge-orange p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(242,125,38,0.4)] flex flex-col items-center gap-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Timer className="text-black animate-pulse" size={24} />
                <span className="text-black font-display font-black text-xl uppercase tracking-tighter">Descanso Ativo</span>
              </div>
              <div className="text-6xl font-display font-black text-black tracking-tighter">
                {timeLeft}s
              </div>
              <button 
                onClick={() => setTimerActive(false)}
                className="w-full py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-forge-zinc transition-colors"
              >
                PULAR DESCANSO
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Finished Notification */}
      <AnimatePresence>
        {showTimerNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-sm"
          >
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(255,255,255,0.2)] flex items-center gap-4 border border-forge-orange/50">
              <div className="w-12 h-12 bg-forge-orange rounded-2xl flex items-center justify-center shrink-0 cyan-glow">
                <Zap className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-lg leading-tight">DESCANSO FINALIZADO!</h4>
                <p className="text-black/60 text-xs font-bold uppercase tracking-widest">Hora de esmagar a próxima série!</p>
              </div>
              <button 
                onClick={() => setShowTimerNotification(false)}
                className="ml-auto text-black/20 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-28 pb-24 md:pt-6 md:pb-0 md:pl-28 max-w-4xl mx-auto p-6">
        <AnimatePresence>
          {isVideoModalOpen && (
            <VideoModal 
              isOpen={isVideoModalOpen}
              onClose={() => setIsVideoModalOpen(false)}
              url={selectedVideoUrl || ''}
              title={videoModalTitle}
            />
          )}
          {isDetailsModalOpen && (
            <ExerciseDetailsModal
              exercise={selectedExerciseDetails}
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
            />
          )}
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-6 right-6 z-[100] flex justify-center pointer-events-none"
            >
              <div className={cn(
                "px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border",
                toast.type === 'success' ? "bg-emerald-500/90 border-emerald-400/20 text-white" : "bg-red-500/90 border-red-400/20 text-white"
              )}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span className="text-sm font-bold">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'trainer-dashboard' && (
            <TrainerDashboard 
              key="trainer-dashboard"
              onSelectStudent={(email) => {
                setSelectedStudentId(email as any);
                setView('workout-builder');
              }}
              apiExercises={apiExercises}
              user={user}
            />
          )}

          {view === 'workout-builder' && selectedStudentId && (
            <WorkoutBuilder 
              key="workout-builder"
              studentEmail={selectedStudentId as any} 
              onBack={() => setView('trainer-dashboard')}
              staticExercises={STATIC_EXERCISES}
            />
          )}

          {view === 'dashboard' && (
            <Dashboard 
              user={user}
              customWorkout={customWorkout}
              dailyTip={dailyTip}
              achievements={achievements}
              workoutHistory={workoutHistory}
              ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
              STATIC_EXERCISES={STATIC_EXERCISES}
              handleStartCustomWorkout={handleStartCustomWorkout}
              setCurrentWorkout={setCurrentWorkout}
              setView={setView}
            />
          )}

          {view === 'auth' && (
            <Auth 
              onAuthSuccess={handleAuthSuccess} 
              loading={loading} 
              setLoading={setLoading} 
              moderateImage={moderateImage} 
            />
          )}

          {view === 'admin' && user?.isAdmin && (
            <AdminDashboard 
              user={user}
              adminStats={adminStats}
              adminUsers={adminUsers}
              muscleGroups={muscleGroups}
              radioStations={radioStations}
              toggleUserPremium={toggleUserPremium}
              toggleUserAdmin={toggleUserAdmin}
              toggleUserBlock={toggleUserBlock}
              deleteUser={deleteUser}
              setMuscleGroups={setMuscleGroups}
              setRadioStations={setRadioStations}
              setView={setView}
            />
          )}

          {view === 'exercises' && (
            <ExerciseLibrary 
              user={user}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setView={setView}
              exerciseSearch={exerciseSearch}
              setExerciseSearch={setExerciseSearch}
              apiExercises={apiExercises}
              CATEGORY_IMAGES={CATEGORY_IMAGES}
              PINTEREST_GIFS={PINTEREST_GIFS}
              EXERCISE_LIBRARY={EXERCISE_LIBRARY}
              CATEGORIES={CATEGORIES}
              setSelectedVideoUrl={setSelectedVideoUrl}
              setVideoModalTitle={setVideoModalTitle}
              setIsVideoModalOpen={setIsVideoModalOpen}
            />
          )}

          {view === 'generator' && (
            <WorkoutGenerator 
              user={user}
              setView={setView}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showSearchResults={showSearchResults}
              setShowSearchResults={setShowSearchResults}
              filteredExercises={filteredExercises}
              handleAddManualExercise={handleAddManualExercise}
              biotype={biotype}
              setBiotype={setBiotype}
              muscleGroups={muscleGroups}
              selectedMuscles={selectedMuscles}
              toggleMuscle={toggleMuscle}
              handleGenerateWorkout={handleGenerateWorkout}
              loading={loading}
              generationCount={generationCount}
              currentWorkout={currentWorkout}
              setCurrentWorkout={setCurrentWorkout}
              MUSCLE_VIDEOS={MUSCLE_VIDEOS}
            />
          )}

          {view === 'workout-detail' && (
            <WorkoutDetail 
              currentWorkout={currentWorkout}
              loading={loading}
              handleGenerateWorkout={handleGenerateWorkout}
              setView={setView}
              selectedMuscles={selectedMuscles}
              activeWorkoutLogs={activeWorkoutLogs}
              setActiveWorkoutLogs={setActiveWorkoutLogs}
              startTimer={startTimer}
              setWorkoutLogs={setWorkoutLogs}
              unlockAchievement={unlockAchievement}
              user={user}
              CATEGORY_IMAGES={CATEGORY_IMAGES}
              PINTEREST_GIFS={PINTEREST_GIFS}
              EXERCISE_LIBRARY={EXERCISE_LIBRARY}
            />
          )}

          {view === 'weekly' && (
            <WeeklyPlan 
              weeklyPlan={weeklyPlan}
              handleLoadWeeklyPlan={handleLoadWeeklyPlan}
              setView={setView}
              setSelectedMuscles={setSelectedMuscles}
              user={user}
            />
          )}

          {view === 'biotypes' && (
            <BiotypeView 
              setView={setView}
              biotype={biotype}
              setBiotype={setBiotype}
            />
          )}

          {view === 'feedback' && (
            <FeedbackView setView={setView} />
          )}

          {view === 'legal' && (
            <LegalView setView={setView} />
          )}

          {view === 'profile' && (
            <ProfileView 
              user={user}
              setUser={setUser}
              biotype={biotype}
              setBiotype={setBiotype}
              level={level}
              setLevel={setLevel}
              handleProfileUpdate={handleProfileUpdate}
              handleProfileImageUpload={handleProfileImageUpload}
              handleLogout={handleLogout}
              handleSwitchRole={handleSwitchRole}
              workoutLogs={workoutLogs}
              setView={setView}
              loading={loading}
              handlePrivacyUpdate={handlePrivacyUpdate}
            />
          )}

          {view === 'rewards' && (
            <RewardsView 
              setView={setView}
              user={user}
              achievements={achievements}
              ACHIEVEMENTS_LIST={ACHIEVEMENTS_LIST}
            />
          )}

          {view === 'vip' && (
            <VipView 
              user={user}
              setView={setView}
              isWatchConnected={isWatchConnected}
              watchData={watchData}
              handleConnectWatch={handleConnectWatch}
              handleAdaptWorkout={handleAdaptWorkout}
              isAdaptingWorkout={isAdaptingWorkout}
              currentWorkout={currentWorkout}
              handleFoodUpload={handleFoodUpload}
              isAnalyzingFood={isAnalyzingFood}
              foodUsageCount={foodUsageCount}
            />
          )}

          {view === 'match' && (
            <MatchView 
              setView={setView}
              user={user}
              selectedGym={selectedGym}
              setSelectedGym={setSelectedGym}
              nearbyGyms={nearbyGyms}
              handleFindGyms={handleFindGyms}
              isFindingGyms={isFindingGyms}
              matches={matches}
              handleSearchMatch={handleSearchMatch}
              isSearchingMatch={isSearchingMatch}
              setChatMessages={setChatMessages}
              setMatches={setMatches}
            />
          )}
          {view === 'feed' && (
            <SocialFeed 
              user={user}
              setLoading={setLoading}
              moderateImage={moderateImage}
            />
          )}

          {view === 'coach' && (
            <CoachView 
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
              chatEndRef={chatEndRef}
            />
          )}
        </AnimatePresence>
      </main>

      <FoodAnalysisModal 
        foodAnalysis={foodAnalysis}
        setFoodAnalysis={setFoodAnalysis}
        lastFoodImage={lastFoodImage}
        onClose={() => {
          setFoodAnalysis(null);
          setLastFoodImage(null);
        }}
      />
    </div>
  );
}



