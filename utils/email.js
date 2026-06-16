const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) make a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_POST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) define email options
  const mailOptions = {
    from: 'Farooq Khan <farooqkhan@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
