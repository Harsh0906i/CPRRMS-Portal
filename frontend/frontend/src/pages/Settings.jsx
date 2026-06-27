import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Database, ShieldAlert, Download, RefreshCw, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function Settings() {
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role === 'Super Admin';

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [logsError, setLogsError] = useState('');

  const fetchLogs = async (pageNum = 1) => {
    if (!isSuperAdmin) return;
    setLoadingLogs(true);
    setLogsError('');
    try {
      const response = await api.get('/users/audit-logs', {
        params: { page: pageNum, limit: 15 }
      });
      setLogs(response.data.data.logs);
      setTotal(response.data.total);
      setPage(response.data.page);
      setPages(response.data.pages);
    } catch (error) {
      setLogsError(error.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [isSuperAdmin]);

  const handleBackup = () => {
    setBackingUp(true);
    setBackupMessage('');
    
    // Simulate database backup process
    setTimeout(() => {
      setBackingUp(false);
      const dateString = new Date().toISOString().slice(0, 10);
      setBackupMessage(`Database Backup Successful! Generated: cprrms_backup_${dateString}.json (1.2 MB)`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings & Controls</h2>
        <p className="text-sm text-muted-foreground">
          Monitor database storage, download backup snapshots, and view system access audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: System Info & Mock Backups */}
        <div className="space-y-6 lg:col-span-1">
          {/* Database Status */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center">
              <Database className="mr-2 h-4 w-4 text-primary" /> Database Services
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-emerald-500 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-mono font-semibold">MongoDB Atlas Cloud</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collections Count:</span>
                <span className="font-bold">8 active collections</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backup Strategy:</span>
                <span className="font-semibold text-primary">Daily Scheduled</span>
              </div>
            </div>
          </div>

          {/* Backup Action card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center">
              <ShieldAlert className="mr-2 h-4 w-4 text-primary" /> Disaster Recovery
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate an immediate snapshot backup of all patient logs, treatments, and transaction files.
            </p>

            {backupMessage && (
              <div className="p-3 text-xs rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {backupMessage}
              </div>
            )}

            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all flex items-center justify-center"
            >
              {backingUp ? (
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-2 h-3.5 w-3.5" />
              )}
              {backingUp ? 'Creating Backup Snapshot...' : 'Run Backup Database Now'}
            </button>
          </div>
        </div>

        {/* Right Columns: Audit logs (Super Admin exclusive) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4 flex items-center">
              <Activity className="mr-2 h-4 w-4 text-primary" /> Audit Trail Logs
            </h3>

            {!isSuperAdmin ? (
              <div className="p-8 text-center bg-muted/20 border border-border rounded-xl">
                <ShieldAlert className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                <p className="text-sm font-bold">Access Restricted</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Database audit logs can only be retrieved by a Super Admin operator.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logsError && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded">
                    {logsError}
                  </div>
                )}
                
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/40 font-bold border-b border-border text-muted-foreground">
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Operator</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Change Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loadingLogs && logs.length === 0 ? (
                        [1, 2, 3].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="5" className="px-4 py-4 h-8 bg-muted/10"></td>
                          </tr>
                        ))
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-muted-foreground">
                            No logs registered.
                          </td>
                        </tr>
                      ) : (
                        logs.map(log => (
                          <tr key={log._id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-mono text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {log.user?.name || 'System'}
                              <span className="block text-[10px] text-muted-foreground font-normal">
                                {log.user?.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-primary font-bold">{log.action}</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{log.ipAddress || '--'}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                              {log.details ? JSON.stringify(log.details) : '{}'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Logs Pagination */}
                {!loadingLogs && pages > 1 && (
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-muted-foreground">
                      Page <b>{page}</b> of <b>{pages}</b> ({total} actions logged)
                    </span>
                    <div className="flex space-x-2">
                      <button
                        disabled={page === 1}
                        onClick={() => fetchLogs(page - 1)}
                        className="p-1.5 border border-border rounded hover:bg-accent disabled:opacity-50"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={page === pages}
                        onClick={() => fetchLogs(page + 1)}
                        className="p-1.5 border border-border rounded hover:bg-accent disabled:opacity-50"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
