// src/models/Hackathon.js
import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  organizer:    { type: String, required: true },
  description:  { type: String, default: '' },
  prize:        { type: String, default: '' },
  deadline:     { type: Date,   required: true },
  mode:         {
    type: String,
    enum: ['Online', 'Offline', 'Online + Offline'],
    default: 'Online',
  },
  tags:         [String],
  maxTeamSize:  { type: Number, default: 4 },
  participants: { type: Number, default: 0 },
  registrationLink: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'upcoming', 'closed'],
    default: 'open',
  },
  // Kaun kaun register kiya
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

export default mongoose.model('Hackathon', hackathonSchema);