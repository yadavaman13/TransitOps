import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import envConfig from './config/envConfig.js';
import { authRouter, userRouter } from './modules/auth/index.js';
import dashboardRouter from './modules/dashboard/index.js';
import vehicleRouter from './modules/vehicle/index.js';
import driverRouter from './modules/driver/index.js';
import tripRouter from './modules/trip/index.js';
import { errorHandler } from './modules/auth/middleware/errorHandler.js';

const app = express();

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: envConfig.CLIENT_ORIGINS,
        credentials: true,
    }),
);
app.use(morgan('combined'));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/trips', tripRouter);

// Centralized error handling
app.use(errorHandler);

export default app;