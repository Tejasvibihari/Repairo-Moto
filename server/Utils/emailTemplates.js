// File: src/templates/emailTemplates.js

/**
 * Email template collection for Repairo Moto application
 * Contains reusable email templates for various notifications
 */

/**
 * Welcome email template for new users
 * @param {Object} user - User object containing user details
 * @returns {String} HTML email template with user data inserted
 */
export const welcomeEmailTemplate = ({ firstName, lastName, email, accountType, referralCode }) => {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Repairo Moto</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #ffffff;
              border-radius: 5px 5px 0 0;
          }
          .header img {
              max-width: 150px;
              height: auto;
          }
          .content {
              padding: 30px 20px;
              background-color: #ffffff;
          }
          .welcome-message {
              margin-bottom: 25px;
          }
          .welcome-message h2 {
              color: #e2a731;
              margin-bottom: 15px;
          }
          .credentials {
              background-color: #f9f9f9;
              border-left: 4px solid #e2a731;
              padding: 15px;
              margin-bottom: 25px;
          }
          .credentials p {
              margin-bottom: 10px;
          }
          .credentials strong {
              color: #e2a731;
          }
          .warning {
              font-size: 12px;
              color: #ff6b6b;
              margin-bottom: 25px;
          }
          .cta-button {
              text-align: center;
              margin: 30px 0;
          }
          .cta-button a {
              display: inline-block;
              padding: 12px 25px;
              background-color: #e2a731;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 14px;
          }
          .features {
              margin: 25px 0;
          }
          .feature {
              margin-bottom: 15px;
              display: flex;
              align-items: flex-start;
          }
          .feature-icon {
              width: 40px;
              height: 40px;
              background-color: #e3f2fd;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              color: #e2a731;
              font-size: 18px;
              font-weight: bold;
          }
          .feature-content h4 {
              color: #e2a731;
              margin-bottom: 5px;
          }
          .social-links {
              text-align: center;
              margin-top: 30px;
          }
          .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #e2a731;
              text-decoration: none;
          }
          .footer {
              text-align: center;
              padding: 20px 0;
              color: #888;
              font-size: 12px;
              border-top: 1px solid #eee;
          }
          .contact-info {
              margin-top: 15px;
          }
          .contact-info p {
              margin-bottom: 5px;
          }
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100%;
                  padding: 10px;
              }
              .content {
                  padding: 20px 15px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://repairomoto.in/logo/logo150.png" alt="Repairo Moto Logo" onerror="this.src=''; this.alt='Repairo Moto';" style="color: white; font-weight: bold; font-size: 24px;">
          </div>
          
          <div class="content">
              <div class="welcome-message">
                  <h2>Welcome to Repairo Moto!</h2>
                  <p>Dear ${firstName} ${lastName},</p>
                  <p>Thank you for joining Repairo Moto! We're excited to have you as part of our community. Your account has been successfully created and is now ready to use.</p>
              </div>
              
              <div class="credentials">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Your Referral Code:</strong> ${referralCode}</p>
                  <p><strong>Account Type:</strong> ${accountType}</p>
              </div>
              
              <div class="warning">
                  <p>*For security reasons, we don't include your password in emails. If you need to reset your password, please use the "Forgot Password" option on our login page.</p>
              </div>
              
              <div class="cta-button">
                  <a href="https://repairomoto.in/user-signin">LOGIN TO YOUR ACCOUNT</a>
              </div>
              
              <div class="features">
                  <h3>What you can do with your Repairo Moto account:</h3>
                  
                  <div class="feature">
                      <div class="feature-icon">1</div>
                      <div class="feature-content">
                          <h4>Book Repairs</h4>
                          <p>Schedule motorcycle repairs and maintenance with qualified mechanics in your area.</p>
                      </div>
                  </div>
                  
                  <div class="feature">
                      <div class="feature-icon">2</div>
                      <div class="feature-content">
                          <h4>Track Service Status</h4>
                          <p>Get real-time updates on your motorcycle repair status.</p>
                      </div>
                  </div>
                  
                  <div class="feature">
                      <div class="feature-icon">3</div>
                      <div class="feature-content">
                          <h4>Refer & Earn</h4>
                          <p>Share your referral code with friends and earn rewards when they sign up.</p>
                      </div>
                  </div>
              </div>
              
              <p>If you have any questions or need assistance, our customer support team is ready to help you.</p>
              
              <div class="social-links">
                  <p>Follow us on:</p>
                  <a href="https://www.facebook.com/share/1D4UWBzREr/">Facebook</a> | 
                  <a href="https://www.instagram.com/repairomoto">Instagram</a> | 
                  <a href="https://x.com/Repairomoto">Twitter</a>
              </div>
          </div>
          
          <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <div class="contact-info">
                  <p>© 2025 Repairo Moto. All rights reserved.</p>
                  <p>Contact: contact@repairomoto.in | Phone: +91 6205731150</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
};

/**
 * Password reset email template
 * @param {Object} user - User object containing user details
 * @param {String} resetToken - Token for password reset
 * @returns {String} HTML email template with reset link
 */
