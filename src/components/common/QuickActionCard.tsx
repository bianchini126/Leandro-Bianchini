import React from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, onClick }) => {
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
};
