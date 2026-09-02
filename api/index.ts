import express from 'express';
import cookieParser from 'cookie-parser';
import { initDatabase } from '../server/db.js';
import { apiRouter } from '../server/routes.js';

const app = express();

const databaseReady = initDatabase();
app.use(async (_req, _res, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', tournament: 'BGMI SHOWDOWN', time: new Date().toISOString() });
});

app.use('/api', apiRouter);

export default app;
