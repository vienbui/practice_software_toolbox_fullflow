export const contactRoutes = {
  getAllMessages: 'messages',
  sendMessage: 'messages',
  messageById: (id: string) => `messages/${id}`,
  replyToMessage: (id: string) => `messages/${id}/reply`,
  updateMessageStatus: (id: string) => `messages/${id}/status`,
  attachFile: (id: string) => `messages/${id}/attach-file`,
};
