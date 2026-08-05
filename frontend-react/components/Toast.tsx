"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onDone?: () => void;
}

export default function Toast({ message, show, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setExiting(false);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onDone?.();
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible && !show) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-success/10 border border-success/20 text-success rounded-xl backdrop-blur-xl shadow-2xl shadow-success/10 transition-all duration-300 ${
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-4 opacity-0"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
