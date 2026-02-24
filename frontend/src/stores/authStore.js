import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from './jwtHelper'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, // { sub, email, rol }

      setAuth: (token) => {
        const decoded = jwtDecode(token)
        set({ token, user: decoded })
      },

      logout: () => {
        set({ token: null, user: null })
      },

      isAuthenticated: () => !!get().token,

      hasRole: (...roles) => {
        const user = get().user
        return user ? roles.some(r => r.toLowerCase() === user.rol?.toLowerCase()) : false
      },
    }),
    {
      name: 'pos-texano-auth',
    },
  ),
)

