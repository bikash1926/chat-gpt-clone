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
    const checkAuth = async () => {
      dispatch(setAuthStatus('loading'));
      try {
        const { data } = await axios.get('/api/auth/me');
        dispatch(setUser(data));
      } catch (error) {
        dispatch(setUser(null));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (status === 'loading' || status === 'idle') {
    return null;
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
