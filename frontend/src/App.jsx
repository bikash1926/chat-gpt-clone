import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setUser, setAuthStatus } from './store/userSlice';

import Home from './page/Home';
import Login from './page/Login';
import Register from './page/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.user);

  useEffect(() => {
    // Ensure all requests use the same backend and include cookies
    axios.defaults.baseURL = 'https://chat-gpt-clone-vdwd.onrender.com';
    axios.defaults.withCredentials = true;

    const checkAuth = async () => {
      dispatch(setAuthStatus('loading'));
      try {
        const { data } = await axios.get('/auth/me');
        // Expect shape { user: {...} } from backend
        dispatch(setUser(data.user || null));
      } catch (error) {
        // Do NOT immediately clear user on network/CORS errors to avoid logout flicker
        // Just mark status failed; ProtectedRoute will keep user if already set
        dispatch(setAuthStatus('failed'));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
