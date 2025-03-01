import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';

function DealsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Rest of your component...
}

export default DealsPage; 