import client from './client';

export const getSalaryList = async (year: number, month: number) => {
  const { data } = await client.get(`/salary/salarylist/${year}/${month}`);
  return Array.isArray(data) ? data : [];
};
export const getSalaryDetails = async (empid: number, year: number, month: number) => {
  const { data } = await client.get(`/salary/details/${empid}/${year}/${month}`);
  return data;
};
export const getSalarySlip = async (empid: number, year: number, month: number) => {
  const { data } = await client.get(`/salary/salary-slip/${empid}/${year}/${month}`);
  return data;
};
export const addSalary = async (payload: any) => { const { data } = await client.post('/salary/add', payload); return data; };
export const adjustSalary = async (payload: any) => { const { data } = await client.post('/salary/adjust', payload); return data; };

export const getMonthlySalaryList = async () => { const { data } = await client.get('/monthlySalary/list'); return Array.isArray(data) ? data : []; };
export const getMonthlySalaryDetails = async (year: number, month: number) => {
  const { data } = await client.get(`/monthlySalary/monthly-details/${year}/${month}`);
  return Array.isArray(data) ? data : [];
};
export const generateMonthlySalary = async (payload: { year: number; month: number }) => {
  const { data } = await client.post('/monthlySalary/generate', payload);
  return data;
};
export const markSalaryPaid = async (payload: { year: number; month: number }) => {
  const { data } = await client.post('/monthlySalary/change-status', payload);
  return data;
};
export const exportSalaryCsv = async (year: number, month: number) => {
  const response = await client.get(`/monthlySalary/csv/${year}/${month}`, { responseType: 'blob' });
  return response.data;
};
