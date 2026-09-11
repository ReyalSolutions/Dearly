import { getAuthState } from '../components/shell.js';
import { showToast } from '../utils/toast.js';

export async function requireSignedIn(navigate) {
  const auth = await getAuthState();
  if (auth.user) return auth;
  showToast('Log in to continue.', 'info');
  navigate('/login');
  return null;
}
