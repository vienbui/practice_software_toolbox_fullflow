export const productRoutes = {
  getAllProducts: 'products',
  createProduct: 'products',
  productById: (id: string) => `products/${id}`,
  searchProducts: 'products/search',
  relatedProducts: (id: string) => `products/${id}/related`,
  productSpecs: (id: string) => `products/${id}/specs`,
  productSpecById: (productId: string, specId: string) => `products/${productId}/specs/${specId}`,
  allSpecNames: 'product-specs/names',
};
