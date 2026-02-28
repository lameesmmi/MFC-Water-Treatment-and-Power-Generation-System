import { useState }    from 'react';
import { updateMe }    from '@/app/services/api';
import { useAuth }     from '@/app/contexts/AuthContext';
import { Avatar }      from './Avatar';
import { Field }       from './Field';

function roleBadgeClass(role: string) {
  if (role === 'admin')    return 'bg-red-500/15 text-red-500';
  if (role === 'operator') return 'bg-blue-500/15 text-blue-500';
  return 'bg-muted text-muted-foreground';
}

export function OwnProfile() {
  const { user, updateUser } = useAuth();
  if (!user) return null;

  const [editName,   setEditName]   = useState(user.name);
  const [nameMsg,    setNameMsg]    = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [curPwd,    setCurPwd]    = useState('');
  const [newPwd,    setNewPwd]    = useState('');
  const [confPwd,   setConfPwd]   = useState('');
  const [pwdMsg,    setPwdMsg]    = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

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

  return (
    <section>
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      {/* Avatar + identity */}
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
            <Field label="Current Password" type="password" value={curPwd}  onChange={setCurPwd}  required autoComplete="current-password" />
            <Field label="New Password"     type="password" value={newPwd}  onChange={setNewPwd}  required autoComplete="new-password" />
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
  );
}
