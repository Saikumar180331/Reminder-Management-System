
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function getStoredData(key) {
  try {
    const data =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() =>
    getStoredData("currentAdmin")
  );

  // ADMIN REGISTRATION
  const register = async (email, password, confirmPassword) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            confirm_password: confirmPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Registration failed."
        };
      }

      return {
        success: true,
        message: result.message
      };

    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        message: "Unable to connect to the server."
      };
    }
  };


  // ADMIN LOGIN
  const login = async (email, password, rememberMe) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Login failed."
        };
      }

      localStorage.removeItem("currentAdmin");
      sessionStorage.removeItem("currentAdmin");

      if (rememberMe) {
        localStorage.setItem(
          "currentAdmin",
          JSON.stringify(result.admin)
        );
      } else {
        sessionStorage.setItem(
          "currentAdmin",
          JSON.stringify(result.admin)
        );
      }

      setUser(result.admin);

      return {
        success: true,
        message: result.message
      };

    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: "Unable to connect to the server."
      };
    }
  };


  // ADMIN LOGOUT
  const logout = () => {
    localStorage.removeItem("currentAdmin");
    sessionStorage.removeItem("currentAdmin");

    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
