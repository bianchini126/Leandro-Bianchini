import React, { useState, useRef, useEffect } from 'react';
import { Radio, Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { cn } from '../utils/cn';

const FALLBACK_RADIO_URL = 'https://ice1.somafm.com/groovesalad-128-mp3';

interface RadioPlayerProps {
  radioStations: { name: string, url: string }[];
  currentRadio: number;
  setCurrentRadio: (index: number | ((prev: number) => number)) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isRadioPlaying: boolean;
  setIsRadioPlaying: (playing: boolean) => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  radioStations,
  currentRadio,
  setCurrentRadio,
  isMuted,
  setIsMuted,
  isRadioPlaying,
  setIsRadioPlaying,
}) => {
  const [isRadioExpanded, setIsRadioExpanded] = useState(true);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [radioError, setRadioError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleRadio = () => {
    if (!audioRef.current) return;
    if (isRadioPlaying) {
      audioRef.current.pause();
    } else {
      setRadioLoadingState();
      audioRef.current.play().catch(e => {
        console.error("Play error:", e);
        setUsingFallback(true);
      });
    }
  };

  const setRadioLoadingState = () => {
    setIsRadioLoading(true);
    setRadioError(null);
  };

  useEffect(() => {
    if (isRadioPlaying && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Auto-play error on switch:", e));
    }
  }, [currentRadio]);

  const nextRadio = () => {
    setRadioError(null);
    setUsingFallback(false);
    setCurrentRadio((prev) => (prev + 1) % radioStations.length);
  };

  return (
    <div className="fixed top-4 left-4 z-50 md:left-24">
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
          }
          console.error("Audio error:", errorDetail);
          
          if (!usingFallback) {
            setRadioError(`Falha: ${errorDetail}. Tentando backup...`);
            setUsingFallback(true);
          } else {
            setRadioError(`Falha total: ${errorDetail}.`);
            setIsRadioPlaying(false);
            setIsRadioLoading(false);
          }
        }}
      />

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
  );
};
