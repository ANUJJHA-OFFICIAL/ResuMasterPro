import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Database, 
  Layout, 
  Figma, 
  BarChart3, 
  Terminal, 
  Users, 
  Briefcase, 
  Search,
  ArrowRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { cn } from '../../lib/utils';

const ROLES = [
  { id: 'frontend', label: 'Frontend Developer', icon: Layout, color: 'bg-blue-500', description: 'Focus on UI/UX, React, and modern web technologies.' },
  { id: 'backend', label: 'Backend Developer', icon: Database, color: 'bg-emerald-500', description: 'Focus on APIs, Node.js, and database architecture.' },
  { id: 'fullstack', label: 'Full Stack Developer', icon: Code, color: 'bg-purple-500', description: 'End-to-end development from frontend to backend.' },
  { id: 'uiux', label: 'UI/UX Designer', icon: Figma, color: 'bg-pink-500', description: 'Focus on user experience and visual design.' },
  { id: 'data', label: 'Data Analyst', icon: BarChart3, color: 'bg-amber-500', description: 'Focus on data visualization and insights.' },
  { id: 'devops', label: 'DevOps Engineer', icon: Terminal, color: 'bg-slate-700', description: 'Focus on infrastructure and automation.' },
  { id: 'manager', label: 'Project Manager', icon: Users, color: 'bg-indigo-500', description: 'Focus on team leadership and coordination.' },
  { id: 'hr', label: 'HR / Management', icon: Briefcase, color: 'bg-orange-500', description: 'Focus on recruitment and operations.' },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredRoles = ROLES.filter(role => 
    role.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/builder/setup?role=${selectedRole}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-slate-900 dark:text-white">Build resume for which position?</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">We'll intelligently highlight your best skills for your target role.</p>
        </div>

        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search for a role..."
              className="pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredRoles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'group h-full cursor-pointer border-2 p-6 transition-all hover:-translate-y-2',
                  selectedRole === role.id 
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-600/10' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                )}
              >
                <div className={cn('mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110', role.color)}>
                  <role.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{role.label}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{role.description}</p>
              </Card>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ROLES.length * 0.05 }}
          >
            <Card
              onClick={() => setSelectedRole('custom')}
              className={cn(
                'group h-full cursor-pointer border-2 border-dashed p-6 transition-all hover:-translate-y-2',
                selectedRole === 'custom' 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
              )}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-sm transition-transform group-hover:scale-110">
                <Plus className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Custom Role</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Enter your own specific job title and role.</p>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-xs"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            Continue to Builder
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
