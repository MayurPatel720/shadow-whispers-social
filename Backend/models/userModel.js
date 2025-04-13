
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please add your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
    bio: {
      type: String,
      default: '',
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', 
      },
    ],
    anonymousAlias: {
      type: String,
      default: '',
    },
    avatarEmoji: {
      type: String,
      default: '🎭',
    },
    clues: [
      {
        type: String,
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    ghostCircles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GhostCircle',
      },
    ],
    recognizedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        recognizedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    identityRecognizers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        recognizedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate random anonymous alias
userSchema.methods.generateAnonymousAlias = function () {
  const adjectives = [
    'Shadow', 'Neon', 'Phantom', 'Mystic', 'Ghost', 'Cosmic', 
    'Stealth', 'Hidden', 'Secret', 'Enigma', 'Veiled', 'Cryptic'
  ];
  
  const nouns = [
    'Fox', 'Wolf', 'Spirit', 'Specter', 'Raven', 'Whisperer',
    'Phantom', 'Ghost', 'Shadow', 'Guardian', 'Knight', 'Wanderer'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  this.anonymousAlias = `${randomAdjective}${randomNoun}`;
  return this.anonymousAlias;
};

module.exports = mongoose.model('User', userSchema);
