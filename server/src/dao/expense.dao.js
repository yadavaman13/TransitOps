import { db } from '../config/database.js';
import { expenses } from '../db/schema/expenses.schema.js';
import { eq, sql } from 'drizzle-orm';

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
