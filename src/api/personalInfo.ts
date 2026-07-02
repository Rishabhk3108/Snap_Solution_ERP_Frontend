import client from './client';
import type { PersonalInfo } from '../types';

export const getPersonalInfoByUser = async (userId: number): Promise<PersonalInfo> => {
  const { data } = await client.get(`/personalInformations/user/${userId}`);
  return data;
};

export const createPersonalInfo = async (payload: PersonalInfo) => {
  const { data } = await client.post('/personalInformations', payload);
  return data;
};

export const updatePersonalInfo = async (userId: number, payload: Partial<PersonalInfo>) => {
  const { data } = await client.put(`/personalInformations/${userId}`, payload);
  return data;
};

export const deletePersonalInfo = async (id: number) => {
  const { data } = await client.delete(`/personalInformations/${id}`);
  return data;
};
