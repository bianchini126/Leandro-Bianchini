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
import { cn } from './utils/cn';
import ReactPlayer from 'react-player';
import { TrainerDashboard } from './components/TrainerDashboard';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { STATIC_EXERCISES } from './data/exercises';

type View = 'dashboard' | 'generator' | 'weekly' | 'workout-detail' | 'profile' | 'feedback' | 'auth' | 'biotypes' | 'feed' | 'coach' | 'vip' | 'rewards' | 'admin' | 'legal' | 'exercises' | 'match' | 'trainer-dashboard' | 'workout-builder';
type Level = 'Iniciante' | 'Praticante' | 'Intermediário' | 'Avançado' | 'Elite';
type Biotype = 'Ectomorfo' | 'Mesomorfo' | 'Endomorfo';
type RadioQuality = 'low' | 'high';

interface UserData {
  id: number;
  name: string;
  email: string;
  age?: number;
  profileImage?: string;
  isPremium: boolean;
  isAdmin: boolean;
  role?: 'student' | 'trainer';
}

interface PerformedSet {
  reps: number;
  weight: number;
}

interface PerformedExercise {
  name: string;
  sets: PerformedSet[];
}

interface WorkoutLog {
  id: string;
  date: number;
  workoutTitle: string;
  exercises: PerformedExercise[];
}

interface FeedPost {
  id: string;
  userName: string;
  userImage: string;
  postImage?: string;
  caption: string;
  likes: number;
  time: string;
  createdAt: number;
  likedBy?: number[];
}

interface Achievement {
  id: number;
  type: string;
  unlocked_at: string;
}

const ACHIEVEMENTS_LIST = [
  { type: 'FIRST_WORKOUT', title: 'Primeiro Passo', description: 'Completou seu primeiro treino.', icon: '🎯' },
  { type: 'STREAK_3', title: 'Foco Inicial', description: 'Treinou 3 dias seguidos.', icon: '🔥' },
  { type: 'STREAK_7', title: 'Uma Semana', description: 'Treinou 7 dias seguidos.', icon: '📅' },
  { type: 'STREAK_21', title: 'Hábito Formado', description: 'Treinou 21 dias seguidos.', icon: '🧠' },
  { type: 'STREAK_30', title: 'Mês Perfeito', description: 'Treinou 30 dias seguidos.', icon: '🏆' },
  { type: 'WORKOUT_10', title: 'Iniciante Dedicado', description: 'Completou 10 treinos.', icon: '🥉' },
  { type: 'WORKOUT_50', title: 'Atleta Amador', description: 'Completou 50 treinos.', icon: '🥈' },
  { type: 'WORKOUT_100', title: 'Veterano', description: 'Completou 100 treinos.', icon: '🥇' },
  { type: 'WORKOUT_365', title: 'Lenda do Ferro', description: 'Completou 365 treinos.', icon: '👑' },
  { type: 'MUSCLE_CHEST', title: 'Peitoral de Aço', description: 'Fez 10 treinos de peito.', icon: '🦍' },
  { type: 'MUSCLE_BACK', title: 'Costas Largas', description: 'Fez 10 treinos de costas.', icon: '🦅' },
  { type: 'MUSCLE_LEGS', title: 'Base Sólida', description: 'Fez 10 treinos de pernas.', icon: '🦵' },
  { type: 'MUSCLE_ARMS', title: 'Braços Armados', description: 'Fez 10 treinos de braços.', icon: '💪' },
  { type: 'MUSCLE_CORE', title: 'Core Blindado', description: 'Fez 10 treinos de abdômen.', icon: '🛡️' },
  { type: 'EARLY_BIRD', title: 'Madrugador', description: 'Treinou antes das 6h da manhã.', icon: '🌅' },
  { type: 'NIGHT_OWL', title: 'Coruja Noturna', description: 'Treinou depois das 22h.', icon: '🦉' },
  { type: 'WEEKEND_WARRIOR', title: 'Guerreiro de Fim de Semana', description: 'Treinou sábado e domingo.', icon: '⚔️' },
  { type: 'COACH_1', title: 'Buscando Sabedoria', description: 'Fez sua primeira pergunta ao Coach AI.', icon: '🤖' },
  { type: 'COACH_50', title: 'Mente Aberta', description: 'Fez 50 perguntas ao Coach AI.', icon: '🧠' },
  { type: 'SOCIAL_1', title: 'Sociável', description: 'Fez sua primeira postagem na comunidade.', icon: '📸' },
  { type: 'SOCIAL_10', title: 'Influenciador', description: 'Fez 10 postagens na comunidade.', icon: '🌟' },
  { type: 'LIKES_100', title: 'Popular', description: 'Recebeu 100 curtidas na comunidade.', icon: '❤️' },
  { type: 'GENERATOR_5', title: 'Explorador', description: 'Gerou 5 treinos diferentes com a IA.', icon: '⚡' },
  { type: 'GENERATOR_20', title: 'Cientista Louco', description: 'Gerou 20 treinos diferentes com a IA.', icon: '🧪' },
  { type: 'HEAVY_LIFTER', title: 'Levantador de Peso', description: 'Registrou um novo PR (Recorde Pessoal).', icon: '🏋️' },
  { type: 'NUTRITION_1', title: 'Nutrição em Dia', description: 'Pediu uma dica de dieta ao Coach.', icon: '🥗' },
  { type: 'WATER_BOY', title: 'Hidratado', description: 'Bateu a meta de água por 7 dias.', icon: '💧' },
  { type: 'RECOVERY_MASTER', title: 'Mestre da Recuperação', description: 'Respeitou os dias de descanso.', icon: '🧘' },
  { type: 'PREMIUM_MEMBER', title: 'Elite IronPulse', description: 'Tornou-se um membro VIP.', icon: '💎' },
  { type: 'FOUNDER', title: 'Pioneiro', description: 'Usuário desde a versão Beta.', icon: '🚀' },
  { type: 'NUTRITION_7', title: 'Dieta de Ferro', description: 'Analisou suas refeições por 7 dias seguidos.', icon: '🥩' },
  { type: 'SLEEP_MASTER', title: 'Mestre do Sono', description: 'Registrou 8h de sono por uma semana.', icon: '😴' },
  { type: 'CARDIO_10', title: 'Coração de Atleta', description: 'Completou 10 sessões de cardio.', icon: '🏃' },
  { type: 'STRENGTH_PR', title: 'Força Bruta', description: 'Bateu 3 recordes pessoais no mesmo mês.', icon: '💥' },
  { type: 'COMMUNITY_HERO', title: 'Herói da Comunidade', description: 'Ajudou 10 iniciantes no feed.', icon: '🤝' },
];

const RADIO_STATIONS = [
  { 
    name: 'Eletrônica/Dance', 
    url: 'https://edge15.streamonkey.net/energy-fitness?aggregator=radiode'
  },
  { 
    name: 'Pop', 
    url: 'https://frontend.streamonkey.net/energy-pop/stream/mp3?aggregator=radiode'
  },
  { 
    name: 'Pop/Hits', 
    url: 'https://e-spo-103.fabricahost.com.br/metropolitana985sp?f=1773107748N01KKAQA7K84R32RND7Q9NZ706K&tid=01KKAQA7K8NJECJESFEKHXRD7X'
  },
  { 
    name: 'Trance', 
    url: 'https://strm112.1.fm/atr_mobile_mp3'
  },
  { 
    name: 'Eletrônica', 
    url: 'https://listenssl.ibizaglobalradio.com:8024/stream'
  },
  { 
    name: 'Dance', 
    url: 'https://strm112.1.fm/dance_mobile_mp3'
  },
  { 
    name: 'Pop/Retrô', 
    url: 'https://listen.181fm.com/181-awesome80s_128k.mp3'
  },
  { 
    name: 'Rock', 
    url: 'https://listen.181fm.com/181-90salt_128k.mp3'
  },
  { 
    name: 'Rock/Indie', 
    url: 'https://stream.radioparadise.com/mp3-128'
  },
  { 
    name: 'Dance/EDM', 
    url: 'https://dancewave.online/dance.mp3'
  },
  { 
    name: 'Ambient/Chill', 
    url: 'https://ice1.somafm.com/groovesalad-128-mp3'
  }
];

const FALLBACK_RADIO_URL = "https://ice1.somafm.com/groovesalad-128-mp3"; // Ambient/Chill

const MUSCLE_IMAGES: Record<string, string> = {
  'Peito': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  'Costas': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  'Pernas': 'https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=800&q=80',
  'Ombros': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  'Braços': 'https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=800&q=80',
  'Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'Tríceps': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=800&q=80',
  'Bíceps': 'https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=800&q=80',
  'Abdômen': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'Default': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
};

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

