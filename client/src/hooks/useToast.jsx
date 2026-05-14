// useToast.jsx — updated toast colors to match Bazaar palette
import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const toastStyles = {
    success: {
      background: "rgba(0,36,56,0.95)",
      border: "1px solid rgba(102,155,188,0.3)",
      color: "#7bbfa0",
      icon: "✓",
    },
    error: {
      background: "rgba(120,0,0,0.85)",
      border: "1px solid rgba(193,18,31,0.5)",
      color: "#FDF0D5",
      icon: "✕",
    },
    warning: {
      background: "rgba(0,36,56,0.95)",
      border: "1px solid rgba(193,140,0,0.4)",
      color: "#e8c87c",
      icon: "⚠",
    },
  };

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => {
        const s = toastStyles[t.type] || toastStyles.success;
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium max-w-xs animate-fade-up"
            style={{
              background: s.background,
              border: s.border,
              color: s.color,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <span className="shrink-0 font-bold">{s.icon}</span>
            <span style={{ color: "#e8d9b8" }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );

  return { show, ToastContainer };
}