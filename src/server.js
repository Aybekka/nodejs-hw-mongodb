import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import contactsRouter from './routers/contacts.js';

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(pino());

  app.use(contactsRouter);

  app.use('*splat', notFoundHandler);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
