import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/app/AppContext';
import RouterComponent from './routes/Router';
import { ToastProvider } from './components/shared/toast/ReactHotToast';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RouterComponent />
        <ToastProvider />
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
