const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateSubscription,
} = require("../../controllers/auth");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user");

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(schemas.registerOrLoginSchema),
  registerUser
);

authRouter.post(
  "/login",
  validateBody(schemas.registerOrLoginSchema),
  loginUser
);

authRouter.get("/current", authenticate, getCurrentUser);

authRouter.post("/logout", authenticate, logoutUser);

authRouter.patch(
  "/users",
  authenticate,
  validateBody(schemas.subscriptionSchema),
  updateSubscription
);

module.exports = authRouter;
