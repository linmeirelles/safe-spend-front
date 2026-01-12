import { api } from '@/lib/api';
import { Category, CategoryRequest } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return api.get<Category[]>('/api/categories');
  },

  async getById(id: string): Promise<Category> {
    return api.get<Category>(`/api/categories/${id}`);
  },

  async create(data: CategoryRequest): Promise<Category> {
    return api.post<Category>('/api/categories', data);
  },

  async update(id: string, data: CategoryRequest): Promise<Category> {
    return api.put<Category>(`/api/categories/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/categories/${id}`);
  },
};
