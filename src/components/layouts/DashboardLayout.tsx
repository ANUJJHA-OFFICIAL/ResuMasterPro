import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  Bell,
  CheckCircle2,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

import { collection, query, where, onSnapshot, limit, orderBy, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Profile for profile picture
    const profileUnsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfilePic(data.personalInfo?.profilePic || null);
      }
    });

    // Fetch Resumes for dynamic notifications
    const resumesQuery = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const resumesUnsub = onSnapshot(resumesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      const newNotifications = docs.map((resume, i) => ({
        id: i,
        title: 'Resume Saved',
        message: `Your "${resume.role}" resume was saved.`,
        time: new Date(resume.updatedAt).toLocaleTimeString(),
        type: 'info'
      }));
      
      // Add a welcome notification if no resumes
      if (newNotifications.length === 0) {
        newNotifications.push({
          id: 0,
          title: 'Welcome!',
          message: 'Start by building your first professional resume.',
          time: 'Just now',
          type: 'success'
        });
      }
      
      setNotifications(newNotifications);
    });

    return () => {
      profileUnsub();
      resumesUnsub();
    };
  }, [user]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Resumes', icon: FileText, path: '/resumes' },
    { label: 'Profile Setup', icon: UserCircle, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className={cn("flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300", theme === 'dark' ? 'dark' : '')}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-900 p-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-100 dark:border-slate-800',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <Link
              to="/builder/role"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
              Build New Resume
            </Link>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all',
                    location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 p-4">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900 ring-2 ring-white dark:ring-slate-700">
                <img 
                  src={profilePic || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="User" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.displayName || 'User'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-xl lg:px-12 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {navItems.find((item) => item.path === location.pathname)?.label || 'App'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 p-1">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                  theme === 'light' 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                )}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                  theme === 'dark' 
                    ? "bg-slate-700 text-blue-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">2 NEW</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        {notifications.map((n) => (
                          <div key={n.id} className="flex gap-4 rounded-xl p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              n.type === 'success' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            )}>
                              {n.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full border-t border-slate-50 dark:border-slate-800 p-3 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                        View All Notifications
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden h-10 w-10 overflow-hidden rounded-full bg-slate-100 lg:block">
              <img 
                src={profilePic || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="User" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
