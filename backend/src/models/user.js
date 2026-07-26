import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema= new mongoose.Schema({


name:{
   type: String,
      required: [true, 'Naam zaroori hai'],
      trim: true,

},
email:{
  type:String,
  required:[true,'Email zarori hai'],
  unique:true,
  lowercase:true,
  trim:true,

},
pin:{
  type: String,
  required: [true, 'PIN zaroori hai'],
},
companyName: {
  type: String,
  default: '',
},
role:{
 type: String,
      enum: ['jobseeker', 'recruiter'],
      default: 'jobseeker',
},
// Existing fields ke baad add karo
resume: {
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
},
photo: {
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
},
otp:{
code: { type: String, default: null },
  expiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
},
location: {
  type: String,
  default: '',
},
linkedin: {
  type: String,
  default: '',
},
education: [{
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, required: true },
  grade: { type: String }
}],
experience: [{
  title: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String }
}],
skills: [{ type: String }],
certifications: [{
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  year: { type: String }
}]
},
{

  timestamps:true,//creatAt aur updateAt automatic ban jayega
}
);

//pin save hone se phle encrypt kro --
userSchema.pre('save',async function(){//agar pin change nhi hua hai to skip krdo
  if(!this.isModified('pin'))
     return ;

  //pin ko hash karo 
  const salt=await bcrypt.genSalt(10);

  this.pin=await bcrypt.hash(this.pin,salt );

}
);

// ─── Login Mein PIN Check Karne Ka Method ───
userSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};


const User = mongoose.model('User', userSchema);

export default User;
