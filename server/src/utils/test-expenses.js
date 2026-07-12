import 'dotenv/config';
import { db, pool } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { trips } from '../db/schema/trips.schema.js';
import { expenses } from '../db/schema/expenses.schema.js';
import { eq } from 'drizzle-orm';
import * as expenseDao from '../dao/expense.dao.js';

// Simple assert helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('--- STARTING EXPENSES DAO TESTS ---');

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

    // 2. Test createExpense
    const testExpenseData = {
        tripId: trip.id,
        vehicleId: vehicle.id,
        category: 'Toll',
        amount: '45.00',
        description: 'Toll fee for route A',
        createdBy: driver.id,
    };

    console.log('Testing createExpense...');
    const record = await expenseDao.createExpense(testExpenseData);
    assert(record.id !== undefined, 'Created record should have an id');
    assert(record.category === 'Toll', 'Category should match');
    assert(record.amount === '45.00', 'Amount should match');

    // 3. Test getExpenseById
    console.log('Testing getExpenseById...');
    const fetchedRecord = await expenseDao.getExpenseById(record.id);
    assert(fetchedRecord !== null, 'Fetched record should not be null');
    assert(fetchedRecord.id === record.id, 'IDs should match');

    // 4. Test listExpenses
    console.log('Testing listExpenses...');
    const allRecords = await expenseDao.listExpenses();
    assert(allRecords.length > 0, 'Should return at least one expense record');

    const filteredRecords = await expenseDao.listExpenses({ vehicleId: vehicle.id });
    assert(filteredRecords.length > 0, 'Should find records for the test vehicle');

    // 5. Test updateExpense
    console.log('Testing updateExpense...');
    const updated = await expenseDao.updateExpense(record.id, {
        category: 'Parking',
        amount: '50.00',
    });
    assert(updated !== null, 'Updated record should not be null');
    assert(updated.category === 'Parking', 'Updated category should match');
    assert(updated.amount === '50.00', 'Updated amount should match');

    // 6. Test getExpensesByVehicle
    console.log('Testing getExpensesByVehicle...');
    const vehicleRecords = await expenseDao.getExpensesByVehicle(vehicle.id);
    assert(vehicleRecords.length > 0, 'Should return grouping by vehicle');

    // 7. Test getExpenseSummaryMetrics & getExpenseSummaryByVehicle
    console.log('Testing summaries...');
    const metrics = await expenseDao.getExpenseSummaryMetrics();
    assert(metrics.totalAmount >= 50.00, 'Total amount should match');
    assert(metrics.totalExpenses >= 1, 'Total count should be >= 1');
    assert(metrics.categoryBreakdown.length > 0, 'Should return grouping by category');

    const vehicleSummary = await expenseDao.getExpenseSummaryByVehicle();
    assert(vehicleSummary.length > 0, 'Should return grouping by vehicle');

    // 8. Test deleteExpense
    console.log('Testing deleteExpense...');
    const deleted = await expenseDao.deleteExpense(record.id);
    assert(deleted !== null, 'Deleted record should not be null');
    assert(deleted.id === record.id, 'Deleted ID should match');

    const fetchDeleted = await expenseDao.getExpenseById(record.id);
    assert(fetchDeleted === null, 'Record should be deleted');

    console.log('--- ALL EXPENSES DAO TESTS PASSED SUCCESSFULLY ---');
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
