// src/controllers/hackathonController.js
import Hackathon from '../models/Hackathon.js';

// ─── 1. Saare hackathons lo ───
// GET /api/hackathons
export const getAllHackathons = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const hackathons = await Hackathon.find(filter)
      .sort({ deadline: 1 }) // deadline ke hisaab se sort
      .select('-registeredUsers'); // users list mat bhejo

    // Har hackathon mein check karo — current user registered hai?
    const userId = req.user?.id;
    const result = hackathons.map(h => ({
      ...h.toObject(),
      isRegistered: userId
        ? h.registeredUsers?.includes(userId)
        : false,
      registeredCount: h.registeredUsers?.length || 0,
    }));

    res.status(200).json({ success: true, hackathons: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 2. Register karo ───
// POST /api/hackathons/:id/register
export const registerHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const hackathon = await Hackathon.findById(id);

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon nahi mila' });
    }

    if (hackathon.status === 'closed') {
      return res.status(400).json({ message: 'Registration band ho gaya' });
    }

    // Already registered?
    if (hackathon.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'Pehle se register ho' });
    }

    // Register karo
    hackathon.registeredUsers.push(userId);
    hackathon.participants = hackathon.registeredUsers.length;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered! 🎉',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 3. Meri registrations ───
// GET /api/hackathons/my
export const getMyHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({
      registeredUsers: req.user.id,
    }).select('-registeredUsers');

    res.status(200).json({ success: true, hackathons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 4. Seed karo — demo data add karo ───
// POST /api/hackathons/seed  (sirf development mein)
export const seedHackathons = async (req, res) => {
  try {
    await Hackathon.deleteMany({});

    const demo = [
      {
        title: 'Smart India Hackathon 2025',
        organizer: 'Government of India',
        prize: '₹1,00,000',
        deadline: new Date('2025-08-15'),
        mode: 'Online + Offline',
        tags: ['AI', 'Healthcare', 'Education'],
        status: 'open',
        participants: 50000,
        registrationLink: 'https://sih.gov.in/',
      },
      {
        title: 'HackWithInfy',
        organizer: 'Infosys',
        prize: '₹5,00,000',
        deadline: new Date('2025-07-30'),
        mode: 'Online',
        tags: ['Web Dev', 'ML', 'Blockchain'],
        status: 'open',
        participants: 20000,
        registrationLink: 'https://infytq.onwingspan.com/en/page/hackwithinfy',
      },
      {
        title: 'TCS CodeVita',
        organizer: 'TCS',
        prize: 'Job + ₹2,00,000',
        deadline: new Date('2025-09-01'),
        mode: 'Online',
        tags: ['Algorithms', 'Problem Solving'],
        status: 'upcoming',
        participants: 300000,
        registrationLink: 'https://codevita.tcsapps.com/',
      },
      {
        title: 'Flipkart Grid 6.0',
        organizer: 'Flipkart',
        prize: '₹3,00,000',
        deadline: new Date('2025-08-01'),
        mode: 'Online + Offline',
        tags: ['E-Commerce', 'AI', 'Supply Chain'],
        status: 'open',
        participants: 100000,
        registrationLink: 'https://unstop.com/hackathons/flipkart-grid-60',
      },
    ];

    await Hackathon.insertMany(demo);
    res.status(200).json({ success: true, message: '4 hackathons seeded!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};