import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../i18n';

interface UserState {
  token: string | null;
  userName: string | null;
  userImage: string | null;
  language: string;
  theme: 'light' | 'dark';
  isLoggedIn: boolean;
  
  setUser: (data: { token?: string; name?: string; image?: string; language?: string }) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  syncSettings: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      userName: null,
      userImage: null,
      language: 'en',
      theme: 'light',
      isLoggedIn: false,

      // التعديل هنا: نستخدم المبدأ الصحيح لتحديث الحالة دون حذف القديم
      setUser: (data) => set((state) => {
        // نقوم بإنشاء نسخة من الحالة الحالية أولاً
        const newState = { ...state, isLoggedIn: true };

        if (data.token !== undefined) newState.token = data.token;
        if (data.name !== undefined) newState.userName = data.name;
        if (data.image !== undefined) newState.userImage = data.image;
        
        if (data.language) {
          newState.language = data.language;
          i18n.changeLanguage(data.language);
        }

        return newState; // نعيد الكائن الكامل الجديد
      }),

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      setTheme: (theme) => set({ theme }),

      syncSettings: () => {
        const state = get();
        if (i18n.language !== state.language) {
          i18n.changeLanguage(state.language);
        }
      },

      logout: () => set({ 
        token: null, 
        userName: null, 
        userImage: null, 
        isLoggedIn: false 
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.syncSettings();
      },
    }
  )
);