import { db } from '../config/database.js';
import { expenses } from '../db/schema/expenses.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function createExpense(data) {
    const [expense] = await db.insert(expenses).values(data).returning();
    return expense;
}

export async function getExpensesByVehicle(vehicleId) {
    return db.select().from(expenses).where(eq(expenses.vehicleId, vehicleId));
}

export async function getTotalExpenses() {
    const [result] = await db
        .select({
            total: sql`sum(${expenses.amount})`
        })
        .from(expenses);
    return result?.total ? Number(result.total) : 0;
}

export async function listExpenses(filters = {}) {
    const query = db.select().from(expenses);
    const conditions = [];
    if (filters.category) conditions.push(eq(expenses.category, filters.category));
    if (filters.vehicleId) conditions.push(eq(expenses.vehicleId, filters.vehicleId));
    if (filters.tripId) conditions.push(eq(expenses.tripId, filters.tripId));
    if (filters.createdBy) conditions.push(eq(expenses.createdBy, filters.createdBy));
    
    if (conditions.length > 0) {
        return query.where(and(...conditions));
    }
    return query;
}

export async function getExpenseById(id) {
    const [record] = await db.select().from(expenses).where(eq(expenses.id, id));
    return record || null;
}

export async function updateExpense(id, updates) {
    const [record] = await db
        .update(expenses)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(expenses.id, id))
        .returning();
    return record || null;
}

export async function deleteExpense(id) {
    const [record] = await db
        .delete(expenses)
        .where(eq(expenses.id, id))
        .returning();
    return record || null;
}

export async function getExpenseSummaryMetrics() {
    const [result] = await db
        .select({
            totalAmount: sql`sum(${expenses.amount})`,
            totalExpenses: sql`count(*)`
          })
          .from(expenses);
      
    const totalAmount = result?.totalAmount ? Number(result.totalAmount) : 0;
    const totalExpenses = result?.totalExpenses ? Number(result.totalExpenses) : 0;

    const categoryBreakdown = await db
        .select({
            category: expenses.category,
            totalAmount: sql`sum(${expenses.amount})`,
            count: sql`count(*)`
        })
        .from(expenses)
        .groupBy(expenses.category);

    return {
        totalAmount,
        totalExpenses,
        categoryBreakdown
    };
}

export async function getExpenseSummaryByVehicle() {
    return db
        .select({
            vehicleId: expenses.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            brand: vehicles.brand,
            model: vehicles.model,
            totalAmount: sql`sum(${expenses.amount})`,
            count: sql`count(*)`
        })
        .from(expenses)
        .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
        .groupBy(expenses.vehicleId, vehicles.registrationNumber, vehicles.brand, vehicles.model);
}

