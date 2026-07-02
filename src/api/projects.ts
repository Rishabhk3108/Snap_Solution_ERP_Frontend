import client from './client';

export interface Project { id?: number; name?: string; description?: string; customerId?: number; startDate?: string; endDate?: string; status?: string; }

export const getAllProjects = async (): Promise<Project[]> => { const { data } = await client.get('/project'); return Array.isArray(data) ? data : []; };
export const getProject = async (id: number) => { const { data } = await client.get(`/project/${id}`); return data; };
export const createProject = async (payload: Project) => { const { data } = await client.post('/project', payload); return data; };
export const updateProject = async (id: number, payload: Partial<Project>) => { const { data } = await client.put(`/project/${id}`, payload); return data; };
export const deleteProject = async (id: number) => { const { data } = await client.delete(`/project/${id}`); return data; };
export const assignEmployee = async (payload: { userId: number; projectId: number }) => { const { data } = await client.post('/employeeProject/assign', payload); return data; };
export const removeEmployee = async (payload: { userId: number; projectId: number }) => { const { data } = await client.put('/employeeProject/remove', payload); return data; };
export const getProjectEmployees = async (projectId: number) => { const { data } = await client.get(`/employeeProject/employee/${projectId}`); return Array.isArray(data) ? data : []; };
