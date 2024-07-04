import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useAuthUserStore = create(
    persist(
        (set) => ({
            authUser: null,
            setAuthUser: (payload) => set(() => ({ authUser: payload })),
            clearAuthUser: () => set({ authUser: null })
        }),
        {
            name: 'iot-auth-user',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)
