import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';
import dns from 'dns';

// Fix for Render IPv6 ENETUNREACH error: Globally force DNS to resolve IPv4 first
dns.setDefaultResultOrder('ipv4first');

// ─── Transporter banao — Gmail se connect ───
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  family: 4, // 👈 FORCES IPv4
  localAddress: '0.0.0.0', // 👈 FORCES IPv4 socket, fixes (:::0) Local binding error on Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ─── SMTP VERIFY (DEBUG) ───
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR ❌:", error);
  } else {
    console.log("SMTP READY ✅");
  }
});

// ─── Base Email Bhejne Ka Function (via Brevo API) ───
const sendEmail = async (to, subject, html) => {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is missing in .env file. Please add it to Render dashboard too.");
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Job Portal", email: process.env.EMAIL_USER || "noreply@jobportal.com" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    console.log(`Email sent to: ${to} via Brevo API`);
  } catch (error) {
    console.error(`Email error: ${error.message}`);
    throw new Error(`Email bhejne me error aayi: ${error.message}`);
  }
};

// ─── 1. Application Confirmation — Jobseeker Ko ───
export const sendApplicationConfirmation = async (applicantEmail, applicantName, jobTitle, company) => {
  const subject = `Application Submitted — ${jobTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Application Submitted! 🎉</h2>
      <p>Namaste <strong>${applicantName}</strong>,</p>
      <p>Tumhari application successfully submit ho gayi hai!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #1f2937;">Job Details:</h3>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Status:</strong> Pending Review</p>
      </div>
      
      <p>Hum tumhe status update karte rahenge.</p>
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;
  
  await sendEmail(applicantEmail, subject, html);
};

// ─── 2. Status Change — Jobseeker Ko ───
export const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, status) => {
  const statusMessages = {
    reviewed: { text: 'Review Ho Rahi Hai 👀', color: '#f59e0b' },
    shortlisted: { text: 'Shortlist Ho Gaye! 🎉', color: '#10b981' },
    rejected: { text: 'Application Rejected', color: '#ef4444' },
  };

  const statusInfo = statusMessages[status];
  const subject = `Application Update — ${jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusInfo.color};">${statusInfo.text}</h2>
      <p>Namaste <strong>${applicantName}</strong>,</p>
      <p>Tumhari <strong>${jobTitle}</strong> application ka status update hua hai.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>New Status:</strong> 
          <span style="color: ${statusInfo.color}; font-weight: bold;">
            ${status.toUpperCase()}
          </span>
        </p>
      </div>
      
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;

  await sendEmail(applicantEmail, subject, html);
};

// ─── 3. New Application — Recruiter Ko ───
export const sendNewApplicationAlert = async (recruiterEmail, recruiterName, applicantName, jobTitle) => {
  const subject = `Naya Application — ${jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Naya Application Aaya! 📬</h2>
      <p>Namaste <strong>${recruiterName}</strong>,</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Applicant:</strong> ${applicantName}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
      </div>
      
      <p>Dashboard par jaake application dekho.</p>
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;

  await sendEmail(recruiterEmail, subject, html);
};


{/*
  +

## Upload Service — Multer + Cloudinary

### Cloudinary Kya Hai?
```
Cloudinary = Cloud par files store karne ki service

Local server par mat rakho files:
  ❌ Server restart → files delete!
  ❌ Multiple servers → files share nahi hongi

Cloudinary par rakho:
  ✅ Hamesha available
  ✅ URL milta hai — database mein save karo
  ✅ Free tier available!
```

### Cloudinary Account Banao
```
1. cloudinary.com par jao
2. Free account banao
3. Dashboard mein yeh copy karo:
   - Cloud Name
   - API Key
   - API Secret
```

### `.env` mein add karo:
```
CLOUDINARY_CLOUD_NAME=tumhara_cloud_name
CLOUDINARY_API_KEY=tumhari_api_key
CLOUDINARY_API_SECRET=tumhara_api_secret*/}

export const sendOTPEmail=async (email,otp)=>{
  const subject='job portal -Login OTP';

  const html=`
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Login OTP 🔐</h2>
      <p>your one time possword is :</p>
      
      <div style="background: #f3f4f6; padding: 30px; border-radius: 12px; 
                  text-align: center; margin: 20px 0;">
        <h1 style="color: #4f46e5; font-size: 48px; letter-spacing: 8px;">
          ${otp}
        </h1>
      </div>
      
      <p style="color: #ef4444;">
        ⚠️ This otp is valid for only 10 minutes!
      </p>
      <p style="color: #6b7280;">
        if you haven't requested this then ignore it .
      </p>
    </div>
  `;

  await sendEmail(email,subject,html);
}