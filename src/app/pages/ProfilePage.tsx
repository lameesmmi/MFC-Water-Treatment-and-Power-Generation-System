import { useEffect, useState } from 'react';
import { useAuth, User } from '@/app/contexts/AuthContext';
import {
  updateMe,
  listUsers,
  createUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
} from '@/app/services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function roleBadgeClass(role: string) {
  if (role === 'admin')    return 'bg-red-500/15 text-red-500';
  if (role === 'operator') return 'bg-blue-500/15 text-blue-500';
  return 'bg-muted text-muted-foreground';
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, color, size = 10 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold select-none flex-shrink-0`}
      style={{ width: size * 4, height: size * 4, backgroundColor: color, fontSize: size * 1.5 }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, type = 'text', value, onChange, placeholder, required, autoComplete,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

// ─── Role Select ──────────────────────────────────────────────────────────────

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Role</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="viewer">Viewer</option>
        <option value="operator">Operator</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // ── Own profile ───────────────────────────────────────────────────────────
  const [editName,  setEditName]  = useState(user?.name ?? '');
  const [nameMsg,   setNameMsg]   = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [pwdMsg,  setPwdMsg]  = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // ── User management ───────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // New user dialog
  const [showNew,  setShowNew]  = useState(false);
  const [newName,  setNewName]  = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole,  setNewRole]  = useState('viewer');
  const [newError, setNewError] = useState('');
  const [newSaving, setNewSaving] = useState(false);

  // Edit user dialog
  const [editUser,    setEditUser]    = useState<User | null>(null);
  const [editUName,   setEditUName]   = useState('');
  const [editURole,   setEditURole]   = useState('');
  const [editUPwd,    setEditUPwd]    = useState('');
  const [editError,   setEditError]   = useState('');
  const [editSaving,  setEditSaving]  = useState(false);

  // Delete user dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setUsersLoading(true);
      listUsers()
        .then(setUsers)
        .catch(console.error)
        .finally(() => setUsersLoading(false));
    }
  }, [user?.role]);

  // ── Handlers: own profile ─────────────────────────────────────────────────

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameMsg('');
    setNameSaving(true);
    try {
      const updated = await updateMe({ name: editName });
      updateUser(updated);
      setNameMsg('Name updated.');
    } catch (err: unknown) {
      setNameMsg(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg('');
    if (newPwd !== confPwd) { setPwdMsg('Passwords do not match'); return; }
    setPwdSaving(true);
    try {
      await updateMe({ currentPassword: curPwd, newPassword: newPwd });
      setCurPwd(''); setNewPwd(''); setConfPwd('');
      setPwdMsg('Password changed.');
    } catch (err: unknown) {
      setPwdMsg(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  }

  // ── Handlers: user management ─────────────────────────────────────────────

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
    setEditUser(u);
    setEditUName(u.name);
    setEditURole(u.role);
    setEditUPwd('');
    setEditError('');
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditError('');
    setEditSaving(true);
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

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto">
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8">

      {/* ── Own Profile ─────────────────────────────────────────────────── */}
      <section>
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.name} color={user.color} size={14} />
          <div>
            <p className="text-lg font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Edit name */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Edit Name</h2>
            <form onSubmit={handleSaveName} className="space-y-3">
              <Field label="Name" value={editName} onChange={setEditName} required />
              {nameMsg && (
                <p className={`text-sm ${nameMsg.includes('updated') ? 'text-green-500' : 'text-destructive'}`}>
                  {nameMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={nameSaving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {nameSaving ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <Field label="Current Password" type="password" value={curPwd} onChange={setCurPwd} required autoComplete="current-password" />
              <Field label="New Password"     type="password" value={newPwd} onChange={setNewPwd} required autoComplete="new-password" />
              <Field label="Confirm Password" type="password" value={confPwd} onChange={setConfPwd} required autoComplete="new-password" />
              {pwdMsg && (
                <p className={`text-sm ${pwdMsg.includes('changed') ? 'text-green-500' : 'text-destructive'}`}>
                  {pwdMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={pwdSaving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {pwdSaving ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── User Management (admin only) ─────────────────────────────────── */}
      {user.role === 'admin' && (
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
            {usersLoading ? (
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
                            disabled={u.id === user.id}
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
        </section>
      )}

      {/* ── New User Dialog ───────────────────────────────────────────────── */}
      {showNew && (
        <Modal title="New User" onClose={() => setShowNew(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Field label="Name"     value={newName}     onChange={setNewName}     required />
            <Field label="Email"    type="email" value={newEmail}    onChange={setNewEmail}    required />
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

      {/* ── Edit User Dialog ──────────────────────────────────────────────── */}
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

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
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
    </div>
    </div>
  );
}
