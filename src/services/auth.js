import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';
import createHttpError from 'http-errors';

import { FIFTEEN_MINUTES, THIRTY_DAYS, SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { sendEmail } from '../utils/sendMail.js';

const createSession = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
  refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
});

export const registerUser = async (payload) => {
  const existing = await UsersCollection.findOne({ email: payload.email });
  if (existing) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return UsersCollection.create({ ...payload, password: encryptedPassword });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(401, 'Unauthorized');

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) throw createHttpError(401, 'Unauthorized');

  await SessionsCollection.deleteOne({ userId: user._id });

  return SessionsCollection.create({ userId: user._id, ...createSession() });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({ _id: sessionId, refreshToken });
  if (!session) throw createHttpError(401, 'Session not found');

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return SessionsCollection.create({ userId: session.userId, ...createSession() });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '5m' },
  );

  const templateSource = (
    await fs.readFile(path.join(TEMPLATES_DIR, 'reset-password-email.html'))
  ).toString();

  const html = handlebars.compile(templateSource)({
    name: user.name,
    link: `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env[SMTP.SMTP_FROM],
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }
};

export const resetPassword = async ({ token, password }) => {
  let entries;
  try {
    entries = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findOne({ email: entries.email, _id: entries.sub });
  if (!user) throw createHttpError(404, 'User not found!');

  const encryptedPassword = await bcrypt.hash(password, 10);
  await UsersCollection.updateOne({ _id: user._id }, { password: encryptedPassword });
  await SessionsCollection.deleteOne({ userId: user._id });
};
