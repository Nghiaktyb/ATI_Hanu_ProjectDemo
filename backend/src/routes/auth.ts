import { dbClient } from "../db/mysql";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { signJwt } from "../utils/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await dbClient()("users").where({ email }).first();
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt({ sub: user.id, role: user.role, email: user.email });
    res.json({ token, role: user.role, email: user.email });
  } catch (e: any) {
    console.error('[/auth/login] Error:', e);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /auth/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await dbClient()("users").where({ email }).first();
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: "If an account exists with this email, a password reset token has been generated." });
    }

    // Generate reset token
    const resetToken = uuid().replace(/-/g, '');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing tokens for this email
    await dbClient()("password_reset_tokens").where({ email }).delete();

    // Create new reset token
    const tokenId = uuid();
    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const expiresAtMySQL = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    await dbClient()("password_reset_tokens").insert({
      id: tokenId,
      email,
      token: resetToken,
      expiresAt: expiresAtMySQL,
      used: false
    });

    console.log(`[Password Reset] Token generated for ${email}: ${resetToken}`);

    // In a real app, you would send this via email
    // For demo purposes, we return it in the response
    res.json({ 
      message: "Password reset token generated",
      resetToken: resetToken, // Only for demo - remove in production
      expiresAt: expiresAt.toISOString()
    });
  } catch (e: any) {
    console.error('[/auth/forgot-password] Error:', e);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// POST /auth/reset-password - Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Find the reset token
    const resetRecord = await dbClient()("password_reset_tokens")
      .where({ token, used: false })
      .first();

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    // Handle both MySQL datetime string and Date object
    const expiresAt = resetRecord.expiresAt instanceof Date 
      ? resetRecord.expiresAt 
      : new Date(resetRecord.expiresAt);
    if (new Date() > expiresAt) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await dbClient()("users")
      .where({ email: resetRecord.email })
      .update({ passwordHash });

    // Mark token as used
    await dbClient()("password_reset_tokens")
      .where({ id: resetRecord.id })
      .update({ used: true });

    console.log(`[Password Reset] Password reset successful for ${resetRecord.email}`);

    res.json({ message: "Password reset successfully" });
  } catch (e: any) {
    console.error('[/auth/reset-password] Error:', e);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
