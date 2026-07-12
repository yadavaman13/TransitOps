import { db } from '../../../config/database.js';
import { expenses } from '../../../db/schema/expenses.schema.js';
import { fuelLogs } from '../../../db/schema/fuel-logs.schema.js';
import { maintenance } from '../../../db/schema/maintenance.schema.js';
import { vehicles } from '../../../db/schema/vehicles.schema.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

/**
 * Get Financial Analyst Dashboard overview data
 */
export async function getDashboardOverview() {
    // 1. Fetch Aggregates
    const [expSum] = await db.select({ total: sql`sum(${expenses.amount})` }).from(expenses);
    const [fuelSum] = await db.select({ total: sql`sum(${fuelLogs.totalCost})` }).from(fuelLogs);
    const [maintSum] = await db
        .select({ total: sql`sum(${maintenance.cost})` })
        .from(maintenance)
        .where(eq(maintenance.status, 'COMPLETED'));

    const totalExpAmount = Number(expSum?.total || 0);
    const totalFuelAmount = Number(fuelSum?.total || 0);
    const totalMaintAmount = Number(maintSum?.total || 0);
    const overallExpenses = totalExpAmount + totalFuelAmount + totalMaintAmount;

    // Monthly Cost (current calendar month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyExp] = await db
        .select({ total: sql`sum(${expenses.amount})` })
        .from(expenses)
        .where(gte(expenses.createdAt, startOfMonth));
    const [monthlyFuel] = await db
        .select({ total: sql`sum(${fuelLogs.totalCost})` })
        .from(fuelLogs)
        .where(gte(fuelLogs.createdAt, startOfMonth));
    const [monthlyMaint] = await db
        .select({ total: sql`sum(${maintenance.cost})` })
        .from(maintenance)
        .where(and(eq(maintenance.status, 'COMPLETED'), gte(maintenance.completedDate, startOfMonth)));

    const monthlyCost = Number(monthlyExp?.total || 0) + Number(monthlyFuel?.total || 0) + Number(monthlyMaint?.total || 0);

    // 2. Fetch Expense Category breakdown
    // Categories: Fuel, Toll, Parking, Repair, Insurance, Misc
    const expCategories = await db
        .select({
            category: expenses.category,
            total: sql`sum(${expenses.amount})`
        })
        .from(expenses)
        .groupBy(expenses.category);

    const categoryBreakdown = {
        Fuel: totalFuelAmount,
        Repair: totalMaintAmount,
        Toll: 0,
        Parking: 0,
        Insurance: 0,
        Misc: 0
    };

    expCategories.forEach(c => {
        const cat = c.category;
        if (cat in categoryBreakdown) {
            categoryBreakdown[cat] += Number(c.total);
        } else {
            categoryBreakdown[cat] = Number(c.total);
        }
    });

    const categoryChartData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
        category,
        amount
    }));

    // 3. Monthly Trends (Expense & Fuel)
    // We group by month (format 'YYYY-MM')
    const monthlyTrendRows = await db.select({
        month: sql`to_char(${expenses.createdAt}, 'YYYY-MM')`,
        total: sql`sum(${expenses.amount})`
    }).from(expenses).groupBy(sql`to_char(${expenses.createdAt}, 'YYYY-MM')`);

    const monthlyFuelRows = await db.select({
        month: sql`to_char(${fuelLogs.createdAt}, 'YYYY-MM')`,
        total: sql`sum(${fuelLogs.totalCost})`
    }).from(fuelLogs).groupBy(sql`to_char(${fuelLogs.createdAt}, 'YYYY-MM')`);

    const monthlyMaintRows = await db.select({
        month: sql`to_char(${maintenance.completedDate}, 'YYYY-MM')`,
        total: sql`sum(${maintenance.cost})`
    }).from(maintenance).where(eq(maintenance.status, 'COMPLETED')).groupBy(sql`to_char(${maintenance.completedDate}, 'YYYY-MM')`);

    const monthsUnion = new Set([
        ...monthlyTrendRows.map(r => r.month),
        ...monthlyFuelRows.map(r => r.month),
        ...monthlyMaintRows.map(r => r.month)
    ].filter(Boolean));

    const sortedMonths = Array.from(monthsUnion).sort();
    
    const expenseTrendData = sortedMonths.map(m => {
        const expVal = Number(monthlyTrendRows.find(r => r.month === m)?.total || 0);
        const fuelVal = Number(monthlyFuelRows.find(r => r.month === m)?.total || 0);
        const maintVal = Number(monthlyMaintRows.find(r => r.month === m)?.total || 0);
        return {
            month: m,
            amount: expVal + fuelVal + maintVal,
            fuelCost: fuelVal
        };
    });

    // 4. Recent Expenses
    // We combine the latest manual expenses + fuel logs + completed maintenance
    const recentManualExpenses = await db
        .select({
            id: expenses.id,
            vehicleId: expenses.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            category: expenses.category,
            amount: expenses.amount,
            date: expenses.createdAt
        })
        .from(expenses)
        .leftJoin(vehicles, eq(vehicles.id, expenses.vehicleId))
        .orderBy(desc(expenses.createdAt))
        .limit(5);

    const recentFuelLogs = await db
        .select({
            id: fuelLogs.id,
            vehicleId: fuelLogs.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            category: sql`'Fuel'::text`,
            amount: fuelLogs.totalCost,
            date: fuelLogs.createdAt
        })
        .from(fuelLogs)
        .leftJoin(vehicles, eq(vehicles.id, fuelLogs.vehicleId))
        .orderBy(desc(fuelLogs.createdAt))
        .limit(5);

    const combinedRecent = [
        ...recentManualExpenses.map(r => ({ ...r, amount: Number(r.amount) })),
        ...recentFuelLogs.map(r => ({ ...r, amount: Number(r.amount) }))
    ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return {
        cards: {
            totalExpenses: overallExpenses,
            fuelCost: totalFuelAmount,
            maintenanceCost: totalMaintAmount,
            monthlyCost
        },
        charts: {
            categoryBreakdown: categoryChartData,
            monthlyTrend: expenseTrendData
        },
        recentExpenses: combinedRecent
    };
}

