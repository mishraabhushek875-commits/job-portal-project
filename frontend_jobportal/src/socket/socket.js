import { io } from 'socket.io-client';




/*Backend = Socket.io SERVER
           Sunta rehta hai connections ke liye

Frontend = Socket.io CLIENT
           Server se connect karta hai

Jaise:
Server = Phone tower
Client = Tumhara phone

Phone tower already laga hua hai (backend)
Tumhara phone connect karta hai (frontend)*/


const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
const socket = io(SOCKET_URL, {
  autoConnect: false, // ← Automatically connect mat karo!
});

export default socket;


/*

---

## `autoConnect: false` Kyun?
```
autoConnect: true hota toh:
  App khulte hi connect ho jaata
  User logged in bhi nahi hai abhi!
  Kisi ke room mein join nahi kar sakte
  Bina userId ke room join = useless!

autoConnect: false matlab:
  Jab user LOGIN kare
  Tab connect karo
  Tab room join karo userId se!
  */