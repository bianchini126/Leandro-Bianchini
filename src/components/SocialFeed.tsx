import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Copy, 
  Camera,
  Zap
} from 'lucide-react';
import { cn } from '../utils/cn';

export interface FeedPost {
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

interface SocialFeedProps {
  user: any;
  setLoading: (loading: boolean) => void;
  moderateImage: (base64: string) => Promise<{ safe: boolean; reason?: string }>;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  user,
  setLoading,
  moderateImage,
}) => {
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

  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);

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

  // Filter posts to only show those less than 5 days old
  const activePosts = posts.filter(post => (Date.now() - post.createdAt) <= 5 * 24 * 60 * 60 * 1000);

  return (
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
  );
};
