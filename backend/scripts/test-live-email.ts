import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function test() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('Testing SMTP with:');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('User:', user);
  console.log('Pass length:', pass ? pass.length : 0);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  console.log('Verifying connection...');
  await transporter.verify();
  console.log('Transporter verified successfully!');

  console.log('Sending test email to venkateshindla2612@gmail.com...');
  const info = await transporter.sendMail({
    from: `"GARUDA NDPS Platform" <${user}>`,
    to: 'venkateshindla2612@gmail.com',
    subject: 'GARUDA NDPS — Real SMTP Test',
    text: 'If you receive this, your Gmail SMTP configuration is working perfectly!',
  });

  console.log('Test email sent! MessageId:', info.messageId);
}

test().catch(console.error);
