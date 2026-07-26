import User from '../models/user.js';
import OtpModel from '../models/OtpModel.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../services/emailServices.js';

/*
=====================================
(eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyJ9.SIGNATURE
─────────────────────────────────────────────────
      Header          Payload      Signature

Header   → Konsa algorithm use hua (HS256)
Payload  → { id: "abc123" } — user ka ID
Signature → Secret key se bana — tamper-proof)======================================
Bank ne tumhe ek Token/Slip di — "Yeh banda verified hai"
        ↓
Ab tum bank ke kisi bhi kaam mein woh slip dikhao
        ↓
Bank ne slip check ki — valid hai ✅
        ↓
Kaam ho gaya — bina dobara password maange
======================================
Koi bhi Payload dekh sakta hai — yeh encoded hai, encrypted nahi
        ↓
Koi badmash ne payload badla — id: "admin123"
        ↓
Signature match nahi karega ← secret key sirf server ko pata hai
        ↓
Server reject kar dega ✅
*/

//generateToken — ek function jo userId lega aur token return karega

//____jwt token Banao _______//
const generateToken=(userId)=>{
  return jwt.sign(
    {id:userId},
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRE}
  );
};

//______REGISTER WITH PIN ________//
export const registerWithPin = async (req, res) => {
  try {
    const { name, email, pin, role, companyName, otp } = req.body;

    // 1. Check if email already registered
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ success: false, message: "User is already registered" });
    }

    // 2. Verify OTP
    const otpRecord = await OtpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 3. Create user (pin will be hashed automatically by pre-save hook)
    const user = await User.create({ 
      name, 
      email, 
      pin, 
      role, 
      companyName: role === 'recruiter' ? companyName : ''
    });

    // 4. Delete the OTP record so it can't be reused
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // 5. Generate token
    const token = generateToken(user._id);

    // 6. Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN WITH PIN ───
export const loginWithPin = async (req, res) => {
  try {
    const { email, pin } = req.body;
    console.log("📩 API HIT: /login-pin", req.body);

    // 1. User dhundo email se
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or PIN' });
    }

    // 1.5 Handle legacy users (no PIN set)
    if (!user.pin) {
      return res.status(403).json({ 
        success: false, 
        message: 'PIN not set', 
        action: 'REQUIRE_PIN_SETUP' 
      });
    }

    // 2. PIN check kro
    const isMatch = await user.matchPin(pin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or PIN' });
    }
    
    // 3. Token banao
    const token = generateToken(user._id);

    // 4. Response bhejo
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── GET PROFILE ───
// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user middleware se aayega — baad mein samjhenge
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
    

//____________otp Generate _________//

const generateOTP=()=>{
  return Math.floor(100000+Math.random()*900000).toString();
};


//____________otp send _________//
// POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    console.log("📩 API HIT: /send-otp");
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // OTP generate karo
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Remove any existing OTP for this email
    await OtpModel.deleteMany({ email });

    // Save new OTP in OtpModel (temporary storage)
    await OtpModel.create({
      email,
      otp
    });

    // Email bhejo 
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email!',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



//____________otp verify & reset pin _________//
export const resetPin = async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // OTP check karo
    const otpRecord = await OtpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update PIN (hashing is handled by pre-save)
    user.pin = newPin;
    await user.save();

    // Remove used OTP
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Login user immediately after reset
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'PIN reset successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── PROFILE UPDATE ───
// PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, location, linkedin, education, experience, skills, certifications } = req.body;

    // Sirf yeh fields update hogi — email aur password nahi
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, location, linkedin, education, experience, skills, certifications },
      { new: true, runValidators: true }  // updated document return karo
    ).select('-password');  // password mat bhejo

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── RESUME UPLOAD ───
// POST /api/auth/upload/resume
export const uploadResumeController = async (req, res) => {
  try {
    // multer ne file upload ki — req.file mein hai
    if (!req.file) {
      return res.status(400).json({ message: 'File upload nahi hui' });
    }

    // Cloudinary ne URL diya — req.file.path mein hoga
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'resume.url':      req.file.path,      // Cloudinary URL
        'resume.publicId': req.file.filename,  // delete ke liye
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      resume: user.resume,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PHOTO UPLOAD ───
// POST /api/auth/upload/photo
export const uploadPhotoController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo upload nahi hui' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'photo.url':      req.file.path,
        'photo.publicId': req.file.filename,
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      photo: user.photo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
