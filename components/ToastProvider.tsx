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

  const colors = { success: 'bg-sage-400 text-white', error: 'bg-red-500 text-white', info: 'bg-choco-400 text-white' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`${colors[t.type]} px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg toast-enter whitespace-nowrap`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