export const passwordResetTemplate = (user, resetToken) => {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Repairo Moto</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #ffffff;
              border-radius: 5px 5px 0 0;
          }
          .header img {
              max-width: 150px;
              height: auto;
          }
          .content {
              padding: 30px 20px;
              background-color: #ffffff;
          }
          h2 {
              color: #e2a731;
              margin-bottom: 15px;
          }
          .reset-button {
              text-align: center;
              margin: 30px 0;
          }
          .reset-button a {
              display: inline-block;
              padding: 12px 25px;
              background-color: #e2a731;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 14px;
          }
          .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 25px 0;
          }
          .footer {
              text-align: center;
              padding: 20px 0;
              color: #888;
              font-size: 12px;
              border-top: 1px solid #eee;
          }
          .contact-info {
              margin-top: 15px;
          }
          .contact-info p {
              margin-bottom: 5px;
          }
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100%;
                  padding: 10px;
              }
              .content {
                  padding: 20px 15px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://repairomoto.in/logo.png" alt="Repairo Moto Logo" onerror="this.src=''; this.alt='Repairo Moto';" style="color: white; font-weight: bold; font-size: 24px;">
          </div>
          
          <div class="content">
              <h2>Reset Your Password</h2>
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>We received a request to reset your password for your Repairo Moto account. Click the button below to create a new password:</p>
              
              <div class="reset-button">
                  <a href="https://repairomoto.in/reset-password/${resetToken}">RESET MY PASSWORD</a>
              </div>
              
              <p>If you did not request this password reset, please ignore this email or contact our support team if you have concerns.</p>
              
              <div class="warning">
                  <p><strong>Important:</strong> This password reset link will expire in 24 hours for security reasons.</p>
              </div>
              
              <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
              <p style="word-break: break-all; font-size: 12px;">https://repairomoto.in/reset-password/${resetToken}</p>
          </div>
          
          <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <div class="contact-info">
                  <p>© 2025 Repairo Moto. All rights reserved.</p>
                  <p>Contact: support@repairomoto.in | Phone: +91 6205731150</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
};

/**
 * Booking confirmation email template
 * @param {Object} user - User object containing user details
 * @param {Object} booking - Booking details
 * @returns {String} HTML email template with booking confirmation
 */
export const bookingConfirmationTemplate = (order) => {
    const {
        orderId,
        name,
        contactNo,
        email,
        city,
        selectedBrand,
        selectedModel,
        modelName,
        cc,
        bs,
        services,
        otherService,
        preferredDate,
        preferredTime,
        estimatedBudget,
        issues
    } = order;

    // Format services array into readable string
    const servicesList = services.join(', ');

    // Format date for display
    const formattedDate = new Date(preferredDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Repairo Moto</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #ffffff;
              border-radius: 5px 5px 0 0;
          }
          .header img {
              max-width: 150px;
              height: auto;
          }
          .content {
              padding: 30px 20px;
              background-color: #ffffff;
          }
          h2 {
              color: #e2a731;
              margin-bottom: 15px;
          }
          .booking-details {
              background-color: #f9f9f9;
              border-left: 4px solid #e2a731;
              padding: 15px;
              margin: 25px 0;
          }
          .booking-details h3 {
              color: #e2a731;
              margin-bottom: 10px;
          }
          .booking-details p {
              margin-bottom: 8px;
          }
          .booking-details strong {
              color: #e2a731;
          }
          .track-button {
              text-align: center;
              margin: 30px 0;
          }
          .track-button a {
              display: inline-block;
              padding: 12px 25px;
              background-color: #e2a731;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 14px;
          }
          .footer {
              text-align: center;
              padding: 20px 0;
              color: #888;
              font-size: 12px;
              border-top: 1px solid #eee;
          }
          .contact-info {
              margin-top: 15px;
          }
          .contact-info p {
              margin-bottom: 5px;
          }
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100%;
                  padding: 10px;
              }
              .content {
                  padding: 20px 15px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://repairomoto.in/logo/logo150.png" alt="Repairo Moto Logo" onerror="this.src=''; this.alt='Repairo Moto';" style="color: white; font-weight: bold; font-size: 24px;">
          </div>
          
          <div class="content">
              <h2>Booking Confirmation</h2>
              <p>Dear ${name},</p>
              <p>Thank you for booking with Repairo Moto. Your service request has been confirmed and is scheduled as follows:</p>
              
              <div class="booking-details">
                  <h3>Booking Details</h3>
                  <p><strong>Booking ID:</strong> ${orderId}</p>
                  <p><strong>Contact:</strong> ${contactNo}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>City:</strong> ${city}</p>
                  
                  <h3>Vehicle Information</h3>
                  <p><strong>Brand:</strong> ${selectedBrand}</p>
                  <p><strong>Model:</strong> ${selectedModel} ${modelName || ''}</p>
                  <p><strong>Engine:</strong> ${cc}cc${bs ? `, BS${bs}` : ''}</p>
                  
                  <h3>Service Information</h3>
                  <p><strong>Services Requested:</strong> ${servicesList}</p>
                  ${otherService ? `<p><strong>Other Services:</strong> ${otherService}</p>` : ''}
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${preferredTime}</p>
                  <p><strong>Estimated Budget:</strong> ₹${estimatedBudget || 'To be determined'}</p>
                  ${issues ? `<p><strong>Issues Reported:</strong> ${issues}</p>` : ''}
                  <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Pending</span></p>
              </div>
              
              <p>Our service professional will contact you shortly before the scheduled time.</p>
              
              <div class="track-button">
                  <a href="https://repairomoto.in/user-allbooking">TRACK YOUR BOOKING</a>
              </div>
              
              <p>If you need to reschedule or cancel your booking, please do so at least 12 hours in advance through your account or by contacting our customer support team.</p>
          </div>
          
          <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <div class="contact-info">
                  <p>© 2025 Repairo Moto. All rights reserved.</p>
                  <p>Contact: support@repairomoto.in | Phone: +91 6205731150</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
};

// You can add more email templates as needed
// Examples might include:
// - Order confirmation
// - Service completed notification
// - Payment receipt
// - Subscription renewal
// - Special promotions