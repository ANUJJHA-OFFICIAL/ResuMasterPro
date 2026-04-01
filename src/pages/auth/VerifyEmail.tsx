import { useState } from 'react';
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail, user } = useAuth();

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await verifyEmail();
      toast.success('Verification email resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle="We've sent a verification link to your email address. Please check your inbox."
    >
      <Card className="p-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Mail className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Check Your Inbox</h2>
            <p className="text-slate-500">
              We sent a verification link to <span className="font-bold text-slate-900">{user?.email}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Click the link in the email to verify your account
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleResend} isLoading={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Button>
            
            <Link to="/dashboard">
              <Button className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            Wrong email address?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">
              Change it
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