const CATEGORIES = [
  { id: 'chest', name: 'Peito', icon: <Zap size={24} />, color: 'from-blue-600/20 to-blue-900/40' },
  { id: 'back', name: 'Costas', icon: <Activity size={24} />, color: 'from-emerald-600/20 to-emerald-900/40' },
  { id: 'legs', name: 'Pernas', icon: <Dumbbell size={24} />, color: 'from-orange-600/20 to-orange-900/40' },
  { id: 'shoulders', name: 'Ombros', icon: <Target size={24} />, color: 'from-purple-600/20 to-purple-900/40' },
  { id: 'biceps', name: 'Bíceps', icon: <Zap size={24} />, color: 'from-red-600/20 to-red-900/40' },
  { id: 'triceps', name: 'Tríceps', icon: <Zap size={24} />, color: 'from-pink-600/20 to-pink-900/40' },
  { id: 'abs', name: 'Abdômen', icon: <Activity size={24} />, color: 'from-yellow-600/20 to-yellow-900/40' },
  { id: 'calves', name: 'Panturrilha', icon: <Activity size={24} />, color: 'from-cyan-600/20 to-cyan-900/40' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  back: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&w=800&q=80',
  triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  abs: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  calves: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&w=800&q=80',
};

const PINTEREST_GIFS: Record<string, string[]> = {
  chest: [
    "https://i.pinimg.com/originals/72/6f/e5/726fe5b37754c6eb0bbdd6c36a1bcffe.gif",
    "https://i.pinimg.com/originals/8e/34/bb/8e34bb41d30ceb2f65aa7873a87a4371.gif",
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/f8/fd/a8/f8fda8fb064e515dfc84a8074f583b74.gif",
    "https://i.pinimg.com/originals/a9/3a/bb/a93abb326710d002da5110820b991717.gif",
    "https://i.pinimg.com/originals/d9/b2/fd/d9b2fd3831e30eeebbebe79810917bf2.gif",
    "https://i.pinimg.com/originals/40/74/22/407422f75623c5d283b3184bba75cd28.gif"
  ],
  arms: [
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/32/f5/7c/32f57c3e06296c7ee0c2ef1b0c7a2193.gif",
    "https://i.pinimg.com/originals/2b/80/b8/2b80b84616a9dd930833911c4a663d3c.gif",
    "https://i.pinimg.com/originals/fa/ea/35/faea356cd85d719ff05e61cf5f48d7df.gif",
    "https://i.pinimg.com/originals/da/cc/bb/daccbb268bfb32ad323e3597a8d3ec25.gif",
    "https://i.pinimg.com/originals/40/5f/cc/405fcc07968c4722e5c5e918ccffddd9.gif",
    "https://i.pinimg.com/originals/94/c2/c4/94c2c4572361db231accb9eede473be6.gif",
    "https://i.pinimg.com/originals/64/8c/60/648c6055923f939981d82e94167b6ab6.gif",
    "https://i.pinimg.com/originals/5a/2c/45/5a2c45a42b7bec3aff2959e221eb903f.gif",
    "https://i.pinimg.com/originals/8e/34/bb/8e34bb41d30ceb2f65aa7873a87a4371.gif",
    "https://i.pinimg.com/originals/2b/1c/18/2b1c181b35a4fdcac27e4a1541132b56.gif",
    "https://i.pinimg.com/originals/40/74/22/407422f75623c5d283b3184bba75cd28.gif",
    "https://i.pinimg.com/originals/a9/3a/bb/a93abb326710d002da5110820b991717.gif"
  ],
  legs: [
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/32/f5/7c/32f57c3e06296c7ee0c2ef1b0c7a2193.gif"
  ],
  shoulders: [
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/a9/3a/bb/a93abb326710d002da5110820b991717.gif",
    "https://i.pinimg.com/originals/7e/1a/01/7e1a018195d26ea7888bd1f8bd8d2981.gif",
    "https://i.pinimg.com/originals/e2/ad/19/e2ad198624fa42937942cf7457c7fef5.gif",
    "https://i.pinimg.com/originals/8e/34/bb/8e34bb41d30ceb2f65aa7873a87a4371.gif",
    "https://i.pinimg.com/originals/40/74/22/407422f75623c5d283b3184bba75cd28.gif",
    "https://i.pinimg.com/originals/72/6f/e5/726fe5b37754c6eb0bbdd6c36a1bcffe.gif"
  ],
  abs: [
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/83/f2/a3/83f2a3e8f0b8fbd5a9db5e2a7ebc01ec.gif"
  ],
  back: [
    "https://i.pinimg.com/originals/f3/fd/57/f3fd57912cf0d54ab346ed9fbbf810e7.gif",
    "https://i.pinimg.com/originals/51/e1/f2/51e1f2b8f459184f8ca094536fa51565.gif",
    "https://i.pinimg.com/originals/32/f5/7c/32f57c3e06296c7ee0c2ef1b0c7a2193.gif",
    "https://i.pinimg.com/originals/83/f2/a3/83f2a3e8f0b8fbd5a9db5e2a7ebc01ec.gif",
    "https://i.pinimg.com/originals/35/ad/73/35ad7310a503c4d6f4230669275bbdbe.gif",
    "https://i.pinimg.com/originals/e8/a1/06/e8a106fdde515d44b9ea572733615556.gif",
    "https://i.pinimg.com/originals/f8/fd/a8/f8fda8fb064e515dfc84a8074f583b74.gif"
  ]
};

const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const MUSCLE_MAP: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abs: 'Abdômen',
  calves: 'Panturrilha'
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

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
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
  const [radioStations, setRadioStations] = useState(() => {
    try {
      const saved = localStorage.getItem('ironpulse_radiostations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      { name: 'Eletrônica/Dance', url: 'https://edge15.streamonkey.net/energy-fitness?aggregator=radiode' },
      { name: 'Hip Hop/Rap', url: 'https://ice1.somafm.com/defcon-128-mp3' },
      { name: 'Rock/Metal', url: 'https://ice1.somafm.com/metal-128-mp3' }
    ];
  });
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [generationCount, setGenerationCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ironpulse_generation_count');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.count === 'number' && typeof parsed.date === 'string') {
          // Reset count if it's a new day
          if (new Date().toDateString() !== new Date(parsed.date).toDateString()) {
            return 0;
          }
          return parsed.count;
        }
      }
    } catch (e) {}
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('ironpulse_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('ironpulse_generation_count', JSON.stringify({
      count: generationCount,
      date: new Date().toISOString()
    }));
  }, [generationCount]);

  const [managingList, setManagingList] = useState<'muscles' | 'radios' | null>(null);
  const [adminInput, setAdminInput] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [dailyTip, setDailyTip] = useState('Carregando dica do dia...');
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
        fetch(`/api/v1/bodyparts/${encodeURIComponent(categoryName)}/exercises`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setApiExercises(data);
          })
          .catch(err => console.error("Error fetching exercises by category:", err));
      }
    }
  }, [view, selectedCategory]);

  useEffect(() => {
    if (view === 'exercises' && exerciseSearch.length > 2) {
      fetch(`/api/v1/exercises/search?name=${encodeURIComponent(exerciseSearch)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Merge with existing category exercises or just show search results
            setApiExercises(data);
          }
        })
        .catch(err => console.error("Error searching exercises:", err));
    }
  }, [exerciseSearch, view]);
  
  const [muscleGroups, setMuscleGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ironpulse_muscles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Tríceps', 'Bíceps', 'Abdômen'];
  });
  
  // New State for Feed and Coach
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: '1',
      userName: 'Marcos Silva',
      userImage: 'https://i.pravatar.cc/150?u=marcos',
      postImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      caption: 'Treino de hoje pago! Foco total no shape. 💪 #IronPulse',
      likes: 24,
      time: '2h atrás',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      likedBy: []
    },
    {
      id: '2',
      userName: 'Ana Costa',
      userImage: 'https://i.pravatar.cc/150?u=ana',
      postImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
      caption: 'Leg day concluído com sucesso. Exausta mas feliz! 🍗🔥',
      likes: 42,
      time: '5h atrás',
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
      likedBy: []
    }
  ]);

  // Filter posts to only show those less than 5 days old
  const activePosts = posts.filter(post => (Date.now() - post.createdAt) <= 5 * 24 * 60 * 60 * 1000);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Eu sou seu Coach IronPulse. Como posso te ajudar com seu treino ou dieta hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const moderation = await moderateImage(base64);

      if (moderation.safe) {
        const newPost: FeedPost = {
          id: Math.random().toString(36).substring(7),
          userName: user?.name || 'Usuário',
          userImage: user?.profileImage || `https://i.pravatar.cc/150?u=${user?.id || 'user'}`,
          postImage: reader.result as string,
          caption: 'Novo treino concluído! 🚀 #IronPulse',
          likes: 0,
          time: 'Agora',
          createdAt: Date.now(),
          likedBy: []
        };
        setPosts([newPost, ...posts]);
      } else {
        alert(`Imagem bloqueada pela IA: ${moderation.reason || 'Conteúdo inadequado ou não relacionado a fitness.'}`);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() || !user) return;
    
    setIsPosting(true);
    const newPost: FeedPost = {
      id: Math.random().toString(36).substring(7),
      userName: user.name,
      userImage: user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`,
      caption: newPostText,
      likes: 0,
      time: 'Agora',
      createdAt: Date.now(),
      likedBy: []
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setIsPosting(false);
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const likedBy = post.likedBy || [];
        const isLiked = likedBy.includes(user.id);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked ? likedBy.filter(id => id !== user.id) : [...likedBy, user.id]
        };
      }
      return post;
    }));
  };

  const handleShare = (post: FeedPost, platform: 'whatsapp' | 'facebook' | 'instagram' | 'copy') => {
    const text = `Confira o progresso de ${post.userName} no IronPulse AI: "${post.caption}"`;
    const url = window.location.href;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(text + ' ' + url);
        alert('Link e legenda copiados! Abra o Instagram para compartilhar.');
        break;
      case 'copy':
        navigator.clipboard.writeText(text + ' ' + url);
        alert('Link copiado para a área de transferência!');
        break;
    }
  };

  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingFood(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        setLastFoodImage(reader.result as string);
        const result = await analyzeFoodImage(base64String);
        console.log("Food analysis result:", result);
        setFoodAnalysis(result);
        setNutritionHistory(prev => [result, ...prev].slice(0, 10));
        setToast({ message: "Análise nutricional concluída!", type: 'success' });
      } catch (error) {
        console.error("Food upload error:", error);
        setToast({ message: "Erro ao analisar a imagem. Verifique sua conexão e tente novamente.", type: 'error' });
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
        try {
          const res = await fetch(`/api/v1/exercises/search?name=${encodeURIComponent(ex.name)}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const match = data.find((apiEx: any) => apiEx.name.toLowerCase() === ex.name.toLowerCase()) || data[0];
            if (match.video_url) videoUrl = match.video_url;
          }
        } catch (e) {
          console.warn("Could not enrich exercise video:", ex.name);
        }

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
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'forgot_verify'>('login');
  const [authRole, setAuthRole] = useState<'student' | 'trainer'>('student');
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ironpulse_token'));
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
  useEffect(() => {
    const fetchTip = async () => {
      try {
        const tip = await generateDailyTip();
        setDailyTip(tip);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTip();
  }, []);

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
    if (!token) return;
    try {
      const res = await fetch('/api/student/custom-workout', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomWorkout(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAchievements = async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`/api/user/${user.id}/achievements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (e) {
      console.error("Erro ao buscar conquistas");
    }
  };

  const unlockAchievement = async (type: string) => {
    if (!user || !token) return;
    try {
      const res = await fetch('/api/user/achievement', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.new) {
          fetchAchievements();
        }
      }
    } catch (e) {
      console.error("Erro ao desbloquear conquista");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ironpulse_token');
    localStorage.removeItem('ironpulse_user');
    setView('auth');
  };

  const handleProfileUpdate = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: user.name, 
          age: user.age, 
          profileImage: user.profileImage 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('ironpulse_user', JSON.stringify(data.user));
        alert('Perfil atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar perfil');
      }
    } catch (e) {
      alert('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (newRole: 'student' | 'trainer') => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/switch-role', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('ironpulse_token', data.token);
        localStorage.setItem('ironpulse_user', JSON.stringify(data.user));
        alert(`Você agora é um ${newRole === 'trainer' ? 'Personal' : 'Aluno'}!`);
        setView(newRole === 'trainer' ? 'trainer-dashboard' : 'dashboard');
      }
    } catch (e) {
      console.error("Erro ao trocar de perfil");
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

  const handleAuth = async () => {
    if (authMode === 'forgot') {
      if (!email) {
        setAuthError('Por favor, insira seu e-mail.');
        return;
      }
      setLoading(true);
      setAuthError(null);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          alert('Código de verificação enviado para o seu e-mail!');
          setAuthMode('forgot_verify');
        } else {
          setAuthError(data.error || 'Erro ao solicitar código');
        }
      } catch (e) {
        setAuthError('Erro na conexão com o servidor');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (authMode === 'forgot_verify') {
      if (!email || !resetCode || !password) {
        setAuthError('Preencha todos os campos.');
        return;
      }
      const { isValid } = validatePassword(password);
      if (!isValid) {
        setAuthError('A nova senha não atende aos requisitos mínimos de segurança.');
        return;
      }
      setLoading(true);
      setAuthError(null);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: resetCode, newPassword: password }),
        });
        const data = await res.json();
        if (res.ok) {
          alert('Senha redefinida com sucesso! Faça login com sua nova senha.');
          setAuthMode('login');
          setPassword('');
          setResetCode('');
        } else {
          setAuthError(data.error || 'Erro ao redefinir senha');
        }
      } catch (e) {
        setAuthError('Erro na conexão com o servidor');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (authMode === 'signup') {
      const { isValid } = validatePassword(password);
      if (!isValid) {
        setAuthError('A senha não atende aos requisitos mínimos de segurança.');
        return;
      }
    }
    
    setLoading(true);
    setAuthError(null);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, rememberMe, role: authRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('ironpulse_token', data.token);
        localStorage.setItem('ironpulse_user', JSON.stringify(data.user));
        setView(data.user.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
      } else {
        setAuthError(data.error || 'Ocorreu um erro');
      }
    } catch (e) {
      setAuthError('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
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

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Por favor, permita popups para fazer login com o Google.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Erro ao iniciar login com Google. Verifique se as credenciais estão configuradas.');
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const code = event.data.code;
        try {
          setLoading(true);
          const res = await fetch('/api/auth/google/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('ironpulse_token', data.token);
            localStorage.setItem('ironpulse_user', JSON.stringify(data.user));
            setView(data.user.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
          } else {
            setAuthError(data.error || 'Erro ao autenticar com Google');
          }
        } catch (e) {
          setAuthError('Erro na conexão com o servidor');
        } finally {
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchAdminData = async () => {
    if (!user?.isAdmin || !token) return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (statsRes.ok && usersRes.ok) {
        setAdminStats(await statsRes.json());
        setAdminUsers(await usersRes.json());
      }
    } catch (e) {
      console.error("Erro ao buscar dados administrativos");
    }
  };

  useEffect(() => {
    if (view === 'admin') {
      fetchAdminData();
    }
  }, [view]);

  const toggleUserPremium = async (userId: number) => {
    if (!token) return;
    await fetch('/api/admin/user/toggle-premium', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }),
    });
    fetchAdminData();
  };

  const toggleUserAdmin = async (userId: number) => {
    if (!token) return;
    await fetch('/api/admin/user/toggle-admin', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }),
    });
    fetchAdminData();
  };

  const toggleUserBlock = async (userId: number) => {
    if (!token) return;
    const res = await fetch('/api/admin/user/toggle-block', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok) {
      fetchAdminData();
    } else {
      alert(data.error || 'Erro ao bloquear usuário');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!token) return;
    const res = await fetch(`/api/admin/user/${userId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      fetchAdminData();
    } else {
      alert(data.error || 'Erro ao excluir usuário');
    }
  };

  const handleBiometricAuth = () => {
    setLoading(true);
    // Simulating biometric check
    setTimeout(() => {
      const savedToken = localStorage.getItem('ironpulse_token');
      const savedUser = localStorage.getItem('ironpulse_user');
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setView(parsedUser.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
      } else {
        setAuthError("Nenhuma biometria cadastrada. Faça login primeiro.");
      }
      setLoading(false);
    }, 1500);
  };

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

  const handleGenerateWorkout = async () => {
    const maxGenerations = user?.isPremium ? 4 : 2;
    if (generationCount >= maxGenerations) {
      alert(`Você atingiu o limite diário de ${maxGenerations} treinos gerados. ${!user?.isPremium ? 'Torne-se VIP para gerar mais treinos!' : 'Volte amanhã para gerar mais treinos.'}`);
      return;
    }

    if (selectedMuscles.length === 0) {
      alert("Por favor, selecione pelo menos um grupo muscular para gerar o treino.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Iniciando geração de treino para:", selectedMuscles);
      const workout = await generateWorkout(selectedMuscles, level, biotype, user?.age);
      
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    
    if (isRadioPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError' && !e.message?.includes('interrupted')) {
            console.warn("Playback failed after source change:", e);
          }
        });
      }
    }
  }, [currentRadio, usingFallback]);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isRadioPlaying) {
        audioRef.current.pause();
        setIsRadioPlaying(false);
      } else {
        if (radioError && !usingFallback) {
          setUsingFallback(true);
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Erro ao tocar rádio:", e);
          });
        }
        setIsRadioPlaying(true);
      }
    }
  };

  const nextRadio = () => {
    setRadioError(null);
    setUsingFallback(false);
    setCurrentRadio((prev) => (prev + 1) % radioStations.length);
  };

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

      <audio 
        ref={audioRef} 
        src={usingFallback ? FALLBACK_RADIO_URL : radioStations[currentRadio]?.url || FALLBACK_RADIO_URL}
        preload="none"
        onPlay={() => {
          setIsRadioPlaying(true);
          setIsRadioLoading(false);
          setRadioError(null);
        }}
        onPause={() => setIsRadioPlaying(false)}
        onWaiting={() => setIsRadioLoading(true)}
        onCanPlay={() => setIsRadioLoading(false)}
        onError={(e) => {
          const mediaError = e.currentTarget.error;
          let errorDetail = "Erro desconhecido";
          if (mediaError) {
            switch (mediaError.code) {
              case 1: errorDetail = "Processo abortado"; break;
              case 2: errorDetail = "Erro de rede"; break;
              case 3: errorDetail = "Erro de decodificação"; break;
              case 4: errorDetail = "Formato não suportado/URL inválida"; break;
            }
            if (mediaError.message) errorDetail += ` (${mediaError.message})`;
          }
          console.error("Audio error:", errorDetail, mediaError);
          
          if (!usingFallback) {
            setRadioError(`Falha: ${errorDetail}. Tentando backup...`);
            setUsingFallback(true);
          } else {
            setRadioError(`Falha total: ${errorDetail}. Tente mais tarde.`);
            setIsRadioPlaying(false);
            setIsRadioLoading(false);
          }
        }}
      />
      
      {/* Radio Player - Fixed at Top */}
      <div className="fixed top-4 left-4 z-50 md:left-24">
        {isRadioExpanded ? (
          <div className="bg-forge-zinc/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-2xl cyan-glow w-[280px]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-forge-orange flex items-center justify-center shrink-0 shadow-lg cursor-pointer",
                isRadioPlaying && "animate-pulse"
              )} onClick={() => setIsRadioExpanded(false)}>
                <Radio size={20} className="text-black" />
              </div>
              <div className="overflow-hidden">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                  radioError ? "text-red-500" : "text-forge-orange"
                )}>
                  {radioError || (isRadioLoading ? 'Conectando...' : 'Web Rádio Academia')}
                </p>
                <h4 className="text-xs font-bold truncate text-white uppercase tracking-wider">
                  {usingFallback ? 'AMBIENT/CHILL (BACKUP)' : radioStations[currentRadio]?.name || 'Rádio'}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button 
                onClick={nextRadio}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={toggleRadio}
                disabled={isRadioLoading}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-forge-orange transition-all active:scale-90 disabled:opacity-50"
              >
                {isRadioLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  isRadioPlaying ? <Volume2 size={20} className="animate-pulse" /> : <Play size={20} fill="currentColor" className="ml-0.5" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsRadioExpanded(true)}
            className={cn(
              "w-12 h-12 rounded-full bg-forge-zinc/90 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl hover:bg-forge-orange hover:text-black transition-all",
              isRadioPlaying && "text-forge-orange border-forge-orange/50 cyan-glow"
            )}
          >
            <Radio size={24} className={isRadioPlaying ? "animate-pulse" : ""} />
          </button>
        )}
      </div>

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
              <NavIcon icon={<ShieldCheck size={22} className="text-cyan-400" />} active={view === 'admin'} onClick={() => setView('admin')} label="Admin" className="hidden md:flex" />
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
          {view === 'trainer-dashboard' && token && (
            <TrainerDashboard 
              key="trainer-dashboard"
              token={token} 
              onSelectStudent={(id) => {
                setSelectedStudentId(id);
                setView('workout-builder');
              }} 
            />
          )}

          {view === 'workout-builder' && token && selectedStudentId && (
            <WorkoutBuilder 
              key="workout-builder"
              token={token} 
              studentId={selectedStudentId} 
              onBack={() => setView('trainer-dashboard')}
              staticExercises={STATIC_EXERCISES}
            />
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8 pb-20"
            >
              {/* 1. Welcome Header - Personalization & Streak */}
              <header className="flex justify-between items-end pt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-forge-orange font-display font-semibold text-sm uppercase tracking-widest">Bem-vindo de volta</h2>
                  </div>
                  <h1 className="text-4xl font-display font-extrabold mt-1">{user?.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-right">
                    <span className="text-[10px] font-bold uppercase text-white/40 block">Status</span>
                    <span className={cn("text-xs font-bold uppercase", user?.isPremium ? "text-yellow-400" : "text-forge-orange")}>
                      {user?.isPremium ? "Elite IronPulse" : "Membro Standard"}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-forge-zinc flex items-center justify-center border border-white/10 cyan-glow overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Flame className="text-forge-orange" />
                    )}
                  </div>
                </div>
              </header>

              {/* Custom Workout from Trainer */}
              {customWorkout && (
                <div className="relative group mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-full glass-card p-5 rounded-[2rem] border border-emerald-500/30 overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-display font-black italic tracking-tighter uppercase text-emerald-400">Treino do Personal</h3>
                        <p className="text-white/60 text-xs mt-1">Montado por: {customWorkout.personal_name}</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Dumbbell size={20} className="text-emerald-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {customWorkout.exercicios.map((ex: any, idx: number) => {
                        const staticEx = STATIC_EXERCISES.find(s => s.id === ex.ex);
                        return (
                          <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-sm">{staticEx?.name || 'Exercício'}</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">{staticEx?.muscle}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-400">{ex.s}x{ex.r}</p>
                              <p className="text-[10px] text-white/40">{ex.d}s desc.</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={handleStartCustomWorkout}
                      className="w-full py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-white transition-colors"
                    >
                      Começar Treino
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Primary Action - The most important thing */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-forge-orange to-orange-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  onClick={() => setView('generator')}
                  className="relative w-full glass-card p-5 rounded-[2rem] border border-white/10 flex items-center justify-between overflow-hidden"
                >
                  <div className="space-y-1 text-left">
                    <h3 className="text-xl font-display font-black italic tracking-tighter uppercase">Iniciar Treino de Hoje</h3>
                    <p className="text-white/40 text-xs">Gere sua rotina em segundos.</p>
                  </div>
                  <div className="w-12 h-12 bg-forge-orange rounded-xl flex items-center justify-center shadow-lg shadow-forge-orange/20">
                    <Zap size={24} className="text-black" />
                  </div>
                </button>
              </div>

              {/* 3. Daily Tip - Engagement */}
              <section className="space-y-4">
                <div className="bg-gradient-to-br from-forge-zinc to-forge-black p-4 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Info size={40} />
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-forge-orange">Dica de Hoje</h4>
                    <p className="text-white/80 text-xs italic">
                      "{dailyTip}"
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Community Snippet */}
              <section className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <Users size={14} className="text-forge-orange" />
                    Comunidade
                  </h3>
                  <button onClick={() => setView('feed')} className="text-[10px] font-bold text-forge-orange uppercase tracking-widest hover:underline">Ver Feed</button>
                </div>
                <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                  {activePosts.length > 0 ? (
                    <>
                      <img src={activePosts[0].postImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{activePosts[0].userName}</p>
                        <p className="text-[10px] text-white/40 line-clamp-1">{activePosts[0].caption}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                        <Heart size={10} className="text-forge-orange" />
                        <span className="text-[10px] font-bold">{activePosts[0].likes}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-white/40 italic w-full text-center py-2">Nenhuma postagem recente.</p>
                  )}
                </div>
              </section>

              {/* 5. Rewards Section - Moved down */}
              <section className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <Star size={14} className="text-forge-orange" />
                    Recompensas
                  </h3>
                  <button 
                    onClick={() => setView('rewards')}
                    className="text-[10px] font-bold text-forge-orange hover:underline uppercase tracking-widest"
                  >
                    Ver Todas ({achievements.length}/{ACHIEVEMENTS_LIST.length})
                  </button>
                </div>
                <div className="glass-card p-3 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {ACHIEVEMENTS_LIST.map((achievement, idx) => {
                      const isUnlocked = achievements.some(a => a.type === achievement.type);
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500",
                            isUnlocked 
                              ? "bg-forge-orange/20 border border-forge-orange/50 grayscale-0" 
                              : "bg-white/5 border border-white/5 grayscale opacity-30"
                          )}
                          title={achievement.title}
                        >
                          {achievement.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 6. History & VIP (Moved to bottom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Últimos Treinos</h3>
                    <button onClick={() => setView('generator')} className="text-[10px] font-bold text-forge-orange hover:text-white transition-colors uppercase tracking-widest">Ver Todos</button>
                  </div>
                  <div className="space-y-2">
                    {workoutHistory.length > 0 ? workoutHistory.slice(0, 2).map((w, i) => (
                      <div key={i} className="glass-card p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-forge-orange/30 transition-all cursor-pointer" onClick={() => { setCurrentWorkout(w); setView('workout-detail'); }}>
                        <div>
                          <h4 className="font-bold text-xs">{w.title}</h4>
                          <p className="text-[10px] text-white/40 uppercase font-mono">{w.muscleGroup}</p>
                        </div>
                        <ChevronRight className="text-white/20 group-hover:text-forge-orange transition-colors" size={14} />
                      </div>
                    )) : (
                      <div className="p-4 text-center glass-card rounded-xl border border-white/5 border-dashed">
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Nenhum treino gerado ainda.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Coach AI & Nutrição</h3>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <Bot className="text-emerald-400" size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold">Dúvidas sobre dieta?</h4>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('coach')}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase transition-colors"
                    >
                      Falar com Coach
                    </button>
                  </div>

                  <div className="glass-card p-4 rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <Star className="text-yellow-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black uppercase tracking-tight text-yellow-400 drop-shadow-md">Recursos VIP</h4>
                        <p className="text-[10px] text-white/60 leading-tight mt-0.5">Desbloqueie seu potencial máximo</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('vip')}
                      className="w-full py-2.5 bg-yellow-400 text-black rounded-lg text-xs font-black uppercase hover:bg-white transition-colors shadow-lg shadow-yellow-400/20"
                    >
                      Acessar Área VIP
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {view === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="min-h-[80vh] flex flex-col items-center justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-forge-orange rounded-3xl mx-auto flex items-center justify-center cyan-glow mb-4">
                  <Zap size={40} className="text-black" />
                </div>
                <h1 className="text-5xl font-display font-black tracking-tighter">IRONPULSE <span className="text-forge-orange">AI</span></h1>
                <p className="text-white/40 font-medium">Forje sua melhor versão com IA.</p>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 border-white/10">
                <div className="flex bg-forge-zinc p-1 rounded-2xl">
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", authMode === 'login' ? "bg-forge-orange text-black" : "text-white/40")}
                  >
                    LOGIN
                  </button>
                  <button 
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", authMode === 'signup' ? "bg-forge-orange text-black" : "text-white/40")}
                  >
                    CADASTRO
                  </button>
                </div>

                <div className="space-y-4">
                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
                    >
                      <AlertTriangle className="text-red-500 shrink-0" size={20} />
                      <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{authError}</p>
                    </motion.div>
                  )}
                  {authMode === 'signup' && (
                    <>
                      <input 
                        type="text" placeholder="Seu Nome" 
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none"
                      />
                      <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => setAuthRole('student')}
                          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", authRole === 'student' ? "bg-forge-orange text-black" : "text-white/40")}
                        >
                          SOU ALUNO
                        </button>
                        <button 
                          onClick={() => setAuthRole('trainer')}
                          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", authRole === 'trainer' ? "bg-forge-orange text-black" : "text-white/40")}
                        >
                          SOU PERSONAL
                        </button>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <input 
                      type="email" placeholder="E-mail" 
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none"
                    />
                  </div>
                  
                  {(authMode === 'login' || authMode === 'signup') && (
                    <div className="relative">
                      <input 
                        type="password" placeholder="Senha" 
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none"
                      />
                    </div>
                  )}

                  {authMode === 'forgot_verify' && (
                    <>
                      <div className="relative">
                        <input 
                          type="text" placeholder="Código de 6 dígitos" 
                          value={resetCode} onChange={e => setResetCode(e.target.value)}
                          className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none text-center tracking-[0.5em] font-mono text-xl"
                          maxLength={6}
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="password" placeholder="Nova Senha" 
                          value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none"
                        />
                      </div>
                    </>
                  )}

                  {(authMode === 'signup' || authMode === 'forgot_verify') && password.length > 0 && (
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Requisitos da Senha:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold transition-colors", passwordChecks.minLength ? "text-emerald-500" : "text-white/20")}>
                          <CheckCircle2 size={12} /> 8+ Caracteres
                        </div>
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold transition-colors", passwordChecks.hasUpper ? "text-emerald-500" : "text-white/20")}>
                          <CheckCircle2 size={12} /> Letra Maiúscula
                        </div>
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold transition-colors", passwordChecks.hasLower ? "text-emerald-500" : "text-white/20")}>
                          <CheckCircle2 size={12} /> Letra Minúscula
                        </div>
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold transition-colors", passwordChecks.hasNumber ? "text-emerald-500" : "text-white/20")}>
                          <CheckCircle2 size={12} /> Número
                        </div>
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold transition-colors", passwordChecks.hasSpecial ? "text-emerald-500" : "text-white/20")}>
                          <CheckCircle2 size={12} /> Símbolo (!@#$)
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-2">
                    {authMode === 'login' && (
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={cn(
                          "w-5 h-5 rounded-md border border-white/10 flex items-center justify-center transition-all",
                          rememberMe ? "bg-forge-orange border-forge-orange" : "bg-forge-zinc"
                        )}>
                          {rememberMe && <CheckCircle2 size={14} className="text-black" />}
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={rememberMe} 
                            onChange={() => setRememberMe(!rememberMe)} 
                          />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">Lembrar de mim</span>
                      </label>
                    )}
                    
                    {authMode === 'login' && (
                      <button 
                        onClick={() => { setAuthMode('forgot'); setAuthError(null); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-forge-orange hover:underline"
                      >
                        Esqueci a senha
                      </button>
                    )}

                    {(authMode === 'forgot' || authMode === 'forgot_verify') && (
                      <button 
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                      >
                        Voltar para o Login
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleAuth}
                    disabled={loading || (authMode === 'signup' && !passwordChecks.isValid) || (authMode === 'forgot_verify' && !passwordChecks.isValid)}
                    className="w-full py-5 bg-white text-black rounded-2xl font-display font-black text-lg hover:bg-forge-orange transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'PROCESSANDO...' : (
                      <>
                        <Lock size={20} />
                        {authMode === 'login' ? 'ENTRAR' : authMode === 'signup' ? 'CRIAR CONTA' : authMode === 'forgot' ? 'ENVIAR CÓDIGO' : 'REDEFINIR SENHA'}
                      </>
                    )}
                  </button>

                  {authMode === 'login' && (
                    <button 
                      onClick={handleBiometricAuth}
                      disabled={loading}
                      className="w-full py-4 bg-forge-zinc/50 border border-white/5 text-white rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Fingerprint size={18} className="text-forge-orange" />
                      ENTRAR COM BIOMETRIA
                    </button>
                  )}

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-forge-black px-2 text-white/40">OU</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-black p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    CONTINUAR COM GOOGLE
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 text-white/20">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Conexão Segura AES-256</span>
                </div>
              </div>
            </motion.div>
          )}



          {view === 'admin' && user?.isAdmin && (
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
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <p className="font-bold">{u.name}</p>
                              <p className="text-white/40">{u.email}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                {u.is_premium ? (
                                  <span className="text-[10px] font-bold text-forge-orange uppercase tracking-widest">VIP Member</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Free User</span>
                                )}
                                {u.is_admin ? (
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
                                  onClick={() => toggleUserPremium(u.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    u.is_premium ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-forge-orange/20 text-forge-orange hover:bg-forge-orange/30"
                                  )}
                                >
                                  {u.is_premium ? 'Remover VIP' : 'Dar VIP'}
                                </button>
                                <button 
                                  onClick={() => toggleUserAdmin(u.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    u.is_admin ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30"
                                  )}
                                >
                                  {u.is_admin ? 'Remover Admin' : 'Dar Admin'}
                                </button>
                                <button 
                                  onClick={() => toggleUserBlock(u.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    u.is_blocked ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" : "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                                  )}
                                >
                                  {u.is_blocked ? 'Desbloquear' : 'Bloquear'}
                                </button>
                                <button 
                                  onClick={() => deleteUser(u.id)}
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
                        onClick={() => {
                          if (adminInput.includes('|')) {
                            const [name, url] = adminInput.split('|');
                            if (name && url) {
                              const newRadios = [...radioStations, { name: name.trim(), url: url.trim() }];
                              setRadioStations(newRadios);
                              localStorage.setItem('ironpulse_radiostations', JSON.stringify(newRadios));
                              setAdminInput('');
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
                            onClick={() => {
                              const newRadios = radioStations.filter((rad: any) => rad.name !== r.name);
                              setRadioStations(newRadios);
                              localStorage.setItem('ironpulse_radiostations', JSON.stringify(newRadios));
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
          )}

          {view === 'exercises' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (selectedCategory) setSelectedCategory(null);
                    else setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
                  }}
                  className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
                  {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Biblioteca de Exercícios'}
                </h2>
                <div className="w-12" />
              </div>

              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "relative group overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-500",
                        "bg-gradient-to-br border border-white/10",
                        cat.color
                      )}
                    >
                      <div className="relative z-10">
                        <div className="mb-4 bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                          {cat.icon}
                        </div>
                        <h3 className="text-xl font-display font-black uppercase tracking-tight">{cat.name}</h3>
                        <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Ver Exercícios</p>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <Dumbbell size={80} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input 
                      type="text"
                      placeholder="Buscar exercício..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-forge-orange transition-colors"
                    />
                  </div>

                  <div className="grid gap-4">
                    {/* Combined exercises from API and static library */}
                    {[
                      ...apiExercises.map(ex => ({
                        name: ex.name,
                        videoUrl: ex.video_url,
                        image: CATEGORY_IMAGES[selectedCategory || ''] || CATEGORY_IMAGES['chest'],
                        isApi: true
                      })),
                      ...(EXERCISE_LIBRARY[selectedCategory || ''] || [])
                        .filter(ex => !apiExercises.some(apiEx => apiEx.name.toLowerCase() === ex.name.toLowerCase()))
                        .filter(ex => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                    ].map((ex, i) => (
                        <div key={i} className="glass-card p-4 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-forge-orange/30 transition-all">
                          <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                            <img 
                              src={PINTEREST_GIFS[selectedCategory || '']?.[ex.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % (PINTEREST_GIFS[selectedCategory || '']?.length || 1)] || ex.image} 
                              alt={ex.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-display font-black uppercase tracking-tight text-lg">{ex.name}</h4>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Foco: {CATEGORIES.find(c => c.id === selectedCategory)?.name}</p>
                            <div className="mt-2 flex gap-2">
                              <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-white/40 uppercase">Vídeo HD</span>
                              <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-white/40 uppercase">Técnica</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedVideoUrl(ex.videoUrl || `https://www.youtube.com/results?search_query=Fitness+Online+${encodeURIComponent(ex.name)}`);
                              setVideoModalTitle(ex.name);
                              setIsVideoModalOpen(true);
                            }}
                            className="w-12 h-12 bg-forge-orange/10 text-forge-orange rounded-2xl flex items-center justify-center hover:bg-forge-orange hover:text-black transition-all shadow-lg shadow-forge-orange/5"
                          >
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar
              </button>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-display font-extrabold">Gerador de Treino</h1>
                <p className="text-white/60">Selecione um ou mais músculos para combinar.</p>
              </div>

              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3 bg-forge-zinc p-4 rounded-2xl border border-white/5 focus-within:border-forge-orange/50 transition-all">
                    <Search size={20} className="text-white/20" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar exercício específico..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(e.target.value.length > 0);
                      }}
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/20 font-medium"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showSearchResults && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-forge-zinc border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                      >
                        {filteredExercises.length > 0 ? filteredExercises.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => handleAddManualExercise(ex)}
                            className="w-full p-4 text-left hover:bg-white/5 border-b border-white/5 last:border-none flex items-center justify-between group"
                          >
                            <span className="font-medium group-hover:text-forge-orange transition-colors">{ex}</span>
                            <PlusCircle size={16} className="text-white/20 group-hover:text-forge-orange" />
                          </button>
                        )) : (
                          <div className="p-4 text-center text-white/40 text-sm">Nenhum exercício encontrado.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold uppercase tracking-widest text-white/40">Seu Biotipo</label>
                    <button 
                      onClick={() => setView('biotypes')}
                      className="text-[10px] text-forge-orange font-bold flex items-center gap-1 hover:underline"
                    >
                      <Info size={12} /> O QUE É ISSO?
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { type: 'Ectomorfo', desc: 'Magro, metabolismo acelerado, dificuldade em ganhar peso.' },
                      { type: 'Mesomorfo', desc: 'Atlético, ganha músculos e perde gordura com facilidade.' },
                      { type: 'Endomorfo', desc: 'Estrutura larga, metabolismo lento, facilidade em ganhar peso.' }
                    ].map((item) => {
                      const b = item.type as Biotype;
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
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold uppercase tracking-widest text-white/40">Grupos Musculares</label>
                    <span className="text-xs text-forge-orange font-bold">{selectedMuscles.length} selecionados</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {muscleGroups.map((m) => (
                      <div key={m} className="relative group">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleMuscle(m)}
                          className={cn(
                            "w-full p-4 rounded-2xl border transition-all text-left font-medium relative overflow-hidden",
                            selectedMuscles.includes(m) 
                              ? "bg-forge-orange border-forge-orange text-black font-bold cyan-glow" 
                              : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20"
                          )}
                        >
                          <span className="relative z-10">{m}</span>
                          {selectedMuscles.includes(m) && (
                            <motion.div 
                              layoutId="pulse-bg"
                              className="absolute inset-0 bg-white/30"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                              transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
                            />
                          )}
                          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Dumbbell size={48} />
                          </div>
                        </motion.button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentWorkout({
                              title: `Anatomia: ${m}`,
                              muscleGroup: m,
                              level: 'Técnico',
                              exercises: [{
                                name: `Execução Correta: ${m}`,
                                sets: '-', reps: '-', rest: '-',
                                notes: `Visualize a anatomia e execução correta para o grupo: ${m}`,
                                videoUrl: MUSCLE_VIDEOS[m] || MUSCLE_VIDEOS['Default']
                              }],
                              tips: ['Foque na contração muscular', 'Mantenha a postura']
                            });
                            setView('workout-detail');
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-forge-orange hover:text-black"
                          title="Ver Vídeo"
                        >
                          <Maximize2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    disabled={selectedMuscles.length === 0 || loading || generationCount >= (user?.isPremium ? 4 : 2)}
                    onClick={handleGenerateWorkout}
                    className="w-full py-5 bg-white text-black rounded-2xl font-display font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-forge-orange hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>FORJAR TREINO COMBINADO <Zap size={20} /></>
                    )}
                  </button>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">
                      Treinos gerados hoje: <span className={generationCount >= (user?.isPremium ? 4 : 2) ? "text-red-500" : "text-forge-orange"}>{generationCount}/{user?.isPremium ? 4 : 2}</span>
                    </span>
                    {!user?.isPremium && generationCount >= 2 && (
                      <button onClick={() => setView('vip')} className="text-xs text-yellow-500 font-bold hover:underline flex items-center gap-1">
                        <Crown size={12} /> SEJA VIP PARA GERAR MAIS
                      </button>
                    )}
                  </div>
                </div>

                {currentWorkout && currentWorkout.exercises.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setView('workout-detail')}
                    className="w-full py-4 bg-forge-zinc border border-forge-orange/30 text-forge-orange rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-forge-orange/10 transition-all"
                  >
                    VER TREINO ATUAL ({currentWorkout.exercises.length} EXERCÍCIOS) <ChevronRight size={18} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {view === 'workout-detail' && (
            <motion.div
              key="workout-detail-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {!currentWorkout ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-forge-zinc rounded-2xl flex items-center justify-center animate-pulse">
                    <Dumbbell className="text-forge-orange/20" size={32} />
                  </div>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Nenhum treino carregado.</p>
                  <button onClick={() => setView('generator')} className="text-forge-orange font-bold text-sm underline">Voltar ao Gerador</button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setView('generator')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                      <ArrowLeft size={20} /> Voltar
                    </button>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleGenerateWorkout}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-forge-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-forge-orange/20"
                      >
                        {loading ? <RotateCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        Regenerar
                      </button>
                      <div className="bg-forge-orange text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        {currentWorkout.level || 'Elite'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl font-display font-extrabold text-gradient">{currentWorkout.title || 'Treino IronPulse'}</h1>
                    <p className="text-white/60 flex items-center gap-2">
                      <Dumbbell size={16} /> Foco: {currentWorkout.muscleGroup || 'Musculação'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(currentWorkout.exercises) && currentWorkout.exercises.length > 0 ? (
                      currentWorkout.exercises.map((ex, idx) => {
                        if (!ex) return null;
                        return (
                          <ExerciseCard 
                            key={`${ex.name}-${idx}`} 
                            exercise={ex} 
                            index={idx} 
                            muscleGroup={selectedMuscles[0] || 'Default'} 
                            onStartRest={() => startTimer(60)}
                            logs={activeWorkoutLogs[ex.name] || []}
                            onUpdateLogs={(sets) => setActiveWorkoutLogs(prev => ({ ...prev, [ex.name]: sets }))}
                            onWatchVideo={(url, title) => {
                              setSelectedVideoUrl(url);
                              setVideoModalTitle(title);
                              setIsVideoModalOpen(true);
                            }}
                            onShowDetails={(exercise) => {
                              setSelectedExerciseDetails(exercise);
                              setIsDetailsModalOpen(true);
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="p-10 text-center glass-card rounded-3xl border border-dashed border-white/10">
                        <p className="text-white/40 text-sm">Nenhum exercício encontrado neste treino.</p>
                      </div>
                    )}
                  </div>

                  {Array.isArray(currentWorkout.tips) && currentWorkout.tips.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-display font-bold flex items-center gap-2">
                        <Zap size={20} className="text-forge-orange" />
                        Dicas de Intensidade
                      </h3>
                      <div className="space-y-3">
                        {currentWorkout.tips.map((tip, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-forge-zinc/50 rounded-2xl border border-white/5">
                            <CheckCircle2 size={20} className="text-forge-orange shrink-0" />
                            <p className="text-white/80 text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <button 
                    onClick={() => {
                      const performedExercises: PerformedExercise[] = currentWorkout.exercises.map(ex => ({
                        name: ex.name,
                        sets: activeWorkoutLogs[ex.name] || []
                      }));

                      const newLog: WorkoutLog = {
                        id: Math.random().toString(36).substr(2, 9),
                        date: Date.now(),
                        workoutTitle: currentWorkout.title || 'Treino IronPulse',
                        exercises: performedExercises
                      };

                      setWorkoutLogs(prev => [newLog, ...prev]);
                      setActiveWorkoutLogs({});
                      unlockAchievement('FIRST_WORKOUT');
                      setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-6 bg-forge-orange text-black rounded-3xl font-display font-black text-xl cyan-glow hover:scale-[1.02] transition-all shadow-2xl shadow-forge-orange/20"
                  >
                    FINALIZAR E SALVAR TREINO 🔥
                  </button>
                </>
              )}
            </motion.div>
          )}

          {view === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar
              </button>

              <div className="space-y-2">
                <h1 className="text-4xl font-display font-extrabold">Plano Semanal</h1>
                <p className="text-white/60">Sua jornada de 7 dias forjada pela IA.</p>
              </div>

              {!weeklyPlan || !weeklyPlan.plan ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-forge-zinc rounded-2xl flex items-center justify-center animate-pulse">
                    <Calendar className="text-forge-orange/20" size={32} />
                  </div>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Nenhum plano carregado.</p>
                  <button onClick={handleLoadWeeklyPlan} className="text-forge-orange font-bold text-sm underline">Gerar Plano Agora</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyPlan.plan.map((day: any, i: number) => (
                    <div key={i} className="glass-card p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-forge-orange/30 transition-all">
                      <div className="space-y-1">
                        <span className="text-forge-orange text-xs font-bold uppercase tracking-widest">{day.day}</span>
                        <h4 className="text-xl font-display font-bold">{day.focus}</h4>
                        <p className="text-white/40 text-sm">{day.description}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedMuscles([day.focus.split(' ')[0]]);
                          setView('generator');
                        }}
                        className="w-10 h-10 rounded-full bg-forge-zinc flex items-center justify-center group-hover:bg-forge-orange transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'biotypes' && (
            <motion.div
              key="biotypes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setView('generator')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar
              </button>

              <div className="space-y-2">
                <h1 className="text-4xl font-display font-extrabold tracking-tighter">Biotipos Corporais</h1>
                <p className="text-white/60">Entenda sua genética para otimizar seus resultados.</p>
              </div>

              <div className="p-6 bg-forge-orange/10 rounded-3xl border border-forge-orange/20">
                <p className="text-sm text-white/80 leading-relaxed">
                  Existem três tipos principais de biotipo corporal definidos pela genética. Eles influenciam o metabolismo, a facilidade de ganhar massa muscular e o acúmulo de gordura. Compreender o seu tipo ajuda a otimizar o treino e a alimentação.
                </p>
              </div>

              <div className="space-y-6">
                <BiotypeSection 
                  title="Ectomorfo (Magro)"
                  color="text-blue-400"
                  description="Metabolismo acelerado, ossos finos, estrutura delgada e ombros estreitos."
                  difficulty="Ganhar peso e massa muscular (hipertrofia)."
                  advantage="Facilidade para manter baixo percentual de gordura."
                  training="Intensidade alta, tempo de descanso maior (1-2 min). Focar em exercícios compostos (supino, agachamento, terra). Treinos curtos e intensos."
                />
                <BiotypeSection 
                  title="Mesomorfo (Atlético)"
                  color="text-forge-orange"
                  description="Estrutura óssea larga, ombros largos, cintura estreita e aparência musculosa."
                  difficulty="Baixa. Ganha músculos e perde gordura com facilidade."
                  advantage="Corpo ideal para atividades de força e definição."
                  training="Equilíbrio entre musculação intensa e cardio. Responde bem a variedade de estímulos (ABC, volume moderado a alto)."
                />
                <BiotypeSection 
                  title="Endomorfo (Arredondado)"
                  color="text-emerald-400"
                  description="Metabolismo lento, tendência a acumular gordura, estrutura óssea larga."
                  difficulty="Perder gordura (emagrecer)."
                  advantage="Alta facilidade para ganhar massa muscular e força."
                  training="Musculação intensa + HIIT/Cardio constante. Descanso menor (30-60s). Dica: Evitar açúcares e industrializados."
                />
              </div>

              <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-forge-orange">Outros Tipos de Treino</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Hipertrofia</p>
                    <p className="text-[10px] text-white/40">3 a 5 séries de 8 a 12 repetições com carga progressiva.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Força (Powerlifting)</p>
                    <p className="text-[10px] text-white/40">Cargas máximas (1-5 repetições) para força absoluta.</p>
                  </div>
                </div>
                <p className="text-white/40 text-[10px] leading-relaxed italic pt-2 border-t border-white/5">
                  * A maioria das pessoas é uma mistura de dois tipos. A chave é a consistência e o ajuste conforme a resposta do seu corpo.
                </p>
              </div>
            </motion.div>
          )}

          {view === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <h1 className="text-4xl font-display font-extrabold">Feedback</h1>
              <p className="text-white/60">Sua opinião ajuda a forjar um app melhor.</p>
              
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-white/40">Avaliação</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} className="p-2 text-forge-orange hover:scale-110 transition-transform">
                        <Star size={32} fill={s <= 4 ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-white/40">O que podemos melhorar?</label>
                  <textarea 
                    className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-forge-orange transition-all h-32 resize-none"
                    placeholder="Sugestões, bugs ou elogios..."
                  />
                </div>

                <button className="w-full py-4 bg-forge-orange text-black rounded-2xl font-display font-extrabold flex items-center justify-center gap-2 hover:bg-white transition-all">
                  ENVIAR FEEDBACK <Send size={20} />
                </button>
              </div>

              <div className="p-6 bg-forge-zinc/30 rounded-3xl border border-white/5 space-y-4">
                <h4 className="font-bold flex items-center gap-2"><Info size={18} className="text-forge-orange" /> Por que seu feedback importa?</h4>
                <p className="text-white/40 text-sm leading-relaxed">
                  Estamos em constante evolução. Futuras atualizações incluirão histórico de treinos, integração com smartwatches e novos modos de IA.
                </p>
              </div>
            </motion.div>
          )}

          {view === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar
              </button>

              <div className="space-y-2">
                <h1 className="text-4xl font-display font-extrabold tracking-tighter">Termos e Privacidade</h1>
                <p className="text-white/60">Transparência e conformidade legal (LGPD).</p>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <h3 className="text-xl font-display font-bold text-forge-orange">1. Proteção de Dados (LGPD)</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    O IronPulse AI está em conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais (nome, e-mail, biotipo) são utilizados exclusivamente para personalizar sua experiência de treino. Não compartilhamos seus dados com terceiros.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <h3 className="text-xl font-display font-bold text-forge-orange">2. Web Rádio e Direitos Autorais</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    As estações de rádio integradas são transmissões públicas via internet. O IronPulse AI atua apenas como um agregador de links. O uso comercial dessas transmissões em ambientes públicos pode exigir licenciamento específico (como o ECAD no Brasil).
                  </p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <h3 className="text-xl font-display font-bold text-forge-orange">3. Isenção de Responsabilidade</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Os treinos gerados pela IA são sugestões baseadas em algoritmos. Sempre consulte um profissional de educação física e um médico antes de iniciar qualquer atividade física intensa.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
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
                      onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-forge-orange transition-all"
                      placeholder="Como quer ser chamado?"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-widest text-white/40">Idade (Opcional)</label>
                    <input 
                      type="number" 
                      value={user?.age || ''}
                      onChange={(e) => setUser(prev => prev ? { ...prev, age: parseInt(e.target.value) || undefined } : null)}
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
                      const b = item.type as Biotype;
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
                  <label className="text-sm font-bold uppercase tracking-widest text-white/40">Nível de Experiência</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { level: 'Iniciante', desc: 'Foco em aprender a técnica e postura.', time: '0-6 meses' },
                      { level: 'Praticante', desc: 'Já conhece a rotina e busca consistência.', time: '6-12 meses' },
                      { level: 'Intermediário', desc: 'Domina a técnica e busca hipertrofia.', time: '1-3 anos' },
                      { level: 'Avançado', desc: 'Treinos intensos e alta consciência corporal.', time: '+3 anos' },
                      { level: 'Elite', desc: 'Performance máxima e atletas.', time: 'Nível Pro' }
                    ].map((item) => {
                      const l = item.level as Level;
                      const isLocked = false; // Níveis Avançado e Elite liberados para todos
                      return (
                        <button
                          key={l}
                          onClick={() => {
                            if (isLocked) {
                              setView('vip');
                            } else {
                              setLevel(l);
                            }
                          }}
                          className={cn(
                            "p-5 rounded-2xl border transition-all text-left flex items-center justify-between",
                            level === l 
                              ? "bg-forge-orange/10 border-forge-orange text-white" 
                              : "bg-forge-zinc border-white/5 text-white/60 hover:border-white/20",
                            isLocked && "opacity-50 hover:border-yellow-500/50"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-bold flex items-center gap-2">
                              {l}
                              {isLocked && <Crown size={14} className="text-yellow-500" />}
                            </span>
                            <span className="text-xs text-white/40">{item.desc}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-forge-orange/60">{item.time}</span>
                          </div>
                          {level === l && <CheckCircle2 size={20} className="text-forge-orange shrink-0 ml-4" />}
                        </button>
                      );
                    })}
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
                    <span className="text-xs text-forge-orange font-bold">{workoutLogs.length} treinos salvos</span>
                  </div>
                  
                  <div className="space-y-3">
                    {workoutLogs.length > 0 ? (
                      workoutLogs.slice(0, 5).map((log) => (
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
                            {log.exercises.map((ex, i) => (
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
                    
                    {workoutLogs.length > 5 && (
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
          )}

          {view === 'rewards' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-20"
            >
              <button onClick={() => setView(user?.role === 'trainer' ? 'trainer-dashboard' : 'dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar ao Início
              </button>

              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">Suas Conquistas</h2>
                  <p className="text-white/40">Forje sua lenda através da constância.</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-display font-black text-forge-orange">{achievements.length}</span>
                  <span className="text-white/20 font-display font-black text-xl">/{ACHIEVEMENTS_LIST.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS_LIST.map((achievement, idx) => {
                  const isUnlocked = achievements.some(a => a.type === achievement.type);
                  const unlockedData = achievements.find(a => a.type === achievement.type);
                  
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "glass-card p-5 rounded-3xl border flex items-center gap-5 transition-all duration-500",
                        isUnlocked 
                          ? "border-forge-orange/30 bg-forge-orange/5" 
                          : "border-white/5 opacity-40 grayscale"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0",
                        isUnlocked ? "bg-forge-orange/20" : "bg-white/5"
                      )}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn("font-bold text-lg", isUnlocked ? "text-white" : "text-white/60")}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-white/40 leading-tight mb-2">{achievement.description}</p>
                        {isUnlocked && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-forge-orange uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Desbloqueado em {new Date(unlockedData?.unlocked_at || '').toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto space-y-8"
            >
              <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar ao Perfil
              </button>
              
              <div>
                <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">Feedback</h2>
                <p className="text-white/40">Sua opinião nos ajuda a forjar um app melhor.</p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-white/40">Tipo de Mensagem</label>
                  <select className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none appearance-none">
                    <option>Sugestão de Melhoria</option>
                    <option>Reportar Bug/Erro</option>
                    <option>Elogio</option>
                    <option>Outro</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-white/40">Sua Mensagem</label>
                  <textarea 
                    rows={5}
                    placeholder="Descreva sua ideia ou o problema que encontrou..."
                    className="w-full bg-forge-zinc border border-white/5 rounded-2xl p-4 text-white focus:border-forge-orange outline-none resize-none"
                  ></textarea>
                </div>

                <button 
                  onClick={() => {
                    alert("Feedback enviado com sucesso! Obrigado.");
                    setView('profile');
                  }}
                  className="w-full py-4 bg-forge-orange text-black rounded-2xl font-bold text-lg hover:bg-white transition-colors"
                >
                  Enviar Feedback
                </button>
              </div>
            </motion.div>
          )}

          {view === 'vip' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-8 pb-20"
            >
              <button onClick={() => setView('profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar ao Perfil
              </button>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-400 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)] mb-4">
                  <Star size={40} className="text-black" />
                </div>
                <h2 className="text-5xl font-display font-black italic tracking-tighter uppercase text-yellow-400">IronPulse VIP</h2>
                <p className="text-white/60 max-w-lg mx-auto">Desbloqueie o potencial máximo do seu treino com ferramentas exclusivas de inteligência artificial e suporte humano.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4">
                    <Camera className="text-yellow-400" size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Análise de Execução por Vídeo</h4>
                  <p className="text-sm text-white/60">A IA analisa seu vídeo treinando em tempo real e corrige sua postura para evitar lesões.</p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                      <Watch className="text-yellow-400" size={24} />
                    </div>
                    {isWatchConnected && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Conectado
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Integração com Smartwatches</h4>
                    <p className="text-sm text-white/60">Sincroniza com Apple Watch e Garmin. A IA adapta seu treino baseado na sua qualidade de sono e batimentos.</p>
                  </div>
                  
                  {isWatchConnected ? (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 text-white/40 mb-1">
                            <Moon size={14} />
                            <span className="text-[10px] font-bold uppercase">Sono</span>
                          </div>
                          <p className="text-sm font-bold text-yellow-400">{watchData?.sleep}</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 text-white/40 mb-1">
                            <Heart size={14} />
                            <span className="text-[10px] font-bold uppercase">Batimentos</span>
                          </div>
                          <p className="text-sm font-bold text-red-400">{watchData?.heartRate} BPM</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleAdaptWorkout}
                        disabled={isAdaptingWorkout || !currentWorkout}
                        className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                      >
                        {isAdaptingWorkout ? (
                          <RotateCcw size={16} className="animate-spin" />
                        ) : (
                          <>ADAPTAR MEU TREINO <Zap size={16} /></>
                        )}
                      </button>
                      {!currentWorkout && <p className="text-[10px] text-center text-white/20 uppercase">Gere um treino primeiro para adaptar</p>}
                    </div>
                  ) : (
                    <button 
                      onClick={handleConnectWatch}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm border border-white/10 transition-all"
                    >
                      CONECTAR DISPOSITIVO
                    </button>
                  )}
                </div>

                <label className="glass-card p-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-transparent relative overflow-hidden cursor-pointer hover:border-yellow-400/50 transition-all group block">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoodUpload} disabled={isAnalyzingFood} />
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {isAnalyzingFood ? <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="text-yellow-400" size={24} />}
                  </div>
                  <h4 className="text-xl font-bold mb-2">Nutricionista IA</h4>
                  <p className="text-sm text-white/60">Tire foto do seu prato de comida e a IA calcula os macros (proteínas, carboidratos) automaticamente.</p>
                  <div className="mt-4 text-xs font-bold text-yellow-400 flex items-center gap-1 uppercase tracking-wider">
                    <Camera size={14} /> Tocar para Fotografar
                  </div>
                </label>
              </div>

              <div className="bg-yellow-400 text-black p-8 rounded-[2.5rem] text-center space-y-6">
                <h3 className="text-3xl font-display font-black uppercase">Assine Agora</h3>
                <p className="font-medium">Por apenas R$ 29,90/mês você transforma seu celular no melhor personal trainer do mundo.</p>
                <button className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                  Tornar-se VIP
                </button>
              </div>
            </motion.div>
          )}

          {view === 'match' && (
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
                                  <img src={m.image} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-400/20" />
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
          )}
          {view === 'feed' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto space-y-8 pb-20"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-display font-black italic tracking-tighter uppercase">Comunidade</h2>
                  <p className="text-white/40">Compartilhe seu progresso e motive outros.</p>
                </div>
              </div>

              {/* Create Post Section */}
              <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                <textarea 
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="O que você está treinando hoje?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-forge-orange/50 transition-colors text-white min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer bg-white/5 text-white/60 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
                    <Camera size={18} />
                    <span className="text-xs uppercase tracking-widest">Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostText.trim() || isPosting}
                    className="bg-forge-orange text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isPosting ? 'POSTANDO...' : 'POSTAR'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {activePosts.map(post => {
                  const isLiked = user && post.likedBy?.includes(user.id);
                  return (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5"
                    >
                      <div className="p-5 flex items-center gap-3">
                        <img src={post.userImage} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <h4 className="font-bold text-sm">{post.userName}</h4>
                          <p className="text-[10px] text-white/40 uppercase font-mono">{post.time}</p>
                        </div>
                      </div>
                      
                      {post.postImage && (
                        <img src={post.postImage} alt="" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                      )}
                      
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-2 transition-all",
                              isLiked ? "text-forge-orange" : "text-white/40 hover:text-white"
                            )}
                          >
                            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                            <span className="text-sm font-black">{post.likes}</span>
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setSharingPostId(sharingPostId === post.id ? null : post.id)}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Share2 size={24} />
                            </button>
                            
                            <AnimatePresence>
                              {sharingPostId === post.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute bottom-full left-0 mb-4 bg-forge-zinc border border-white/10 rounded-2xl p-2 shadow-2xl z-10 flex gap-2"
                                >
                                  <button onClick={() => { handleShare(post, 'whatsapp'); setSharingPostId(null); }} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all">
                                    <MessageCircle size={20} />
                                  </button>
                                  <button onClick={() => { handleShare(post, 'facebook'); setSharingPostId(null); }} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all">
                                    <Facebook size={20} />
                                  </button>
                                  <button onClick={() => { handleShare(post, 'instagram'); setSharingPostId(null); }} className="p-3 bg-pink-500/10 text-pink-500 rounded-xl hover:bg-pink-500/20 transition-all">
                                    <Instagram size={20} />
                                  </button>
                                  <button onClick={() => { handleShare(post, 'copy'); setSharingPostId(null); }} className="p-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all">
                                    <Copy size={20} />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <p className="text-sm text-white/80 leading-relaxed">
                          <span className="font-black text-forge-orange mr-2">{post.userName}</span>
                          {post.caption}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'coach' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-20 md:pb-0"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-display font-black italic tracking-tighter uppercase">Coach IronPulse</h2>
                <p className="text-xs text-white/40">Seu mentor pessoal para treinos e dieta.</p>
              </div>

              <div className="flex-1 glass-card rounded-3xl border border-white/5 p-4 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-forge-orange text-black font-medium rounded-tr-none" 
                        : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 text-white/40 p-4 rounded-2xl text-sm animate-pulse">
                      Coach está digitando...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte sobre treinos, dietas ou motivação..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-forge-orange/50 transition-colors text-white"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading}
                  className="bg-forge-orange text-black p-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={24} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest font-mono">
                A IA responde apenas sobre o mundo fitness.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals inside App scope */}
      <AnimatePresence>
        {foodAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setFoodAnalysis(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(242,125,38,0.2)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-forge-orange p-8 text-black">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Análise Nutricional</h3>
                    <p className="font-bold text-sm uppercase tracking-widest opacity-60">IA Nutrition Scanner</p>
                  </div>
                  <button onClick={() => setFoodAnalysis(null)} className="bg-black/10 p-2 rounded-full hover:bg-black/20 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                {lastFoodImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden border-2 border-black/10 aspect-video">
                    <img src={lastFoodImage} alt="Comida analisada" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-6xl font-display font-black tracking-tighter">
                  {foodAnalysis.totalCalories} <span className="text-xl uppercase">kcal</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Proteínas</span>
                    <span className="text-xl font-display font-black text-blue-400">{foodAnalysis.macros.protein}g</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Carbos</span>
                    <span className="text-xl font-display font-black text-green-400">{foodAnalysis.macros.carbs}g</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Gorduras</span>
                    <span className="text-xl font-display font-black text-yellow-400">{foodAnalysis.macros.fats}g</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Alimentos Identificados</h4>
                  <div className="flex flex-wrap gap-2">
                    {foodAnalysis.foodItems.map((item, i) => (
                      <span key={i} className="bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-forge-orange/10 p-6 rounded-3xl border border-forge-orange/20">
                  <div className="flex items-start gap-3">
                    <Zap className="text-forge-orange shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-forge-orange mb-1">Dica do Coach</h4>
                      <p className="text-white/80 text-sm leading-relaxed italic">"{foodAnalysis.tips}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setFoodAnalysis(null)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors"
                  >
                    VOLTAR
                  </button>
                  <button 
                    onClick={() => setFoodAnalysis(null)}
                    className="flex-[2] py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-forge-orange transition-colors"
                  >
                    FECHAR ANÁLISE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavIcon({ icon, active, onClick, label, className }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 transition-all duration-300 group",
        active ? "text-forge-orange" : "text-white/40 hover:text-white/70",
        className
      )}
    >
      <div className={cn(
        "p-2 md:p-3 rounded-2xl transition-all duration-500 relative overflow-hidden",
        active ? "bg-forge-orange/10 shadow-[0_0_20px_rgba(242,125,38,0.2)]" : "hover:bg-white/5"
      )}>
        {active && (
          <motion.div 
            layoutId="nav-active-bg"
            className="absolute inset-0 bg-forge-orange/5"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className={cn(
          "relative z-10 transition-transform duration-300",
          active ? "scale-110" : "group-hover:scale-110"
        )}>
          {icon}
        </div>
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 group-hover:opacity-40"
      )}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="absolute -bottom-1 w-1 h-1 bg-forge-orange rounded-full"
        />
      )}
    </button>
  );
}

function QuickActionCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-6 rounded-3xl border border-white/5 text-left group hover:border-forge-orange/30 transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-display font-bold mb-1">{title}</h4>
      <p className="text-white/40 text-sm">{description}</p>
    </button>
  );
}

function ExerciseCard({ 
  exercise, 
  index, 
  muscleGroup, 
  onStartRest,
  logs,
  onUpdateLogs,
  onWatchVideo,
  onShowDetails
}: { 
  exercise: WorkoutExercise, 
  index: number, 
  muscleGroup: string, 
  onStartRest: () => void,
  logs: PerformedSet[],
  onUpdateLogs: (sets: PerformedSet[]) => void,
  onWatchVideo: (url: string, title: string) => void,
  onShowDetails: (exercise: WorkoutExercise) => void
}) {
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5s safety timeout
    return () => clearTimeout(timer);
  }, []);
  
  const addSet = () => {
    const lastSet = logs[logs.length - 1];
    onUpdateLogs([...logs, { 
      reps: lastSet?.reps || 10, 
      weight: lastSet?.weight || 0 
    }]);
  };

  const removeSet = (idx: number) => {
    onUpdateLogs(logs.filter((_, i) => i !== idx));
  };

  const updateSet = (idx: number, field: keyof PerformedSet, value: number) => {
    const newLogs = [...logs];
    newLogs[idx] = { ...newLogs[idx], [field]: value };
    onUpdateLogs(newLogs);
  };

  // Get image from exercise data or library, fallback to category image, then brand image
  const normalizedName = normalizeText(exercise.name);
  const libraryImage = Object.values(EXERCISE_LIBRARY).flat().find(ex => {
    const libName = normalizeText(ex.name);
    return normalizedName.includes(libName) || libName.includes(normalizedName);
  })?.image;
  
  const categoryKey = Object.keys(CATEGORY_IMAGES).find(key => {
    const groupMap: Record<string, string[]> = {
      chest: ['chest', 'peito', 'peitoral'],
      back: ['back', 'costas', 'dorsal'],
      legs: ['legs', 'pernas', 'quadriceps', 'isquios'],
      calves: ['panturrilha', 'calves'],
      shoulders: ['shoulders', 'ombros', 'deltoides'],
      biceps: ['biceps'],
      triceps: ['triceps'],
      abs: ['abs', 'abdomen', 'core', 'abdominal'],
      arms: ['arms', 'bracos', 'antebreco']
    };
    return groupMap[key]?.some(term => normalizeText(muscleGroup).includes(term));
  }) || 'chest';

  const pinterestGifs = PINTEREST_GIFS[categoryKey] || PINTEREST_GIFS['chest'];
  const nameHash = exercise.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gifUrl = pinterestGifs[nameHash % pinterestGifs.length];

  const imageUrl = exercise.imageUrl || libraryImage || gifUrl || CATEGORY_IMAGES[categoryKey] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 1) }}
          className={cn(
            "glass-card p-5 rounded-3xl border transition-all relative overflow-hidden group/card",
            completed ? "border-emerald-500/30 bg-emerald-500/5 opacity-60" : "border-white/5"
          )}
        >
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-forge-orange font-mono text-xs font-bold tracking-tighter">EX {index + 1}</span>
              {completed && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Concluído</span>}
            </div>
            <h4 className="text-lg font-display font-bold leading-tight">{exercise.name}</h4>
          </div>
          <button 
            onClick={() => {
              setCompleted(!completed);
              if (!completed) onStartRest();
            }}
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-all shrink-0",
              completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 text-white/40 hover:border-white/60 hover:bg-white/5"
            )}
          >
            <CheckCircle2 size={20} />
          </button>
        </div>

        {/* Brand Image Section */}
        <div 
          className="mb-4 relative group overflow-hidden rounded-2xl bg-forge-zinc aspect-video flex items-center justify-center border border-white/5 shadow-2xl"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-forge-zinc z-10">
              <div className="w-8 h-8 border-2 border-forge-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <img 
            src={imageUrl} 
            alt={exercise.name}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              (e.target as HTMLImageElement).src = CATEGORY_IMAGES[categoryKey] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';
            }}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />

          <div className="absolute inset-0 pointer-events-none border-4 border-forge-orange/20 mix-blend-overlay group-hover:border-forge-orange/40 transition-all z-20" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatBox label="Séries" value={exercise.sets} />
          <StatBox label="Reps" value={exercise.reps} />
          <StatBox label="Descanso" value={exercise.rest} icon={<Clock size={12} />} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => {
              onWatchVideo(exercise.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)}+execucao`, exercise.name);
            }}
            className="py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Play size={12} fill="currentColor" /> Vídeo
          </button>
          <button 
            onClick={() => onShowDetails(exercise)}
            className="py-3 bg-forge-orange/10 border border-forge-orange/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forge-orange/20 text-forge-orange transition-all"
          >
            <Info size={12} /> Detalhes
          </button>
        </div>

        {/* Tracking Section */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Registrar Séries</h5>
            <button 
              onClick={addSet}
              className="text-[10px] font-bold text-forge-orange hover:underline flex items-center gap-1"
            >
              <PlusCircle size={12} /> ADICIONAR SÉRIE
            </button>
          </div>
          
          <div className="space-y-2">
            {logs.map((set, sIdx) => (
              <div key={sIdx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white/20 w-4">{sIdx + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Reps</span>
                    <input 
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(sIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-white/10 focus:border-forge-orange transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Peso (kg)</span>
                    <input 
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(sIdx, 'weight', parseInt(e.target.value) || 0)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-white/10 focus:border-forge-orange transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeSet(sIdx)}
                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-[10px] text-white/20 italic text-center py-2">Nenhuma série registrada ainda.</p>
            )}
          </div>
        </div>

        <div className="bg-forge-zinc/30 p-3.5 rounded-2xl border border-white/5 group-hover/card:border-white/10 transition-colors">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-forge-orange shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs leading-relaxed italic">
              "{exercise.notes}"
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (logs.length === 0) addSet();
            onStartRest();
          }}
          className="w-full mt-4 py-4 bg-forge-orange text-black rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-[0.98] shadow-lg shadow-forge-orange/10"
        >
          CONCLUIR SÉRIE <CheckCircle2 size={18} />
        </button>
      </motion.div>
    </>
  );
}

function ExerciseDetailsModal({ exercise, isOpen, onClose }: { exercise: WorkoutExercise | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-forge-zinc rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-forge-zinc/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">{exercise.name}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {exercise.overview && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Info size={14} /> Visão Geral
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">{exercise.overview}</p>
            </section>
          )}

          {exercise.instructions && exercise.instructions.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Instruções
              </h4>
              <div className="space-y-3">
                {exercise.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-forge-orange/20 text-forge-orange flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {exercise.exerciseTips && exercise.exerciseTips.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Zap size={14} /> Dicas do Especialista
              </h4>
              <ul className="space-y-2">
                {exercise.exerciseTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="text-forge-orange mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {exercise.equipments && exercise.equipments.length > 0 && (
            <section>
              <h4 className="text-forge-orange font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <Dumbbell size={14} /> Equipamentos
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.equipments.map((eq, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60">
                    {eq}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function VideoModal({ url, isOpen, onClose, title }: { url: string, isOpen: boolean, onClose: () => void, title: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="w-full h-full pt-16">
          <ReactPlayer 
            {...({
              url: url,
              width: "100%",
              height: "100%",
              controls: true,
              playing: true
            } as any)}
          />
        </div>
      </motion.div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-forge-zinc/50 p-2 rounded-xl border border-white/5 text-center">
      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1 flex items-center justify-center gap-1">
        {icon} {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function BiotypeSection({ title, color, description, difficulty, advantage, training }: { 
  title: string, 
  color: string, 
  description: string, 
  difficulty: string, 
  advantage: string, 
  training: string 
}) {
  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
      <h3 className={cn("text-xl font-display font-black uppercase tracking-tighter", color)}>{title}</h3>
      <div className="space-y-3">
        <p className="text-white/80 text-sm leading-relaxed"><span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Características</span>{description}</p>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-white/80 text-xs leading-relaxed"><span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Dificuldade</span>{difficulty}</p>
          <p className="text-white/80 text-xs leading-relaxed"><span className="text-white/40 font-bold uppercase text-[10px] tracking-widest block mb-1">Vantagem</span>{advantage}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-white/80 text-xs leading-relaxed"><span className="text-forge-orange font-bold uppercase text-[10px] tracking-widest block mb-1">Foco de Treino</span>{training}</p>
        </div>
      </div>
    </div>
  );
}
