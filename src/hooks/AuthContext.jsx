import { createContext, useContext } from 'react';
import { useDemoData } from '../context/DemoDataContext';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    updateEmail,
    updateProfile,
    changePassword,
  } = useDemoData();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signIn,
        signUp,
        signOut,
        updateEmail,
        updateProfile,
        changePassword,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
