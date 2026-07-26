import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    // ← typeof window check — server par crash nahi hoga
    mode: typeof window !== 'undefined' 
      ? localStorage.getItem('theme') || 'light'
      : 'light',
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.mode);
        document.documentElement.setAttribute('data-theme', state.mode);
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;