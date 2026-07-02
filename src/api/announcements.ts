import client from './client';

export interface Announcement {
  id?: number;
  departmentId?: number;
  title?: string;
  content?: string;
  createdAt?: string;
  createdBy?: string;
}

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  const { data } = await client.get('/departmentAnnouncements/');
  return Array.isArray(data) ? data : [];
};

export const getDeptAnnouncements = async (deptId: number): Promise<Announcement[]> => {
  const { data } = await client.get(`/departmentAnnouncements/department/${deptId}`);
  return Array.isArray(data) ? data : [];
};

export const getRecentDeptAnnouncements = async (deptId: number): Promise<Announcement[]> => {
  const { data } = await client.get(`/departmentAnnouncements/recent/department/${deptId}`);
  return Array.isArray(data) ? data : [];
};

// Admin-only
export const createAnnouncement = async (payload: Announcement) => {
  const { data } = await client.post('/departmentAnnouncements', payload);
  return data;
};
export const deleteAnnouncement = async (id: number) => {
  const { data } = await client.delete(`/departmentAnnouncements/${id}`);
  return data;
};
