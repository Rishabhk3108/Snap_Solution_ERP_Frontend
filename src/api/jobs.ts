import client from './client';

export interface Job { id?: number; title?: string; description?: string; departmentId?: number; }

export const getAllJobs = async (): Promise<Job[]> => { const { data } = await client.get('/jobs'); return Array.isArray(data) ? data : []; };
export const createJob = async (payload: Job) => { const { data } = await client.post('/jobs', payload); return data; };
export const updateJob = async (id: number, payload: Partial<Job>) => { const { data } = await client.put(`/jobs/${id}`, payload); return data; };
export const deleteJob = async (id: number) => { const { data } = await client.delete(`/jobs/${id}`); return data; };
