import React, { useEffect } from 'react';
import MainRoute from "./MainRoute";
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUser, setAuthStatus } from './store/userSlice.js';

const App = () => {
  const dispatch = useDispatch();
  const { status } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(setAuthStatus('loading'));
    axios.get('https://chat-gpt-clone-vdwd.onrender.com/api/auth/me', { withCredentials: true })
      .then(res => {
        dispatch(setUser(res.data.user));
      })
      .catch(() => {
        dispatch(setAuthStatus('failed'));
      });
  }, [dispatch]);

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div>
      <MainRoute />
    </div>
  )
}

export default App;
