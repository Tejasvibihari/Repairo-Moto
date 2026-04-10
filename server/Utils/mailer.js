
import nodemailer from 'nodemailer';
import * as emailTemplates from './emailTemplates.js';

/**
 * Main email sending utility function
 * @param {Object} options - Email sending options
 * @param {String} options.to - Recipient email address
 * @param {String} options.subject - Email subject
 * @param {String} options.body - Email body (HTML)
 * @returns {Promise<Object>} Email sending result
 */
export const sendMail = async ({ to, subject, body }) => {
    try {
        // const transporter = nodemailer.createTransport({
        //     host: "smtpout.secureserver.net",
        //     port: 465,
        //     secure: true, // Use true for 465, false for other ports
        //     auth: {
        //         user: "contact@repairomoto.in", // GoDaddy email
        //         pass: "Heybro@11", // GoDaddy email password
        //     },
        // });
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use true for 465, false for other ports
            auth: {
                user: "librarysathi07@gmail.com", // GoDaddy email
                pass: "xbkmzwaqbbrejcsd", // GoDaddy email password
            },
        });

        const emailFormat = {
            from: '"Repairo Moto" <librarysathi07@gmail.com>', // Include a clear display name
            to: to,
            subject: subject,
            text: "Repairo Moto", // Consider adding a plaintext version of the email
            html: body,
            headers: {
                'X-Priority': '3', // Normal priority
            },
        };

        const info = await transporter.sendMail(emailFormat);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send welcome email to newly registered user
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} Success status
 */
export const sendWelcomeEmail = async ({ firstName, lastName, email, accountType, referralCode }) => {
    try {
        // Create email content using the template
        const emailSubject = "Welcome to Repairo Moto!";
        const emailBody = emailTemplates.welcomeEmailTemplate({ firstName, lastName, email, accountType, referralCode });

        // Send email
        await sendMail({
            to: email,
            subject: emailSubject,
            body: emailBody
        });

        console.log(`Welcome email sent to ${email}`);
        return true;

    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} resetToken - Password reset token
 * @returns {Promise<Boolean>} Success status
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found for password reset');
            return false;
        }

        // Create email content using the template
        const emailSubject = "Reset Your Password - Repairo Moto";
        const emailBody = emailTemplates.passwordResetTemplate(user, resetToken);

        // Send email
        await sendMail({
            to: user.email,
            subject: emailSubject,
            body: emailBody
        });

        console.log(`Password reset email sent to ${user.email}`);
        return true;

    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

/**
 * Send booking confirmation email
 * @param {String} userId - User ID
 * @param {Object} bookingDetails - Booking information
 * @returns {Promise<Boolean>} Success status
 */
export const sendBookingConfirmationEmail = async (newOrder, email) => {
    try {

        // Create email content using the template
        const emailSubject = "Booking Confirmation - Repairo Moto";
        const emailBody = emailTemplates.bookingConfirmationTemplate(newOrder);

        // Send email
        await sendMail({
            to: email,
            subject: emailSubject,
            body: emailBody
        });

        console.log(`Booking confirmation email sent to ${newOrder.email}`);
        return true;

    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return false;
    }
};

// Export additional email sending functions as needed

export const sendRefereeEmail = async (referee) => {
    try {

        // Create email content using the template
        const emailSubject = "🎉 Congratulations! You’ve Earned Reward Points - Repairo Moto";
        const emailBody = emailTemplates.referralPointsTemplate(referee);

        // Send email
        await sendMail({
            to: referee.email,
            subject: emailSubject,
            body: emailBody
        });

        console.log(`Email Sent to ${referee.email}`);
        return true;

    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return false;
    }
};
