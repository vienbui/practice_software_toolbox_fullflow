export const cartRoutes = {
  createCart: 'carts',
  addItem: (cartId: string) => `carts/${cartId}`,
  getCart: (cartId: string) => `carts/${cartId}`,
  deleteCart: (cartId: string) => `carts/${cartId}`,
  updateQuantity: (cartId: string) => `carts/${cartId}/product/quantity`,
  removeProduct: (cartId: string, productId: string) => `carts/${cartId}/product/${productId}`,
};
