import React from 'react';
import { Zap, Activity, Dumbbell, Target } from 'lucide-react';

export const ACHIEVEMENTS_LIST = [
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

export const RADIO_STATIONS = [
  { name: 'Rádio EnergyFitness', url: 'https://edge15.streamonkey.net/energy-fitness?aggregator=radiode' },
  { name: 'Energy Pop', url: 'https://frontend.streamonkey.net/energy-pop/stream/mp3?aggregator=radiode' },
  { name: 'Metropolitana 98.5', url: 'https://e-spo-103.fabricahost.com.br/metropolitana985sp?f=1773107748N01KKAQA7K84R32RND7Q9NZ706K&tid=01KKAQA7K8NJECJESFEKHXRD7X' },
  { name: 'Dance', url: 'https://strm112.1.fm/dance_mobile_mp3' },
  { name: 'Pop/Retrô', url: 'https://listen.181fm.com/181-awesome80s_128k.mp3' },
  { name: 'Rock', url: 'https://listen.181fm.com/181-90salt_128k.mp3' },
  { name: 'Rock/Indie', url: 'https://stream.radioparadise.com/mp3-128' },
  { name: 'Dance/EDM', url: 'https://dancewave.online/dance.mp3' },
  { name: 'Ambient/Chill', url: 'https://ice1.somafm.com/groovesalad-128-mp3' }
];

export const MUSCLE_IMAGES: Record<string, string> = {
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

export const CATEGORY_IMAGES: Record<string, string> = {
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

export const PINTEREST_GIFS: Record<string, string[]> = {
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

export const CATEGORIES = [
  { id: 'chest', name: 'Peito', icon: <Zap size={24} />, color: 'from-blue-600/20 to-blue-900/40' },
  { id: 'back', name: 'Costas', icon: <Activity size={24} />, color: 'from-emerald-600/20 to-emerald-900/40' },
  { id: 'legs', name: 'Pernas', icon: <Dumbbell size={24} />, color: 'from-orange-600/20 to-orange-900/40' },
  { id: 'shoulders', name: 'Ombros', icon: <Target size={24} />, color: 'from-purple-600/20 to-purple-900/40' },
  { id: 'biceps', name: 'Bíceps', icon: <Zap size={24} />, color: 'from-red-600/20 to-red-900/40' },
  { id: 'triceps', name: 'Tríceps', icon: <Zap size={24} />, color: 'from-pink-600/20 to-pink-900/40' },
  { id: 'abs', name: 'Abdômen', icon: <Activity size={24} />, color: 'from-yellow-600/20 to-yellow-900/40' },
  { id: 'calves', name: 'Panturrilha', icon: <Activity size={24} />, color: 'from-cyan-600/20 to-cyan-900/40' },
];

export const MUSCLE_MAP: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abs: 'Abdômen',
  calves: 'Panturrilha'
};
