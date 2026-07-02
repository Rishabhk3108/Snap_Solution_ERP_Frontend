import client from './client';

export interface AdvancePayment { id?: number; empid?: number; amount?: number; date?: string; note?: string; status?: string; }

export const addAdvancePayment = async (payload: AdvancePayment) => { const { data } = await client.post('/advancePayment/add', payload); return data; };
export const getAdvancePayments = async (): Promise<AdvancePayment[]> => {
  const { data } = await client.get('/advancePayment/list');
  return Array.isArray(data) ? data : [];
};
export const getAdvancesByUser = async (userId: number) => {
  const { data } = await client.get(`/financialInformations/advances/${userId}`);
  return Array.isArray(data) ? data : [];
};
