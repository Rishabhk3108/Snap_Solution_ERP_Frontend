import client from './client';

export interface CompanyExpense {
  id?: number;
  title?: string;
  amount?: number;
  departmentId?: number;
  year?: number;
  description?: string;
  status?: string;
}

export const getAllCompanyExpenses = async (): Promise<CompanyExpense[]> => {
  const { data } = await client.get('/expenses');
  return Array.isArray(data) ? data : [];
};
export const getExpensesByDept = async (deptId: number): Promise<CompanyExpense[]> => {
  const { data } = await client.get(`/expenses/department/${deptId}`);
  return Array.isArray(data) ? data : [];
};
export const getExpensesByYearAndDept = async (year: number, deptId: number): Promise<CompanyExpense[]> => {
  const { data } = await client.get(`/expenses/year/${year}/department/${deptId}`);
  return Array.isArray(data) ? data : [];
};
export const createCompanyExpense = async (payload: CompanyExpense) => {
  const { data } = await client.post('/expenses', payload);
  return data;
};
export const updateCompanyExpense = async (id: number, payload: Partial<CompanyExpense>) => {
  const { data } = await client.put(`/expenses/${id}`, payload);
  return data;
};
export const getCompanyExpense = async (id: number) => {
  const { data } = await client.get(`/expenses/${id}`);
  return data;
};
