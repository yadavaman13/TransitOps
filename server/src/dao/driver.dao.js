import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { driverProfiles } from '../db/schema/driver-profiles.schema.js';
import { eq, and } from 'drizzle-orm';

export async function createDriver(userData, profileData) {
    return await db.transaction(async (tx) => {
        const [user] = await tx.insert(users).values({
            ...userData,
            role: 'DRIVER', // We use 'DRIVER' as role name
            isActive: true,
            isDeleted: false,
        }).returning();

        const [profile] = await tx.insert(driverProfiles).values({
            ...profileData,
            userId: user.id,
            availabilityStatus: 'AVAILABLE',
        }).returning();

        return { ...user, profile };
    });
}

export async function getDriverById(userId) {
    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive,
            isDeleted: users.isDeleted,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            driverProfileId: driverProfiles.id,
            licenseNumber: driverProfiles.licenseNumber,
            licenseExpiry: driverProfiles.licenseExpiry,
            joiningDate: driverProfiles.joiningDate,
            phone: driverProfiles.phone,
            emergencyContact: driverProfiles.emergencyContact,
            bloodGroup: driverProfiles.bloodGroup,
            safetyScore: driverProfiles.safetyScore,
            experienceYears: driverProfiles.experienceYears,
            availabilityStatus: driverProfiles.availabilityStatus,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)));

    return rows[0] || null;
}

export async function getDriverByLicenseNumber(licenseNumber) {
    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            driverProfileId: driverProfiles.id,
            licenseNumber: driverProfiles.licenseNumber,
        })
        .from(driverProfiles)
        .leftJoin(users, eq(users.id, driverProfiles.userId))
        .where(eq(driverProfiles.licenseNumber, licenseNumber));

    return rows[0] || null;
}

export async function listDrivers() {
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive,
            isDeleted: users.isDeleted,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            driverProfileId: driverProfiles.id,
            licenseNumber: driverProfiles.licenseNumber,
            licenseExpiry: driverProfiles.licenseExpiry,
            joiningDate: driverProfiles.joiningDate,
            phone: driverProfiles.phone,
            emergencyContact: driverProfiles.emergencyContact,
            bloodGroup: driverProfiles.bloodGroup,
            safetyScore: driverProfiles.safetyScore,
            experienceYears: driverProfiles.experienceYears,
            availabilityStatus: driverProfiles.availabilityStatus,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(and(eq(users.role, 'DRIVER'), eq(users.isDeleted, false)));
}

export async function listAvailableDrivers() {
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive,
            isDeleted: users.isDeleted,
            role: users.role,
            driverProfileId: driverProfiles.id,
            licenseNumber: driverProfiles.licenseNumber,
            licenseExpiry: driverProfiles.licenseExpiry,
            availabilityStatus: driverProfiles.availabilityStatus,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(
            and(
                eq(users.role, 'DRIVER'),
                eq(users.isDeleted, false),
                eq(users.isActive, true),
                eq(driverProfiles.availabilityStatus, 'AVAILABLE')
            )
        );
}

export async function updateDriver(userId, userUpdates, profileUpdates) {
    return await db.transaction(async (tx) => {
        if (Object.keys(userUpdates).length > 0) {
            await tx.update(users)
                .set({ ...userUpdates, updatedAt: new Date() })
                .where(eq(users.id, userId));
        }

        if (Object.keys(profileUpdates).length > 0) {
            await tx.update(driverProfiles)
                .set({ ...profileUpdates, updatedAt: new Date() })
                .where(eq(driverProfiles.userId, userId));
        }

        // Fetch updated combined data
        const rows = await tx
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                isActive: users.isActive,
                isDeleted: users.isDeleted,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                driverProfileId: driverProfiles.id,
                licenseNumber: driverProfiles.licenseNumber,
                licenseExpiry: driverProfiles.licenseExpiry,
                joiningDate: driverProfiles.joiningDate,
                phone: driverProfiles.phone,
                emergencyContact: driverProfiles.emergencyContact,
                bloodGroup: driverProfiles.bloodGroup,
                safetyScore: driverProfiles.safetyScore,
                experienceYears: driverProfiles.experienceYears,
                availabilityStatus: driverProfiles.availabilityStatus,
            })
            .from(users)
            .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
            .where(eq(users.id, userId));

        return rows[0] || null;
    });
}

export async function updateDriverStatus(userId, status) {
    const [profile] = await db
        .update(driverProfiles)
        .set({ availabilityStatus: status, updatedAt: new Date() })
        .where(eq(driverProfiles.userId, userId))
        .returning();
    return profile || null;
}

export async function updateDriverLicense(userId, licenseNumber, licenseExpiry) {
    const [profile] = await db
        .update(driverProfiles)
        .set({ licenseNumber, licenseExpiry, updatedAt: new Date() })
        .where(eq(driverProfiles.userId, userId))
        .returning();
    return profile || null;
}

export async function updateDriverSafetyScore(userId, safetyScore) {
    const [profile] = await db
        .update(driverProfiles)
        .set({ safetyScore, updatedAt: new Date() })
        .where(eq(driverProfiles.userId, userId))
        .returning();
    return profile || null;
}
