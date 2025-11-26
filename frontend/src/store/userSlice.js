import { createSlice } from '@reduxjs/toolkit';

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user,
  isAuthenticated: !!user,
  status: user ? 'succeeded' : 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'succeeded' : 'failed';
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      localStorage.removeItem('user');
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { setUser, logout, setAuthStatus } = userSlice.actions;
export default userSlice.reducer;
