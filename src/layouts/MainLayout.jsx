import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';

function MainLayout({ user }) {
  return (
    <div>
      <TopBar user={user} />
      <Outlet />
    </div>
  );
}

export default MainLayout; 