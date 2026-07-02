import client from './client';

export interface Holiday { id?: number; name?: string; date?: string; type?: string; }

export const getAllHolidays = async (): Promise<Holiday[]> => { const { data } = await client.get('/daysHolidays'); return Array.isArray(data) ? data : []; };
export const createHoliday = async (payload: Holiday) => { const { data } = await client.post('/daysHolidays', payload); return data; };
export const deleteHoliday = async (id: number) => { const { data } = await client.delete(`/daysHolidays/${id}`); return data; };
