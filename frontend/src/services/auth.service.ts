import api from '../lib/axios';


export const authService = {
  login: (payload: { email: string; password: string }) => {
    console.log('[auth.service] login request payload', payload);

    return api.post('/auth/login', payload)
      .then((response) => {
        console.log('[auth.service] login response', response?.data);
        return response;
      })
      .catch((error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          console.warn('[auth.service] login client warning:', error?.response?.data?.message || error?.message);
        } else {
          console.error('[auth.service] login error:', error?.response?.data || error?.message || error);
        }
        throw error;
      });
  },
  signup: (formData: FormData) => api.post('/auth/signup', formData),
  verifyOtp: (payload: { email: string; otp: string }) => api.post('/auth/verify-otp', payload),
  resendOtp: (payload: { email: string }) => api.post('/auth/resend-otp', payload),
  forgotPassword: (payload: { email: string }) => api.post('/auth/forgot-password', payload),
  verifyForgotOtp: (payload: { email: string; otp: string }) => api.post('/auth/verify-forgot-otp', payload),
  resetPassword: (payload: { email: string; password: string }) => api.post('/auth/reset-password', payload),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  getProfile: () => api.get('/user/profile'),
  logout: () => api.post('/auth/logout'),
  resendVerification: (payload: { email: string }) => api.post('/auth/resend-verification', payload),
  updateProfile: (payload: { name?: string; bio?: string; specialization?: string }) => api.put('/user/profile', payload),
  updateAvatar: (formData: FormData) => api.put('/user/avatar', formData),
};
