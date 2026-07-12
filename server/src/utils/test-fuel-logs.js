import 'dotenv/config';
import { db, pool } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { trips } from '../db/schema/trips.schema.js';
import { fuelLogs } from '../db/schema/fuel-logs.schema.js';
import { eq } from 'drizzle-orm';
import * as fuelLogDao from '../dao/fuel-log.dao.js';

// Simple assert helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('--- STARTING FUEL LOG DAO TESTS ---');

    // 1. Fetch or create a test driver, vehicle, and trip
    let driver = (await db.select().from(users).where(eq(users.role, 'DRIVER')).limit(1))[0];
    if (!driver) {
        console.log('Creating test driver...');
        [driver] = await db.insert(users).values({
            name: 'Test Driver',
            email: `testdriver-${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'DRIVER',
            emailVerified: true,
            isActive: true,
        }).returning();
    }

    let vehicle = (await db.select().from(vehicles).limit(1))[0];
    if (!vehicle) {
        console.log('Creating test vehicle...');
        [vehicle] = await db.insert(vehicles).values({
            registrationNumber: `REG-${Date.now()}`,
            vehicleNumber: `V-${Date.now()}`,
            brand: 'TestBrand',
            model: 'TestModel',
            manufactureYear: 2020,
            capacityKg: '5000.00',
            fuelType: 'Diesel',
            currentOdometer: '100.00',
            purchaseDate: new Date(),
            insuranceExpiry: new Date(),
            pollutionExpiry: new Date(),
        }).returning();
    }

    let trip = (await db.select().from(trips).limit(1))[0];
    if (!trip) {
        console.log('Creating test trip...');
        [trip] = await db.insert(trips).values({
            tripNumber: `TRP-${Date.now()}`,
            vehicleId: vehicle.id,
            driverId: driver.id,
            createdBy: driver.id,
            source: 'Source A',
            destination: 'Dest B',
            cargoName: 'Cargo A',
            cargoWeight: '1000.00',
            distanceKm: '150.00',
            plannedStart: new Date(),
            plannedEnd: new Date(),
            status: 'DRAFT',
        }).returning();
    }

    console.log(`Using Driver: ${driver.id}, Vehicle: ${vehicle.id}, Trip: ${trip.id}`);

    // 2. Test createFuelLog
    const testLogData = {
        tripId: trip.id,
        vehicleId: vehicle.id,
        driverId: driver.id,
        litres: '45.50',
        pricePerLitre: '95.50',
        totalCost: '4345.25',
        stationName: 'Test Fuel Station',
        odometer: '120.00',
    };

    console.log('Testing createFuelLog...');
    const log = await fuelLogDao.createFuelLog(testLogData);
    assert(log.id !== undefined, 'Created log should have an id');
    assert(log.stationName === 'Test Fuel Station', 'Station name should match');
    assert(log.litres === '45.50', 'Litres should match');

    // 3. Test getFuelLogById
    console.log('Testing getFuelLogById...');
    const fetchedLog = await fuelLogDao.getFuelLogById(log.id);
    assert(fetchedLog !== null, 'Fetched log should not be null');
    assert(fetchedLog.id === log.id, 'IDs should match');

    // 4. Test listFuelLogs
    console.log('Testing listFuelLogs...');
    const allLogs = await fuelLogDao.listFuelLogs();
    assert(allLogs.length > 0, 'Should return at least one fuel log');

    const filteredLogs = await fuelLogDao.listFuelLogs({ vehicleId: vehicle.id });
    assert(filteredLogs.length > 0, 'Should find logs for the test vehicle');

    // 5. Test updateFuelLog
    console.log('Testing updateFuelLog...');
    const updated = await fuelLogDao.updateFuelLog(log.id, { litres: '50.00', totalCost: '4775.00' });
    assert(updated !== null, 'Updated log should not be null');
    assert(updated.litres === '50.00', 'Updated litres should match');
    assert(updated.totalCost === '4775.00', 'Updated total cost should match');

    // 6. Test getFuelSummaryMetrics
    console.log('Testing getFuelSummaryMetrics...');
    const metrics = await fuelLogDao.getFuelSummaryMetrics();
    assert(metrics.totalFuelCost >= 4775.00, 'Total cost should reflect the update');
    assert(metrics.totalLogs >= 1, 'Total logs count should be at least 1');

    // 7. Test getFuelSummaryByVehicle
    console.log('Testing getFuelSummaryByVehicle...');
    const vehicleSummary = await fuelLogDao.getFuelSummaryByVehicle();
    assert(vehicleSummary.length > 0, 'Should return grouping by vehicle');
    const matchedVehicle = vehicleSummary.find(v => v.vehicleId === vehicle.id);
    assert(matchedVehicle !== undefined, 'Should include test vehicle');
    assert(Number(matchedVehicle.totalLitres) >= 50.00, 'Litres should match');

    // 8. Test deleteFuelLog
    console.log('Testing deleteFuelLog...');
    const deleted = await fuelLogDao.deleteFuelLog(log.id);
    assert(deleted !== null, 'Deleted log should not be null');
    assert(deleted.id === log.id, 'Deleted ID should match');

    const fetchDeleted = await fuelLogDao.getFuelLogById(log.id);
    assert(fetchDeleted === null, 'Log should be deleted');

    console.log('--- ALL DAO TESTS PASSED SUCCESSFULLY ---');
}

runTests()
    .then(() => {
        pool.end();
        process.exit(0);
    })
    .catch(err => {
        console.error('Test Failed:', err);
        pool.end();
        process.exit(1);
    });
