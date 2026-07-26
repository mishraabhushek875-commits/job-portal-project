import { createSlice } from '@reduxjs/toolkit';

// ─── localStorage safely read karo ───
const getFromStorage = (key) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const initialState = {
  user: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || 'null') 
    : null,
  token: getFromStorage('token'),
  isLoggedIn: !!getFromStorage('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { loginSuccess, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;