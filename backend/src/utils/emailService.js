const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    type: "SMTP",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GPASS,
    },
  });
};

const sendAlertEmail = async (alert, currentPrice) => {
  try {
    const transporter = createTransporter();

    const directionText = alert.direction === 'above' ? 'exceeded' : 'fallen below';
    const subject = `Stock Alert: ${alert.symbol} has ${directionText} ${alert.threshold}`;

    const htmlContent = `
      <h2>Stock Price Alert</h2>
      <p>Hello,</p>
      <p>This is an alert for the stock <strong>${alert.symbol}</strong>.</p>
      <p>The current price is <strong>$${currentPrice.toFixed(2)}</strong>.</p>
      <p>This price has ${directionText} your threshold of <strong>$${alert.threshold.toFixed(2)}</strong>.</p>
      <p>Thank you for using our Stock Index Values Tracker!</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL,
      to: alert.email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Alert email sent to ${alert.email} for ${alert.symbol}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
};

module.exports = {
  sendAlertEmail
}; 