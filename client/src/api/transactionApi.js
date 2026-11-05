import axiosClient from './axiosClient.js';

export const transactionApi = {
  getTransactions: (params = {}) => axiosClient.get('/transactions', { params }),
  createTransaction: (data) => axiosClient.post('/transactions', data),
  getTransactionById: (id) => axiosClient.get(`/transactions/${id}`),
  updateTransaction: (id, data) => axiosClient.patch(`/transactions/${id}`, data),
  deleteTransaction: (id) => axiosClient.delete(`/transactions/${id}`),
  exportTransactionsCsv: (params = {}) =>
    axiosClient.get('/transactions/export', {
      params,
      responseType: 'blob',
    }),
  getExportUrl: (params = {}) => {
    const token = localStorage.getItem('finflow_token');
    const allParams = { ...params };
    if (token) allParams.token = token;
    const query = new URLSearchParams(allParams).toString();
    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
    return `${baseUrl}/transactions/export?${query}`;
  },
};

export default transactionApi;
