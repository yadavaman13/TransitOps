import { db } from '../../../config/database.js';
import { vehicles } from '../../../db/schema/vehicles.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { driverProfiles } from '../../../db/schema/driver-profiles.schema.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { expenses } from '../../../db/schema/expenses.schema.js';
import { fuelLogs } from '../../../db/schema/fuel-logs.schema.js';
import { maintenance } from '../../../db/schema/maintenance.schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '../../auth/utils/appError.js';

export async function getFleetReport() {
    const allVehicles = await db.select().from(vehicles);

    const totalVehicles = allVehicles.length;
    const statusBreakdown = { AVAILABLE: 0, ON_TRIP: 0, MAINTENANCE: 0, RETIRED: 0 };
    const fuelTypeBreakdown = {};

    let totalOdometer = 0;

    allVehicles.forEach(v => {
        if (statusBreakdown[v.status] !== undefined) {
            statusBreakdown[v.status]++;
        } else {
            statusBreakdown[v.status] = (statusBreakdown[v.status] || 0) + 1;
        }

        fuelTypeBreakdown[v.fuelType] = (fuelTypeBreakdown[v.fuelType] || 0) + 1;
        totalOdometer += Number(v.currentOdometer || 0);
    });

    const averageOdometer = totalVehicles > 0 ? Number((totalOdometer / totalVehicles).toFixed(2)) : 0;

    return {
        metrics: {
            totalVehicles,
            statusBreakdown,
            fuelTypeBreakdown,
            totalOdometer: Number(totalOdometer.toFixed(2)),
            averageOdometer,
        },
        vehicles: allVehicles,
    };
}

export async function getDriverReport() {
    const allDrivers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive,
            availabilityStatus: driverProfiles.availabilityStatus,
            safetyScore: driverProfiles.safetyScore,
            licenseNumber: driverProfiles.licenseNumber,
            phone: driverProfiles.phone,
        })
        .from(users)
        .leftJoin(driverProfiles, eq(users.id, driverProfiles.userId))
        .where(and(eq(users.role, 'DRIVER'), eq(users.isDeleted, false)));

    const allTrips = await db.select().from(trips);
    const driverTripCounts = {};
    const driverActiveTripCounts = {};

    allTrips.forEach(t => {
        driverTripCounts[t.driverId] = (driverTripCounts[t.driverId] || 0) + 1;
        if (['DRAFT', 'DISPATCHED', 'STARTED'].includes(t.status)) {
            driverActiveTripCounts[t.driverId] = (driverActiveTripCounts[t.driverId] || 0) + 1;
        }
    });

    const driversWithTrips = allDrivers.map(d => ({
        ...d,
        totalTrips: driverTripCounts[d.id] || 0,
        activeTrips: driverActiveTripCounts[d.id] || 0,
    }));

    const totalDrivers = allDrivers.length;
    const activeDrivers = allDrivers.filter(d => d.isActive).length;
    const inactiveDrivers = totalDrivers - activeDrivers;

    const availabilityBreakdown = { AVAILABLE: 0, ON_TRIP: 0, MAINTENANCE: 0, RESTING: 0 };
    allDrivers.forEach(d => {
        const status = d.availabilityStatus || 'AVAILABLE';
        if (availabilityBreakdown[status] !== undefined) {
            availabilityBreakdown[status]++;
        } else {
            availabilityBreakdown[status] = (availabilityBreakdown[status] || 0) + 1;
        }
    });

    return {
        metrics: {
            totalDrivers,
            activeDrivers,
            inactiveDrivers,
            availabilityBreakdown,
        },
        drivers: driversWithTrips,
    };
}

