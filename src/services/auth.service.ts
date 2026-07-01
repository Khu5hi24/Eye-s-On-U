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
        console.error('[auth.service] login error', error?.response?.data || error?.message || error);
        throw error;
      });
  },
  signup: (formData: FormData) => api.post('/auth/signup', formData),
  verifyOtp: (payload: { email: string; otp: string }) => api.post('/auth/verify-otp', payload),
  resendOtp: (payload: { email: string }) => api.post('/auth/resend-otp', payload),
  forgotPassword: (payload: { email: string }) => api.post('/auth/forgot-password', payload),
  resetPassword: (token: string, payload: { password: string; confirmPassword: string }) =>
    api.post(`/auth/reset-password/${token}`, payload),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  getProfile: () => api.get('/user/profile'),
  logout: () => api.post('/auth/logout'),
  resendVerification: (payload: { email: string }) => api.post('/auth/resend-verification', payload),
  updateProfile: (payload: { name?: string; bio?: string; specialization?: string }) => api.put('/user/profile', payload),
  updateAvatar: (formData: FormData) => api.put('/user/avatar', formData),
};
