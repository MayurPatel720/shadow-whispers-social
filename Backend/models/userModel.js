// Backend/models/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: [true, "Please add your full name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', 
    },
  ],
  anonymousAlias: { type: String, unique: true },
  avatarEmoji: { type: String, default: "😎" },
  referralCode: { type: String, unique: true },
  referralCount: { type: Number, default: 0 },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  ghostCircles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GhostCircle",
    },
  ],
  recognizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  identityRecognizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bio: { type: String, default: "" },
  claimedRewards: [
    {
      tierLevel: { type: Number, required: true },
      rewardType: {
        type: String,
        enum: ["badge", "cash", "premium"],
        required: true,
      },
      rewardDescription: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
      claimedAt: { type: Date, default: Date.now },
      paymentDetails: { type: String }, // For Razorpay order ID
    },
  ],
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
