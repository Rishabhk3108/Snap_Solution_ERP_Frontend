import client from './client';

export const addAttendance = async (payload: {
  empid: number; projectId: number; date: string;
  startTime: string; location: string; year: number; month: number;
}) => {
  const { data } = await client.post('/attendance/add', payload);
  return data;
};

export const updateAttendance = async (payload: { empid: number; date: string; endTime: string }) => {
  const { data } = await client.put('/attendance/update', payload);
  return data;
};

export const getAttendanceList = async (empid: number, year: number, month: number) => {
  const { data } = await client.get(`/attendance/list/${empid}/${year}/${month}`);
  return data?.attendanceList ?? data;
};

export const getDaysWorked = async (empid: number, year: number, month: number) => {
  const { data } = await client.get(`/attendance/days-worked/${empid}/${year}/${month}`);
  return data;
};

export const getAttendanceByDateRange = async (payload: {
  startDate: string; endDate: string; projectId?: number;
}) => {
  const { data } = await client.post('/attendance/attendanceByDateRange', payload);
  return data;
};

export const getAttendanceByFilterEmp = async (payload: {
  startDate: string; endDate: string; empid?: string;
}) => {
  const { data } = await client.post('/attendance/attendanceByFilterEmp', payload);
  return data;
};

export const getTodaySummary = async () => {
  const { data } = await client.get('/attendance/today-summary');
  return data;
};

export const getAttendanceStatus = async (empid: number, date: string) => {
  const { data } = await client.post('/attendance/getAttendanceStatus', { empid, date });
  return data;
};

export const updateAttendanceById = async (id: number, startTime?: string, endTime?: string) => {
  const { data } = await client.post('/attendance/updateById', { id, startTime, endTime });
  return data;
};

export const getAttendanceForProject = async (projectId: number, date: string) => {
  const { data } = await client.get(`/attendance/project/${projectId}/date/${date}`);
  return data;
};

export const addFullAttendance = async (payload: {
  empid: number; projectId: number; date: string;
  startTime: string; endTime: string; location: string;
}) => {
  const { data } = await client.post('/attendance/full', payload);
  return data;
};

export const getIncompleteCheckouts = async () => {
  const { data } = await client.get('/attendance/incomplete-today');
  return data as { empid: number; fullname: string; start_time: string }[];
};
