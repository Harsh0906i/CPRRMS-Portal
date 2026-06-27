import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserCheck, Shield, Plus, ToggleLeft, ToggleRight, Trash2, Mail, Lock, User } from 'lucide-react';

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Onboarding form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOnboardSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/users', formData);
      setSuccess(`Onboarded staff member ${formData.name} successfully!`);
      setFormData({ name: '', email: '', password: '', role: 'Admin' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard user');
    }
  };

  const toggleStatus = async user => {
    setError('');
    setSuccess('');
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    try {
      await api.patch(`/users/${user._id}`, { status: newStatus });
      setSuccess(`User status updated to ${newStatus}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setError('');
    setSuccess('');

    try {
      await api.patch(`/users/${user._id}`, { role: newRole });
      setSuccess(`User role changed to ${newRole}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async uId => {
    if (!window.confirm('Delete this staff member permanently?')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/users/${uId}`);
      setSuccess('Staff member deleted successfully');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Staff Account Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage system administrators, update authorization access, and onboard clinic staff.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-500/20">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Users list (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Staff Directory
            </h3>

            <div className="space-y-4">
              {loading && users.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Loading staff directory...</p>
              ) : users.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No users found.</p>
              ) : (
                users.map(u => {
                  const isActive = u.status === 'Active';
                  return (
                    <div
                      key={u._id}
                      className="p-4 border border-border rounded-xl bg-background/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                          {u.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm flex items-center">
                            {u.name}
                            <span
                              className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.role === 'Super Admin'
                                  ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                  : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          </h4>
                          <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        {/* Change Role Selection */}
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u, e.target.value)}
                          className="bg-background border border-border rounded px-2 py-1 text-xs text-muted-foreground focus:outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>

                        {/* Toggle Status (Block/Unblock) */}
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`p-1.5 rounded hover:bg-accent transition-colors`}
                          title={isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {isActive ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                          )}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Onboarding Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-4">
            Onboard New Staff
          </h3>
          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mary Jane"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mjane@icsr.org"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Role Designation</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="Admin">Admin (Medical Staff)</option>
                <option value="Super Admin">Super Admin (System Manager)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/95 transition-all flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Confirm Onboarding
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
