import { db } from '../../../config/database.js';
import { vehicles } from '../../../db/schema/vehicles.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { driverProfiles } from '../../../db/schema/driver-profiles.schema.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { expenses } from '../../../db/schema/expenses.schema.js';
import { fuelLogs } from '../../../db/schema/fuel-logs.schema.js';
import { maintenance } from '../../../db/schema/maintenance.schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function getFleetUtilization() {
    const allVehicles = await db.select().from(vehicles);
    const allTrips = await db.select().from(trips);

    // Group trips & calculate total distance per vehicle
    const vehicleTripsCount = {};
    const vehicleDistance = {};

    allTrips.forEach(t => {
        vehicleTripsCount[t.vehicleId] = (vehicleTripsCount[t.vehicleId] || 0) + 1;
        if (t.status === 'COMPLETED') {
            vehicleDistance[t.vehicleId] = (vehicleDistance[t.vehicleId] || 0) + Number(t.distanceKm || 0);
        }
    });

    const totalVehicles = allVehicles.length;
    const nonRetiredVehicles = allVehicles.filter(v => v.status !== 'RETIRED');
    const totalNonRetired = nonRetiredVehicles.length;
    const activeVehiclesCount = allVehicles.filter(v => ['ON_TRIP', 'MAINTENANCE'].includes(v.status)).length;
    const onTripCount = allVehicles.filter(v => v.status === 'ON_TRIP').length;

    const utilizationRate = totalNonRetired > 0 ? Number(((onTripCount / totalNonRetired) * 100).toFixed(2)) : 0;
    
    let totalOdometer = 0;
    allVehicles.forEach(v => {
        totalOdometer += Number(v.currentOdometer || 0);
    });

    const averageOdometer = totalVehicles > 0 ? Number((totalOdometer / totalVehicles).toFixed(2)) : 0;

    const breakdown = allVehicles.map(v => ({
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        brand: v.brand,
        model: v.model,
        status: v.status,
        currentOdometer: Number(v.currentOdometer),
        totalTrips: vehicleTripsCount[v.id] || 0,
        totalDistanceKm: Number((vehicleDistance[v.id] || 0).toFixed(2)),
    }));

    return {
        metrics: {
            totalVehicles,
            activeVehiclesCount,
            utilizationRate,
            averageOdometer,
        },
        breakdown,
    };
}

export async function getFuelEfficiency() {
    const allVehicles = await db.select().from(vehicles);
    const allFuelLogs = await db.select().from(fuelLogs);

    // Group logs by vehicle
    const fuelByVehicle = {};
    allFuelLogs.forEach(log => {
        const vid = log.vehicleId;
        if (!fuelByVehicle[vid]) {
            fuelByVehicle[vid] = {
                litres: 0,
                cost: 0,
                odometers: [],
            };
        }
        fuelByVehicle[vid].litres += Number(log.litres || 0);
        fuelByVehicle[vid].cost += Number(log.totalCost || 0);
        fuelByVehicle[vid].odometers.push(Number(log.odometer || 0));
    });

    let totalLitres = 0;
    let totalFuelCost = 0;
    let sumEfficiency = 0;
    let efficiencyCount = 0;

    const breakdown = allVehicles.map(v => {
        const entry = fuelByVehicle[v.id];
        let distance = 0;
        let efficiency = 0;
        let litres = 0;
        let cost = 0;

        if (entry && entry.odometers.length > 0) {
            litres = entry.litres;
            cost = entry.cost;
            totalLitres += litres;
            totalFuelCost += cost;

            if (entry.odometers.length > 1) {
                const maxOdo = Math.max(...entry.odometers);
                const minOdo = Math.min(...entry.odometers);
                distance = maxOdo - minOdo;
                if (litres > 0) {
                    efficiency = Number((distance / litres).toFixed(2));
                    sumEfficiency += efficiency;
                    efficiencyCount++;
                }
            }
        }

        return {
            vehicleId: v.id,
            registrationNumber: v.registrationNumber,
            brand: v.brand,
            model: v.model,
            distanceCoveredKm: Number(distance.toFixed(2)),
            litresConsumed: Number(litres.toFixed(2)),
            totalCost: Number(cost.toFixed(2)),
            fuelEfficiencyKmL: efficiency,
        };
    });

    const averageEfficiency = efficiencyCount > 0 ? Number((sumEfficiency / efficiencyCount).toFixed(2)) : 0;

    return {
        metrics: {
            averageEfficiency,
            totalLitres: Number(totalLitres.toFixed(2)),
            totalFuelCost: Number(totalFuelCost.toFixed(2)),
        },
        breakdown,
    };
}

