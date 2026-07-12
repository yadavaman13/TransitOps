import * as driverDao from '../../../dao/driver.dao.js';
import { getUserByEmail, softDeleteUser } from '../../../dao/user.dao.js';
import { db } from '../../../config/database.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { driverProfiles } from '../../../db/schema/driver-profiles.schema.js';
import { AppError } from '../../auth/utils/appError.js';
import bcrypt from 'bcryptjs';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { generatePassword } from '../../../utils/password-generator.utils.js';
import { sendEmail } from '../../../services/mail/mail.service.js';


export async function registerDriver(data) {
    const { name, email, phone, licenseNumber, licenseExpiry, emergencyContact, bloodGroup, experienceYears } = data;

    // Validate email uniqueness
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new AppError('Driver email must be unique', 400);
    }

    // Validate license uniqueness
    const existingLicense = await driverDao.getDriverByLicenseNumber(licenseNumber);
    if (existingLicense) {
        throw new AppError('Driver license number must be unique', 400);
    }

    // Validate license not expired
    const expiryDate = new Date(licenseExpiry);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        throw new AppError('Driver license must not be expired before dispatch', 400);
    }

    // Generate random password automatically
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const userData = {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
    };

    const profileData = {
        licenseNumber,
        licenseExpiry: expiryDate,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        phone,
        emergencyContact,
        bloodGroup,
        experienceYears: experienceYears ? Number(experienceYears) : 0,
    };

    const result = await driverDao.createDriver(userData, profileData);

    // Send email with credentials
    const subject = 'Your TransitOps Driver Account Credentials';
    const html = `
        <h3>Welcome to TransitOps</h3>
        <p>Hi ${name},</p>
        <p>Your Driver account has been created successfully.</p>
        <p>Here are your login credentials:</p>
        <ul>
            <li><strong>Email:</strong> ${email.trim().toLowerCase()}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
        </ul>
        <p>Please log in and update your password.</p>
    `;
    try {
        await sendEmail({ to: email.trim().toLowerCase(), subject, html });
    } catch (mailError) {
        console.error('Failed to send Driver credential email:', mailError);
    }

    return {
        driver: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            createdAt: result.createdAt,
            profile: result.profile,
        },
        credentials: {
            email: result.email,
            password: plainPassword, // Show generated credentials
        }
    };
}

export async function getDrivers() {
    return driverDao.listDrivers();
}

export async function getDriverDetails(id) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }
    return driver;
}

export async function updateDriver(id, updates) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    const userUpdates = {};
    const profileUpdates = {};

    if (updates.name) userUpdates.name = updates.name;
    if (updates.email && updates.email !== driver.email) {
        const existing = await getUserByEmail(updates.email);
        if (existing) {
            throw new AppError('Driver email must be unique', 400);
        }
        userUpdates.email = updates.email;
    }

    if (updates.licenseNumber && updates.licenseNumber !== driver.licenseNumber) {
        const existing = await driverDao.getDriverByLicenseNumber(updates.licenseNumber);
        if (existing) {
            throw new AppError('Driver license number must be unique', 400);
        }
        profileUpdates.licenseNumber = updates.licenseNumber;
    }

    if (updates.licenseExpiry) {
        const expiryDate = new Date(updates.licenseExpiry);
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
            throw new AppError('Driver license must not be expired', 400);
        }
        profileUpdates.licenseExpiry = expiryDate;
    }

    if (updates.phone) profileUpdates.phone = updates.phone;
    if (updates.emergencyContact) profileUpdates.emergencyContact = updates.emergencyContact;
    if (updates.bloodGroup) profileUpdates.bloodGroup = updates.bloodGroup;
    if (updates.experienceYears !== undefined) profileUpdates.experienceYears = Number(updates.experienceYears);

    return driverDao.updateDriver(id, userUpdates, profileUpdates);
}

export async function deleteDriver(id) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    // Check active trips
    const activeTrips = await db
        .select()
        .from(trips)
        .where(
            and(
                eq(trips.driverId, id),
                inArray(trips.status, ['DRAFT', 'DISPATCHED', 'STARTED'])
            )
        )
        .limit(1);

    if (activeTrips.length > 0) {
        throw new AppError('Deleted Driver cannot have active trips', 400);
    }

    return softDeleteUser(id);
}

export async function getAvailableDrivers() {
    return driverDao.listAvailableDrivers();
}

export async function updateDriverStatus(id, status) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    const validStatuses = ['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status update', 400);
    }

    // Business Rule: A driver cannot be suspended if they have active trips
    if (status === 'SUSPENDED') {
        const activeTrips = await db
            .select()
            .from(trips)
            .where(
                and(
                    eq(trips.driverId, id),
                    inArray(trips.status, ['DRAFT', 'DISPATCHED', 'STARTED'])
                )
            )
            .limit(1);

        if (activeTrips.length > 0) {
            throw new AppError('Driver has active trips and cannot be suspended. Complete or cancel active trips first.', 400);
        }
    }

    return driverDao.updateDriverStatus(id, status);
}

export async function updateDriverLicense(id, licenseNumber, licenseExpiry) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    const existing = await driverDao.getDriverByLicenseNumber(licenseNumber);
    if (existing && existing.id !== id) {
        throw new AppError('Driver license number must be unique', 400);
    }

    const expiryDate = new Date(licenseExpiry);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        throw new AppError('Driver license must not be expired', 400);
    }

    return driverDao.updateDriverLicense(id, licenseNumber, expiryDate);
}

export async function updateDriverSafetyScore(id, safetyScore) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    const score = Number(safetyScore);
    if (isNaN(score) || score < 0 || score > 100) {
        throw new AppError('Driver safety score must be between 0 and 100', 400);
    }

    return driverDao.updateDriverSafetyScore(id, String(score));
}

export async function suspendDriver(id) {
    return updateDriverStatus(id, 'SUSPENDED');
}

export async function activateDriver(id) {
    return updateDriverStatus(id, 'AVAILABLE');
}

export async function getDriverTrips(id) {
    const driver = await driverDao.getDriverById(id);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }
    return db.select().from(trips).where(eq(trips.driverId, id));
}

export async function getExpiringLicenses() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            licenseNumber: driverProfiles.licenseNumber,
            licenseExpiry: driverProfiles.licenseExpiry,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(
            and(
                eq(users.role, 'DRIVER'),
                eq(users.isDeleted, false),
                sql`${driverProfiles.licenseExpiry} >= ${now} AND ${driverProfiles.licenseExpiry} <= ${thirtyDaysFromNow}`
            )
        );
}
