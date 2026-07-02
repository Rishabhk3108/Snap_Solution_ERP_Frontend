import client from './client';

export interface LeaveApplication {
  id?: number;
  user_id?: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  type?: 'Casual Leave' | 'Sick Leave' | 'LWP';
  reason?: string;
  start_date: string;
  end_date: string;
  year?: number;
  month?: number;
}

export const applyLeave = async (payload: Omit<LeaveApplication, 'id' | 'status'> & { type?: string; reason?: string }) => {
  const { data } = await client.post('/applications/', payload);
  return data;
};

export const getMyLeaves = async (userId: number): Promise<LeaveApplication[]> => {
  const { data } = await client.get(`/applications/user/${userId}`);
  return Array.isArray(data) ? data : [];
};

export const getRecentMyLeaves = async (userId: number): Promise<LeaveApplication[]> => {
  const { data } = await client.get(`/applications/recent/user/${userId}`);
  return Array.isArray(data) ? data : [];
};

export const getLeaveById = async (id: number): Promise<LeaveApplication> => {
  const { data } = await client.get(`/applications/${id}`);
  return data;
};

// Admin-only
export const getAllLeaves = async (): Promise<LeaveApplication[]> => {
  const { data } = await client.get('/applications');
  return Array.isArray(data) ? data : [];
};
export const updateLeaveStatus = async (id: number, payload: { status: 'Approved' | 'Rejected' }) => {
  const { data } = await client.put(`/applications/${id}`, payload);
  return data;
};
export const deleteLeave = async (id: number) => {
  const { data } = await client.delete(`/applications/${id}`);
  return data;
};
export const getLeavesByDepartment = async (deptId: number): Promise<LeaveApplication[]> => {
  const { data } = await client.get(`/applications/department/${deptId}`);
  return Array.isArray(data) ? data : [];
};
