import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext.js'

export function useToast() {
  return useContext(ToastContext)
}
