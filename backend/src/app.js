import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api/v1', apiRouter);

  // TODO: central error middleware and 404 handler should be registered here.
  return app;
};
