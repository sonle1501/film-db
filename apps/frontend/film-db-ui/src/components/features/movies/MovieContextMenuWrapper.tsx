"use client";

import { useState, useEffect, ReactNode } from "react";
import { AddToListModal } from "./AddToListModal";

interface MovieContextMenuWrapperProps {
  children: ReactNode;
  movieId: string;
  className?: string;
}

export function MovieContextMenuWrapper({ children, movieId, className = "" }: MovieContextMenuWrapperProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleClick);
    };
  }, []);

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>
      
      {contextMenu && (
        <div
          className="absolute z-50 bg-surface-dark border border-white/10 rounded-lg shadow-xl py-2 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
              closeContextMenu();
            }}
          >
            Add to List
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddToListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          movieId={movieId}
        />
      )}
    </>
  );
}
