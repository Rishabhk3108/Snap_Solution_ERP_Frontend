import client from './client';

export interface Role { id?: number; name?: string; description?: string; }
export interface Permission { id?: number; name?: string; description?: string; }
export interface RolePermission { id?: number; roleId?: number; permissionId?: number; }

export const getAllRoles = async (): Promise<Role[]> => { const { data } = await client.get('/role'); return Array.isArray(data) ? data : []; };
export const createRole = async (payload: Role) => { const { data } = await client.post('/role', payload); return data; };
export const updateRole = async (id: number, payload: Partial<Role>) => { const { data } = await client.put(`/role/${id}`, payload); return data; };
export const deleteRole = async (id: number) => { const { data } = await client.delete(`/role/${id}`); return data; };
export const restoreRole = async (id: number) => { const { data } = await client.patch(`/role/restore/${id}`); return data; };

export const getAllPermissions = async (): Promise<Permission[]> => { const { data } = await client.get('/permission'); return Array.isArray(data) ? data : []; };
export const createPermission = async (payload: Permission) => { const { data } = await client.post('/permission', payload); return data; };
export const updatePermission = async (id: number, payload: Partial<Permission>) => { const { data } = await client.put(`/permission/${id}`, payload); return data; };

export const getRolePermissions = async (): Promise<RolePermission[]> => { const { data } = await client.get('/rolePermission'); return Array.isArray(data) ? data : []; };
export const getPermissionsForRole = async (roleId: number): Promise<Permission[]> => { const { data } = await client.get(`/rolePermission/rolePermission/${roleId}`); return Array.isArray(data) ? data : []; };
export const assignPermissionToRole = async (payload: RolePermission) => { const { data } = await client.post('/rolePermission', payload); return data; };
export const removePermissionFromRole = async (id: number) => { const { data } = await client.delete(`/rolePermission/delete?id=${id}`); return data; };