export async function getTripReport() {
    const allTrips = await db
        .select({
            id: trips.id,
            tripNumber: trips.tripNumber,
            vehicleId: trips.vehicleId,
            driverId: trips.driverId,
            source: trips.source,
            destination: trips.destination,
            cargoName: trips.cargoName,
            cargoWeight: trips.cargoWeight,
            distanceKm: trips.distanceKm,
            status: trips.status,
            plannedStart: trips.plannedStart,
            plannedEnd: trips.plannedEnd,
            actualStart: trips.actualStart,
            actualEnd: trips.actualEnd,
            vehicleRegistration: vehicles.registrationNumber,
            driverName: users.name,
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
        .leftJoin(users, eq(trips.driverId, users.id));

    const totalTrips = allTrips.length;
    const statusBreakdown = { DRAFT: 0, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
    let totalDistance = 0;
    let totalCargoWeight = 0;

    allTrips.forEach(t => {
        if (statusBreakdown[t.status] !== undefined) {
            statusBreakdown[t.status]++;
        } else {
            statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
        }
        totalDistance += Number(t.distanceKm || 0);
        totalCargoWeight += Number(t.cargoWeight || 0);
    });

    const averageDistance = totalTrips > 0 ? Number((totalDistance / totalTrips).toFixed(2)) : 0;
    const averageCargoWeight = totalTrips > 0 ? Number((totalCargoWeight / totalTrips).toFixed(2)) : 0;

    return {
        metrics: {
            totalTrips,
            statusBreakdown,
            totalDistance: Number(totalDistance.toFixed(2)),
            averageDistance,
            totalCargoWeight: Number(totalCargoWeight.toFixed(2)),
            averageCargoWeight,
        },
        trips: allTrips,
    };
}

export async function getExpenseReport() {
    const allExpenses = await db.select().from(expenses);

    const totalAmount = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const categoryBreakdown = {};

    allExpenses.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount);
    });

    // Format category breakdown amounts to 2 decimals
    Object.keys(categoryBreakdown).forEach(cat => {
        categoryBreakdown[cat] = Number(categoryBreakdown[cat].toFixed(2));
    });

    const vehicleBreakdownRaw = await db
        .select({
            vehicleId: expenses.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            brand: vehicles.brand,
            model: vehicles.model,
            amount: expenses.amount,
        })
        .from(expenses)
        .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id));

    const vehicleBreakdownMap = {};
    vehicleBreakdownRaw.forEach(e => {
        const key = e.vehicleId;
        if (!vehicleBreakdownMap[key]) {
            vehicleBreakdownMap[key] = {
                vehicleId: e.vehicleId,
                registrationNumber: e.registrationNumber || 'Unknown',
                brand: e.brand || '',
                model: e.model || '',
                totalAmount: 0,
            };
        }
        vehicleBreakdownMap[key].totalAmount += Number(e.amount);
    });

    const vehicleBreakdown = Object.values(vehicleBreakdownMap).map(v => ({
        ...v,
        totalAmount: Number(v.totalAmount.toFixed(2)),
    }));

    return {
        metrics: {
            totalAmount: Number(totalAmount.toFixed(2)),
            categoryBreakdown,
        },
        vehicleBreakdown,
        expenses: allExpenses,
    };
}

export async function getOperationalCostReport() {
    const allVehicles = await db.select().from(vehicles);
    const fuel = await db.select().from(fuelLogs);
    const maint = await db.select().from(maintenance);
    const exp = await db.select().from(expenses);

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

    let totalOperationalCost = 0;

    const breakdown = allVehicles.map(v => {
        const fuelCost = fuelByVehicle[v.id] || 0;
        const maintenanceCost = maintByVehicle[v.id] || 0;
        const generalExpenseCost = expByVehicle[v.id] || 0;
        const total = fuelCost + maintenanceCost + generalExpenseCost;
        totalOperationalCost += total;

        return {
            vehicleId: v.id,
            registrationNumber: v.registrationNumber,
            brand: v.brand,
            model: v.model,
            fuelCost: Number(fuelCost.toFixed(2)),
            maintenanceCost: Number(maintenanceCost.toFixed(2)),
            generalExpenseCost: Number(generalExpenseCost.toFixed(2)),
            totalOperationalCost: Number(total.toFixed(2)),
        };
    });

    const averageOperationalCost = allVehicles.length > 0 ? Number((totalOperationalCost / allVehicles.length).toFixed(2)) : 0;

    return {
        metrics: {
            totalOperationalCost: Number(totalOperationalCost.toFixed(2)),
            averageOperationalCost,
        },
        breakdown,
    };
}

// Helpers for CSV and PDF generation
function convertToCSV(headers, rows) {
    const formatValue = (val) => {
        if (val === undefined || val === null) return '';
        const stringVal = String(val).replace(/"/g, '""');
        if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"')) {
            return `"${stringVal}"`;
        }
        return stringVal;
    };
    const headerLine = headers.map(formatValue).join(',');
    const rowLines = rows.map(r => r.map(formatValue).join(','));
    return [headerLine, ...rowLines].join('\n');
}

