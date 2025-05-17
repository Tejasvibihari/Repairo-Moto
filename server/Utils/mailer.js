import nodemailer from 'nodemailer'

export const sendMail = async ({ to, subject, body }) => {
    try {


        const transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true, // Use true for 465, false for other ports
            auth: {
                user: "admin@repairomoto.in", // GoDaddy email
                pass: "Heybro@11",       // GoDaddy email password
            },
        });

        const emailFormat = {
            from: '"Repairo Moto" <admin@repairomoto.in>', // Include a clear display name
            to: to,
            subject: subject,
            text: "Repairo Moto", // Consider adding a plaintext version of the email
            html: body,
            headers: {
                'X-Priority': '3', // Normal priority
            },
        };
        const info = await transporter.sendMail(emailFormat)
        console.log(info.messageId)

    } catch (error) {
        console.log(error)
    }
}