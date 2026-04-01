import React, { useState, useRef } from 'react';
import { User, Bell, Shield, Palette, Save, Camera, LogOut, Trash2, Lock, Moon, Sun } from 'lucide-react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { updateProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: true,
    security: true
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 'profile') {
        await updateProfile(user, { displayName });
        // Also update Firestore profile if it exists
        try {
          await updateDoc(doc(db, 'profiles', user.uid), {
            'personalInfo.fullName': displayName
          });
        } catch (e) {
          // Profile might not exist yet, ignore
        }
        toast.success('Profile updated successfully!');
      } else {
        toast.success('Settings updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Create a canvas to resize the image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to low-quality JPEG to save space
        const photoURL = canvas.toDataURL('image/jpeg', 0.7);

        try {
          setIsLoading(true);
          // Save to Firestore instead of Auth Profile to avoid size limits
          await updateDoc(doc(db, 'profiles', user.uid), {
            'personalInfo.profilePic': photoURL
          });
          
          toast.success('Profile picture updated!');
        } catch (error: any) {
          toast.error('Failed to update photo. Make sure you have completed your profile setup first.');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="group relative h-24 w-24 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="User" 
                  className="h-full w-full object-cover transition-all group-hover:scale-110 group-hover:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-all group-hover:opacity-100"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your photo to be displayed on your resumes.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Remove</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input 
                label="Display Name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input label="Email Address" defaultValue={user?.email || ''} disabled />
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" isLoading={isLoading}>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </Button>
            </div>
          </form>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you want to be notified about your account activity.</p>
            </div>
            <div className="space-y-3">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive updates about your resume views and job matches.' },
                { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your browser for important updates.' },
                { id: 'updates', label: 'Product Updates', desc: 'Stay informed about new features and improvements.' },
                { id: 'security', label: 'Security Alerts', desc: 'Receive notifications about login attempts and security changes.' }
              ].map((pref) => (
                <label key={pref.id} className="flex items-center justify-between rounded-2xl border-2 border-slate-50 dark:border-slate-800 p-4 transition-all hover:border-blue-100 dark:hover:border-blue-900">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{pref.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{pref.desc}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications[pref.id as keyof typeof notifications]} 
                    onChange={(e) => setNotifications(prev => ({ ...prev, [pref.id]: e.target.checked }))}
                    className="h-6 w-6 rounded-lg border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" 
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={() => toast.success('Notification settings saved!')}>
                <Save className="mr-2 h-5 w-5" />
                Save Preferences
              </Button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and account security.</p>
            </div>
            
            <div className="space-y-4">
              <Card className="border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Change Password</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">We'll send a reset link to your email address.</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handlePasswordReset}>Send Reset Link</Button>
                </div>
              </Card>

              <Card className="border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-red-600 shadow-sm">
                      <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900 dark:text-red-400">Delete Account</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">Permanently remove your account and all data.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">Delete Account</Button>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customize how ResuMaster Pro looks on your device.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button 
                onClick={() => setTheme('light')}
                className={cn(
                  "flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all",
                  theme === 'light' 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900"
                )}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                  <Sun className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">Light Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Classic clean interface</p>
                </div>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all",
                  theme === 'dark' 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900"
                )}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-blue-400 shadow-sm">
                  <Moon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Easier on the eyes at night</p>
                </div>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and application settings.</p>
          </div>
          <Button variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            {[
              { id: 'profile', label: 'Account Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'appearance', label: 'Appearance', icon: Palette },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
