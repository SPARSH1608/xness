"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

const UserContext = createContext({
  user: null,
  login: async (email, password) => {},
  signup: async (username, email, password, phone) => {},
  logout: () => {},
  loading: false,
  refreshUser: async () => {},
})

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPositions, setLoadingPositions] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || import.meta.env.BASE_API_URL || 'http://localhost:3000/api';

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({
          id: data.userId,
          username: data.username,
          balance: data.balance
        }))
        setUser({
          id: data.userId,
          username: data.username,
          balance: data.balance
        })
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (username, email, password, phone) => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, phone }),
      })
      
      const data = await response.json()
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshPositions = useCallback(async () => {
    setLoadingPositions(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/positions/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setPositions(data.positions || []);
    } finally {
      setLoadingPositions(false);
    }
  }, []);

  // Optionally, fetch positions when user logs in
  // useEffect(() => { if (user) refreshPositions(); }, [user, refreshPositions]);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      positions, 
      login, 
      signup, 
      logout, 
      loading, 
      loadingPositions, 
      refreshUser, 
      refreshPositions 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)