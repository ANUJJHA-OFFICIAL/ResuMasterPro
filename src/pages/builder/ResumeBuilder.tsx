import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Settings, 
  Download, 
  Share2, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  FileText,
  CheckCircle2,
  Zap,
  LayoutGrid,
  Columns,
  List
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { UserProfile, Resume, Experience, Project } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { ModernTemplate } from '../../components/templates/ModernTemplate';
import { CorporateTemplate } from '../../components/templates/CorporateTemplate';
import { ExecutiveTemplate } from '../../components/templates/ExecutiveTemplate';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';

export default function ResumeBuilder() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'custom';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeType, setResumeType] = useState<'chronological' | 'functional' | 'combination'>('chronological');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(smartPrioritize(data, role));
      } else {
        toast.error('Please complete your profile first');
        navigate('/profile');
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user, role, navigate]);

  const smartPrioritize = (data: UserProfile, targetRole: string): UserProfile => {
    const prioritizedData = { ...data };
    
    // Prioritize Experience
    prioritizedData.experience = [...data.experience].sort((a, b) => {
      const aMatch = a.position.toLowerCase().includes(targetRole.toLowerCase()) || 
                     a.description.toLowerCase().includes(targetRole.toLowerCase());
      const bMatch = b.position.toLowerCase().includes(targetRole.toLowerCase()) || 
                     b.description.toLowerCase().includes(targetRole.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    // Prioritize Projects
    prioritizedData.projects = [...data.projects].sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(targetRole.toLowerCase()) || 
                     a.techStack.some(s => s.toLowerCase().includes(targetRole.toLowerCase()));
      const bMatch = b.title.toLowerCase().includes(targetRole.toLowerCase()) || 
                     b.techStack.some(s => s.toLowerCase().includes(targetRole.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    // Prioritize Skills
    prioritizedData.skills.technical = [...data.skills.technical].sort((a, b) => {
      const aMatch = a.toLowerCase().includes(targetRole.toLowerCase());
      const bMatch = b.toLowerCase().includes(targetRole.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    // Prioritize Achievements
    if (data.achievements) {
      prioritizedData.achievements = [...data.achievements].sort((a, b) => {
        const aMatch = a.title.toLowerCase().includes(targetRole.toLowerCase()) || 
                       a.description.toLowerCase().includes(targetRole.toLowerCase());
        const bMatch = b.title.toLowerCase().includes(targetRole.toLowerCase()) || 
                       b.description.toLowerCase().includes(targetRole.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return prioritizedData;
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      const resumeId = doc(collection(db, 'resumes')).id;
      const resumeData: Resume = {
        id: resumeId,
        userId: user.uid,
        title: `Resume - ${role} - ${new Date().toLocaleDateString()}`,
        role,
        template: selectedTemplate,
        type: resumeType,
        data: profile,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, 'resumes', resumeId), resumeData);
      toast.success('Resume saved to dashboard!');
      navigate('/resumes');
    } catch (error) {
      console.error('Save Error:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const renderTemplate = () => {
    if (!profile) return null;
    const props = { data: profile, role, type: resumeType };
    
    switch (selectedTemplate) {
      case 'corporate':
        return <CorporateTemplate {...props} />;
      case 'executive':
        return <ExecutiveTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsSaving(true);
    const loadingToast = toast.loading('Preparing your professional PDF...');
    
    try {
      const element = resumeRef.current;
      
      // Use modern-screenshot which handles modern CSS (like oklch) much better than html2canvas
      const imgData = await domToPng(element, {
        scale: 2,
        quality: 1.0,
        backgroundColor: '#ffffff',
        features: {
          // Ensure all features are enabled for best results
          removeControlCharacter: true,
        }
      });
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Get image properties to calculate dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / ratio;
      
      // Handle multi-page if the resume is longer than A4
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Resume_${role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss(loadingToast);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate PDF. Please try again or use a different browser.');
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex h-[calc(100vh-12rem)] flex-col gap-8 lg:flex-row">
        {/* Left Sidebar: Controls */}
        <aside className="w-full space-y-8 lg:w-80 lg:flex-shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Resume Type</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'chronological', label: 'Chronological', icon: List },
                  { id: 'functional', label: 'Functional', icon: LayoutGrid },
                  { id: 'combination', label: 'Combination', icon: Columns },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setResumeType(type.id as any)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all',
                      resumeType === type.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-blue-200'
                    )}
                  >
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Templates</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'modern', label: 'Modern Pro' },
                  { id: 'corporate', label: 'Corporate Classic' },
                  { id: 'executive', label: 'Executive Elite' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all text-left',
                      selectedTemplate === t.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-blue-200'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
                <Zap className="h-4 w-4" />
                Smart Highlighting Active
              </div>
              <p className="text-xs leading-relaxed text-blue-700/70">
                Your profile data has been intelligently prioritized for the <strong>{role}</strong> role.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <Button className="w-full" onClick={handleSave} isLoading={isSaving}>
              <Save className="mr-2 h-5 w-5" />
              Save to Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDownloadPDF} isLoading={isSaving}>
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" />
              Share Link
            </Button>
          </div>
        </aside>

        {/* Right Side: Live Preview */}
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center gap-2">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id as any)}
                  className={cn(
                    'rounded-lg p-2 transition-all',
                    previewMode === mode.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                  )}
                >
                  <mode.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">A4 Preview</span>
              <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-100 dark:bg-slate-900/50 p-8 shadow-inner transition-colors duration-300">
            <div 
              className={cn(
                'mx-auto transition-all duration-500',
                previewMode === 'desktop' ? 'w-[210mm]' : 
                previewMode === 'tablet' ? 'w-[148mm]' : 'w-[100mm]'
              )}
            >
              <div 
                ref={resumeRef} 
                className="min-h-[297mm] w-full bg-white shadow-2xl relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, transparent 296.9mm, #cbd5e1 296.9mm, #cbd5e1 297.1mm, transparent 297.1mm)',
                  backgroundSize: '100% 297mm'
                }}
              >
                {renderTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
