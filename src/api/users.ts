import client from './client';
import type { User } from '../types';

const normalize = (u: any): User => {
  if (u?.fullName && !u.fullname) u.fullname = u.fullName;
  return u;
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await client.get('/users');
  return (data as any[]).map(normalize);
};

export const getActiveUsers = async (): Promise<User[]> => {
  const { data } = await client.get('/users/nullend');
  return (data as any[]).map(normalize);
};

export const getExitedUsers = async (): Promise<User[]> => {
  const { data } = await client.get('/users/notnull');
  return (data as any[]).map(normalize);
};

export const getUser = async (id: number): Promise<User> => {
  const { data } = await client.get(`/users/${id}`);
  return normalize(data);
};

export const getTotalUsers = async () => {
  const { data } = await client.get('/users/total');
  return data;
};

export const getUsersByDepartment = async (deptId: number): Promise<User[]> => {
  const { data } = await client.get(`/users/department/${deptId}`);
  return data;
};

export const createUser = async (payload: Partial<User> & { password?: string }) => {
  const { data } = await client.post('/users', payload);
  return data;
};

export const updateUser = async (id: number, payload: Partial<User>) => {
  const { data } = await client.put(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: number) => {
  const { data } = await client.delete(`/users/${id}`);
  return data;
};

export const changePassword = async (id: number, oldPassword: string, newPassword: string) => {
  const { data } = await client.put(`/users/changePassword/${id}`, { oldPassword, newPassword });
  return data;
};

export const updateEndDate = async (id: number, endDate: string, remark?: string) => {
  const { data } = await client.put(`/users/updateEndDate/${id}`, { endDate, remark });
  return data;
};

export const activateUser = async (id: number) => {
  const { data } = await client.put(`/users/${id}`, { active: 1 });
  return data;
};
