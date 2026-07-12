import request from 'supertest';
import app from '../src/app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-credentials.json'), 'utf8'));

describe('TransitOps Modules 13-16 E2E Integration Test Suite', () => {
    jest.setTimeout(30000);
    let managerToken = '';
    let driverToken = '';
    let safetyToken = '';
    let testVehicleId = '';
    let testDocumentId = '';
    let testNotificationId = '';
    let analystToken = '';

    beforeAll(async () => {
        // Log in to retrieve authorization tokens
        const managerLogin = await request(app)
            .post('/api/auth/login')
            .send(credentials.fleetManager);
        
        const setCookie = managerLogin.headers['set-cookie'];
        if (setCookie && setCookie.length > 0) {
            const tokenMatch = setCookie[0].match(/token=([^;]+)/);
            if (tokenMatch) managerToken = tokenMatch[1];
        }

        const driverLogin = await request(app)
            .post('/api/auth/login')
            .send(credentials.driver);
        const setCookieDriver = driverLogin.headers['set-cookie'];
        if (setCookieDriver && setCookieDriver.length > 0) {
            const tokenMatch = setCookieDriver[0].match(/token=([^;]+)/);
            if (tokenMatch) driverToken = tokenMatch[1];
        }

        const safetyLogin = await request(app)
            .post('/api/auth/login')
            .send(credentials.safetyOfficer);
        const setCookieSafety = safetyLogin.headers['set-cookie'];
        if (setCookieSafety && setCookieSafety.length > 0) {
            const tokenMatch = setCookieSafety[0].match(/token=([^;]+)/);
            if (tokenMatch) safetyToken = tokenMatch[1];
        }

        const analystLogin = await request(app)
            .post('/api/auth/login')
            .send(credentials.financialAnalyst);
        const setCookieAnalyst = analystLogin.headers['set-cookie'];
        if (setCookieAnalyst && setCookieAnalyst.length > 0) {
            const tokenMatch = setCookieAnalyst[0].match(/token=([^;]+)/);
            if (tokenMatch) analystToken = tokenMatch[1];
        }
    });

    // ==========================================
    // 1. SETTINGS MODULE TESTS (Module 15)
    // ==========================================
    describe('Module 15 — Settings Preferences', () => {
        test('GET /api/settings - Should retrieve settings successfully', async () => {
            const res = await request(app)
                .get('/api/settings')
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.settings).toBeDefined();
        });

        test('PATCH /api/settings/theme - Should update theme to dark', async () => {
            const res = await request(app)
                .patch('/api/settings/theme')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ theme: 'dark' });
            expect(res.status).toBe(200);
            expect(res.body.data.settings.theme).toBe('dark');
        });

        test('PATCH /api/settings/fleet-rules - Should succeed for Fleet Manager', async () => {
            const res = await request(app)
                .patch('/api/settings/fleet-rules')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ licenseExpiryWarningDays: 45 });
            expect(res.status).toBe(200);
            expect(res.body.data.settings.fleetRules.licenseExpiryWarningDays).toBe(45);
        });

        test('PATCH /api/settings/fleet-rules - Should fail for Driver (403)', async () => {
            const res = await request(app)
                .patch('/api/settings/fleet-rules')
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ licenseExpiryWarningDays: 15 });
            expect(res.status).toBe(403);
        });
    });

    // ==========================================
    // 2. SEARCH MODULE TESTS (Module 16)
    // ==========================================
    describe('Module 16 — Search and Indexing', () => {
        test('GET /api/search - Should search globally for brand', async () => {
            const res = await request(app)
                .get('/api/search?q=Volvo')
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.vehicles.length).toBeGreaterThan(0);
            testVehicleId = res.body.data.vehicles[0].id;
        });

        test('GET /api/search/drivers - Should search for driver by name', async () => {
            const res = await request(app)
                .get('/api/search/drivers?q=Robert')
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.drivers.length).toBeGreaterThan(0);
        });
    });

    // ==========================================
    // 3. VEHICLE DOCUMENTS MODULE TESTS (Module 14)
    // ==========================================
    describe('Module 14 — Vehicle Document Management', () => {
        test('POST /api/vehicle-documents - Should upload RC successfully for manager', async () => {
            const res = await request(app)
                .post('/api/vehicle-documents')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    vehicleId: testVehicleId,
                    documentType: 'RC',
                    fileName: 'Volvo_FH16_RC_Jest.pdf',
                    filePath: '/documents/fleet/volvo_fh16_rc_jest.pdf',
                    fileSize: 204800
                });
            expect(res.status).toBe(201);
            expect(res.body.data.document.id).toBeDefined();
            testDocumentId = res.body.data.document.id;
        });

        test('POST /api/vehicle-documents - Should fail for Driver (403)', async () => {
            const res = await request(app)
                .post('/api/vehicle-documents')
                .set('Authorization', `Bearer ${driverToken}`)
                .send({
                    vehicleId: testVehicleId,
                    documentType: 'RC',
                    fileName: 'Driver_Hack_RC.pdf',
                    filePath: '/documents/fleet/hack.pdf',
                    fileSize: 102400
                });
            expect(res.status).toBe(403);
        });

        test('GET /api/vehicle-documents/:vehicleId - Should list documents for vehicle', async () => {
            const res = await request(app)
                .get(`/api/vehicle-documents/${testVehicleId}`)
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.documents.length).toBeGreaterThan(0);
        });

        test('GET /api/vehicle-documents/:id/download - Should get download reference info', async () => {
            const res = await request(app)
                .get(`/api/vehicle-documents/${testDocumentId}/download`)
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.fileName).toBe('Volvo_FH16_RC_Jest.pdf');
        });

        test('DELETE /api/vehicle-documents/:id - Should delete document reference', async () => {
            const res = await request(app)
                .delete(`/api/vehicle-documents/${testDocumentId}`)
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
        });
    });

    // ==========================================
    // 4. NOTIFICATIONS MODULE TESTS (Module 13)
    // ==========================================
    describe('Module 13 — Notifications and Reminders', () => {
        test('POST /api/notifications/license-reminder - Should run license verification successfully', async () => {
            const res = await request(app)
                .post('/api/notifications/license-reminder')
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('POST /api/notifications/license-reminder - Should fail for Driver (403)', async () => {
            const res = await request(app)
                .post('/api/notifications/license-reminder')
                .set('Authorization', `Bearer ${driverToken}`);
            expect(res.status).toBe(403);
        });

        test('GET /api/notifications - Should list notifications for user', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${managerToken}`);
            expect(res.status).toBe(200);
            if (res.body.data.notifications.length > 0) {
                testNotificationId = res.body.data.notifications[0].id;
            }
        });

        test('PATCH /api/notifications/:id/read - Should mark notification as read', async () => {
            if (testNotificationId) {
                const res = await request(app)
                    .patch(`/api/notifications/${testNotificationId}/read`)
                    .set('Authorization', `Bearer ${managerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.data.notification.isRead).toBe(true);
            }
        });

        test('DELETE /api/notifications/:id - Should delete notification alert', async () => {
            if (testNotificationId) {
                const res = await request(app)
                    .delete(`/api/notifications/${testNotificationId}`)
                    .set('Authorization', `Bearer ${managerToken}`);
                expect(res.status).toBe(200);
            }
        });
    });

    // ==========================================
    // 5. FINANCE PORTAL TESTS (Modules 8 & 9)
    // ==========================================
    describe('Modules 8 & 9 — Financial Analyst Portal', () => {
        test('GET /api/finance/dashboard - Should retrieve dashboard summary', async () => {
            const res = await request(app)
                .get('/api/finance/dashboard')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cards).toBeDefined();
        });

        test('GET /api/finance/expenses - Should retrieve expenses list', async () => {
            const res = await request(app)
                .get('/api/finance/expenses')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.expenses)).toBe(true);
        });

        test('GET /api/finance/fuel - Should retrieve fuel logs', async () => {
            const res = await request(app)
                .get('/api/finance/fuel')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.fuelLogs)).toBe(true);
        });

        test('GET /api/finance/reports - Should retrieve reports analytics', async () => {
            const res = await request(app)
                .get('/api/finance/reports')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.vehicleOperatingCosts).toBeDefined();
        });

        test('POST /api/finance/expenses - Should log a new manual expense', async () => {
            // First we need a vehicle ID to link
            const vehRes = await request(app)
                .get('/api/vehicles')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(vehRes.status).toBe(200);
            const vehicles = vehRes.body.data.vehicles || vehRes.body.data || [];
            
            if (vehicles.length > 0) {
                const targetVehicleId = vehicles[0].id;
                const expensePayload = {
                    vehicleId: targetVehicleId,
                    category: 'Toll',
                    amount: 45.50,
                    description: 'Highway toll charge for route verification',
                    receipt: 'https://receipts.com/toll-jest.pdf'
                };
                
                const res = await request(app)
                    .post('/api/finance/expenses')
                    .set('Authorization', `Bearer ${analystToken}`)
                    .send(expensePayload);
                expect(res.status).toBe(201);
                expect(res.body.success).toBe(true);
                expect(res.body.data.expense.amount).toBe("45.50"); // decimal string from pg
            }
        });

        test('GET /api/finance/dashboard - Should block unauthorized Driver role (403)', async () => {
            const res = await request(app)
                .get('/api/finance/dashboard')
                .set('Authorization', `Bearer ${driverToken}`);
            expect(res.status).toBe(403);
        });
    });
});
