import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, ADMIN_EMAIL } from "./firebase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL;

  const value = {
    user,
    loading,
    isAdmin,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    register: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return cred;
    },
    loginWithGoogle: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
