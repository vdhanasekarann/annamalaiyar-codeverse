import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    apiFetch("/api/auth/me")
      .then(r=> r.ok ? r.json() : null)
      .then(setUser)
      .finally(()=>setLoading(false));
  },[]);

  return (
    <AuthContext.Provider value={{user,setUser,loading}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = ()=> useContext(AuthContext);
