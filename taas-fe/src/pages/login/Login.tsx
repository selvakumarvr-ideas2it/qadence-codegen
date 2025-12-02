import LoginForm from '@/components/login/LoginForm';
import { useToast } from '@/hooks/useToast';
import { useEffect } from 'react';

const Login = () => {
  const toast = useToast();

  useEffect(() => {
    // Check if user was redirected here after logout
    const showLogoutMessage = localStorage.getItem('showLogoutMessage');
    if (showLogoutMessage === 'true') {
      toast.success(
        'Logged out successfully',
        'You have been logged out of your account'
      );
      // Remove the flag
      localStorage.removeItem('showLogoutMessage');
    }
  }, [toast]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#e7eeff]">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center mb-5">
          <div className="text-4xl font-['aeonik-bold']">
            <span className="text-[#c63d3d]">Qa</span>dence
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center">
          AI-Powered QA Platform
        </h1>
        <p className="text-gray-500 text-center mt-1">
          Quality Assurance as a Service
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-1 text-center">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-3 text-center">
          Sign in to access your QA dashboard
        </p>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
