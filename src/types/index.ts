// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: string;
  name: string;
  email: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

// Account Types
export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT';

export interface AccountRequest {
  name: string;
  initialBalance: number;
  type: AccountType;
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  type: AccountType;
}

// Category Types
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryRequest {
  name: string;
  icon?: string;
  type: CategoryType;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  type: CategoryType;
}

// Credit Card Types
export interface CreditCardRequest {
  name: string;
  closingDay: number;
  dueDay: number;
  limitValue: number;
}

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
  limitValue: number;
  usedLimit: number;
  availableLimit: number;
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionRequest {
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  type: TransactionType;
  categoryId: string;
  accountId?: string;
  creditCardId?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  accountId?: string;
  accountName?: string;
  creditCardId?: string;
  creditCardName?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

// API Error
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  timestamp: string;
  errors?: Record<string, string>;
}
