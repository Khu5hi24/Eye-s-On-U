'use client';

import { create } from 'zustand';
import type { UserProfile } from '../types';
import { authService } from '../services/auth.service';

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  name: string;
  email: string;
  role: 'admin' | 'employee';
  password: string;
  confirmPassword: string;
  profilePicture?: FileList;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
  restoreSession: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyForgotOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, password: string, confirmPassword: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<boolean>;
  clearError: () => void;
}

// Helper to safely extract error message from axios error
const getErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (!err || typeof err !== 'object') return defaultMsg;
  const axiosErr = err as Record<string, any>;
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  return defaultMsg;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: undefined,

  restoreSession: async () => {
    set({ loading: true, error: undefined });

    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      console.log('[auth.store] restoreSession started', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      if (!accessToken) {
        console.log('[auth.store] no access token found, skipping profile fetch');
        set({ user: null, isAuthenticated: false });
        return;
      }

      console.log('[auth.store] attempting to fetch profile with token');
      const response = await authService.getProfile();
      const profile = response.data.data;

      console.log('[auth.store] profile fetched successfully', {
        name: profile.name,
        email: profile.email,
        role: profile.role,
      });

      set({
        user: {
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar || profile.profilePicture || '',
          bio: profile.bio || '',
          specialization: profile.specialization || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
        },
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('[auth.store] restoreSession failed', {
        status: (error as any)?.response?.status,
        message: (error as any)?.response?.data?.message || (error as any)?.message,
      });
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: undefined });

    try {
      const response = await authService.login(payload);
      console.log('[auth.store] full login response', response?.data);

      if (!response?.data?.success) {
        const message = getErrorMessage({ response }, 'Unable to sign in. Please try again.');
        set({ error: message });
        return false;
      }

      const accessToken = response?.data?.data?.accessToken;
      const refreshToken = response?.data?.data?.refreshToken;

      console.log('[auth.store] tokens received from backend', {
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
      });

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        console.log('[auth.store] accessToken saved to localStorage');
        console.log('[auth.store] Authorization header will be: Bearer ' + accessToken.substring(0, 20) + '...');
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        console.log('[auth.store] refreshToken saved to localStorage');
      }

      // Fetch profile to obtain role and other details from server
      try {
        const profileResp = await authService.getProfile();
        const profile = profileResp.data.data;
        set({
          user: {
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar: profile.avatar || '',
            bio: profile.bio || '',
            specialization: profile.specialization || '',
          },
          isAuthenticated: true,
        });
      } catch (profileErr) {
        // If fetching profile fails, still mark authenticated but with minimal info
        set({
          user: { name: payload.email, email: payload.email, role: 'user', avatar: '' },
          isAuthenticated: true,
        });
      }

      console.log('[auth.store] login success redirect pending');
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to sign in. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (payload) => {
    set({ loading: true, error: undefined });

    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('role', payload.role);
      formData.append('password', payload.password);
      formData.append('confirmPassword', payload.confirmPassword);

      // specialization removed from signup payload

      // adminSecretCode removed from signup flow

      if (payload.profilePicture?.length) {
        formData.append('profilePicture', payload.profilePicture[0]);
      }

      await authService.signup(formData);
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Signup failed. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: undefined });

    try {
      await authService.forgotPassword({ email });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to submit request. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verifyForgotOtp: async (email, otp) => {
    set({ loading: true, error: undefined });

    try {
      await authService.verifyForgotOtp({ email, otp });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to verify OTP. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email, password, confirmPassword) => {
    set({ loading: true, error: undefined });

    try {
      await authService.resetPassword({ email, password });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to reset password. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ loading: true, error: undefined });

    try {
      await authService.verifyOtp({ email, otp });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to verify OTP. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  resendOtp: async (email: string) => {
    set({ loading: true, error: undefined });

    try {
      await authService.resendOtp({ email });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to resend OTP. Please try again.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async (token) => {
    set({ loading: true, error: undefined });

    try {
      await authService.verifyEmail(token);
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to verify email.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  resendVerification: async (email) => {
    set({ loading: true, error: undefined });

    try {
      await authService.resendVerification({ email });
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Unable to resend verification email.');
      set({ error: message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: undefined });

    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: 'Unable to logout. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (profile) => {
    set({ loading: true, error: undefined });

    try {
      const payload: Record<string, unknown> = {};
      if (typeof profile.name === 'string') payload.name = profile.name;
      if (typeof profile.email === 'string') payload.email = profile.email;
      if (typeof profile.bio === 'string') payload.bio = profile.bio;
      if (typeof profile.specialization === 'string') payload.specialization = profile.specialization;
      if (typeof profile.avatar === 'string') payload.avatar = profile.avatar;
      if (typeof profile.phone === 'string') payload.phone = profile.phone;
      if (typeof profile.gender === 'string') payload.gender = profile.gender;

      const response = await authService.updateProfile(payload);
      const user = response.data.data;
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              name: user.name,
              avatar: typeof user.avatar === 'string' ? user.avatar : state.user.avatar,
              bio: user.bio || state.user.bio,
              specialization: user.specialization || state.user.specialization,
              phone: user.phone || state.user.phone,
              gender: user.gender || state.user.gender,
              role: state.user.role,
              email: user.email || state.user.email,
            }
          : {
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar || user.profilePicture || '',
              bio: user.bio || '',
              specialization: user.specialization || '',
              phone: user.phone || '',
              gender: user.gender || '',
            },
      }));
    } catch (err) {
      set({ error: 'Unable to update profile. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  updateAvatar: async (formData) => {
    set({ loading: true, error: undefined });
    try {
      const response = await authService.updateAvatar(formData);
      const user = response.data.data;
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              avatar: user.avatar,
            }
          : {
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar || '',
              bio: user.bio || '',
              specialization: user.specialization || '',
              phone: user.phone || '',
              gender: user.gender || '',
            },
      }));
      return true;
    } catch (err) {
      set({ error: 'Unable to update profile picture. Please try again.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: undefined }),
}));
