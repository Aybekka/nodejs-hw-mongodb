import { Router } from 'express';
import authRouter from './auth.js';
import contactsRouter from './contacts.js';

const router = Router();

router.use('/auth', authRouter);
router.use(contactsRouter);

export default router;
