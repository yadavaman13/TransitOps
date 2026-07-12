import 'dotenv/config';
import { pool } from '../config/database.js';
import * as analyticsService from '../modules/analytics/services/analytics.service.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('--- STARTING ANALYTICS SERVICE TESTS ---');

    console.log('Testing getFleetUtilization...');
    const util = await analyticsService.getFleetUtilization();
    assert(util.metrics !== undefined, 'Fleet utilization should return metrics');
    assert(util.breakdown !== undefined, 'Fleet utilization should return breakdown');
    assert(typeof util.metrics.utilizationRate === 'number', 'utilizationRate should be a number');

    console.log('Testing getFuelEfficiency...');
    const efficiency = await analyticsService.getFuelEfficiency();
    assert(efficiency.metrics !== undefined, 'Fuel efficiency should return metrics');
    assert(efficiency.breakdown !== undefined, 'Fuel efficiency should return breakdown');

    console.log('Testing getVehicleROI...');
    const roi = await analyticsService.getVehicleROI();
    assert(roi.metrics !== undefined, 'Vehicle ROI should return metrics');
    assert(roi.breakdown !== undefined, 'Vehicle ROI should return breakdown');

    console.log('Testing getDriverPerformance...');
    const drivers = await analyticsService.getDriverPerformance();
    assert(drivers.metrics !== undefined, 'Driver performance should return metrics');
    assert(drivers.breakdown !== undefined, 'Driver performance should return breakdown');

    console.log('Testing getMaintenanceTrends...');
    const maintenance = await analyticsService.getMaintenanceTrends();
    assert(maintenance.metrics !== undefined, 'Maintenance trends should return metrics');
    assert(maintenance.monthlyTrend !== undefined, 'Maintenance trends should return monthlyTrend');

    console.log('Testing getExpenseTrends...');
    const expenses = await analyticsService.getExpenseTrends();
    assert(expenses.metrics !== undefined, 'Expense trends should return metrics');
    assert(expenses.monthlyTrend !== undefined, 'Expense trends should return monthlyTrend');

    console.log('Testing getMonthlyStatistics...');
    const monthly = await analyticsService.getMonthlyStatistics();
    assert(monthly.monthlyStats !== undefined, 'Monthly statistics should return monthlyStats');
    assert(Array.isArray(monthly.monthlyStats), 'monthlyStats should be an array');

    console.log('--- ALL ANALYTICS TESTS PASSED SUCCESSFULLY ---');
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
