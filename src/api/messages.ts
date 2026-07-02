import client from './client';

export interface Message {
  id?: number;
  senderId?: number;
  receiverId?: number;
  content: string;
  subject?: string;
  createdAt?: string;
  sender?: { fullname?: string };
}

export const sendMessage = async (payload: Omit<Message, 'id' | 'createdAt'>) => {
  const { data } = await client.post('/messages/', payload);
  return data;
};

export const getMyMessages = async (userId: number): Promise<Message[]> => {
  const { data } = await client.get(`/messages/user/${userId}`);
  return Array.isArray(data) ? data : [];
};

export const getMessageById = async (id: number): Promise<Message> => {
  const { data } = await client.get(`/messages/${id}`);
  return data;
};
