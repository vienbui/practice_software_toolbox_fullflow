export const userRoutes = {
  registry: 'users/register',
  login: 'users/login',
  forgotPassword: 'users/forgot-password',
  changePassword: 'users/change-password',
  getMe: 'users/me',
  logout: 'users/logout',
  refresh: 'users/refresh',
  searchUsers: 'users/search',
  getAllUsers: 'users',
  userById: (id: string) => `users/${id}`,
};
