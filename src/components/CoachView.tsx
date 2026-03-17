import React from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { cn } from '../utils/cn';

interface CoachViewProps {
  chatMessages: any[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: () => void;
  isChatLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const CoachView: React.FC<CoachViewProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  isChatLoading,
  chatEndRef,
}) => {
  return (
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
  );
};
