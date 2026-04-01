import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  FolderGit2, 
  Trophy, 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { toast } from 'sonner';
import { UserProfile, Education, Experience, Project } from '../types';
import { cn } from '../lib/utils';

const profileSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
    github: z.string().url('Invalid URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
  summary: z.string().min(10, 'Introduction should be at least 10 characters').max(500, 'Introduction should not exceed 500 characters').optional().or(z.literal('')),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field is required'),
    startYear: z.string().min(1, 'Start year is required'),
    endYear: z.string().min(1, 'End year is required'),
    grade: z.string().min(1, 'Grade is required'),
    achievements: z.string().optional(),
  })),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string().min(1, 'Company is required'),
    position: z.string().min(1, 'Position is required'),
    location: z.string().min(1, 'Location is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string().min(1, 'Description is required'),
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    role: z.string().min(1, 'Role is required'),
    techStack: z.array(z.string()),
    description: z.string().min(1, 'Description is required'),
    links: z.object({
      demo: z.string().url('Invalid URL').optional().or(z.literal('')),
      github: z.string().url('Invalid URL').optional().or(z.literal('')),
    }).optional(),
  })),
  achievements: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    organization: z.string().min(1, 'Organization is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['hackathon', 'quiz', 'competition', 'participation', 'other']),
  })),
});

