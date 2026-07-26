import axios from "axios";

//_________Step 1:Base URL EK JAGHA_______//
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const api=axios.create({baseURL: API_URL});

// ─── Step 2: Interceptor ───
// Har request jaane se PEHLE yeh chalta hai

//ye tab chalte hai interceptro jab login krne baad frontend par sections me udhr uadhr kee hai dusri api cal krte hai tb

api.interceptors.request.use((config) => {
  // Yahan par request ke sath kuch additional data add kar sakte hain
  const token=localStorage.getItem("token"); // Token ko localStorage se le lo

     // Token hai toh header mein lagao
  if(token){
    config.headers.Authorization=`Bearer ${token}`; // Token ko Authorization header me add karo
  }
  return config;
},
(error)=>{
  // Agar request bhejne mein koi error aata hai toh yeh chalta hai
  console.error("Request error:", error);
  return Promise.reject(error);
}
);
/*
## Har Cheez Samjho

### Request Interceptor:
```
GET /api/jobs jaane wali thi
       ↓
Interceptor ne rokaa
       ↓
localStorage se token nikala:
"eyJhbGci..."
       ↓
Header mein lagaya:
Authorization: Bearer eyJhbGci...
       ↓
Ab request gayi backend par!
*/




// ─── Step 3: Response Interceptor ───
// Har response aane ke BAAD yeh chalta hai
api.interceptors.response.use(
  (response) => {
    return response; // Sahi response aaya — aage bhejo
  },
  (error) => {
    // 401 aaya matlab token expire ho gaya
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Login par bhejo
    }
    return Promise.reject(error);
  }
);

/*
### Response Interceptor:
```
Backend ne 401 bheja
matlab: "Token expire ho gaya!"
       ↓
Interceptor ne pakda
       ↓
localStorage saaf kiya
       ↓
User ko login page par bheja!

Automatically! Bina manually check kiye!
*/

export default api;



/* {
          
          step 1 — User Login Kiya
Rahul ne login kiya
Email + Password bheja
       ↓
Backend ne verify kiya
       ↓
Token mila:
"eyJhbGci..."
       ↓
Frontend ne localStorage mein save kiya:
localStorage.setItem('token', "eyJhbGci...")
          

-------------------------
Step 2 — Rahul Ne Jobs Dekhni Chahiye
javascript// Component mein likha:
const jobs = await api.get('/jobs');
```

---

### Step 3 — Axios Ne Config Banaya
```
api.get('/jobs') call hote hi
Axios ne andar se yeh banaya:

config = {
  url: '/jobs',
  method: 'GET',
  headers: {}    ← abhi khali hai!
}
```

---

### Step 4 — Interceptor Beech Mein Aaya
```
Request jaane se PEHLE
Interceptor ne config pakda!

config = {
  url: '/jobs',
  method: 'GET',
  headers: {}   ← khali tha
}

Interceptor ne kiya:
const token = localStorage.getItem('token')
// token = "eyJhbGci..."

config.headers.Authorization = "Bearer eyJhbGci..."

config ab aisa ho gaya:
{
  url: '/jobs',
  method: 'GET',
  headers: {
    Authorization: "Bearer eyJhbGci..." ← add ho gaya!
  }
}

return config ← request aage gayi!
```

---

### Step 5 — Request Backend Par Gayi
```
Yeh request gayi:

GET http://localhost:5000/api/jobs
Headers: {
  Authorization: "Bearer eyJhbGci..."
}
```

---

### Step 6 — Backend Par kya Hua?
```
Request aayi backend par
       ↓
jobRoutes.js ne pakda:
router.get('/', getAllJobs)
       ↓
Koi middleware nahi → seedha controller!
(getAllJobs public route hai)
       ↓
Jobs fetch huyi DB se
       ↓
Response aaya!
```

---

### Step 7 — Protected Route Ka Example
```
Ab Rahul ne apply karna chaha:

api.post('/applications/jobId', { coverLetter })
       ↓
Interceptor ne token lagaya:
Authorization: "Bearer eyJhbGci..."
       ↓
Request gayi backend par
       ↓
applicationRoutes.js:
router.post('/:jobId', protect, applyJob)
          ↑
     protect middleware hai!
       ↓
authMiddleware.js chala:

1. Header se token nikala:
   req.headers.authorization
   = "Bearer eyJhbGci..."
   
   token = "eyJhbGci..."

2. Token verify kiya:
   jwt.verify(token, JWT_SECRET)
   = { id: "69bc22fa..." }

3. DB se user dhunda:
   User.findById("69bc22fa...")
   = { name: "Rahul", role: "jobseeker" }

4. req.user mein rakha:
   req.user = { name: "Rahul", role: "jobseeker" }

5. next() call kiya — aage badho!
       ↓
applyJob controller chala:
req.user.id se pata chala kaun hai!
Application save hui!
       ↓
Response aaya: { success: true }
```

---

## Poora Flow Ek Jagah
```
FRONTEND:
Rahul login kiya
       ↓
Token localStorage mein save hua
       ↓
api.post('/applications/jobId') call kiya
       ↓
Interceptor ne token pakda localStorage se
       ↓
Header mein lagaya: Authorization: Bearer token
       ↓
Request gayi

─────────────────────────────────────

BACKEND:
Request aayi
       ↓
Route ne pakda
       ↓
protect middleware chala
       ↓
Header se token nikala
       ↓
jwt.verify se decode kiya
       ↓
User DB se dhunda
       ↓
req.user set kiya
       ↓
next() → Controller chala
       ↓
Kaam hua
       ↓
Response aaya

─────────────────────────────────────

FRONTEND:
Response mila
       ↓
Data show kiya user ko!
```

---

## Simple Words Mein
```
Token = Tumhara ID card

Login = ID card mila → localStorage mein rakha

Har request = Interceptor ne ID card nikala
              Header mein lagaya
              
Backend = ID card check kiya (protect middleware)
          Valid hai? → Andar aao!
          Invalid hai? → 401 error

          
          
          }


*/
