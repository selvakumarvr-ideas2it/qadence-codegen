import { useLoginMutation } from '@/hooks/mutation/useLoginMutation';
import { useToast } from '@/hooks/useToast';
import type { ILoginResponse } from '@/interfaces/Auth';
import { decodeJwt, saveTokensToLocalStorage } from '@/utils/auth';
import { cn } from '@/utils/util';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import InputField from '../shared/inputField/InputField';

const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type IFormValues = z.infer<typeof LoginSchema>;

const validate = (values: IFormValues) => {
  const result = LoginSchema.safeParse(values);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const onLoginSuccess = (data: ILoginResponse) => {
    const token = data?.data?.token;
    const user = data?.data?.user.userName;
    const user_id = data?.data?.user.id;
    const organization = data?.data?.user?.accessibleTenants?.[0]?.name;

    if (user) {
      localStorage.setItem('user', user);
      localStorage.setItem('user_id', user_id);
    }

    if (organization) {
      localStorage.setItem('organization', organization);
    }

    if (token && user) {
      saveTokensToLocalStorage(token, token);

      // decodeJwt will persist tenant_id if present in token
      decodeJwt(token);

      // react-hot-toast
      showSuccessToast('Login successful!', 'Welcome back to your dashboard');

      navigate('/dashboard');
    } else {
      console.error('Missing token in response:', data);
    }
  };

  const onLoginError = (error: Error) => {
    // Handle different types of errors
    let errorMessage = 'Login failed';
    let errorDescription = 'Please check your credentials and try again';

    if (error?.message?.includes('401')) {
      errorMessage = 'Invalid credentials';
      errorDescription = 'Username or password is incorrect';
    } else if (error?.message?.includes('400')) {
      errorMessage = 'Invalid request';
      errorDescription = 'Please check your email and password format';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showErrorToast(errorMessage, errorDescription);
  };

  const onLoginMutation = useLoginMutation(onLoginSuccess, onLoginError);

  const formik = useFormik<IFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        onLoginMutation.onUserLogin(values);
      } catch (error) {
        console.error('Login submission error:', error);
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={formik.handleSubmit}
      className="w-full space-y-3"
    >
      <InputField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formik.values.email}
        onChange={formik.handleChange}
        className={cn(`!py-2`)}
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formik.values.password}
        onChange={formik.handleChange}
        className={cn(`!py-2`)}
      />
      <PrimaryButton
        type="submit"
        disabled={!formik.isValid || onLoginMutation.onLogin.isPending}
        className="w-full px-4 py-2"
      >
        {onLoginMutation.onLogin.isPending ? 'Signing in...' : 'Sign In'}
      </PrimaryButton>
    </form>
  );
};

export default LoginForm;