type ProfileForm = z.infer<typeof profileSchema>;

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personalInfo: {
        fullName: user?.displayName || '',
        email: user?.email || '',
      },
      education: [],
      experience: [],
      skills: { technical: [], soft: [], tools: [] },
      projects: [],
      achievements: [],
    },
  });

  const formData = watch();
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    setCompletionPercentage(calculateCompletion(formData));
  }, [formData]);

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: 'experience',
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({
    control,
    name: 'achievements',
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        reset({
          ...data,
          achievements: data.achievements || [],
          education: data.education || [],
          experience: data.experience || [],
          skills: data.skills || { technical: [], soft: [], tools: [] },
          projects: data.projects || [],
        } as ProfileForm);
      }
    });

    return unsubscribe;
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const completionPercentage = calculateCompletion(data);
      await setDoc(doc(db, 'profiles', user.uid), {
        ...data,
        uid: user.uid,
        completionPercentage,
        updatedAt: Date.now(),
      });
      toast.success('Profile saved successfully!');
      if (currentStep === STEPS.length - 1) {
        navigate('/dashboard');
      } else {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      toast.error('Failed to save profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Validation Errors:', errors);
    toast.error('Please fix the errors in the form before proceeding.');
  };

  const calculateCompletion = (data: ProfileForm) => {
    let score = 0;
    // Personal Info: 20%
    if (data.personalInfo?.fullName) score += 5;
    if (data.personalInfo?.phone) score += 5;
    if (data.personalInfo?.dob) score += 5;
    if (data.personalInfo?.address) score += 5;
    
    // Education: 20%
    if (data.education?.length > 0) score += 20;
    
    // Experience: 20%
    if (data.experience?.length > 0) score += 20;
    
    // Skills: 15%
    if (data.skills?.technical?.length > 0) score += 5;
    if (data.skills?.soft?.length > 0) score += 5;
    if (data.skills?.tools?.length > 0) score += 5;
    
    // Projects: 15%
    if (data.projects?.length > 0) score += 15;
    
    // Achievements: 10%
    if (data.achievements?.length > 0) score += 10;
    
    return Math.min(score, 100);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'personal':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Full Name" {...register('personalInfo.fullName')} error={errors.personalInfo?.fullName?.message} />
            <Input label="Email" {...register('personalInfo.email')} error={errors.personalInfo?.email?.message} disabled />
            <Input label="Phone" {...register('personalInfo.phone')} error={errors.personalInfo?.phone?.message} />
            <Input label="Date of Birth" type="date" {...register('personalInfo.dob')} error={errors.personalInfo?.dob?.message} />
            <Input label="Gender" {...register('personalInfo.gender')} error={errors.personalInfo?.gender?.message} />
            <Input label="Nationality" {...register('personalInfo.nationality')} error={errors.personalInfo?.nationality?.message} />
            <div className="md:col-span-2">
              <Input label="Address" {...register('personalInfo.address')} error={errors.personalInfo?.address?.message} />
            </div>
            <Input label="City" {...register('personalInfo.city')} error={errors.personalInfo?.city?.message} />
            <Input label="State" {...register('personalInfo.state')} error={errors.personalInfo?.state?.message} />
            <Input label="Country" {...register('personalInfo.country')} error={errors.personalInfo?.country?.message} />
            <Input label="Pincode" {...register('personalInfo.pincode')} error={errors.personalInfo?.pincode?.message} />
            <Input label="LinkedIn URL" {...register('personalInfo.linkedin')} error={errors.personalInfo?.linkedin?.message} />
            <Input label="GitHub URL" {...register('personalInfo.github')} error={errors.personalInfo?.github?.message} />
            <Input label="Portfolio URL" {...register('personalInfo.portfolio')} error={errors.personalInfo?.portfolio?.message} />
            <div className="md:col-span-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Professional Introduction (2-4 lines)</label>
                <textarea 
                  {...register('summary')}
                  placeholder="e.g. Passionate Full Stack Developer with 3+ years of experience in building scalable web applications using React and Node.js. Focused on delivering high-quality, user-centric solutions..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none min-h-[100px]"
                />
                {errors.summary && (
                  <p className="text-xs text-red-500">{errors.summary.message}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="space-y-6">
            {eduFields.map((field, index) => (
              <Card key={field.id} className="relative border-2 border-slate-100 dark:border-slate-800 p-6">
                <button
                  type="button"
                  onClick={() => removeEdu(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Institution" {...register(`education.${index}.institution`)} error={errors.education?.[index]?.institution?.message} />
                  <Input label="Degree" {...register(`education.${index}.degree`)} error={errors.education?.[index]?.degree?.message} />
                  <Input label="Field of Study" {...register(`education.${index}.field`)} error={errors.education?.[index]?.field?.message} />
                  <Input label="Grade / CGPA" {...register(`education.${index}.grade`)} error={errors.education?.[index]?.grade?.message} />
                  <Input label="Start Year" {...register(`education.${index}.startYear`)} error={errors.education?.[index]?.startYear?.message} />
                  <Input label="End Year" {...register(`education.${index}.endYear`)} error={errors.education?.[index]?.endYear?.message} />
                  <div className="md:col-span-2">
                    <Input label="Achievements" {...register(`education.${index}.achievements`)} />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendEdu({ id: crypto.randomUUID(), institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' })}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Education
            </Button>
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-6">
            {expFields.map((field, index) => (
              <Card key={field.id} className="relative border-2 border-slate-100 dark:border-slate-800 p-6">
                <button
                  type="button"
                  onClick={() => removeExp(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Company" {...register(`experience.${index}.company`)} error={errors.experience?.[index]?.company?.message} />
                  <Input label="Position" {...register(`experience.${index}.position`)} error={errors.experience?.[index]?.position?.message} />
                  <Input label="Location" {...register(`experience.${index}.location`)} error={errors.experience?.[index]?.location?.message} />
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <input type="checkbox" {...register(`experience.${index}.isCurrent`)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 bg-transparent" />
                      I currently work here
                    </label>
                  </div>
                  <Input label="Start Date" type="date" {...register(`experience.${index}.startDate`)} error={errors.experience?.[index]?.startDate?.message} />
                  {!watch(`experience.${index}.isCurrent`) && (
                    <Input label="End Date" type="date" {...register(`experience.${index}.endDate`)} error={errors.experience?.[index]?.endDate?.message} />
                  )}
                  <div className="md:col-span-2">
                    <Input label="Description" {...register(`experience.${index}.description`)} error={errors.experience?.[index]?.description?.message} />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendExp({ id: crypto.randomUUID(), company: '', position: '', location: '', startDate: '', isCurrent: false, description: '' })}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Experience
            </Button>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Technical Skills</label>
              <div className="flex flex-wrap gap-2">
                {watch('skills.technical').map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {skill}
                    <button type="button" onClick={() => {
                      const current = watch('skills.technical');
                      setValue('skills.technical', current.filter((_, idx) => idx !== i));
                    }}>
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add technical skill (press Enter)"
                  className="flex-1 min-w-[200px] border-b-2 border-slate-100 dark:border-slate-800 bg-transparent py-1 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setValue('skills.technical', [...watch('skills.technical'), val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Soft Skills</label>
              <div className="flex flex-wrap gap-2">
                {watch('skills.soft').map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {skill}
                    <button type="button" onClick={() => {
                      const current = watch('skills.soft');
                      setValue('skills.soft', current.filter((_, idx) => idx !== i));
                    }}>
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add soft skill (press Enter)"
                  className="flex-1 min-w-[200px] border-b-2 border-slate-100 dark:border-slate-800 bg-transparent py-1 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setValue('skills.soft', [...watch('skills.soft'), val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tools & Technologies</label>
              <div className="flex flex-wrap gap-2">
                {watch('skills.tools').map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                    {skill}
                    <button type="button" onClick={() => {
                      const current = watch('skills.tools');
                      setValue('skills.tools', current.filter((_, idx) => idx !== i));
                    }}>
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tool (press Enter)"
                  className="flex-1 min-w-[200px] border-b-2 border-slate-100 dark:border-slate-800 bg-transparent py-1 text-sm text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setValue('skills.tools', [...watch('skills.tools'), val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            {projFields.map((field, index) => (
              <Card key={field.id} className="relative border-2 border-slate-100 dark:border-slate-800 p-6">
                <button
                  type="button"
                  onClick={() => removeProj(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Project Title" {...register(`projects.${index}.title`)} error={errors.projects?.[index]?.title?.message} />
                  <Input label="Your Role" {...register(`projects.${index}.role`)} error={errors.projects?.[index]?.role?.message} />
                  <div className="md:col-span-2">
                    <Input label="Tech Stack (comma separated)" placeholder="React, Node.js, Firebase" onChange={(e) => {
                      const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setValue(`projects.${index}.techStack`, val);
                    }} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Description" {...register(`projects.${index}.description`)} error={errors.projects?.[index]?.description?.message} />
                  </div>
                  <Input label="Demo Link" {...register(`projects.${index}.links.demo`)} error={errors.projects?.[index]?.links?.demo?.message} />
                  <Input label="GitHub Link" {...register(`projects.${index}.links.github`)} error={errors.projects?.[index]?.links?.github?.message} />
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendProj({ id: crypto.randomUUID(), title: '', role: '', techStack: [], description: '', links: { demo: '', github: '' } })}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Project
            </Button>
          </div>
        );
      case 'achievements':
        return (
          <div className="space-y-6">
            {achFields.map((field, index) => (
              <Card key={field.id} className="relative border-2 border-slate-100 dark:border-slate-800 p-6">
                <button
                  type="button"
                  onClick={() => removeAch(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Achievement Title" {...register(`achievements.${index}.title`)} error={errors.achievements?.[index]?.title?.message} />
                  <Input label="Organization / Event" {...register(`achievements.${index}.organization`)} error={errors.achievements?.[index]?.organization?.message} />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <select 
                      {...register(`achievements.${index}.type`)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="hackathon">Hackathon</option>
                      <option value="quiz">Quiz</option>
                      <option value="competition">Competition</option>
                      <option value="participation">Participation</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.achievements?.[index]?.type && (
                      <p className="text-xs text-red-500">{errors.achievements?.[index]?.type?.message}</p>
                    )}
                  </div>
                  <Input label="Date" type="date" {...register(`achievements.${index}.date`)} error={errors.achievements?.[index]?.date?.message} />
                  <div className="md:col-span-2">
                    <Input label="Description" {...register(`achievements.${index}.description`)} error={errors.achievements?.[index]?.description?.message} />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendAch({ id: crypto.randomUUID(), title: '', organization: '', date: '', description: '', type: 'participation' })}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Achievement / Participation
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Complete Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400">Fill in your details to build a professional resume.</p>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-400">Profile Completion</span>
              <span className="text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20"
              />
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-12 flex items-center justify-between overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center last:flex-none min-w-[100px]">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl transition-all',
                  index === currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                  index < currentStep ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                )}>
                  {index < currentStep ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                </div>
                <span className={cn(
                  'text-[10px] md:text-xs font-bold uppercase tracking-wider text-center',
                  index === currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                )}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'mx-2 md:mx-4 h-0.5 flex-1 rounded-full',
                  index < currentStep ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                )} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <Card className="mb-8 p-8">
            <div className="mb-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {(() => {
                    const Icon = STEPS[currentStep].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{STEPS[currentStep].label}</h3>
              </div>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Step {currentStep + 1} of {STEPS.length}</span>
            </div>

            {renderStep()}
          </Card>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit(onSubmit, onInvalid)}
                isLoading={isLoading}
              >
                <Save className="mr-2 h-5 w-5" />
                Save Draft
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {currentStep === STEPS.length - 1 ? 'Finish Setup' : 'Save & Next'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
