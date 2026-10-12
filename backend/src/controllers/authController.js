import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../middleware/auth.js";
import { isDbConnected } from "../config/db.js";

// In-memory store used only when DEV_MOCK_STORAGE=true and MongoDB is offline
const memoryUsers = new Map();

function checkDatabase(res) {
  if (!isDbConnected() && process.env.DEV_MOCK_STORAGE !== "true") {
    res.status(503).json({
      success: false,
      message:
        "MongoDB is not currently connected. Please configure a valid MONGODB_URI in backend/.env, or set DEV_MOCK_STORAGE=true for offline testing.",
    });
    return false;
  }
  return true;
}

export async function register(req, res) {
  if (!checkDatabase(res)) return;

  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: "An account with this email address already exists.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const mockId = "mock_" + Date.now();
      const mockUser = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : "",
        password: hashedPassword,
        authProvider: "local",
        isEmailVerified: false,
        isPhoneVerified: false,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryUsers.set(normalizedEmail, mockUser);
      const token = generateToken(mockId);
      const { password: _, ...publicProfile } = mockUser;

      return res.status(201).json({
        success: true,
        message: "User registered successfully (In-memory dev mode).",
        token,
        user: publicProfile,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.authProvider !== "local") {
        return res.status(409).json({
          success: false,
          message: `An account already exists using ${existingUser.authProvider}. Please sign in with ${existingUser.authProvider}.`,
        });
      }
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : "",
      password,
      authProvider: "local",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("[Auth Register Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please check your inputs.",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  if (!checkDatabase(res)) return;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      const mockUser = memoryUsers.get(normalizedEmail);
      if (!mockUser) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken(mockUser._id);
      const { password: _, ...publicProfile } = mockUser;

      return res.status(200).json({
        success: true,
        message: "Login successful (In-memory dev mode).",
        token,
        user: publicProfile,
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.authProvider !== "local" && !user.password) {
      return res.status(400).json({
        success: false,
        message: `This account uses Continue with ${user.authProvider}. Please sign in with ${user.authProvider}.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("[Auth Login Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
}

export async function continueWithGoogle(req, res) {
  if (!checkDatabase(res)) return;

  try {
    const { googleId, email, name, avatar, phone } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "googleId and email are required for Google authentication.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      let mockUser = memoryUsers.get(normalizedEmail);
      if (!mockUser) {
        const mockId = "mock_g_" + Date.now();
        mockUser = {
          _id: mockId,
          id: mockId,
          name: name ? name.trim() : normalizedEmail.split("@")[0],
          email: normalizedEmail,
          phone: phone ? phone.trim() : "",
          googleId,
          avatar: avatar || "",
          authProvider: "google",
          isEmailVerified: true,
          isPhoneVerified: false,
          role: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryUsers.set(normalizedEmail, mockUser);
      } else {
        mockUser.googleId = googleId;
        if (avatar) mockUser.avatar = avatar;
        if (phone && !mockUser.phone) mockUser.phone = phone.trim();
        mockUser.isEmailVerified = true;
      }

      const token = generateToken(mockUser._id);
      const { password: _, ...publicProfile } = mockUser;

      return res.status(200).json({
        success: true,
        message: "Google authentication successful (In-memory dev mode).",
        token,
        user: publicProfile,
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (phone && !user.phone) {
        user.phone = phone.trim();
        modified = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name ? name.trim() : normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: phone ? phone.trim() : "",
        googleId,
        avatar: avatar || "",
        authProvider: "google",
        isEmailVerified: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("[Google Auth Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed.",
      error: error.message,
    });
  }
}

export async function continueWithApple(req, res) {
  if (!checkDatabase(res)) return;

  try {
    const { appleId, email, name, phone } = req.body;

    if (!appleId) {
      return res.status(400).json({
        success: false,
        message: "appleId is required for Apple authentication.",
      });
    }

    if (!isDbConnected()) {
      const generatedEmail = email
        ? email.toLowerCase().trim()
        : `${appleId}@privaterelay.appleid.com`;

      let mockUser = memoryUsers.get(generatedEmail);
      if (!mockUser) {
        const mockId = "mock_a_" + Date.now();
        mockUser = {
          _id: mockId,
          id: mockId,
          name: name ? name.trim() : "Apple User",
          email: generatedEmail,
          phone: phone ? phone.trim() : "",
          appleId,
          authProvider: "apple",
          isEmailVerified: true,
          isPhoneVerified: false,
          role: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryUsers.set(generatedEmail, mockUser);
      }

      const token = generateToken(mockUser._id);
      const { password: _, ...publicProfile } = mockUser;

      return res.status(200).json({
        success: true,
        message: "Apple authentication successful (In-memory dev mode).",
        token,
        user: publicProfile,
      });
    }

    const query = [{ appleId }];
    if (email) {
      query.push({ email: email.toLowerCase().trim() });
    }

    let user = await User.findOne({ $or: query });

    if (user) {
      let modified = false;
      if (!user.appleId) {
        user.appleId = appleId;
        modified = true;
      }
      if (name && !user.name) {
        user.name = name.trim();
        modified = true;
      }
      if (phone && !user.phone) {
        user.phone = phone.trim();
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      const generatedEmail = email
        ? email.toLowerCase().trim()
        : `${appleId}@privaterelay.appleid.com`;

      user = await User.create({
        name: name ? name.trim() : "Apple User",
        email: generatedEmail,
        phone: phone ? phone.trim() : "",
        appleId,
        authProvider: "apple",
        isEmailVerified: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Apple authentication successful.",
      token,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("[Apple Auth Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Apple authentication failed.",
      error: error.message,
    });
  }
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user.toPublicProfile ? req.user.toPublicProfile() : req.user,
  });
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;

    if (user.save) {
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toPublicProfile ? user.toPublicProfile() : user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
}
