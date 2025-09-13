import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // This is for initial app load only

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
          setUser(null);
          navigate("/authentication/sign-in");
        }
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login({ email, password });
      if (!userData || !userData.role) {
        throw new Error("Login successful but user data is missing role information.");
      }
      setUser(userData);
      toast.success(userData.message || "Inicio de sesión exitoso!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error de inicio de sesión.";
      toast.error(message);
      setUser(null);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, email, password, role) => {
    setLoading(true);
    try {
      const userData = await authService.register({ firstName, lastName, email, password, role });
      if (!userData || !userData.role) {
        throw new Error("Registration successful but user data is missing role information.");
      }
      setUser(userData);
      toast.success(userData.message || "Registro exitoso!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error de registro.";
      toast.error(message);
      setUser(null);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/authentication/sign-in");
  };

  // --- MODIFIED: Removed setLoading from this function ---
  const forgotPassword = useCallback(async (email) => {
    // This no longer uses the global loading state.
    // The component calling this function should manage its own loading spinner.
    try {
      const data = await authService.forgotPassword({ email });
      return { success: true, message: data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al enviar el correo de restablecimiento.";
      return { success: false, message };
    }
  }, []);

  // --- MODIFIED: Removed setLoading from this function ---
  const resetPassword = useCallback(async (token, newPassword) => {
    // This also no longer uses the global loading state.
    try {
      const data = await authService.resetPassword(token, { newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Error al restablecer la contraseña.";
      return { success: false, message };
    }
  }, []);

  const authContextValue = {
    user,
    loading, // This is now ONLY for the initial app load
    login,
    register,
    logout,
    isAuthenticated: !!user,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
