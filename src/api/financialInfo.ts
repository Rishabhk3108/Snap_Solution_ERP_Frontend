import client from './client';
import type { FinancialInfo } from '../types';

export const getFinancialInfoByUser = async (userId: number): Promise<FinancialInfo | FinancialInfo[]> => {
  const { data } = await client.get(`/financialInformations/user/${userId}`);
  return data;
};

export const getAllFinancialInfo = async (): Promise<FinancialInfo[]> => {
  const { data } = await client.get('/financialInformations');
  return data;
};

export const createFinancialInfo = async (payload: FinancialInfo) => {
  const { data } = await client.post('/financialInformations', payload);
  return data;
};

export const updateFinancialInfo = async (userId: number, payload: Partial<FinancialInfo>) => {
  const { data } = await client.put(`/financialInformations/${userId}`, payload);
  return data;
};

export const updateSalary = async (userId: number, salaryBasic: number, salaryGross: number, salaryNet: number) => {
  const { data } = await client.post('/financialInformations/salaryUpdate', {
    userId, salaryBasic, salaryGross, salaryNet,
  });
  return data;
};

export const getAdvances = async (userId: number) => {
  const { data } = await client.get(`/financialInformations/advances/${userId}`);
  return data;
};
