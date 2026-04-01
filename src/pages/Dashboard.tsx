import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UserProfile, Resume } from '../types';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

import { ResumePreview } from '../components/ResumePreview';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Profile
    const profileUnsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      }
      setIsLoading(false);
    });

    // Fetch Resumes
    const resumesQuery = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid)
    );
    const resumesUnsub = onSnapshot(resumesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resume));
      setResumes(docs.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      profileUnsub();
      resumesUnsub();
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resumes', id));
      toast.success('Resume deleted successfully');
      setDeletingId(null);
      setActiveMenu(null);
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const handleDownload = async (resume: Resume) => {
    toast.info('Preparing your download...');
    // In a real app, you'd trigger the PDF generation API
    // For now, we'll navigate to the builder with the resume data
    navigate(`/builder/role?role=${resume.role}&resumeId=${resume.id}`);
  };

  const stats = [
    { label: 'Total Resumes', value: resumes.length, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Profile Completion', value: `${profile?.completionPercentage || 0}%`, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Last Updated', value: profile?.updatedAt ? formatDate(profile.updatedAt) : 'N/A', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Welcome Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">Ready to land your next big role? Let's build something great.</p>
          </div>
          <Link to="/builder/role">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New Resume
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-6 p-6">
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm', stat.bg, stat.color)}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Profile Completion Alert */}
        {(!profile || profile.completionPercentage < 100) && (
          <Card className="border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 p-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Complete your profile for better results</h3>
                  <p className="text-slate-600 dark:text-slate-400">A complete profile helps us highlight your best skills for specific roles.</p>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="secondary" size="sm">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Resumes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Resumes</h2>
            <Link to="/resumes" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
          </div>

          {resumes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resumes.slice(0, 3).map((resume) => (
                <Card key={resume.id} className="group relative overflow-hidden p-0 border-slate-100 dark:border-slate-800">
                    <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 p-4 transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                      {/* Resume Thumbnail */}
                      <div className="h-full w-full rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden relative">
                        <ResumePreview resume={resume} />
                        
                        {/* Overlay for actions */}
                        <div className="absolute inset-0 bg-blue-600/0 transition-all group-hover:bg-blue-600/5 flex items-center justify-center">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="opacity-0 translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0"
                            onClick={() => navigate(`/builder/role?role=${resume.role}&resumeId=${resume.id}`)}
                          >
                            Open Builder
                          </Button>
                        </div>
                      </div>
                    </div>
                  <div className="p-6 bg-white dark:bg-slate-900">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{resume.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{resume.role}</p>
                      </div>
                      <div className="relative">
                        <button 
                          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          onClick={() => setActiveMenu(activeMenu === resume.id ? null : resume.id)}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {activeMenu === resume.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl animate-in fade-in zoom-in duration-200">
                              <button 
                                onClick={() => { navigate(`/builder/role?role=${resume.role}&resumeId=${resume.id}`); setActiveMenu(null); }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit Resume
                              </button>
                              <button 
                                onClick={() => { handleDownload(resume); setActiveMenu(null); }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Download className="h-4 w-4" />
                                Download PDF
                              </button>
                              <button 
                                onClick={() => { handleShare(resume.id); setActiveMenu(null); }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Share2 className="h-4 w-4" />
                                Share Link
                              </button>
                              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                              <button 
                                onClick={() => { setDeletingId(resume.id); setActiveMenu(null); }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Resume
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-1">
                      {resume.data.skills.technical.slice(0, 3).map(skill => (
                        <span key={skill} className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex gap-2">
                        <button 
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400" 
                          title="Edit"
                          onClick={() => navigate(`/builder/role?role=${resume.role}&resumeId=${resume.id}`)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400" 
                          title="Download"
                          onClick={() => handleDownload(resume)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400" 
                          title="Share"
                          onClick={() => handleShare(resume.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button 
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600" 
                        title="Delete"
                        onClick={() => setDeletingId(resume.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">No resumes yet</h3>
              <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">Create your first professional resume in minutes with our smart builder.</p>
              <Link to="/builder/role">
                <Button>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Resume
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeletingId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <Trash2 className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Delete Resume?</h3>
                <p className="mb-8 text-slate-500 dark:text-slate-400">This action cannot be undone. All data associated with this resume will be permanently removed.</p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeletingId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDelete(deletingId)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
