import Application from '@/pages/applications/Application';
import Bugs from '@/pages/bugs/Bugs';
import ClientAccount from '@/pages/client-account/ClientAccount';
import Dashboard from '@/pages/dashboard/Dashboard';
import SharedLayout from '@/pages/layouts/SharedLayout';
import Login from '@/pages/login/Login';
import RunHistory from '@/pages/run-history/RunHistory';
import TestStepsScreenshotView from '@/pages/test-steps-screenshot/TestStepsScreenshotView';
import { UserAccount } from '@/pages/user-account/UserAccount';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// inline admin guard
const isPlatformAdmin = (): boolean => {
  try {
    const roles = JSON.parse(localStorage.getItem('roles') ?? '[]') as string[];
    return Array.isArray(roles) && roles.includes('PLATFORM_ADMIN');
  } catch {
    return false;
  }
};

const AdminRoute = () => {
  if (!isPlatformAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

// Non-admin guard: hide general routes for platform admins
const NonAdminRoute = () => {
  if (isPlatformAdmin()) {
    return <Navigate to="/client-accounts" replace />;
  }
  return <Outlet />;
};

const RouterComponent = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      children: [
        {
          index: true,
          element: <Navigate to="/login" replace />,
        },
        {
          path: 'login',
          element: <Login />,
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <SharedLayout />,
          children: [
            // Non-admin-only group (hidden from platform admins)
            {
              element: <NonAdminRoute />,
              children: [
                {
                  path: '/dashboard',
                  element: <Dashboard />,
                },
                {
                  path: '/applications',
                  element: <Application />,
                },
                {
                  path: '/run-history',
                  element: <RunHistory />,
                },
                {
                  path: '/bugs',
                  element: <Bugs />,
                },
                {
                  path: '/test-steps-screenshot',
                  element: <TestStepsScreenshotView />,
                },
              ],
            },

            // Admin-only group
            {
              element: <AdminRoute />,
              children: [
                {
                  path: '/client-accounts',
                  element: <ClientAccount />,
                },
                {
                  path: '/user-account',
                  element: <UserAccount />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RouterComponent;
