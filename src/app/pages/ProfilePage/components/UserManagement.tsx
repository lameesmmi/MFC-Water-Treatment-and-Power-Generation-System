import { useState, useEffect }  from 'react';
import { listUsers, createUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '@/app/services/api';
import { User }       from '@/app/contexts/AuthContext';
import { Avatar }     from './Avatar';
import { Field }      from './Field';
import { Modal }      from './Modal';
import { RoleSelect } from './RoleSelect';

function roleBadgeClass(role: string) {
  if (role === 'admin')    return 'bg-red-500/15 text-red-500';
  if (role === 'operator') return 'bg-blue-500/15 text-blue-500';
  return 'bg-muted text-muted-foreground';
}

interface Props {
  currentUserId: string;
}

export function UserManagement({ currentUserId }: Props) {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);

  // New user dialog state
  const [showNew,     setShowNew]     = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newEmail,    setNewEmail]    = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole,     setNewRole]     = useState('viewer');
  const [newError,    setNewError]    = useState('');
  const [newSaving,   setNewSaving]   = useState(false);

  // Edit user dialog state
  const [editUser,   setEditUser]   = useState<User | null>(null);
  const [editUName,  setEditUName]  = useState('');
  const [editURole,  setEditURole]  = useState('');
  const [editUPwd,   setEditUPwd]   = useState('');
  const [editError,  setEditError]  = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setNewError('');
    setNewSaving(true);
    try {
      const created = await createUser({ name: newName, email: newEmail, password: newPassword, role: newRole });
      setUsers(prev => [...prev, created]);
      setShowNew(false);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('viewer');
    } catch (err: unknown) {
      setNewError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setNewSaving(false);
    }
  }

  function openEdit(u: User) {
    setEditUser(u); setEditUName(u.name); setEditURole(u.role);
    setEditUPwd(''); setEditError('');
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditError(''); setEditSaving(true);
    try {
      const payload: Record<string, string> = { name: editUName, role: editURole };
      if (editUPwd) payload.password = editUPwd;
      const updated = await apiUpdateUser(editUser.id, payload);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditUser(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDeleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">User Management</h2>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + New User
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">User</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Role</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.color} size={8} />
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === currentUserId}
                        className="rounded-md px-3 py-1.5 text-xs font-medium border border-border text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New User Dialog */}
      {showNew && (
        <Modal title="New User" onClose={() => setShowNew(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Field label="Name"     value={newName}     onChange={setNewName}     required />
            <Field label="Email"    type="email"    value={newEmail}    onChange={setNewEmail}    required />
            <Field label="Password" type="password" value={newPassword} onChange={setNewPassword} required autoComplete="new-password" />
            <RoleSelect value={newRole} onChange={setNewRole} />
            {newError && <p className="text-sm text-destructive">{newError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNew(false)} className="rounded-md px-4 py-2 text-sm border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={newSaving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {newSaving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Dialog */}
      {editUser && (
        <Modal title={`Edit ${editUser.name}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleEditUser} className="space-y-4">
            <Field label="Name" value={editUName} onChange={setEditUName} required />
            <RoleSelect value={editURole} onChange={setEditURole} />
            <Field label="New Password (leave blank to keep)" type="password" value={editUPwd} onChange={setEditUPwd} autoComplete="new-password" />
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditUser(null)} className="rounded-md px-4 py-2 text-sm border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={editSaving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <Modal title="Delete User" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <strong className="text-foreground">{deleteTarget.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="rounded-md px-4 py-2 text-sm border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
