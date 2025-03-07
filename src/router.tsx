import { createBrowserRouter } from 'react-router-dom';
import Listings from './pages/Listings';
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
    ],
  },
]);

export default router; 