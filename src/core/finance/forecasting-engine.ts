import { Transaction } from "@/types/finance";
import { addDays, format, isAfter, isBefore, isSameDay, parseISO } from "date-fns";
import { generateRecurringTransactions } from "./transaction-engine";

export interface DailyBalance {
    date: string;
    balance: number;
    income: number;
    expense: number;
    transactions: Transaction[];
    hasVirtual: boolean;
}

export function calculateProjectedCashFlow(
    currentBalance: number,
    transactions: Transaction[],
    days: number = 90
): DailyBalance[] {
    const today = new Date();
    // Normalize today to start of day
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, days);

    // 1. Filter Relevant Existing Transactions
    // We want Future interactions + Past Pending (liabilities)
    const effectiveTransactions = transactions.filter(t => {
        // If paid, ignore (already in balance)
        if (t.is_paid || t.status === 'paid') return false;
        return true;
        // We include ALL pending. 
        // Optimization: Don't include pending from 10 years ago? Assuming user cleans up.
    });

    // 2. Identify Recurring Patterns to Extend
    // We look for 'is_recurring' items. 
    // We group by recurrence_id.
    const recurrenceGroups: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
        if (t.is_recurring && t.recurrence_id) {
            if (!recurrenceGroups[t.recurrence_id]) recurrenceGroups[t.recurrence_id] = [];
            recurrenceGroups[t.recurrence_id].push(t);
        }
    });

    const virtualTransactions: Transaction[] = [];

    Object.values(recurrenceGroups).forEach(group => {
        // Find the latest scheduled date in DB
        const sorted = group.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
        const lastTx = sorted[sorted.length - 1];
        const lastDate = parseISO(lastTx.transaction_date);

        // If the last scheduled occurrence is before our simulation end, we project more.
        if (isBefore(lastDate, endDate)) {
            // Check if frequency exists
            const frequency = lastTx.frequency || 'monthly';
            // Generate enough future items. Start from Last Transaction.
            const projected = generateRecurringTransactions(
                { ...lastTx, id: 'temp-base' } as any,
                frequency,
                12 // Generate 12 periods to be safe
            );

            // Filter valid ones
            projected.forEach((pt, index) => {
                // generateRecurringTransactions includes the base date as index 0 usually?
                // Let's check impl: it generates 'occurrences' starting from 'baseTransaction.transaction_date' + 1 period?
                // Step 1071: loops i=0 to occurrences. 
                // if monthly: addMonths(date, i). 
                // So index 0 is SAME DATE as base.
                // We want NEW dates.

                // Correction: The `virtual` ones should strictly be AFTER `lastDate`.
                const ptDate = parseISO(pt.transaction_date);
                if (isAfter(ptDate, lastDate) && (isBefore(ptDate, endDate) || isSameDay(ptDate, endDate))) {
                    virtualTransactions.push({
                        ...pt,
                        id: `virtual-${lastTx.recurrence_id}-${index}`,
                        created_at: new Date().toISOString(),
                        is_paid: false,
                        status: 'projected',
                        description: `${pt.description} (Projeção)`
                    } as Transaction);
                }
            });
        }
    });

    // Combine Real Pending + Virtual
    const simulationSet = [...effectiveTransactions, ...virtualTransactions];

    // 3. Simulate Day by Day
    let runningBalance = currentBalance;
    const result: DailyBalance[] = [];

    for (let i = 0; i <= days; i++) {
        const currentDate = addDays(today, i);

        // Find transactions hitting this day
        const dailyTxs = simulationSet.filter(t => {
            const tDate = parseISO(t.transaction_date);
            tDate.setHours(0, 0, 0, 0); // Normalize

            if (i === 0) {
                // On Day 0 (Today), include Past Pending transactions
                return isSameDay(tDate, currentDate) || isBefore(tDate, currentDate);
            }
            return isSameDay(tDate, currentDate);
        });

        // Apply to Balance
        let dailyIncome = 0;
        let dailyExpense = 0;

        dailyTxs.forEach(t => {
            const val = Number(t.amount);
            if (t.type === 'income') dailyIncome += val;
            else dailyExpense += val;
        });

        runningBalance += (dailyIncome - dailyExpense);

        result.push({
            date: format(currentDate, 'dd/MM'),
            fullDate: format(currentDate, 'yyyy-MM-dd'), // For keys
            balance: runningBalance,
            income: dailyIncome,
            expense: dailyExpense,
            transactions: dailyTxs,
            hasVirtual: dailyTxs.some(t => t.status === 'projected')
        } as any);
    }

    return result;
}

export function calculateHistoricalCashFlow(
    currentBalance: number,
    transactions: Transaction[],
    days: number = 30
): DailyBalance[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let runningBalance = currentBalance;
    const result: DailyBalance[] = [];

    // We start from Today and go backwards
    for (let i = 0; i < days; i++) {
        const currentDate = addDays(today, -i); // 0 = Today, 1 = Yesterday

        // Push Current State BEFORE reversing for previous day
        // Actually, runningBalance at i=0 IS Today's Balance.

        const dateStr = format(currentDate, 'dd/MM');

        // Find transactions for this day
        const dailyTxs = transactions.filter(t => {
            const tDate = parseISO(t.transaction_date);
            return isSameDay(tDate, currentDate) && (t.is_paid || t.status === 'paid'); // Only paid items in history
        });

        let dailyIncome = 0;
        let dailyExpense = 0;
        dailyTxs.forEach(t => {
            if (t.type === 'income') dailyIncome += Number(t.amount);
            else dailyExpense += Number(t.amount);
        });

        // Current 'runningBalance' corresponds to End of 'currentDate'.
        result.push({
            date: dateStr,
            balance: runningBalance,
            income: dailyIncome,
            expense: dailyExpense,
            transactions: dailyTxs,
            hasVirtual: false
        } as any);

        // Reverse to get previous day's end balance
        // Balance(Prev) = Balance(Curr) - Income + Expense
        runningBalance = runningBalance - dailyIncome + dailyExpense;
    }

    return result.reverse();
}
