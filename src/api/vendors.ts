import client from './client';

export interface Vendor { id?: number; name?: string; email?: string; phone?: string; address?: string; }

export const getAllVendors = async (): Promise<Vendor[]> => { const { data } = await client.get('/vendor'); return Array.isArray(data) ? data : []; };
export const getVendor = async (id: number) => { const { data } = await client.get(`/vendor/${id}`); return data; };
export const createVendor = async (payload: Vendor) => { const { data } = await client.post('/vendor', payload); return data; };
