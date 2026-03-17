import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MapPin, Dumbbell, UserPlus, Check, X, RefreshCw, Loader2, Navigation } from 'lucide-react';
import { cn } from '../utils/cn';
import { dbService, GymInvite } from '../services/dbService';

interface GymBroProps {
  user: any;
}

interface NearbyUser {
  email: string;
  name: string;
  profile_image?: string;
  partner_bio?: string;
  distance: number;
}

export const GymBro: React.FC<GymBroProps> = ({ user }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [invites, setInvites] = useState<GymInvite[]>([]);
  const [bio, setBio] = useState('');
  const [radius, setRadius] = useState(10);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!user?.latitude || !user?.longitude) return;
    setLoading(true);
    try {
      const users = await dbService.getNearbyUsers(user.latitude, user.longitude, radius);
      const mapped = users
        .filter(u => u.email !== user.email)
        .map(u => ({
          email: u.email,
          name: u.name,
          profile_image: u.profileImage,
          partner_bio: u.partner_bio || '',
          distance: Math.sqrt(Math.pow(u.latitude! - user.latitude!, 2) + Math.pow(u.longitude! - user.longitude!, 2)) * 111
        }));
      setNearbyUsers(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, radius]);

  const fetchInvites = useCallback(async () => {
    if (!user?.email) return;
    try {
      const myInvites = await dbService.getMyInvites(user.email);
      setInvites(myInvites);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 15000);
    return () => clearInterval(interval);
  }, [fetchInvites]);

  const toggleSearching = async () => {
    if (!isSearching) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          await dbService.updateUser(user.email, {
            is_searching_partner: true,
            latitude: lat,
            longitude: lng,
            partner_bio: bio
          });
          
          setIsSearching(true);
          setLocating(false);
          fetchNearby();
        },
        () => {
          setLocating(false);
          alert('Permita o acesso à localização para usar o Gym Bro!');
        }
      );
    } else {
      await dbService.updateUser(user.email, {
        is_searching_partner: false
      });
      setIsSearching(false);
      setNearbyUsers([]);
    }
  };

  const sendInvite = async (toEmail: string, name: string) => {
    if (!user?.email) return;
    await dbService.sendGymInvite({
      senderId: user.email,
      receiverId: toEmail,
      senderName: user.name,
      status: 'pending',
      gymName: 'Gym'
    });
    setSentInvites(prev => new Set(prev).add(toEmail));
    setSuccessMsg(`Convite enviado para ${name}! ⚡`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const onRespondInvite = async (inviteId: string, action: 'accepted' | 'declined') => {
    await dbService.respondInvite(inviteId, action);
    setInvites(prev => prev.filter(i => i.id !== inviteId));
    if (action === 'accepted') {
      setSuccessMsg('Parceiro aceito! Combinado! 💪');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forge-orange/20 to-purple-600/10 border border-forge-orange/20 p-6"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-forge-orange/5 rounded-full translate-x-16 -translate-y-8 pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-forge-orange rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-black" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg uppercase italic tracking-tight text-forge-orange">Gym Bro</h3>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Parceiro de Treino</p>
              </div>
            </div>
            <p className="text-xs text-white/50 max-w-[200px]">
              Encontre alguém perto de você para treinar junto. Disponível para todos!
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <button
              onClick={toggleSearching}
              disabled={locating}
              className={cn(
                "px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                isSearching
                  ? "bg-forge-orange text-black shadow-lg shadow-forge-orange/30"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              {locating ? (
                <><Loader2 size={12} className="animate-spin" /> Localizando...</>
              ) : isSearching ? (
                <><div className="w-2 h-2 bg-black rounded-full animate-pulse" /> Ativo</>
              ) : (
                <><Navigation size={12} /> Ativar</>
              )}
            </button>

            {invites.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-forge-orange/10 border border-forge-orange/30 rounded-full">
                <div className="w-2 h-2 bg-forge-orange rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-forge-orange uppercase">{invites.length} convite{invites.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Sua mensagem (ex: 'Treino às 18h, zona sul...')"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-forge-orange transition-colors"
              />
              <button
                onClick={fetchNearby}
                disabled={loading}
                className="px-3 py-2 bg-forge-orange text-black rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={12} className="text-white/30 shrink-0" />
              <input
                type="range" min={1} max={50} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="text-[10px] text-white/40 font-bold w-14 text-right">{radius} km</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-4 py-3 rounded-2xl text-center"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {invites.map(invite => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-gradient-to-r from-forge-orange/10 to-transparent border border-forge-orange/30 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-forge-orange/20 flex items-center justify-center overflow-hidden shrink-0">
               <Users size={18} className="text-forge-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-forge-orange uppercase tracking-widest">Convite Recebido!</p>
              <p className="text-sm font-bold text-white truncate">{invite.senderName}</p>
              <p className="text-[9px] text-white/30 uppercase">Expira em 1 hora</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => invite.id && onRespondInvite(invite.id, 'declined')}
                className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => invite.id && onRespondInvite(invite.id, 'accepted')}
                className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Check size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isSearching && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={10} /> {nearbyUsers.length} parceiro{nearbyUsers.length !== 1 ? 's' : ''} em até {radius}km
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={28} className="text-forge-orange animate-spin" />
            </div>
          ) : nearbyUsers.length === 0 ? (
            <div className="text-center py-8 text-white/20 space-y-2">
              <Dumbbell size={36} className="mx-auto opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum parceiro encontrado</p>
              <p className="text-[10px]">Tente aumentar o raio de busca</p>
            </div>
          ) : (
            nearbyUsers.map(u => (
              <motion.div
                key={u.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 bg-white/3 border border-white/5 rounded-2xl p-4 hover:border-forge-orange/20 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  {u.profile_image ? (
                    <img src={u.profile_image} className="w-full h-full object-cover" alt={u.name} />
                  ) : (
                    <Users size={22} className="text-white/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{u.name}</p>
                  {u.partner_bio && <p className="text-[10px] text-white/40 truncate mt-0.5">{u.partner_bio}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={8} className="text-forge-orange" />
                    <span className="text-[9px] font-bold text-forge-orange">{u.distance.toFixed(1)} km</span>
                  </div>
                </div>
                <button
                  onClick={() => sendInvite(u.email, u.name)}
                  disabled={sentInvites.has(u.email)}
                  className={cn(
                    "px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1",
                    sentInvites.has(u.email)
                      ? "bg-white/5 text-white/20 cursor-default"
                      : "bg-forge-orange text-black hover:scale-105 active:scale-95"
                  )}
                >
                  {sentInvites.has(u.email) ? <><Check size={12} /> Enviado</> : <><UserPlus size={12} /> Convidar</>}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
