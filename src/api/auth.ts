import client from './client';
import type { AuthPayload } from '../types';

export const login = async (username: string, password: string): Promise<AuthPayload> => {
  const { data } = await client.post('/login', { username, password });
  return data;
};

export const checkToken = async () => {
  const { data } = await client.get('/checkToken');
  return data;
};
