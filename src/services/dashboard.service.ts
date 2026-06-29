import api from '../lib/axios';

export const dashboardService = {
  getTasks: () => api.get('/tasks'),
  createTask: (payload: unknown) => api.post('/tasks/create', payload),
  updateTask: (id: string, payload: unknown) => api.put(`/tasks/${id}`, payload),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  updateTaskStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
  getTeamMembers: () => api.get('/user/team'),
};
