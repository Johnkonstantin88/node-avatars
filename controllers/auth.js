const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({ email: newUser.email });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Wrong email or password");
  }

  const comparedPassword = await bcrypt.compare(password, user.password);

  if (!comparedPassword) {
    throw HttpError(401, "Wrong email or password");
  }

  const { SECRET_KEY } = process.env;
  const payload = { id: user._id };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const getCurrentUser = (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logoutUser = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: null });

  res.json({ message: "Logged out" });
};

const updateSubscription = async (req, res) => {
  const { subscription: newSubscription } = req.body;
  const { _id, subscription } = req.user;
  if (subscription === newSubscription) {
    throw HttpError(400, "You already have this subscription");
  }
  await User.findByIdAndUpdate(_id, {
    subscription: newSubscription,
  });

  res.json({
    message: `subscription changed on ${newSubscription}`,
  });
};

module.exports = {
  registerUser: ctrlWrapper(registerUser),
  loginUser: ctrlWrapper(loginUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  logoutUser: ctrlWrapper(logoutUser),
  updateSubscription: ctrlWrapper(updateSubscription),
};