/**
 * Get filterable list of manual expenses
 */
export async function getExpensesList(filters = {}) {
    let query = db
        .select({
            id: expenses.id,
            tripId: expenses.tripId,
            tripNumber: trips.tripNumber,
            vehicleId: expenses.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            category: expenses.category,
            amount: expenses.amount,
            receipt: expenses.receipt,
            description: expenses.description,
            date: expenses.createdAt
        })
        .from(expenses)
        .leftJoin(vehicles, eq(vehicles.id, expenses.vehicleId))
        .leftJoin(trips, eq(trips.id, expenses.tripId));

    const conditions = [];

    if (filters.category) {
        conditions.push(eq(expenses.category, filters.category));
    }
    if (filters.vehicleId) {
        conditions.push(eq(expenses.vehicleId, filters.vehicleId));
    }
    if (filters.startDate) {
        conditions.push(gte(expenses.createdAt, new Date(filters.startDate)));
    }
    if (filters.endDate) {
        conditions.push(lte(expenses.createdAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    return query.orderBy(desc(expenses.createdAt));
}

/**
 * Get detailed list of fuel logs
 */
export async function getFuelLogsList() {
    return db
        .select({
            id: fuelLogs.id,
            tripId: fuelLogs.tripId,
            tripNumber: trips.tripNumber,
            vehicleId: fuelLogs.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            litres: fuelLogs.litres,
            pricePerLitre: fuelLogs.pricePerLitre,
            totalCost: fuelLogs.totalCost,
            stationName: fuelLogs.stationName,
            odometer: fuelLogs.odometer,
            receiptUrl: fuelLogs.receiptUrl,
            date: fuelLogs.createdAt
        })
        .from(fuelLogs)
        .leftJoin(vehicles, eq(vehicles.id, fuelLogs.vehicleId))
        .leftJoin(trips, eq(trips.id, fuelLogs.tripId))
        .orderBy(desc(fuelLogs.createdAt));
}

/**
 * Get reports and analytical data
 */
export async function getReportsData() {
    // 1. Vehicle Operating Costs (Expenses + Fuel + Completed Maintenance per Vehicle)
    const vehManual = await db
        .select({
            vehicleId: expenses.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            total: sql`sum(${expenses.amount})`
        })
        .from(expenses)
        .leftJoin(vehicles, eq(vehicles.id, expenses.vehicleId))
        .groupBy(expenses.vehicleId, vehicles.registrationNumber, vehicles.vehicleNumber);

    const vehFuel = await db
        .select({
            vehicleId: fuelLogs.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            total: sql`sum(${fuelLogs.totalCost})`
        })
        .from(fuelLogs)
        .leftJoin(vehicles, eq(vehicles.id, fuelLogs.vehicleId))
        .groupBy(fuelLogs.vehicleId, vehicles.registrationNumber, vehicles.vehicleNumber);

    const vehMaint = await db
        .select({
            vehicleId: maintenance.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            vehicleNumber: vehicles.vehicleNumber,
            total: sql`sum(${maintenance.cost})`
        })
        .from(maintenance)
        .leftJoin(vehicles, eq(vehicles.id, maintenance.vehicleId))
        .where(eq(maintenance.status, 'COMPLETED'))
        .groupBy(maintenance.vehicleId, vehicles.registrationNumber, vehicles.vehicleNumber);

    const vehicleCostMap = {};
    const mergeCosts = (rows, typeKey) => {
        rows.forEach(r => {
            const vId = r.vehicleId;
            if (!vId) return;
            if (!vehicleCostMap[vId]) {
                vehicleCostMap[vId] = {
                    vehicleId: vId,
                    registrationNumber: r.registrationNumber,
                    vehicleNumber: r.vehicleNumber,
                    fuel: 0,
                    maintenance: 0,
                    other: 0,
                    total: 0
                };
            }
            const val = Number(r.total || 0);
            vehicleCostMap[vId][typeKey] += val;
            vehicleCostMap[vId].total += val;
        });
    };

    mergeCosts(vehFuel, 'fuel');
    mergeCosts(vehMaint, 'maintenance');
    mergeCosts(vehManual, 'other');

    const vehicleOperatingCosts = Object.values(vehicleCostMap);

    // 2. Fetch category shares
    const dashboard = await getDashboardOverview();

    return {
        vehicleOperatingCosts,
        categoryBreakdown: dashboard.charts.categoryBreakdown,
        monthlyTrend: dashboard.charts.monthlyTrend
    };
}

/**
 * Create a new manual expense record
 */
export async function createExpense(data) {
    const [inserted] = await db
        .insert(expenses)
        .values({
            tripId: data.tripId || null,
            vehicleId: data.vehicleId,
            category: data.category,
            amount: data.amount,
            description: data.description || null,
            receipt: data.receipt || null,
            createdBy: data.createdBy
        })
        .returning();

    return inserted;
}
