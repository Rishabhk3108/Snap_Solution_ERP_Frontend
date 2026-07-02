import client from './client';

export interface Customer { id?: number; name?: string; email?: string; phone?: string; address?: string; }

export const getAllCustomers = async (): Promise<Customer[]> => { const { data } = await client.get('/customer'); return Array.isArray(data) ? data : []; };
export const getCustomer = async (id: number) => { const { data } = await client.get(`/customer/${id}`); return data; };
export const createCustomer = async (payload: Customer) => { const { data } = await client.post('/customer', payload); return data; };
export const updateCustomer = async (id: number, payload: Partial<Customer>) => { const { data } = await client.put(`/customer/${id}`, payload); return data; };
export const deleteCustomer = async () => { const { data } = await client.delete('/customer'); return data; };
