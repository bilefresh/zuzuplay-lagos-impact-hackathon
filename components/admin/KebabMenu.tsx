"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MenuItem = { label: string; onClick: () => void; danger?: boolean };

type KebabMenuProps = {
  items: MenuItem[];
};

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function updatePosition() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      // Align the menu's right edge with the trigger's right edge.
      const menuWidth = 160; // w-40
      const left = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth));
      const top = Math.max(8, rect.bottom + 8);
      setCoords({ top, left });
    }
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f8f9fa] transition-colors"
        aria-label="Open row menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="2" cy="2" r="2" fill="#9C9C9C"/>
          <circle cx="8" cy="2" r="2" fill="#9C9C9C"/>
          <circle cx="14" cy="2" r="2" fill="#9C9C9C"/>
        </svg>
      </button>
      {open && coords
        ? createPortal(
            <div
              ref={containerRef}
              role="menu"
              className="z-[1000] w-40 overflow-hidden rounded-lg border border-[#d5d7d5] bg-white shadow-lg"
              style={{ position: "fixed", top: coords.top, left: coords.left }}
           >
              {items.map((it) => (
                <button
                  key={it.label}
                  onClick={() => {
                    setOpen(false);
                    it.onClick();
                  }}
                  role="menuitem"
                  className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
                    it.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-[#364151] hover:bg-[#f8f9fa]"
                  }`}
                >
                  {it.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default KebabMenu;