export function generateSimplePDF(title, headers, columnWidths, rows) {
    const reportTitle = `TransitOps - ${title}`;
    const generatedOn = `Generated on: ${new Date().toUTCString()}`;

    // Create table header
    let headerLine = "";
    headers.forEach((h, idx) => {
        const width = columnWidths[idx] || 10;
        headerLine += h.slice(0, width).padEnd(width) + "  ";
    });

    // PDF Stream Builder (PDF-1.4 format, pure JS)
    let streamContent = "BT\n";
    
    // Title: Helvetica-Bold, 16pt, primary color (mauve: 0.44 0.29 0.40 rg)
    streamContent += "/F2 16 Tf\n";
    streamContent += "20 TL\n";
    streamContent += "0.44 0.29 0.40 rg\n";
    streamContent += "40 730 Td\n";
    streamContent += `(${reportTitle.replace(/[()]/g, "")}) Tj T*\n`;
    
    // Subtitle: Helvetica, 9pt, muted color (grey-purple: 0.42 0.40 0.47 rg)
    streamContent += "/F3 9 Tf\n";
    streamContent += "14 TL\n";
    streamContent += "0.42 0.40 0.47 rg\n";
    streamContent += `(${generatedOn}) Tj T*\n`;
    streamContent += "() Tj T*\n"; // Empty line

    // Header divider: Courier, 8.5pt, muted color (0.42 0.40 0.47 rg)
    const divider = "_".repeat(headerLine.trimEnd().length);
    streamContent += "/F1 8.5 Tf\n";
    streamContent += "12 TL\n";
    streamContent += "0.42 0.40 0.47 rg\n";
    streamContent += "() Tj T*\n"; // Spacer
    
    // Table Header: Courier-Bold, 9pt, main text color (deep purple-black: 0.12 0.10 0.22 rg)
    streamContent += "/F4 9 Tf\n";
    streamContent += "0.12 0.10 0.22 rg\n";
    streamContent += `(${headerLine.replace(/[()]/g, "")}) Tj T*\n`;

    // Divider line: Courier, 8.5pt, muted color (0.42 0.40 0.47 rg)
    streamContent += "/F1 8.5 Tf\n";
    streamContent += "0.42 0.40 0.47 rg\n";
    streamContent += `(${divider}) Tj T*\n`;
    streamContent += "() Tj T*\n"; // Spacer

    // Table Content: Courier, 8.5pt, main text color (0.12 0.10 0.22 rg)
    streamContent += "0.12 0.10 0.22 rg\n";
    rows.forEach(r => {
        let rowLine = "";
        r.forEach((cell, idx) => {
            const width = columnWidths[idx] || 10;
            const strVal = cell !== undefined && cell !== null ? String(cell) : "";
            rowLine += strVal.slice(0, width).padEnd(width) + "  ";
        });
        const escaped = rowLine.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        streamContent += `(${escaped}) Tj T*\n`;
    });

    // Bottom Divider: Courier, 8.5pt, muted color (0.42 0.40 0.47 rg)
    streamContent += "0.42 0.40 0.47 rg\n";
    streamContent += `(${divider}) Tj T*\n`;
    
    // End text object
    streamContent += "ET";

    const streamLength = Buffer.byteLength(streamContent);

    const objects = [];
    objects.push("%PDF-1.4\n");
    
    const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> /Contents 5 0 R >>\nendobj\n";
    const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";
    const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
    const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";
    const obj7 = "7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    const obj8 = "8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n";

    const body = objects[0];
    const offsets = [];
    
    offsets.push(body.length);
    const p1 = body + obj1;
    offsets.push(p1.length);
    const p2 = p1 + obj2;
    offsets.push(p2.length);
    const p3 = p2 + obj3;
    offsets.push(p3.length);
    const p4 = p3 + obj4;
    offsets.push(p4.length);
    const p5 = p4 + obj5;
    offsets.push(p5.length);
    const p6 = p5 + obj6;
    offsets.push(p6.length);
    const p7 = p6 + obj7;
    offsets.push(p7.length);
    const p8 = p7 + obj8;

    const startXref = p8.length;
    let xref = "xref\n0 9\n0000000000 65535 f \n";
    offsets.forEach(offset => {
        xref += String(offset).padStart(10, '0') + " 00000 n \n";
    });
    
    const trailer = `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    
    return Buffer.from(p8 + xref + trailer, "utf-8");
}

export async function compileCSV(type) {
    if (type === 'fleet') {
        const data = await getFleetReport();
        const headers = ['Registration Number', 'Vehicle Number', 'Brand', 'Model', 'Manufacture Year', 'Fuel Type', 'Odometer', 'Status'];
        const rows = data.vehicles.map(v => [
            v.registrationNumber, v.vehicleNumber, v.brand, v.model, v.manufactureYear, v.fuelType, v.currentOdometer, v.status
        ]);
        return convertToCSV(headers, rows);
    }
    
    if (type === 'drivers') {
        const data = await getDriverReport();
        const headers = ['Name', 'Email', 'Phone', 'License Number', 'Availability Status', 'Safety Score', 'Total Trips', 'Active Trips'];
        const rows = data.drivers.map(d => [
            d.name, d.email, d.phone || '', d.licenseNumber || '', d.availabilityStatus || 'AVAILABLE', d.safetyScore || 'N/A', d.totalTrips, d.activeTrips
        ]);
        return convertToCSV(headers, rows);
    }

    if (type === 'trips') {
        const data = await getTripReport();
        const headers = ['Trip Number', 'Vehicle', 'Driver', 'Source', 'Destination', 'Cargo Name', 'Cargo Weight (kg)', 'Distance (km)', 'Status'];
        const rows = data.trips.map(t => [
            t.tripNumber, t.vehicleRegistration || '', t.driverName || '', t.source, t.destination, t.cargoName, t.cargoWeight, t.distanceKm, t.status
        ]);
        return convertToCSV(headers, rows);
    }

    if (type === 'expenses') {
        const data = await getExpenseReport();
        const headers = ['Category', 'Amount', 'Description', 'Receipt URL', 'Created By ID', 'Created At'];
        const rows = data.expenses.map(e => [
            e.category, e.amount, e.description || '', e.receipt || '', e.createdBy, e.createdAt.toUTCString()
        ]);
        return convertToCSV(headers, rows);
    }

    if (type === 'operational-cost' || type === 'costs') {
        const data = await getOperationalCostReport();
        const headers = ['Registration Number', 'Brand', 'Model', 'Fuel Cost', 'Maintenance Cost', 'General Expense Cost', 'Total Operational Cost'];
        const rows = data.breakdown.map(b => [
            b.registrationNumber, b.brand, b.model, b.fuelCost, b.maintenanceCost, b.generalExpenseCost, b.totalOperationalCost
        ]);
        return convertToCSV(headers, rows);
    }

    throw new AppError(`Invalid report type: ${type}`, 400);
}

export async function compilePDF(type) {
    if (type === 'fleet') {
        const data = await getFleetReport();
        const headers = ['REGISTRATION', 'BRAND', 'MODEL', 'YEAR', 'FUEL', 'ODOMETER', 'STATUS'];
        const widths = [15, 12, 12, 6, 8, 12, 12];
        const rows = data.vehicles.map(v => [
            v.registrationNumber, v.brand, v.model, v.manufactureYear, v.fuelType, v.currentOdometer, v.status
        ]);
        return generateSimplePDF('Fleet Operations Report', headers, widths, rows);
    }

    if (type === 'drivers') {
        const data = await getDriverReport();
        const headers = ['NAME', 'EMAIL', 'PHONE', 'LICENSE', 'AVAILABILITY', 'SCORE', 'TRIPS'];
        const widths = [18, 22, 12, 12, 12, 6, 6];
        const rows = data.drivers.map(d => [
            d.name, d.email, d.phone || 'N/A', d.licenseNumber || 'N/A', d.availabilityStatus || 'AVAILABLE', d.safetyScore || '100', d.totalTrips
        ]);
        return generateSimplePDF('Driver Performance Report', headers, widths, rows);
    }

    if (type === 'trips') {
        const data = await getTripReport();
        const headers = ['TRIP NO', 'VEHICLE', 'DRIVER', 'SOURCE', 'DESTINATION', 'CARGO', 'DIST(KM)', 'STATUS'];
        const widths = [10, 12, 15, 15, 15, 12, 8, 10];
        const rows = data.trips.map(t => [
            t.tripNumber, t.vehicleRegistration || '', t.driverName || '', t.source, t.destination, t.cargoName, t.distanceKm, t.status
        ]);
        return generateSimplePDF('Transit Trip Summary Report', headers, widths, rows);
    }

    if (type === 'expenses') {
        const data = await getExpenseReport();
        const headers = ['CATEGORY', 'AMOUNT', 'DESCRIPTION', 'DATE'];
        const widths = [12, 12, 45, 20];
        const rows = data.expenses.map(e => [
            e.category, e.amount, e.description || '', e.createdAt.toDateString()
        ]);
        return generateSimplePDF('Fleet Expenses Ledger Report', headers, widths, rows);
    }

    if (type === 'operational-cost' || type === 'costs') {
        const data = await getOperationalCostReport();
        const headers = ['VEHICLE REG', 'BRAND', 'MODEL', 'FUEL COST', 'MAINT COST', 'GENERAL EXP', 'TOTAL COST'];
        const widths = [14, 12, 12, 12, 12, 12, 14];
        const rows = data.breakdown.map(b => [
            b.registrationNumber, b.brand, b.model, b.fuelCost, b.maintenanceCost, b.generalExpenseCost, b.totalOperationalCost
        ]);
        return generateSimplePDF('Operational Cost Analysis Report', headers, widths, rows);
    }

    throw new AppError(`Invalid report type: ${type}`, 400);
}
