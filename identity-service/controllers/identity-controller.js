const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration, validatelogin } = require("../utils/validation");

//user registration
const resgiterUser = async (req, res) => {
    logger.info("Registration endpoint hit...");
    try {
      //validate the schema
      const { error } = validateRegistration(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const { email, password, username } = req.body;
  
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        logger.warn("User already exists");
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
  
      user = new User({ username, email, password });
      await user.save();
      logger.warn("User saved successfully", user._id);
  
      const { accessToken, refreshToken } = await generateTokens(user);
  
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        accessToken,
        refreshToken,
      });
    } catch (e) {
      logger.error("Registration error occured", e);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  //user login
const loginUser = async (req, res) => {
  logger.info("Login endpoint hit...");
  try {
    const { error } = validatelogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // user valid password or not
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (e) {
    logger.error("Login error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//refresh token
const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn("Refresh token missing");
    return res.status(400).json({ success: false, message: "Refresh token missing" });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    // console.log(storedToken);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({ accessToken, refreshToken: newRefreshToken });

  } catch (error) {
    logger.error("Error refreshing token", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//logout user
const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn("Refresh token missing");
    return res.status(400).json({ success: false, message: "Refresh token missing" });
  }

  try {
    const deleted = await RefreshToken.findOneAndDelete({ token: refreshToken });

    if (!deleted) {
      logger.warn("Invalid refresh token");
      return res.status(400).json({ success: false, message: "Invalid refresh token" });
    }

    logger.info("User logged out successfully");
    res.json({ success: true, message: "Logged out successfully!" });

  } catch (error) {
    logger.error("Error during logout", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


  module.exports = { resgiterUser , loginUser , refreshTokenUser , logoutUser };  