import { useAuth0 } from '@auth0/auth0-vue';

export const auth0 = {
  isAuthenticated: async () => {
    const { isAuthenticated } = useAuth0();

    return new Promise<boolean>((resolve) => {
      if (isAuthenticated.value) resolve(true);
      else setTimeout(() => resolve(isAuthenticated.value), 300);
    });
  },
  loginWithRedirect: async () => {
    const { loginWithRedirect } = useAuth0();
    await loginWithRedirect();
  },
  logout: async () => {
    const { logout } = useAuth0();
    logout({ logoutParams: { returnTo: window.location.origin } });
  },
};
