import { Sidebar } from '@/components/shared/sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

const SharedLayout = () => {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="main-container flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default SharedLayout;
