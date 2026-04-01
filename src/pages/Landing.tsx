import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Layout, 
  Download, 
  Share2,
  Users,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from '../components/Logo';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const features = [
    {
      title: 'ATS-Friendly Templates',
      description: 'Our templates are designed to pass through Applicant Tracking Systems with ease.',
      icon: ShieldCheck,
      color: 'bg-blue-500',
    },
    {
      title: 'Smart Role Highlighting',
      description: 'Intelligently prioritize your skills and experience based on the job you want.',
      icon: Zap,
      color: 'bg-amber-500',
    },
    {
      title: 'Real-Time Preview',
      description: 'See your resume update instantly as you fill in your professional details.',
      icon: Layout,
      color: 'bg-emerald-500',
    },
    {
      title: 'One-Click Export',
      description: 'Download your resume in high-quality PDF or DOCX format, ready for submission.',
      icon: Download,
      color: 'bg-purple-500',
    },
    {
      title: 'Shareable Links',
      description: 'Generate a unique link to share your professional profile directly with recruiters.',
      icon: Share2,
      color: 'bg-pink-500',
    },
    {
      title: 'Multi-Role Versions',
      description: 'Create and manage different versions of your resume for various job applications.',
      icon: Users,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300", theme === 'dark' ? 'dark' : '')}>
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="mr-2 flex items-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 p-1">
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

            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600"
            >
              <Zap className="h-4 w-4" />
              The Smartest Way to Build Your Resume
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 text-5xl font-extrabold leading-tight text-slate-900 dark:text-white lg:text-7xl"
            >
              Build a Resume That <br />
              <span className="text-blue-600">Gets You Hired.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 max-w-2xl text-xl text-slate-600 dark:text-slate-400 lg:text-2xl"
            >
              ResuMaster Pro helps you create professional, ATS-friendly resumes in minutes. 
              Smart role-based highlighting ensures your best skills always stand out.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Build My Resume Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Templates
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero Image / Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20 overflow-hidden rounded-3xl border-8 border-white bg-white shadow-2xl lg:mt-32"
          >
            <img 
              src="https://picsum.photos/seed/dashboard/1200/800" 
              alt="Dashboard Preview" 
              className="w-full"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white dark:bg-slate-900 py-24 lg:py-32 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">Everything You Need</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Powerful features to help you land your dream job.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-8 transition-all hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-blue-900/10">
                  <div className={cn('mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg', feature.color)}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 text-center md:grid-cols-3">
            <div>
              <p className="mb-2 text-5xl font-extrabold text-blue-500">50,000+</p>
              <p className="text-xl text-slate-400">Resumes Created</p>
            </div>
            <div>
              <p className="mb-2 text-5xl font-extrabold text-blue-500">98%</p>
              <p className="text-xl text-slate-400">ATS Pass Rate</p>
            </div>
            <div>
              <p className="mb-2 text-5xl font-extrabold text-blue-500">12,000+</p>
              <p className="text-xl text-slate-400">Jobs Landed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Card className="relative overflow-hidden bg-blue-600 p-12 text-center text-white lg:p-20">
            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold lg:text-6xl">Ready to Level Up Your Career?</h2>
              <p className="mb-10 text-xl text-blue-100 lg:text-2xl">
                Join thousands of professionals who have built their future with ResuMaster Pro.
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/50 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-700/50 blur-3xl" />
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Logo size="sm" />
            <div className="flex gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</a>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500">© 2026 ResuMaster Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
