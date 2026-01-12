import { api } from '@/lib/api';
import { Account, AccountRequest } from '@/types';

export const accountService = {
  async getAll(): Promise<Account[]> {
    return api.get<Account[]>('/api/accounts');
  },

  async getById(id: string): Promise<Account> {
    return api.get<Account>(`/api/accounts/${id}`);
  },

  async create(data: AccountRequest): Promise<Account> {
    return api.post<Account>('/api/accounts', data);
  },

  async update(id: string, data: AccountRequest): Promise<Account> {
    return api.put<Account>(`/api/accounts/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/accounts/${id}`);
  },
};