export async function getVehicleROI() {
    const allVehicles = await db.select().from(vehicles);
    const allTrips = await db.select().from(trips);
    const fuel = await db.select().from(fuelLogs);
    const maint = await db.select().from(maintenance);
    const exp = await db.select().from(expenses);

    // Group operational costs
    const fuelByVehicle = {};
    fuel.forEach(f => {
        fuelByVehicle[f.vehicleId] = (fuelByVehicle[f.vehicleId] || 0) + Number(f.totalCost || 0);
    });

    const maintByVehicle = {};
    maint.forEach(m => {
        maintByVehicle[m.vehicleId] = (maintByVehicle[m.vehicleId] || 0) + Number(m.cost || 0);
    });

    const expByVehicle = {};
    exp.forEach(e => {
        expByVehicle[e.vehicleId] = (expByVehicle[e.vehicleId] || 0) + Number(e.amount || 0);
    });

    // Group virtual revenue from completed trips
    // Revenue Formula: distanceKm * $3.00 + cargoWeight * $0.10
    const revenueByVehicle = {};
    allTrips.forEach(t => {
        if (t.status === 'COMPLETED') {
            const rev = Number(t.distanceKm || 0) * 3.00 + Number(t.cargoWeight || 0) * 0.10;
            revenueByVehicle[t.vehicleId] = (revenueByVehicle[t.vehicleId] || 0) + rev;
        }
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let sumRoiRate = 0;
    let roiCount = 0;

    const breakdown = allVehicles.map(v => {
        const rev = revenueByVehicle[v.id] || 0;
        const fuelCost = fuelByVehicle[v.id] || 0;
        const maintCost = maintByVehicle[v.id] || 0;
        const expCost = expByVehicle[v.id] || 0;
        const cost = fuelCost + maintCost + expCost;
        const profit = rev - cost;
        const roiRate = cost > 0 ? Number(((profit / cost) * 100).toFixed(2)) : 0;

        totalRevenue += rev;
        totalCost += cost;
        totalProfit += profit;

        if (cost > 0) {
            sumRoiRate += roiRate;
            roiCount++;
        }

        return {
            vehicleId: v.id,
            registrationNumber: v.registrationNumber,
            brand: v.brand,
            model: v.model,
            revenue: Number(rev.toFixed(2)),
            operationalCost: Number(cost.toFixed(2)),
            netProfit: Number(profit.toFixed(2)),
            roiRate,
        };
    });

    const averageROI = roiCount > 0 ? Number((sumRoiRate / roiCount).toFixed(2)) : 0;

    return {
        metrics: {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalCost: Number(totalCost.toFixed(2)),
            totalProfit: Number(totalProfit.toFixed(2)),
            averageROI,
        },
        breakdown,
    };
}

export async function getDriverPerformance() {
    const allDrivers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive,
            safetyScore: driverProfiles.safetyScore,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(and(eq(users.role, 'DRIVER'), eq(users.isDeleted, false)));

    const allTrips = await db.select().from(trips);
    const exp = await db.select().from(expenses);

    // Group metrics by driver
    const driverTripsCount = {};
    const driverCompletedTripsCount = {};
    const driverDistance = {};
    const driverWeight = {};
    const driverDurationSum = {};
    const driverDurationCount = {};

    allTrips.forEach(t => {
        driverTripsCount[t.driverId] = (driverTripsCount[t.driverId] || 0) + 1;
        if (t.status === 'COMPLETED') {
            driverCompletedTripsCount[t.driverId] = (driverCompletedTripsCount[t.driverId] || 0) + 1;
            driverDistance[t.driverId] = (driverDistance[t.driverId] || 0) + Number(t.distanceKm || 0);
            driverWeight[t.driverId] = (driverWeight[t.driverId] || 0) + Number(t.cargoWeight || 0);

            if (t.actualStart && t.actualEnd) {
                const dur = new Date(t.actualEnd) - new Date(t.actualStart); // ms
                const hours = dur / (1000 * 60 * 60);
                driverDurationSum[t.driverId] = (driverDurationSum[t.driverId] || 0) + hours;
                driverDurationCount[t.driverId] = (driverDurationCount[t.driverId] || 0) + 1;
            }
        }
    });

    const driverExpenses = {};
    exp.forEach(e => {
        driverExpenses[e.createdBy] = (driverExpenses[e.createdBy] || 0) + Number(e.amount || 0);
    });

    let sumSafetyScore = 0;
    let safetyScoreCount = 0;
    let totalDistance = 0;
    let totalTrips = 0;

    const breakdown = allDrivers.map(d => {
        const safetyScore = d.safetyScore ? Number(d.safetyScore) : 100;
        const totalTrps = driverTripsCount[d.id] || 0;
        const completedTrps = driverCompletedTripsCount[d.id] || 0;
        const dist = driverDistance[d.id] || 0;
        const wght = driverWeight[d.id] || 0;
        const expAmount = driverExpenses[d.id] || 0;
        
        let avgDuration = 0;
        if (driverDurationCount[d.id]) {
            avgDuration = Number((driverDurationSum[d.id] / driverDurationCount[d.id]).toFixed(2));
        }

        sumSafetyScore += safetyScore;
        safetyScoreCount++;
        totalDistance += dist;
        totalTrips += completedTrps;

        return {
            driverId: d.id,
            name: d.name,
            email: d.email,
            safetyScore,
            totalTrips: totalTrps,
            completedTrips: completedTrps,
            totalDistanceKm: Number(dist.toFixed(2)),
            totalCargoWeightKg: Number(wght.toFixed(2)),
            averageTripDurationHours: avgDuration,
            totalExpensesLogged: Number(expAmount.toFixed(2)),
        };
    });

    const averageSafetyScore = safetyScoreCount > 0 ? Number((sumSafetyScore / safetyScoreCount).toFixed(2)) : 100;

    return {
        metrics: {
            averageSafetyScore,
            totalDistance: Number(totalDistance.toFixed(2)),
            totalTrips,
        },
        breakdown,
    };
}

export async function getMaintenanceTrends() {
    const maint = await db.select().from(maintenance);

    let totalCost = 0;
    const typeCost = {};
    const typeCount = {};
    const monthlyCost = {};
    const monthlyCount = {};

    maint.forEach(m => {
        const cost = Number(m.cost || 0);
        totalCost += cost;

        typeCost[m.maintenanceType] = (typeCost[m.maintenanceType] || 0) + cost;
        typeCount[m.maintenanceType] = (typeCount[m.maintenanceType] || 0) + 1;

        // Date grouping: YYYY-MM
        const date = new Date(m.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        monthlyCost[monthKey] = (monthlyCost[monthKey] || 0) + cost;
        monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    const totalCount = maint.length;
    const averageCost = totalCount > 0 ? Number((totalCost / totalCount).toFixed(2)) : 0;

    const typeBreakdown = Object.keys(typeCost).map(type => ({
        type,
        totalCost: Number(typeCost[type].toFixed(2)),
        count: typeCount[type],
    }));

    const monthlyTrend = Object.keys(monthlyCost).map(month => ({
        month,
        totalCost: Number(monthlyCost[month].toFixed(2)),
        count: monthlyCount[month],
        averageCost: Number((monthlyCost[month] / monthlyCount[month]).toFixed(2)),
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
        metrics: {
            totalCost: Number(totalCost.toFixed(2)),
            totalCount,
            averageCost,
            typeBreakdown,
        },
        monthlyTrend,
    };
}

export async function getExpenseTrends() {
    const exp = await db.select().from(expenses);

    let totalExpense = 0;
    const categoryCost = {};
    const categoryCount = {};
    const monthlyCost = {};
    const monthlyCount = {};

    exp.forEach(e => {
        const amt = Number(e.amount || 0);
        totalExpense += amt;

        categoryCost[e.category] = (categoryCost[e.category] || 0) + amt;
        categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;

        const date = new Date(e.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        monthlyCost[monthKey] = (monthlyCost[monthKey] || 0) + amt;
        monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    const totalCount = exp.length;
    const categoryBreakdown = Object.keys(categoryCost).map(category => ({
        category,
        totalCost: Number(categoryCost[category].toFixed(2)),
        count: categoryCount[category],
    }));

    const monthlyTrend = Object.keys(monthlyCost).map(month => ({
        month,
        totalCost: Number(monthlyCost[month].toFixed(2)),
        count: monthlyCount[month],
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
        metrics: {
            totalExpense: Number(totalExpense.toFixed(2)),
            totalCount,
            categoryBreakdown,
        },
        monthlyTrend,
    };
}

export async function getMonthlyStatistics() {
    // Compile chronological reports of the last 12 calendar months
    const allTrips = await db.select().from(trips);
    const fuel = await db.select().from(fuelLogs);
    const maint = await db.select().from(maintenance);
    const exp = await db.select().from(expenses);

    const monthlyStatsMap = {};

    // Get current calendar range (last 12 months)
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyStatsMap[monthKey] = {
            month: monthKey,
            completedTripsCount: 0,
            distanceCoveredKm: 0,
            fuelCost: 0,
            maintenanceCost: 0,
            generalExpensesCost: 0,
            totalOperationalCost: 0,
        };
    }

    allTrips.forEach(t => {
        if (t.status === 'COMPLETED') {
            const date = new Date(t.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyStatsMap[monthKey]) {
                monthlyStatsMap[monthKey].completedTripsCount++;
                monthlyStatsMap[monthKey].distanceCoveredKm += Number(t.distanceKm || 0);
            }
        }
    });

    fuel.forEach(f => {
        const date = new Date(f.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyStatsMap[monthKey]) {
            monthlyStatsMap[monthKey].fuelCost += Number(f.totalCost || 0);
        }
    });

    maint.forEach(m => {
        const date = new Date(m.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyStatsMap[monthKey]) {
            monthlyStatsMap[monthKey].maintenanceCost += Number(m.cost || 0);
        }
    });

    exp.forEach(e => {
        const date = new Date(e.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyStatsMap[monthKey]) {
            monthlyStatsMap[monthKey].generalExpensesCost += Number(e.amount || 0);
        }
    });

    const monthlyStats = Object.values(monthlyStatsMap).map(m => {
        const fuelCost = Number(m.fuelCost.toFixed(2));
        const maintenanceCost = Number(m.maintenanceCost.toFixed(2));
        const generalExpensesCost = Number(m.generalExpensesCost.toFixed(2));
        const total = fuelCost + maintenanceCost + generalExpensesCost;

        return {
            ...m,
            distanceCoveredKm: Number(m.distanceCoveredKm.toFixed(2)),
            fuelCost,
            maintenanceCost,
            generalExpensesCost,
            totalOperationalCost: Number(total.toFixed(2)),
        };
    }).sort((a, b) => a.month.localeCompare(b.month));

    return {
        monthlyStats,
    };
}
