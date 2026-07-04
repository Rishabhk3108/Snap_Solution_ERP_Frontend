import client from './client';
import type { Project } from '../types';

export const getAllProjects = async (): Promise<Project[]> => {
  const { data } = await client.get('/project');
  return Array.isArray(data) ? data : [];
};

export const getProject = async (id: number): Promise<Project> => {
  const { data } = await client.get(`/project/${id}`);
  return data;
};

export const createProject = async (payload: Partial<Project>) => {
  const { data } = await client.post('/project', payload);
  return data;
};

export const updateProject = async (id: number, payload: Partial<Project>) => {
  const { data } = await client.put(`/project/${id}`, payload);
  return data;
};

export const deleteProject = async (id: number) => {
  const { data } = await client.delete(`/project/${id}`);
  return data;
};

// Manager assignment
export const getProjectManagers = async (projectId: number) => {
  const { data } = await client.get(`/project/${projectId}/managers`);
  return Array.isArray(data) ? data : [];
};

export const assignManager = async (projectId: number, managerId: number) => {
  const { data } = await client.post(`/project/${projectId}/managers`, { managerId });
  return data;
};

export const removeManager = async (projectId: number, managerId: number) => {
  const { data } = await client.delete(`/project/${projectId}/managers/${managerId}`);
  return data;
};

// Employee assignment
export const getProjectEmployees = async (projectId: number) => {
  const { data } = await client.get(`/project/${projectId}/employees`);
  return Array.isArray(data) ? data : [];
};

export const assignEmployeeToProject = async (projectId: number, userId: number) => {
  const { data } = await client.put(`/project/${projectId}/employees/${userId}`);
  return data;
};

export const removeEmployeeFromProject = async (projectId: number, userId: number) => {
  const { data } = await client.delete(`/project/${projectId}/employees/${userId}`);
  return data;
};

// Legacy – kept for compatibility
export const assignEmployee = async (payload: { userId: number; projectId: number }) => {
  const { data } = await client.post('/employeeProject/assign', payload);
  return data;
};

export const removeEmployee = async (payload: { userId: number; projectId: number }) => {
  const { data } = await client.put('/employeeProject/remove', payload);
  return data;
};
