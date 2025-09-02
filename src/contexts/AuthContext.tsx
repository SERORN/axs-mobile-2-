import React, { createContext, useContext, useState } from "react";

interface AuthContextProps {
  token: string | null;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  setToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
