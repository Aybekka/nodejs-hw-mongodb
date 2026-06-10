import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';

const transporter = nodemailer.createTransport({
  host: process.env[SMTP.SMTP_HOST],
  port: 465,
  secure: true,
  auth: {
    user: process.env[SMTP.SMTP_USER],
    pass: process.env[SMTP.SMTP_PASSWORD],
  },
});

export const sendEmail = async (options) => transporter.sendMail(options);
