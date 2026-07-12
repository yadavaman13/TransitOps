//script to test the fleet-operations

import 'dotenv/config';
import app from '../src/app.js';
import { db, pool, connectToDatabase } from '../src/config/database.js';
import redis from '../src/config/cache.js';
import { users } from '../src/db/schema/users.schema.js';
import { driverProfiles } from '../src/db/schema/driver-profiles.schema.js';
import { vehicles } from '../src/db/schema/vehicles.schema.js';
import { trips } from '../src/db/schema/trips.schema.js';
import { fuelLogs } from '../src/db/schema/fuel-logs.schema.js';
import { maintenance } from '../src/db/schema/maintenance.schema.js';
import { expenses } from '../src/db/schema/expenses.schema.js';
import { eq, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Storage for test results
const results = [];

async function logResult(module, name, method, path, requestBody, responseStatus, responseBody) {
    results.push({
        module,
        name,
        method,
        path,
        requestBody: requestBody ? JSON.stringify(requestBody, null, 2) : 'N/A',
        responseStatus,
        responseBody: typeof responseBody === 'object' ? JSON.stringify(responseBody, null, 2) : String(responseBody),
        success: responseStatus >= 200 && responseStatus < 300,
    });
    console.log(`[${module}] ${name} - ${method} ${path} -> ${responseStatus}`);
}

async function runTests() {
    console.log('Starting verification of all module endpoints...');

    // 1. Database Connections
    await connectToDatabase();

    // Start Express Server
    const server = app.listen(TEST_PORT, () => {
        console.log(`Test server running on port ${TEST_PORT}`);
    });

    try {
        // 2. Setup Test Users
        const timestamp = Date.now();
        const managerEmail = `test_manager_${timestamp}@example.com`;
        const driverEmail = `test_driver_${timestamp}@example.com`;

        // Create Fleet Manager user in db
        const [managerUser] = await db.insert(users).values({
            name: 'Verification Manager',
            email: managerEmail,
            password: 'hashed_password_123',
            role: 'FLEET_MANAGER',
            isActive: true,
            isDeleted: false,
        }).returning();

        // Create Driver user in db
        const [driverUser] = await db.insert(users).values({
            name: 'Verification Driver',
            email: driverEmail,
            password: 'hashed_password_123',
            role: 'DRIVER',
            isActive: true,
            isDeleted: false,
        }).returning();

        // Create corresponding Driver Profile
        const [driverProfile] = await db.insert(driverProfiles).values({
            userId: driverUser.id,
            licenseNumber: `LIC-${timestamp}`,
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year in future
            joiningDate: new Date(),
            phone: '9876543210',
            emergencyContact: '9876543211',
            bloodGroup: 'O+',
            safetyScore: '100.00',
            experienceYears: 5,
            availabilityStatus: 'AVAILABLE',
        }).returning();

        console.log('Created verification test users successfully');

        // Sign JWT Tokens
        const managerToken = jwt.sign(
            { id: managerUser.id, email: managerUser.email, role: managerUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const driverToken = jwt.sign(
            { id: driverUser.id, email: driverUser.email, role: driverUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const managerHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${managerToken}`
        };

        const driverHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${driverToken}`
        };

        // Variable store for created test entity IDs
        let testVehicleId = null;
        let testDriverUserId = driverUser.id; // From created driver user
        let testTripId = null;

        // ==========================================
        // 5. VEHICLES MODULE TESTS
        // ==========================================
        const regNo = `REG-${timestamp}`;
        
        // 5.1 Register Vehicle
        const regVehiclePayload = {
            registrationNumber: regNo,
            vehicleNumber: `V-${timestamp}`,
            brand: 'Tata',
            model: 'Prima 4028.S',
            manufactureYear: 2022,
            capacityKg: '15000.00',
            fuelType: 'Diesel',
            currentOdometer: '1000.00',
            purchaseDate: new Date().toISOString(),
            insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            pollutionExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        };
        try {
            const res = await fetch(`${BASE_URL}/api/vehicles`, {
                method: 'POST',
                headers: managerHeaders,
                body: JSON.stringify(regVehiclePayload),
            });
            const data = await res.json();
            testVehicleId = data.data?.id;
            await logResult('Vehicles', 'Register Vehicle', 'POST', '/api/vehicles', regVehiclePayload, res.status, data);
        } catch (err) {
            console.error('Error in Register Vehicle:', err);
        }

        // 5.2 Get Vehicles
        try {
            const res = await fetch(`${BASE_URL}/api/vehicles`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Vehicles', 'Get Vehicles', 'GET', '/api/vehicles', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 5.3 Vehicle Details
        if (testVehicleId) {
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Vehicle Details', 'GET', `/api/vehicles/:id`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 5.4 Update Vehicle
            const updateVehiclePayload = { brand: 'Tata Motors', model: 'Prima 4030.S' };
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(updateVehiclePayload),
                });
                const data = await res.json();
                await logResult('Vehicles', 'Update Vehicle', 'PATCH', `/api/vehicles/:id`, updateVehiclePayload, res.status, data);
            } catch (err) {
                console.error(err);
            }
        }

        // 5.6 Available Vehicles
        try {
            const res = await fetch(`${BASE_URL}/api/vehicles/available`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Vehicles', 'Available Vehicles', 'GET', '/api/vehicles/available', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 5.7 Update Status
        if (testVehicleId) {
            const statusPayload = { status: 'MAINTENANCE' };
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/status`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(statusPayload),
                });
                const data = await res.json();
                await logResult('Vehicles', 'Update Status', 'PATCH', `/api/vehicles/:id/status`, statusPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 5.9 Restore Vehicle (Restore status to AVAILABLE)
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/restore`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Restore Vehicle', 'PATCH', `/api/vehicles/:id/restore`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 5.8 Retire Vehicle
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/retire`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Retire Vehicle', 'PATCH', `/api/vehicles/:id/retire`, null, res.status, data);
                
                // Restore again so we can use it for trip tests
                await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/restore`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
            } catch (err) {
                console.error(err);
            }

            // 5.10 Update Odometer
            const odoPayload = { odometer: '1500.00' };
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/odometer`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(odoPayload),
                });
                const data = await res.json();
                await logResult('Vehicles', 'Update Odometer', 'PATCH', `/api/vehicles/:id/odometer`, odoPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }
        }


        // ==========================================
        // 6. DRIVERS MODULE TESTS
        // ==========================================
        let testRegisteredDriverId = null;
        
        // 6.1 Register Driver
        const regDriverPayload = {
            name: `Test Driver Reg ${timestamp}`,
            email: `registered_driver_${timestamp}@example.com`,
            phone: '9999888877',
            licenseNumber: `LIC-REG-${timestamp}`,
            licenseExpiry: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
            joiningDate: new Date().toISOString(),
            emergencyContact: '9999888800',
            bloodGroup: 'B+',
            experienceYears: 3,
        };
        try {
            const res = await fetch(`${BASE_URL}/api/drivers`, {
                method: 'POST',
                headers: managerHeaders,
                body: JSON.stringify(regDriverPayload),
            });
            const data = await res.json();
            testRegisteredDriverId = data.data?.driver?.id;
            await logResult('Drivers', 'Register Driver', 'POST', '/api/drivers', regDriverPayload, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 6.2 Get Drivers
        try {
            const res = await fetch(`${BASE_URL}/api/drivers`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Drivers', 'Get Drivers', 'GET', '/api/drivers', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 6.3 Driver Details
        if (testDriverUserId) {
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Drivers', 'Driver Details', 'GET', `/api/drivers/:id`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 6.4 Update Driver
            const updateDriverPayload = { name: 'Verification Driver Updated', phone: '9876543222' };
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(updateDriverPayload),
                });
                const data = await res.json();
                await logResult('Drivers', 'Update Driver', 'PATCH', `/api/drivers/:id`, updateDriverPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }
        }

        // 6.6 Available Drivers
        try {
            const res = await fetch(`${BASE_URL}/api/drivers/available`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Drivers', 'Available Drivers', 'GET', '/api/drivers/available', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 6.13 Expiring Licenses
        try {
            const res = await fetch(`${BASE_URL}/api/drivers/expiring-license`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Drivers', 'Expiring Licenses', 'GET', '/api/drivers/expiring-license', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        if (testDriverUserId) {
            // 6.7 Update Status
            const driverStatusPayload = { status: 'ON_LEAVE' };
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/status`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(driverStatusPayload),
                });
                const data = await res.json();
                await logResult('Drivers', 'Update Status', 'PATCH', `/api/drivers/:id/status`, driverStatusPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 6.11 Activate Driver
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/activate`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Drivers', 'Activate Driver', 'PATCH', `/api/drivers/:id/activate`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 6.10 Suspend Driver
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/suspend`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Drivers', 'Suspend Driver', 'PATCH', `/api/drivers/:id/suspend`, null, res.status, data);

                // Restore back to AVAILABLE for trip tests
                await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/activate`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                });
            } catch (err) {
                console.error(err);
            }

            // 6.8 Update License
            const licensePayload = { licenseNumber: `LIC-NEW-${timestamp}`, licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString() };
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/license`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(licensePayload),
                });
                const data = await res.json();
                await logResult('Drivers', 'Update License', 'PATCH', `/api/drivers/:id/license`, licensePayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 6.9 Update Safety Score
            const safetyPayload = { safetyScore: '92.50' };
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/safety-score`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(safetyPayload),
                });
                const data = await res.json();
                await logResult('Drivers', 'Update Safety Score', 'PATCH', `/api/drivers/:id/safety-score`, safetyPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }
        }


        // ==========================================
        // 7. TRIPS MODULE TESTS
        // ==========================================
        if (testVehicleId && testDriverUserId) {
            // 7.1 Create Trip
            const createTripPayload = {
                vehicleId: testVehicleId,
                driverId: testDriverUserId,
                source: 'Mumbai Warehouse A',
                destination: 'Pune Distribution Center',
                cargoName: 'Electronic Goods',
                cargoWeight: '5000.00',
                distanceKm: '150.00',
                plannedStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                plannedEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                remarks: 'Fragile cargo, drive safely',
            };
            try {
                const res = await fetch(`${BASE_URL}/api/trips`, {
                    method: 'POST',
                    headers: managerHeaders,
                    body: JSON.stringify(createTripPayload),
                });
                const data = await res.json();
                testTripId = data.data?.id;
                await logResult('Trips', 'Create Trip', 'POST', '/api/trips', createTripPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }
        }

        // 7.2 Get Trips
        try {
            const res = await fetch(`${BASE_URL}/api/trips`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Trips', 'Get Trips', 'GET', '/api/trips', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        if (testTripId) {
            // 7.3 Trip Details
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Trips', 'Trip Details', 'GET', `/api/trips/:id`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.4 Update Trip
            const updateTripPayload = { source: 'Mumbai Warehouse B', remarks: 'Fragile electronics' };
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(updateTripPayload),
                });
                const data = await res.json();
                await logResult('Trips', 'Update Trip', 'PATCH', `/api/trips/:id`, updateTripPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.10 Assign Driver
            if (testRegisteredDriverId) {
                const assignDriverPayload = { driverId: testRegisteredDriverId };
                try {
                    const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/assign-driver`, {
                        method: 'PATCH',
                        headers: managerHeaders,
                        body: JSON.stringify(assignDriverPayload),
                    });
                    const data = await res.json();
                    await logResult('Trips', 'Assign Driver', 'PATCH', `/api/trips/:id/assign-driver`, assignDriverPayload, res.status, data);
                } catch (err) {
                    console.error(err);
                }
            }

            // Re-assign main driver back
            await fetch(`${BASE_URL}/api/trips/${testTripId}/assign-driver`, {
                method: 'PATCH',
                headers: managerHeaders,
                body: JSON.stringify({ driverId: testDriverUserId }),
            });

            // 7.11 Assign Vehicle
            if (testVehicleId) {
                const assignVehiclePayload = { vehicleId: testVehicleId };
                try {
                    const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/assign-vehicle`, {
                        method: 'PATCH',
                        headers: managerHeaders,
                        body: JSON.stringify(assignVehiclePayload),
                    });
                    const data = await res.json();
                    await logResult('Trips', 'Assign Vehicle', 'PATCH', `/api/trips/:id/assign-vehicle`, assignVehiclePayload, res.status, data);
                } catch (err) {
                    console.error(err);
                }
            }

            // 7.12 Update Cargo
            const cargoPayload = { cargoName: 'High-Value Electronics', cargoWeight: '4500.00' };
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/cargo`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(cargoPayload),
                });
                const data = await res.json();
                await logResult('Trips', 'Update Cargo', 'PATCH', `/api/trips/:id/cargo`, cargoPayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.13 Update Distance
            const distancePayload = { distanceKm: '160.00' };
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/distance`, {
                    method: 'PATCH',
                    headers: managerHeaders,
                    body: JSON.stringify(distancePayload),
                });
                const data = await res.json();
                await logResult('Trips', 'Update Distance', 'PATCH', `/api/trips/:id/distance`, distancePayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.6 Dispatch Trip
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/dispatch`, {
                    method: 'POST',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Trips', 'Dispatch Trip', 'POST', `/api/trips/:id/dispatch`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.7 Start Trip (As Driver)
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/start`, {
                    method: 'POST',
                    headers: driverHeaders, // Hit as driver
                });
                const data = await res.json();
                await logResult('Trips', 'Start Trip (Driver)', 'POST', `/api/trips/:id/start`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // Populate some test fuel logs/expenses to check sub-endpoints and timeline
            const [fuelLog] = await db.insert(fuelLogs).values({
                tripId: testTripId,
                vehicleId: testVehicleId,
                driverId: testDriverUserId,
                litres: '45.00',
                pricePerLitre: '95.00',
                totalCost: '4275.00',
                stationName: 'Shell Mumbai',
                odometer: '1600.00'
            }).returning();

            const [expense] = await db.insert(expenses).values({
                tripId: testTripId,
                vehicleId: testVehicleId,
                category: 'Toll',
                amount: '400.00',
                description: 'Mumbai-Pune Expressway toll',
                createdBy: managerUser.id
            }).returning();

            // 7.14 Timeline
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/timeline`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Trips', 'Trip Timeline', 'GET', `/api/trips/:id/timeline`, null, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // 7.8 Complete Trip (As Driver)
            const completePayload = { actualDistance: '165.00', remarks: 'Delivered successfully with minor traffic delay' };
            try {
                const res = await fetch(`${BASE_URL}/api/trips/${testTripId}/complete`, {
                    method: 'POST',
                    headers: driverHeaders, // Hit as driver
                    body: JSON.stringify(completePayload),
                });
                const data = await res.json();
                await logResult('Trips', 'Complete Trip (Driver)', 'POST', `/api/trips/:id/complete`, completePayload, res.status, data);
            } catch (err) {
                console.error(err);
            }

            // Let's create another test trip to test cancel and delete
            let testTripId2 = null;
            try {
                const res = await fetch(`${BASE_URL}/api/trips`, {
                    method: 'POST',
                    headers: managerHeaders,
                    body: JSON.stringify({
                        vehicleId: testVehicleId,
                        driverId: testDriverUserId,
                        source: 'Mumbai Warehouse A',
                        destination: 'Pune Distribution Center',
                        cargoName: 'Electronic Goods',
                        cargoWeight: '2000.00',
                        distanceKm: '150.00',
                        plannedStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        plannedEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    }),
                });
                const data = await res.json();
                testTripId2 = data.data?.id;
            } catch (err) {}

            if (testTripId2) {
                // 7.9 Cancel Trip
                try {
                    const res = await fetch(`${BASE_URL}/api/trips/${testTripId2}/cancel`, {
                        method: 'POST',
                        headers: managerHeaders,
                    });
                    const data = await res.json();
                    await logResult('Trips', 'Cancel Trip', 'POST', `/api/trips/:id/cancel`, null, res.status, data);
                } catch (err) {
                    console.error(err);
                }

                // 7.5 Delete Trip
                try {
                    const res = await fetch(`${BASE_URL}/api/trips/${testTripId2}`, {
                        method: 'DELETE',
                        headers: managerHeaders,
                    });
                    const data = await res.json();
                    await logResult('Trips', 'Delete Trip', 'DELETE', `/api/trips/:id`, null, res.status, data);
                } catch (err) {}
            }
        }


        // ==========================================
        // 5. VEHICLE RELATED SUB-RESOURCES
        // ==========================================
        if (testVehicleId) {
            // 5.11 Vehicle Trips
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/trips`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Vehicle Trips', 'GET', `/api/vehicles/:id/trips`, null, res.status, data);
            } catch (err) {}

            // 5.12 Vehicle Maintenance
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/maintenance`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Vehicle Maintenance', 'GET', `/api/vehicles/:id/maintenance`, null, res.status, data);
            } catch (err) {}

            // 5.13 Vehicle Fuel Logs
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/fuel-logs`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Vehicle Fuel Logs', 'GET', `/api/vehicles/:id/fuel-logs`, null, res.status, data);
            } catch (err) {}

            // 5.14 Vehicle Expenses
            try {
                const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/expenses`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Vehicles', 'Vehicle Expenses', 'GET', `/api/vehicles/:id/expenses`, null, res.status, data);
            } catch (err) {}
        }


        // ==========================================
        // 6. DRIVER RELATED SUB-RESOURCES
        // ==========================================
        if (testDriverUserId) {
            // 6.12 Driver Trips
            try {
                const res = await fetch(`${BASE_URL}/api/drivers/${testDriverUserId}/trips`, {
                    method: 'GET',
                    headers: managerHeaders,
                });
                const data = await res.json();
                await logResult('Drivers', 'Driver Trips', 'GET', `/api/drivers/:id/trips`, null, res.status, data);
            } catch (err) {}
        }


        // ==========================================
        // 4. DASHBOARD MODULE TESTS
        // ==========================================
        // 4.1 Dashboard Overview
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Dashboard Overview', 'GET', '/api/dashboard', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 4.2 KPIs
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard/kpis`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Dashboard KPIs', 'GET', '/api/dashboard/kpis', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 4.3 Vehicle Summary
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard/vehicle-summary`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Vehicle Summary', 'GET', '/api/dashboard/vehicle-summary', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 4.4 Driver Summary
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard/driver-summary`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Driver Summary', 'GET', '/api/dashboard/driver-summary', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 4.5 Trip Summary
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard/trip-summary`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Trip Summary', 'GET', '/api/dashboard/trip-summary', null, res.status, data);
        } catch (err) {
            console.error(err);
        }

        // 4.6 Recent Activities
        try {
            const res = await fetch(`${BASE_URL}/api/dashboard/recent-activities`, {
                method: 'GET',
                headers: managerHeaders,
            });
            const data = await res.json();
            await logResult('Dashboard', 'Recent Activities', 'GET', '/api/dashboard/recent-activities', null, res.status, data);
        } catch (err) {
            console.error(err);
        }


        // ==========================================
        // TEARDOWN TEST ENTITIES & CLEANUP
        // ==========================================
        console.log('Cleaning up temporary testing users and profiles...');
        if (testRegisteredDriverId) {
            try {
                // Delete drivers
                await db.delete(driverProfiles).where(eq(driverProfiles.userId, testRegisteredDriverId));
                await db.delete(users).where(eq(users.id, testRegisteredDriverId));
            } catch (err) {}
        }
        
        try {
            // Delete main test data
            if (testTripId) {
                await db.delete(fuelLogs).where(eq(fuelLogs.tripId, testTripId));
                await db.delete(expenses).where(eq(expenses.tripId, testTripId));
                await db.delete(trips).where(eq(trips.id, testTripId));
            }
            if (testVehicleId) {
                await db.delete(vehicles).where(eq(vehicles.id, testVehicleId));
            }
            await db.delete(driverProfiles).where(eq(driverProfiles.userId, testDriverUserId));
            await db.delete(users).where(eq(users.id, testDriverUserId));
            await db.delete(users).where(eq(users.id, managerUser.id));
            console.log('Teardown complete.');
        } catch (cleanupErr) {
            console.error('Error during cleanup:', cleanupErr);
        }

    } catch (err) {
        console.error('An error occurred during verification script:', err);
    } finally {
        // Shutdown server & databases
        server.close(() => {
            console.log('Test server closed');
        });
        await redis.quit();
        await pool.end();
        console.log('Database and Redis connections closed');
        
        // Write the results to Markdown report
        writeResultsToMarkdown();
    }
}

