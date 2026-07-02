import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllRoles, createRole, deleteRole, getAllPermissions, createPermission, getPermissionsForRole, assignPermissionToRole, removePermissionFromRole } from '../../api/roles';

type Tab = 'roles' | 'permissions' | 'mappings';

export default function RoleManagement() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('roles');
  const [roleName, setRoleName] = useState('');
  const [permName, setPermName] = useState('');
  const [permDesc, setPermDesc] = useState('');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [assignPerm, setAssignPerm] = useState('');
  const [msg, setMsg] = useState('');

  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: getAllRoles, retry: false });
  const { data: permissions = [] } = useQuery({ queryKey: ['permissions'], queryFn: getAllPermissions, retry: false });
  const { data: rolePerms = [] } = useQuery({
    queryKey: ['role-permissions', selectedRole?.id],
    queryFn: () => getPermissionsForRole(selectedRole!.id),
    enabled: !!selectedRole?.id, retry: false,
  });

  const createRoleMut = useMutation({
    mutationFn: () => createRole({ name: roleName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setMsg('Role created!'); setRoleName(''); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });
  const deleteRoleMut = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
  const createPermMut = useMutation({
    mutationFn: () => createPermission({ name: permName, description: permDesc }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setMsg('Permission created!'); setPermName(''); setPermDesc(''); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });
  const assignMut = useMutation({
    mutationFn: () => assignPermissionToRole({ roleId: selectedRole!.id, permissionId: Number(assignPerm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['role-permissions'] }); setMsg('Permission assigned!'); setAssignPerm(''); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });
  const removeMut = useMutation({
    mutationFn: (id: number) => removePermissionFromRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['role-permissions'] }),
  });

  const roleList = roles as any[];
  const permList = permissions as any[];
  const rolePermList = rolePerms as any[];

  return (
    <div style={{ flex: 1 }}>
      <Header title="Roles & Permissions" subtitle="Manage system roles and access control" />
      <div style={{ padding: 28 }}>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 9, padding: 3, width: 'fit-content', marginBottom: 22 }}>
          {(['roles', 'permissions', 'mappings'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', background: tab === t ? '#f4b400' : 'transparent', color: tab === t ? '#F9FAFB' : '#9ca3af' }}>
              {t === 'mappings' ? 'Role–Permission Map' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Roles Tab */}
        {tab === 'roles' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Create Role</h3>
              <form onSubmit={e => { e.preventDefault(); createRoleMut.mutate(); }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Role Name *</label>
                <input value={roleName} onChange={e => setRoleName(e.target.value)} required placeholder="e.g. ROLE_HR"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, marginBottom: 14 }} />
                <button type="submit" disabled={createRoleMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Create Role
                </button>
              </form>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Existing Roles ({roleList.length})</span>
              </div>
              {roleList.map((r: any, i: number) => (
                <div key={r.id} style={{ padding: '11px 18px', borderBottom: i < roleList.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {r.id}</div>
                  </div>
                  <button onClick={() => { if (confirm(`Delete role "${r.name}"?`)) deleteRoleMut.mutate(r.id); }}
                    style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
              {roleList.length === 0 && <p style={{ padding: '28px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No roles found.</p>}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {tab === 'permissions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Create Permission</h3>
              <form onSubmit={e => { e.preventDefault(); createPermMut.mutate(); }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Permission Name *</label>
                <input value={permName} onChange={e => setPermName(e.target.value)} required placeholder="e.g. VIEW_SALARY"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, marginBottom: 10 }} />
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Description</label>
                <input value={permDesc} onChange={e => setPermDesc(e.target.value)} placeholder="What does this permit?"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, marginBottom: 14 }} />
                <button type="submit" disabled={createPermMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Create Permission
                </button>
              </form>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Permissions ({permList.length})</span>
              </div>
              {permList.map((p: any, i: number) => (
                <div key={p.id} style={{ padding: '11px 18px', borderBottom: i < permList.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.description}</div>}
                </div>
              ))}
              {permList.length === 0 && <p style={{ padding: '28px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No permissions found.</p>}
            </div>
          </div>
        )}

        {/* Role-Permission Mappings Tab */}
        {tab === 'mappings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
            {/* Role selector */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '13px 16px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Select Role</span>
              </div>
              {roleList.map((r: any, i: number) => (
                <div key={r.id} onClick={() => setSelectedRole(r)}
                  style={{ padding: '10px 16px', borderBottom: i < roleList.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', background: selectedRole?.id === r.id ? 'rgba(244,180,0,0.08)' : 'transparent', borderLeft: selectedRole?.id === r.id ? '2px solid #f4b400' : '2px solid transparent' }}>
                  <div style={{ fontSize: 13, color: selectedRole?.id === r.id ? '#f4b400' : '#111827', fontWeight: 500 }}>{r.name}</div>
                </div>
              ))}
            </div>

            {/* Permissions for selected role */}
            <div>
              {!selectedRole ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '44px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>Select a role to manage its permissions.</p>
                </div>
              ) : (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Permissions for <span style={{ color: '#f4b400' }}>{selectedRole.name}</span></span>
                    <form onSubmit={e => { e.preventDefault(); assignMut.mutate(); }} style={{ display: 'flex', gap: 8 }}>
                      <select value={assignPerm} onChange={e => setAssignPerm(e.target.value)} required
                        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 10px', color: '#111827', fontSize: 12 }}>
                        <option value="">Add permission…</option>
                        {permList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button type="submit" disabled={assignMut.isPending}
                        style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                    </form>
                  </div>
                  {rolePermList.length === 0 ? (
                    <p style={{ padding: '28px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No permissions assigned to this role yet.</p>
                  ) : (
                    rolePermList.map((p: any, i: number) => (
                      <div key={p.id} style={{ padding: '11px 18px', borderBottom: i < rolePermList.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.description}</div>}
                        </div>
                        <button onClick={() => removeMut.mutate(p.rolePermissionId ?? p.id)}
                          style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
