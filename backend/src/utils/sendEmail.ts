import nodemailer from 'nodemailer';

export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  try {
    // Create a SMTP transporter object using environment variables
    // host: the hostname or IP address of your email provider's SMTP server
    // port: the port number to use for the connection (e.g. 587 for most providers)
    // secure: whether to use a secure connection (true for port 465, false for other ports)
    // auth: an object containing the username and password to use for authentication
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });

    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
