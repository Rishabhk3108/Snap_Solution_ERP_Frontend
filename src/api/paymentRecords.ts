import client from './client';

export interface PaymentRecord {
  id?: number;
  userId?: number;
  jobId?: number;
  amount?: number;
  year?: number;
  status?: string;
  description?: string;
  date?: string;
}

export const getAllPayments = async (): Promise<PaymentRecord[]> => {
  const { data } = await client.get('/payments');
  return Array.isArray(data) ? data : [];
};
export const getPaymentsByYear = async (year: number): Promise<PaymentRecord[]> => {
  const { data } = await client.get(`/payments/year/${year}`);
  return Array.isArray(data) ? data : [];
};
export const getPaymentsByJob = async (jobId: number): Promise<PaymentRecord[]> => {
  const { data } = await client.get(`/payments/job/${jobId}`);
  return Array.isArray(data) ? data : [];
};
export const getPayment = async (id: number) => {
  const { data } = await client.get(`/payments/${id}`);
  return data;
};
export const updatePayment = async (id: number, payload: Partial<PaymentRecord>) => {
  const { data } = await client.put(`/payments/${id}`, payload);
  return data;
};
