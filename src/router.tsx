import { createBrowserRouter } from 'react-router-dom';
import Listings from './pages/Listings';
import ResearchAndReports from './pages/ResearchAndReports';
import AdminReports from './pages/AdminReports';
// ... other imports ...

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // ... existing routes ...
      {
        path: '/listings',
        element: <Listings />,
      },
      {
        path: '/research-reports',
        element: <ResearchAndReports />,
      },
      {
        path: '/admin/reports',
        element: <AdminReports />,
      },
    ],
  },
]);

export default router; 