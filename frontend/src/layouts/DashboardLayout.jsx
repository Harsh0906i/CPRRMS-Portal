import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { useDarkMode } from '../hooks/useDarkMode';
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  CreditCard,
  UserCheck,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useSelector(state => state.auth);
  const [theme, toggleTheme] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Super Admin', 'Admin'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['Super Admin', 'Admin'] },
    { name: 'Cancer Registry', path: '/registry', icon: HeartPulse, roles: ['Super Admin', 'Admin'] },
    { name: 'Receipts & Billing', path: '/receipts', icon: CreditCard, roles: ['Super Admin', 'Admin'] },
    { name: 'Staff Directory', path: '/staff', icon: UserCheck, roles: ['Super Admin'] },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['Super Admin', 'Admin'] }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-primary text-primary-foreground font-bold text-lg tracking-wider">
          ICSR CPRRMS
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary flex items-center justify-center font-bold text-primary">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          
          <div className="relative flex flex-col w-64 max-w-xs bg-card border-r border-border animate-slide-in">
            {/* Close Button */}
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>

            <div className="h-16 flex items-center px-6 border-b border-border bg-primary text-primary-foreground font-bold text-lg">
              ICSR CPRRMS
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary flex items-center justify-center font-bold text-primary">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button onClick={handleLogout} className="flex items-center p-2 rounded-lg text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 rounded-md text-muted-foreground md:hidden hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold md:text-xl text-primary-foreground bg-primary/5 px-3 py-1 rounded-md border border-primary/10">
              ICSR Patient Registry Management
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg border border-border shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border font-semibold text-sm flex justify-between items-center">
                    <span>System Alerts & Notifications</span>
                    <span className="text-xs text-primary font-normal cursor-pointer">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border">
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <p className="text-xs font-bold text-teal-600">Database Backup Successful</p>
                      <p className="text-xs text-muted-foreground mt-1">Automated backup finished successfully.</p>
                      <span className="text-[10px] text-muted-foreground block mt-2">Just now</span>
                    </div>
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <p className="text-xs font-bold text-amber-500">Critical Stage Alert</p>
                      <p className="text-xs text-muted-foreground mt-1">Patient ICSR-2026-0002 has transitioned to Stage IV.</p>
                      <span className="text-[10px] text-muted-foreground block mt-2">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Initials Display */}
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
