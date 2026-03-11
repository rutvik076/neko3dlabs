'use client'
import { createContext, useContext, useState, useCallback } from 'react'

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
interface ToastContextType { toast: (msg: string, type?: Toast['type']) => void }

const ToastContext = createContext<ToastContextType>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(ts => [...ts, { id, message, type }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000)
  }, [])

  const styles = {
    success: 'bg-graphite-800 text-white border border-green-500/30',
    error:   'bg-graphite-800 text-white border border-red-500/30',
    info:    'bg-graphite-800 text-white border border-blue-500/30',
  }
  const icons = { success: '✓', error: '✕', info: 'i' }
  const dotColors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`${styles[t.type]} flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl toast-enter whitespace-nowrap`}>
            <span className={`w-4 h-4 rounded-full ${dotColors[t.type]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
              {icons[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