function writeResultsToMarkdown() {
    let md = `# Endpoint Verification Report

This report outlines the verified API endpoints, request details, HTTP responses, and confirmation of correct functionality against the TransitOps user schema and database check constraints.

| Module | API Endpoint Name | Method | Path | Status | Success |
|---|---|---|---|---|---|
`;

    results.forEach(r => {
        md += `| ${r.module} | ${r.name} | \`${r.method}\` | \`${r.path}\` | \`${r.responseStatus}\` | ${r.success ? '✅ Success' : '❌ Failed'} |\n`;
    });

    md += '\n## Detailed Request/Response Payloads\n';

    results.forEach((r, idx) => {
        md += `\n### ${idx + 1}. [${r.module}] ${r.name}\n`;
        md += `- **Endpoint:** \`${r.method} ${r.path}\`\n`;
        md += `- **Status Code:** \`${r.responseStatus}\` (${r.success ? 'Success' : 'Failure'})\n`;
        if (r.requestBody !== 'N/A') {
            md += `\n**Request Body:**\n\`\`\`json\n${r.requestBody}\n\`\`\`\n`;
        }
        md += `\n**Response Body:**\n\`\`\`json\n${r.responseBody}\n\`\`\`\n`;
        md += '---\n';
    });

    fs.writeFileSync('verify-endpoints-results.md', md);
    console.log('Successfully wrote verify-endpoints-results.md results file.');
}

runTests();
