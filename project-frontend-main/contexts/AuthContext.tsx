"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  signup as apiSignup,
  login as apiLogin,
  firebaseLogin as apiFirebaseLogin,
  googleSignup as apiGoogleSignup,
  getProfile,
  setAuthToken,
  removeAuthToken,
  type SignupData,
  type LoginData,
} from "@/lib/api";
import type { User } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (payload: {
    email: string;
    name: string;
    college: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; data?: SignupData; error?: string }>;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    data?: LoginData;
    error?: string;
  }>;
  signInWithGoogle: () => Promise<{
    success: boolean;
    data?: LoginData;
    error?: string;
    needsSignup?: boolean;
  }>;
  signupWithGoogle: (payload: {
    idToken: string;
    phone: string;
    college: string;
    password: string;
  }) => Promise<{ success: boolean; data?: SignupData; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const result = await getProfile();
      if (result.success && result.data) {
        setUser(result.data.user);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh profile when tab/window gains focus (e.g. after superadmin promoted this user to admin)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFocus = () => {
      const token = localStorage.getItem("authToken");
      if (token) loadProfile();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadProfile]);

  const clearError = useCallback(() => setError(null), []);

  const signup = useCallback(
    async (payload: {
      email: string;
      name: string;
      college: string;
      phone: string;
      password: string;
    }) => {
      setError(null);
      try {
        const data = await apiSignup(payload);
        if (data.success && data.data) {
          setAuthToken(data.data.token);
          setUser(data.data.user);
          return { success: true, data: data.data };
        }
        return { success: false, error: "Signup failed" };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Signup failed";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      if (data.success && data.data) {
        setAuthToken(data.data.token);
        setUser(data.data.user);
        return { success: true, data: data.data };
      }
      return { success: false, error: "Login failed" };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid email or password";
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const { getFirebaseAuth, getGoogleProvider } = await import("@/lib/firebase");
      const auth = getFirebaseAuth();
      if (!auth) {
        const msg = "Firebase is not configured. Add Firebase env vars.";
        setError(msg);
        return { success: false, error: msg };
      }
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await result.user.getIdToken();
      const data = await apiFirebaseLogin(idToken);
      if (data.success && data.data) {
        setAuthToken(data.data.token);
        setUser(data.data.user);
        return { success: true, data: data.data };
      }
      return { success: false, error: "Login failed" };
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 404) {
        const msg = "Account not found. Please sign up first.";
        setError(msg);
        return { success: false, error: msg, needsSignup: true };
      }
      const msg = err instanceof ApiError ? err.message : "Google sign-in failed";
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const signupWithGoogle = useCallback(
    async (payload: { idToken: string; phone: string; college: string; password: string }) => {
      setError(null);
      try {
        const data = await apiGoogleSignup(payload);
        if (data.success && data.data) {
          setAuthToken(data.data.token);
          setUser(data.data.user);
          return { success: true, data: data.data };
        }
        return { success: false, error: "Signup failed" };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Signup failed";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    []
  );

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await getProfile();
    if (result.success && result.data) setUser(result.data.user);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    login,
    signInWithGoogle,
    signupWithGoogle,
    logout,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
