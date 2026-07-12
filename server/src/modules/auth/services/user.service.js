import bcrypt from 'bcryptjs';
import { 
    getUserById, 
    updateUser, 
    softDeleteUser, 
    listUsers,
    getUserByEmail,
    createUser
} from '../../../dao/user.dao.js';
import { AppError } from '../utils/appError.js';
import { generatePassword } from '../../../utils/password-generator.utils.js';
import { sendEmail } from '../../../services/mail/mail.service.js';

/**
 * Update current user profile
 * @param {string} userId
 * @param {object} updates name, email
 * @returns {object} updated user
 */
export async function updateProfile(userId, { name, email, phone, profileImage }) {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const user = await updateUser(userId, updates);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

/**
 * Change current user password
 * @param {string} userId
 * @param {object} param1 currentPassword, newPassword
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
    const user = await getUserById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await updateUser(userId, { password: hashedPassword });
}

/**
 * Soft delete own user account
 * @param {string} userId
 */
export async function deleteAccount(userId) {
    const user = await softDeleteUser(userId);
    if (!user) {
        throw new AppError('User not found or already deleted', 404);
    }
    return user;
}

/**
 * Get user by id (Admin helper)
 * @param {string} id
 */
export async function adminGetUserById(id) {
    const user = await getUserById(id, true);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

/**
 * List users (Admin helper)
 * @param {boolean} includeDeleted
 */
export async function adminListUsers(includeDeleted = false) {
    return listUsers(includeDeleted);
}

/**
 * Change a user's role (Admin helper)
 * @param {string} targetUserId
 * @param {string} newRole
 */
export async function adminUpdateRole(targetUserId, newRole) {
    const user = await updateUser(targetUserId, { role: newRole });
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

/**
 * Soft delete user by ID (Admin helper)
 * @param {string} targetUserId
 */
export async function adminDeleteUser(targetUserId) {
    const user = await softDeleteUser(targetUserId);
    if (!user) {
        throw new AppError('User not found or already deleted', 404);
    }
    return user;
}

/**
 * Create a new Safety Officer user and email credentials
 * @param {object} param0 name, email
 */
export async function createSafetyOfficer({ name, email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
        throw new AppError('Email is already registered', 400);
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'SAFETY_OFFICER',
        emailVerified: true,
        isActive: true,
        isDeleted: false,
    });

    // Send email with credentials
    const subject = 'Your TransitOps Safety Officer Account Credentials';
    const html = `
        <h3>Welcome to TransitOps</h3>
        <p>Hi ${name},</p>
        <p>Your Safety Officer account has been created successfully.</p>
        <p>Here are your login credentials:</p>
        <ul>
            <li><strong>Email:</strong> ${normalizedEmail}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
        </ul>
        <p>Please log in and update your password.</p>
    `;
    try {
        await sendEmail({ to: normalizedEmail, subject, html });
    } catch (mailError) {
        console.error('Failed to send Safety Officer credential email:', mailError);
    }

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
        credentials: {
            email: user.email,
            password: plainPassword,
        }
    };
}

/**
 * Create a new Financial Analyst user and email credentials
 * @param {object} param0 name, email
 */
export async function createFinancialAnalyst({ name, email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
        throw new AppError('Email is already registered', 400);
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'FINANCIAL_ANALYST',
        emailVerified: true,
        isActive: true,
        isDeleted: false,
    });

    // Send email with credentials
    const subject = 'Your TransitOps Financial Analyst Account Credentials';
    const html = `
        <h3>Welcome to TransitOps</h3>
        <p>Hi ${name},</p>
        <p>Your Financial Analyst account has been created successfully.</p>
        <p>Here are your login credentials:</p>
        <ul>
            <li><strong>Email:</strong> ${normalizedEmail}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
        </ul>
        <p>Please log in and update your password.</p>
    `;
    try {
        await sendEmail({ to: normalizedEmail, subject, html });
    } catch (mailError) {
        console.error('Failed to send Financial Analyst credential email:', mailError);
    }

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
        credentials: {
            email: user.email,
            password: plainPassword,
        }
    };
}

