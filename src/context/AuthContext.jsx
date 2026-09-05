import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext(null);

const API_URL = `${
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
}/api/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK CURRENT USER
  // =====================================================

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data.message || "Authentication failed"
          );
        }

        return data;
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // =====================================================
  // SIGN UP
  // =====================================================

  const signup = async (formData) => {
    const res = await fetch(
      `${API_URL}/signup`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || "Signup failed"
      );
    }

    localStorage.setItem(
      "token",
      data.token
    );

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
    email,
    password
  ) => {
    const res = await fetch(
      `${API_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    localStorage.setItem(
      "token",
      data.token
    );

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  // =====================================================
  // FORGOT PASSWORD
  // POST /api/auth/forgot-password
  // =====================================================

  const forgotPassword = async (email) => {
    const res = await fetch(
      `${API_URL}/forgot-password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Unable to process password reset request"
      );
    }

    return data;
  };

  // =====================================================
  // RESET PASSWORD
  // POST /api/auth/reset-password
  // =====================================================

  const resetPassword = async (
    resetToken,
    password
  ) => {
    const res = await fetch(
      `${API_URL}/reset-password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token: resetToken,
          password,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Unable to reset password"
      );
    }

    return data;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        signup,
        login,

        forgotPassword,
        resetPassword,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}