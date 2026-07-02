import client from './client';

export interface Fine { id?: number; empid?: number; amount?: number; reason?: string; date?: string; }

export const createFine = async (payload: Fine) => { const { data } = await client.post('/fine/create', payload); return data; };
export const getFines = async (): Promise<Fine[]> => {
  const { data } = await client.get('/fine/list');
  return Array.isArray(data) ? data : [];
};
