'use client';

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, X } from "lucide-react"

export interface ToastProps {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info"
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 mb-3 w-80 pointer-events-auto flex gap-3"
    >
      <div className="shrink-0 mt-0.5">
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        {type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
        {type === 'info' && <div className="w-5 h-5 rounded-full bg-blue-500" />}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <button onClick={() => onClose(id)} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
