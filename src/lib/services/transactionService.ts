import { api } from '@/lib/api';
import { Transaction, TransactionRequest } from '@/types';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    return api.get<Transaction[]>('/api/transactions');
  },

  async getById(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/api/transactions/${id}`);
  },

  async getByPeriod(startDate: string, endDate: string): Promise<Transaction[]> {
    return api.get<Transaction[]>(`/api/transactions/period?startDate=${startDate}&endDate=${endDate}`);
  },

  async getPending(): Promise<Transaction[]> {
    return api.get<Transaction[]>('/api/transactions/pending');
  },

  async create(data: TransactionRequest): Promise<Transaction> {
    return api.post<Transaction>('/api/transactions', data);
  },

  async update(id: string, data: TransactionRequest): Promise<Transaction> {
    return api.put<Transaction>(`/api/transactions/${id}`, data);
  },

  async markAsPaid(id: string): Promise<Transaction> {
    return api.patch<Transaction>(`/api/transactions/${id}/mark-as-paid`);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/transactions/${id}`);
  },
};
