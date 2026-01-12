import { api } from '@/lib/api';
import { CreditCard, CreditCardRequest } from '@/types';

export const creditCardService = {
  async getAll(): Promise<CreditCard[]> {
    return api.get<CreditCard[]>('/api/credit-cards');
  },

  async getById(id: string): Promise<CreditCard> {
    return api.get<CreditCard>(`/api/credit-cards/${id}`);
  },

  async create(data: CreditCardRequest): Promise<CreditCard> {
    return api.post<CreditCard>('/api/credit-cards', data);
  },

  async update(id: string, data: CreditCardRequest): Promise<CreditCard> {
    return api.put<CreditCard>(`/api/credit-cards/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/credit-cards/${id}`);
  },
};
