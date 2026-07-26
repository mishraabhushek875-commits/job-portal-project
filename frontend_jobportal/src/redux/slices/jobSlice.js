import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  error: null,
  filters: {
    keyword: '',
    location: '',
    jobType: '',
  },
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {

    // ─── Saari Jobs Set Karo ───
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.loading = false;
    },

    // ─── Ek Job Select Karo ───
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },

    // ─── Loading ───
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // ─── Error ───
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // ─── Filters Set Karo ───
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setJobs, setSelectedJob, setLoading, setError, setFilters } = jobSlice.actions;
export default jobSlice.reducer;