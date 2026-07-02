import client from './client';

export interface ExpenseHeader {
  id?: number;
  empid?: number;
  title?: string;
  totalAmount?: number;
  status?: string;
  date?: string;
  description?: string;
}

export interface ExpenseDetail {
  id?: number;
  expenseHeaderId?: number;
  category?: string;
  amount?: number;
  description?: string;
  receiptUrl?: string;
}

export const submitExpense = async (payload: ExpenseHeader) => {
  const { data } = await client.post('/expenseHeader/add', payload);
  return data;
};

export const getMyExpenses = async (): Promise<ExpenseHeader[]> => {
  const { data } = await client.get('/expenseHeader/list');
  return Array.isArray(data) ? data : [];
};

export const deleteExpense = async (id: number) => {
  const { data } = await client.delete(`/expenseHeader/${id}`);
  return data;
};

export const getExpenseDetails = async (expId: number): Promise<ExpenseDetail[]> => {
  const { data } = await client.get(`/expenseDetails/list/${expId}`);
  return Array.isArray(data) ? data : [];
};

export const addExpenseDetail = async (payload: ExpenseDetail) => {
  const { data } = await client.post('/expenseDetails/add', payload);
  return data;
};

export const getExpenseCategories = async () => {
  const { data } = await client.get('/expenseCategory/list');
  return Array.isArray(data) ? data : [];
};

export const getPendingExpenseCount = async () => {
  const { data } = await client.get('/expenseHeader/pending-expense-count');
  return data;
};
