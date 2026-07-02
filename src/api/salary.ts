import client from './client';

export interface SalarySlip {
  empid?: number;
  year?: number;
  month?: number;
  basicSalary?: number;
  grossSalary?: number;
  netSalary?: number;
  allowanceTotal?: number;
  deductionTotal?: number;
  status?: string;
}

export const getSalaryDetails = async (empid: number, year: number, month: number): Promise<SalarySlip> => {
  const { data } = await client.get(`/salary/details/${empid}/${year}/${month}`);
  return data;
};

export const getSalarySlip = async (empid: number, year: number, month: number): Promise<SalarySlip> => {
  const { data } = await client.get(`/salary/salary-slip/${empid}/${year}/${month}`);
  return data;
};

export const getMonthlySalaryList = async (): Promise<SalarySlip[]> => {
  const { data } = await client.get('/monthlySalary/list');
  return Array.isArray(data) ? data : [];
};
