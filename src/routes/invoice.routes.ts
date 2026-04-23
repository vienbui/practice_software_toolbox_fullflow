export const invoiceRoutes = {
  getAllInvoices: 'invoices',
  createInvoice: 'invoices',
  createGuestInvoice: 'invoices/guest',
  searchInvoices: 'invoices/search',
  invoiceById: (id: string) => `invoices/${id}`,
  invoiceStatus: (id: string) => `invoices/${id}/status`,
  downloadPdf: (invoiceNumber: string) => `invoices/${invoiceNumber}/download-pdf`,
  downloadPdfStatus: (invoiceNumber: string) => `invoices/${invoiceNumber}/download-pdf-status`,
};
