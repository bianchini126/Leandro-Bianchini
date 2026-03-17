import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface NavIconProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ icon, active, onClick, label, className }) => {
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
};
