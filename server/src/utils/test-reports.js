import 'dotenv/config';
import { pool } from '../config/database.js';
import * as reportService from '../modules/report/services/report.service.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('--- STARTING REPORTS SERVICE TESTS ---');

    console.log('Testing getFleetReport...');
    const fleet = await reportService.getFleetReport();
    assert(fleet.metrics !== undefined, 'Fleet report should return metrics');
    assert(fleet.vehicles !== undefined, 'Fleet report should return vehicles list');
    assert(typeof fleet.metrics.totalVehicles === 'number', 'Total vehicles should be a number');

    console.log('Testing getDriverReport...');
    const drivers = await reportService.getDriverReport();
    assert(drivers.metrics !== undefined, 'Driver report should return metrics');
    assert(drivers.drivers !== undefined, 'Driver report should return drivers list');

    console.log('Testing getTripReport...');
    const trips = await reportService.getTripReport();
    assert(trips.metrics !== undefined, 'Trip report should return metrics');
    assert(trips.trips !== undefined, 'Trip report should return trips list');

    console.log('Testing getExpenseReport...');
    const expenses = await reportService.getExpenseReport();
    assert(expenses.metrics !== undefined, 'Expense report should return metrics');
    assert(expenses.vehicleBreakdown !== undefined, 'Expense report should return vehicle breakdown');

    console.log('Testing getOperationalCostReport...');
    const cost = await reportService.getOperationalCostReport();
    assert(cost.metrics !== undefined, 'Operational cost report should return metrics');
    assert(cost.breakdown !== undefined, 'Operational cost report should return breakdown');

    console.log('Testing CSV compilation...');
    const csvContent = await reportService.compileCSV('fleet');
    assert(typeof csvContent === 'string', 'CSV content should be a string');
    assert(csvContent.length > 0, 'CSV content should not be empty');

    console.log('Testing PDF compilation...');
    const pdfBuffer = await reportService.compilePDF('fleet');
    assert(Buffer.isBuffer(pdfBuffer), 'PDF compilation should return a Buffer');
    assert(pdfBuffer.toString('utf-8', 0, 8) === '%PDF-1.4', 'PDF buffer should start with PDF header');

    console.log('--- ALL REPORTS TESTS PASSED SUCCESSFULLY ---');
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
