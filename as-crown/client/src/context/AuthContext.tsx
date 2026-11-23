import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import type {
  ReactNode
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser
} from "../api/auth.api";

import type {
  RegisterData,
  LoginData
} from "../api/auth.api";

import type {
  User
} from "../types/auth";


interface AuthContextType {

  user: User | null;

  token: string | null;

  loading: boolean;

  isAuthenticated: boolean;

  login:
    (
      data: LoginData
    ) => Promise<void>;

  register:
    (
      data: RegisterData
    ) => Promise<void>;

  logout:
    () => void;

}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


const TOKEN_KEY =
  "as_crown_token";

const USER_KEY =
  "as_crown_user";


export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {

  const [
    user,
    setUser
  ] =
    useState<User | null>(
      () => {

        try {

          const stored =
            localStorage.getItem(
              USER_KEY
            );

          return stored
            ? JSON.parse(stored)
            : null;

        } catch {

          localStorage.removeItem(
            USER_KEY
          );

          return null;

        }

      }
    );


  const [
    token,
    setToken
  ] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_KEY
        )
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  useEffect(() => {

    let cancelled = false;


    async function loadUser() {

      if (!token) {

        if (!cancelled) {

          setUser(null);

          setLoading(false);

        }

        return;

      }


      try {

        const response =
          await getCurrentUser();


        const currentUser =
          response?.data?.user;


        if (!currentUser) {

          throw new Error(
            "Invalid user response"
          );

        }


        if (!cancelled) {

          setUser(
            currentUser
          );

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              currentUser
            )
          );

        }

      } catch {

        localStorage.removeItem(
          TOKEN_KEY
        );

        localStorage.removeItem(
          USER_KEY
        );


        if (!cancelled) {

          setToken(null);

          setUser(null);

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }


    loadUser();


    return () => {

      cancelled = true;

    };

  }, [token]);


  async function login(
    data: LoginData
  ) {

    const response =
      await loginUser(
        data
      );


    const newToken =
      response?.data?.token;

    const newUser =
      response?.data?.user;


    if (
      !newToken ||
      !newUser
    ) {

      throw new Error(
        "Invalid login response"
      );

    }


    localStorage.setItem(
      TOKEN_KEY,
      newToken
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        newUser
      )
    );


    setToken(
      newToken
    );

    setUser(
      newUser
    );

  }


  async function register(
    data: RegisterData
  ) {

    const response =
      await registerUser(
        data
      );


    const newToken =
      response?.data?.token;

    const newUser =
      response?.data?.user;


    if (
      !newToken ||
      !newUser
    ) {

      throw new Error(
        "Invalid registration response"
      );

    }


    localStorage.setItem(
      TOKEN_KEY,
      newToken
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        newUser
      )
    );


    setToken(
      newToken
    );

    setUser(
      newUser
    );

  }


  function logout() {

    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );


    setToken(null);

    setUser(null);

  }


  const value:
    AuthContextType = {

    user,

    token,

    loading,

    isAuthenticated:
      Boolean(
        token &&
        user
      ),

    login,

    register,

    logout

  };


  return (

    <AuthContext.Provider
      value={
        value
      }
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}