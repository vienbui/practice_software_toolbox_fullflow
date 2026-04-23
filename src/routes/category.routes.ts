export const categoryRoutes = {
  getAllCategories: 'categories',
  getCategoryTree: 'categories/tree',
  categoryTreeById: (id: string) => `categories/tree/${id}`,
  searchCategories: 'categories/search',
  createCategory: 'categories',
  categoryById: (id: string) => `categories/${id}`,
};
