import client from './client';

export interface PersonalEvent {
  id?: number;
  userId?: number;
  title: string;
  date: string;
  description?: string;
  type?: string;
}

export const createEvent = async (payload: PersonalEvent) => {
  const { data } = await client.post('/personalEvents/', payload);
  return data;
};

export const getMyEvents = async (userId: number): Promise<PersonalEvent[]> => {
  const { data } = await client.get(`/personalEvents/user/${userId}`);
  return Array.isArray(data) ? data : [];
};

export const updateEvent = async (id: number, payload: Partial<PersonalEvent>) => {
  const { data } = await client.put(`/personalEvents/${id}`, payload);
  return data;
};

export const deleteEvent = async (id: number) => {
  const { data } = await client.delete(`/personalEvents/${id}`);
  return data;
};
