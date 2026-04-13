import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@devvai/devv-code-backend';

const DEV_OTP_STORAGE_KEY = 'SAFESAFAR_DEV_OTP';
const DEV_OTP_EXPIRY_MS = 10 * 60 * 1000;

const isLocalDevHost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

interface User {
  projectId: string;
  uid: string;
  name: string;
  email: string;
  createdTime: number;
  lastLoginTime: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  sendOTP: (email: string) => Promise<{ mode: 'remote' | 'local'; code?: string }>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      sendOTP: async (email: string) => {
        set({ isLoading: true });
        try {
          // Try remote auth first
          if (!isLocalDevHost()) {
            await auth.sendOTP(email);
            set({ isLoading: false });
            return { mode: 'remote' as const };
          }
          throw new Error('Using local dev OTP mode');
        } catch (error) {
          // Fallback: generate local dev OTP
          const otpCode = String(Math.floor(100000 + Math.random() * 900000));
          const payload = {
            email,
            code: otpCode,
            expiresAt: Date.now() + DEV_OTP_EXPIRY_MS
          };
          localStorage.setItem(DEV_OTP_STORAGE_KEY, JSON.stringify(payload));
          console.info(`[SafeSafar][DEV OTP] ${email} -> ${otpCode}`);
          set({ isLoading: false });
          return { mode: 'local' as const, code: otpCode };
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true });
        try {
          // Try remote auth first
          if (!isLocalDevHost()) {
            const response = await auth.verifyOTP(email, code);
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
          throw new Error('Using local dev OTP mode');
        } catch (error) {
          // Fallback: validate local dev OTP
          const raw = localStorage.getItem(DEV_OTP_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          const isValid =
            parsed &&
            parsed.email === email &&
            parsed.code === code &&
            parsed.expiresAt > Date.now();

          if (isValid) {
            set({
              user: {
                projectId: 'local-dev',
                uid: 'dev-user-' + Date.now(),
                name: email.split('@')[0] || 'User',
                email,
                createdTime: Date.now(),
                lastLoginTime: Date.now()
              },
              isAuthenticated: true,
              isLoading: false
            });
            localStorage.removeItem(DEV_OTP_STORAGE_KEY);
            return;
          }

          set({ isLoading: false });
          throw new Error('Invalid or expired OTP. Please try again.');
        }
      },

      logout: async () => {
        try {
          await auth.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
        // Always clear local state
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem(DEV_OTP_STORAGE_KEY);
      },

      checkAuthStatus: () => {
        const currentState = get();
        // If we have a persisted user, consider them authenticated
        if (currentState.user) {
          set({ isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'safesafar-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);