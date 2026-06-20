
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// ── Transporter (created once at startup, not per-request) ──────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password (not your login password)
  },
});

// Verify connection once on startup so you catch bad credentials early
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail transporter error:', error.message);
  } else {
    console.log('✅ Mail transporter ready');
  }
});

// ── Contact route ───────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  // Match the fields your frontend actually sends
  const { name, email, service, scope, message } = req.body;

  // ── Input validation ──
  if (!name || !email || !service || !scope || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address.',
    });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Message must be at least 10 characters.',
    });
  }

  // ── Mail options ──
  const mailOptions = {
    // 'from' MUST be your authenticated Gmail — not the client's email.
    // Put the client's email in replyTo so you can reply directly to them.
    from: `"ZenithLogic Website" <${process.env.EMAIL_USER}>`,
    replyTo: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: `New Project Inquiry — ${service}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;
                  padding: 24px; background-color: #070b15; color: #fff;
                  border-radius: 12px;">

        <h2 style="color: #00ffcc; border-bottom: 1px solid rgba(255,255,255,0.1);
                   padding-bottom: 12px; margin-top: 0;">
          New Project Inquiry — ZenithLogic Solutions
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5);
                       width: 130px; font-size: 13px;">Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Email</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${escapeHtml(email)}"
                 style="color: #00ffcc; text-decoration: none;">${escapeHtml(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Service</td>
            <td style="padding: 8px 0;">${escapeHtml(service)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Budget</td>
            <td style="padding: 8px 0;">${escapeHtml(scope)}</td>
          </tr>
        </table>

        <div style="background-color: #0c1322; padding: 16px;
                    border-left: 4px solid #00ffcc;
                    border-radius: 4px; margin-top: 8px;">
          <p style="margin: 0; line-height: 1.7; font-size: 15px;">
            ${escapeHtml(message).replace(/\n/g, '<br>')}
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 12px;
                  color: rgba(255,255,255,0.25); text-align: center;">
          Sent via zenithlogicsolutions.com contact form
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Nodemailer send error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────────
// Prevent XSS if the email HTML is ever viewed in a browser
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});