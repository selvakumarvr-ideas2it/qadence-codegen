import showToast from '@/components/shared/toast/ReactHotToast';

export const useToast = () => {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    loading: showToast.loading,
    dismiss: showToast.dismiss,
    dismissAll: showToast.dismissAll,
  };
};
