import toast, { Toaster } from 'react-hot-toast';
import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import Exclamation from '@/assets/icons/Exclamation.svg?react';
import InfoCircle from '@/assets/icons/InfoCircle.svg?react';
import Fail from '@/assets/icons/Fail.svg?react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Custom toast component
const CustomToast = ({
  type,
  message,
  description
}: {
  type: ToastType;
  message: string;
  description?: string;
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <Fail className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Exclamation className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <InfoCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <InfoCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`flex items-start p-4 rounded-lg border shadow-lg max-w-md ${getBackgroundColor()}`}>
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};

// Toast functions
export const showToast = {
  success: (message: string, description?: string) => {
    return toast.custom(() => (
      <CustomToast
        type="success"
        message={message}
        description={description}
      />
    ), {
      duration: 4000,
      position: 'bottom-right',
    });
  },

  error: (message: string, description?: string) => {
    return toast.custom(() => (
      <CustomToast
        type="error"
        message={message}
        description={description}
      />
    ), {
      duration: 5000,
      position: 'bottom-right',
    });
  },

  warning: (message: string, description?: string) => {
    return toast.custom(() => (
      <CustomToast
        type="warning"
        message={message}
        description={description}
      />
    ), {
      duration: 4000,
      position: 'bottom-right',
    });
  },

  info: (message: string, description?: string) => {
    return toast.custom(() => (
      <CustomToast
        type="info"
        message={message}
        description={description}
      />
    ), {
      duration: 4000,
      position: 'bottom-right',
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'bottom-right',
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  }
};

// Toast Provider Component
export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        // Success toast options
        success: {
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        },
        // Error toast options
        error: {
          duration: 5000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        },
      }}
    />
  );
};

export default showToast;
