import { NavigateFunction } from 'react-router-dom';

import { store } from '@/store';

export const loginJump = (navigate: NavigateFunction, isClearSession = false) => {
  const {
    global: { loginLandingLocation, recordOpenHash, setOpenPageFn },
  } = store.getState();
  if (loginLandingLocation === '1' && !recordOpenHash) {
    if (window.location.href.includes('login.php')) {
      if (isClearSession) window.sessionStorage.clear();
      window.location.href = '/';
      return false;
    }

    navigate('/');
    setOpenPageFn?.({
      isOpen: false,
      openUrl: '',
    });
    if (isClearSession) window.sessionStorage.clear();
    window.location.reload();
    return false;
  }
  if (loginLandingLocation === '1' && recordOpenHash) {
    const hash = recordOpenHash.split('#')[1];
    navigate(hash);

    return false;
  }

  return true;
};

export default loginJump;
