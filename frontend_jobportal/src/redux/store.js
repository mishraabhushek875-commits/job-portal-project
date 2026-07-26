import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import jobReducer from './slices/jobSlice.js';
import themeReducer from './slices/themeSlice.js'

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    theme:themeReducer,
  },
});

export default store;

/*

---

### Samjho — Store Kaise Kaam Karta Hai
```
store = {
  auth: {
    user: { name: "Rahul", role: "jobseeker" },
    token: "eyJhbGci...",
    isLoggedIn: true,
    loading: false,
    error: null
  },
  jobs: {
    jobs: [...],
    selectedJob: null,
    loading: false,
    filters: {}
  }
}

Component mein use karo:
const user = useSelector(state => state.auth.user)
const jobs = useSelector(state => state.jobs.jobs)

Action dispatch karo:
dispatch(loginSuccess({ user, token }))
dispatch(setJobs(jobsArray))
dispatch(logout())
*/