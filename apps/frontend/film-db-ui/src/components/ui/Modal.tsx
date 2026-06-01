'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-surface-dark border border-white/10 rounded-none w-full max-w-md p-6 shadow-2xl transform transition-all font-mono">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10 select-none">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-accent animate-pulse"></span>
            // {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-[10px] text-text-muted-dark hover:text-red-accent transition-all font-mono font-bold px-1.5 py-0.5 border border-transparent hover:border-red-accent/30 hover:bg-red-accent/15 rounded-none cursor-pointer"
            aria-label="Close modal"
          >
            ESC [X]
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
