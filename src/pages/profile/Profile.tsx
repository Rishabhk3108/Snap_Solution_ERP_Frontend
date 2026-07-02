import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Redirect to employee detail page for self
  navigate(`/employees/${user.id}`, { replace: true });
  return null;
}
