import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For production, you'd use a real email service
    // For now, we'll use ethereal email for testing
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: '"Bible Study Hub" <noreply@biblestudyhub.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log('Email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Bible Study Hub!</h1>
        <p>Dear ${fullName},</p>
        <p>Thank you for joining Bible Study Hub. We're excited to have you on this journey of spiritual growth and learning.</p>
        <h2>What's Next?</h2>
        <ul>
          <li>🔍 Explore our comprehensive Bible study lessons</li>
          <li>📖 Track your progress as you complete lessons</li>
          <li>🔖 Bookmark your favorite content for later</li>
          <li>📝 Take notes and reflect on your learning</li>
        </ul>
        <p>Start your journey by browsing our "People of God in the Bible" series, featuring inspiring stories of faith from Abraham, Moses, and other biblical figures.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Start Learning
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Blessings,<br>
          The Bible Study Hub Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Bible Study Hub - Your Journey Begins!',
      html,
      text: `Welcome to Bible Study Hub, ${fullName}! Thank you for joining us on this journey of spiritual growth and learning.`
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>You requested a password reset for your Bible Study Hub account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, please ignore this email.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link: ${resetUrl}
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - Bible Study Hub',
      html,
      text: `Password reset requested. Visit: ${resetUrl}`
    });
  }
}