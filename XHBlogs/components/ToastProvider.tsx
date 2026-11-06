"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 定义全局可以调用的方法
interface ToastContextType {
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// 1. 导出 Provider 组件（注意这里是 export function，没有 default）
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState<{ text: string, type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg flex items-center gap-3 border ${toastMsg.type === 'success' ? 'bg-[var(--ok)] border-[var(--ok)]/45 text-[var(--accent-ink)]' : ''} ${toastMsg.type === 'warning' ? 'bg-[var(--warn)] border-[var(--warn)]/45 text-[var(--accent-ink)]' : ''} ${toastMsg.type === 'error' ? 'bg-[var(--err)] border-[var(--err)]/45 text-[var(--accent-ink)]' : ''} ${toastMsg.type === 'info' ? 'bg-[var(--accent)] border-[var(--line-strong)] text-[var(--accent-ink)]' : ''}`}
          >
            <span className="font-bold text-sm">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </ToastContext.Provider>
  );
}

// 2. 导出魔法钩子，让 ProfileCard 可以调用
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast 必须在 ToastProvider 内部使用");
  return context;
};