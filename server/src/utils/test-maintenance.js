import 'dotenv/config';
import { db, pool } from '../config/database.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { maintenance } from '../db/schema/maintenance.schema.js';
import { eq } from 'drizzle-orm';
import * as maintenanceDao from '../dao/maintenance.dao.js';

// Simple assert helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('--- STARTING MAINTENANCE DAO TESTS ---');

    // 1. Fetch or create a test vehicle
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

    console.log(`Using Vehicle: ${vehicle.id}`);

    // 2. Test createMaintenanceRecord
    const testRecordData = {
        vehicleId: vehicle.id,
        title: 'Routine Oil Change',
        description: 'Scheduled regular oil change',
        maintenanceType: 'Oil Change',
        cost: '150.00',
        serviceCenter: 'Quick Lube Center',
        scheduledDate: new Date(),
        status: 'PENDING',
    };

    console.log('Testing createMaintenanceRecord...');
    const record = await maintenanceDao.createMaintenanceRecord(testRecordData);
    assert(record.id !== undefined, 'Created record should have an id');
    assert(record.title === 'Routine Oil Change', 'Title should match');
    assert(record.cost === '150.00', 'Cost should match');

    // 3. Test getMaintenanceById
    console.log('Testing getMaintenanceById...');
    const fetchedRecord = await maintenanceDao.getMaintenanceById(record.id);
    assert(fetchedRecord !== null, 'Fetched record should not be null');
    assert(fetchedRecord.id === record.id, 'IDs should match');

    // 4. Test listMaintenance
    console.log('Testing listMaintenance...');
    const allRecords = await maintenanceDao.listMaintenance();
    assert(allRecords.length > 0, 'Should return at least one maintenance record');

    const filteredRecords = await maintenanceDao.listMaintenance({ vehicleId: vehicle.id });
    assert(filteredRecords.length > 0, 'Should find records for the test vehicle');

    // 5. Test updateMaintenanceRecord
    console.log('Testing updateMaintenanceRecord...');
    const updated = await maintenanceDao.updateMaintenanceRecord(record.id, {
        status: 'IN_PROGRESS',
        cost: '175.50',
    });
    assert(updated !== null, 'Updated record should not be null');
    assert(updated.status === 'IN_PROGRESS', 'Updated status should match');
    assert(updated.cost === '175.50', 'Updated cost should match');

    // 6. Test getActiveMaintenance
    console.log('Testing getActiveMaintenance...');
    const activeRecords = await maintenanceDao.getActiveMaintenance();
    assert(activeRecords.length > 0, 'Should find active records');
    const matchedActive = activeRecords.find(r => r.id === record.id);
    assert(matchedActive !== undefined, 'Should include the test record');

    // 7. Test deleteMaintenanceRecord
    console.log('Testing deleteMaintenanceRecord...');
    const deleted = await maintenanceDao.deleteMaintenanceRecord(record.id);
    assert(deleted !== null, 'Deleted record should not be null');
    assert(deleted.id === record.id, 'Deleted ID should match');

    const fetchDeleted = await maintenanceDao.getMaintenanceById(record.id);
    assert(fetchDeleted === null, 'Record should be deleted');

    console.log('--- ALL MAINTENANCE DAO TESTS PASSED SUCCESSFULLY ---');
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
