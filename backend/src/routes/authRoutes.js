import express from 'express';
import {
  registerWithPin,
  loginWithPin,
  getMe,
  sendOTP,
  resetPin,
  updateProfile,
  uploadResumeController,
  uploadPhotoController,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {resumeUpload, photoUpload, handleUploadError } from '../middlewares/uploadMiddleware.js'
import { uploadResume, uploadPhoto } from '../services/uploadServices.js';
import User from '../models/user.js';


const router = express.Router();

//resume upload krne ke liye routes
router.post('/upload/resume',protect,resumeUpload,handleUploadError,
  async(req,res)=>{
    try{
const user=await User.findByIdAndUpdate(
  req.user.id,{
    resume:{
      url:req.file.path,
      publicId:req.file.filename
    },
  },
  {new:true}
).select('-password');

res.status(200).json({
        success: true,
        message: 'Resume upload ho gaya!',
        resume: user.resume,
      });

    }catch(error){
 res.status(500).json({ message: error.message });
    }
  }
);

//post or upload photo 
router.post('/upload/photo',protect,photoUpload,handleUploadError,
  async(req,res)=>{
    try{
const user=await User.findByIdAndUpdate(
  req.user.id,{
    photo:{
      url:req.file.path,
      publicId:req.file.filename,
    },
  },
  {new:true}
).select('-password');

 res.status(200).json({
        success: true,
        message: 'Photo upload ho gayi!',
        photo: user.photo,
      });
    }catch(error){
 res.status(500).json({ message: error.message });
    }
  }
);


router.post('/send-otp', sendOTP);
router.post('/register-pin', registerWithPin);
router.post('/login-pin', loginWithPin);
router.post('/reset-pin', resetPin);

router.get('/me', protect, getMe);

// Naye routes
router.put('/update-profile', protect, updateProfile);
router.post('/upload/resume', protect, uploadResume.single('resume'), uploadResumeController);
router.post('/upload/photo',  protect, uploadPhoto.single('photo'),   uploadPhotoController);

export default router;