import client from './client';

export interface Department { id?: number; name?: string; description?: string; }

export const getAllDepartments = async (): Promise<Department[]> => {
  const { data } = await client.get('/departments');
  return Array.isArray(data) ? data : [];
};
export const getDepartment = async (id: number) => { const { data } = await client.get(`/departments/${id}`); return data; };
export const createDepartment = async (payload: Department) => { const { data } = await client.post('/departments', payload); return data; };
export const updateDepartment = async (id: number, payload: Partial<Department>) => { const { data } = await client.put(`/departments/${id}`, payload); return data; };
export const deleteDepartment = async (id: number) => { const { data } = await client.delete(`/departments/${id}`); return data; };
