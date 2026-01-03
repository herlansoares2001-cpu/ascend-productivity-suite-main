import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format, isSameDay, parseISO } from "date-fns";

export interface UserContextData {
    finance: {
        balance: number;
        spentToday: number;
        spentMonth: number;
        spentLastMonth: number;
        incomeMonth: number;
    };
    habits: {
        total: number;
        completedToday: number;
        score: string; // "2/5"
        neglected: string[]; // Names of habits not done for > 3 days
    };
    tasks: {
        pendingCount: number;
        priorityTasks: string[];
    };
    calendar: {
        todayEvents: number;
        nextEvent?: string;
    };
    timestamp: string;
}

export async function getGlobalUserContext(userId: string, currentBalance?: number): Promise<UserContextData> {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const startMonthStr = format(startOfMonth(now), 'yyyy-MM-dd');

    // --- 1. Finance Data ---
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date, category, is_paid')
        .eq('user_id', userId)
        .gte('transaction_date', format(subMonths(now, 1), 'yyyy-MM-01')); // Fetch last 2 months roughly

    let spentToday = 0;
    let spentMonth = 0;
    let spentLastMonth = 0;
    let incomeMonth = 0;
    // Prefer passed balance, otherwise 0 (or could try to fetch accounts sum if needed, but client passing is standard)
    const balance = currentBalance !== undefined ? currentBalance : 0;

    // ... rest of logic for spentToday etc ...

    const currentMonth = now.getMonth();
    const lastMonth = subMonths(now, 1).getMonth();

    transactions?.forEach(t => {
        const tDate = parseISO(t.transaction_date);
        const amount = Number(t.amount);

        // Expense logic
        if (t.type === 'expense') {
            if (isSameDay(tDate, now)) spentToday += amount;
            if (tDate.getMonth() === currentMonth) spentMonth += amount;
            if (tDate.getMonth() === lastMonth) spentLastMonth += amount;
        }
        // Income logic
        else if (t.type === 'income') {
            if (tDate.getMonth() === currentMonth) incomeMonth += amount;
        }
    });

    // --- 2. Habits Data ---
    const { data: habits } = await supabase
        .from('habits')
        .select('*, habit_completions(*)');

    const totalHabits = habits?.length || 0;
    let completedToday = 0;
    const neglected: string[] = [];

    habits?.forEach(idx => {
        const completions = idx.habit_completions || [];
        // Check today
        const doneToday = completions.some(c => isSameDay(parseISO(c.completed_at), now));
        if (doneToday) completedToday++;

        // Check neglect (simple logic: no completion in last 3 days)
        // Sort completions desc
        const sorted = completions.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        const lastCompletion = sorted[0];
        if (lastCompletion) {
            const daysDiff = (now.getTime() - new Date(lastCompletion.completed_at).getTime()) / (1000 * 3600 * 24);
            if (daysDiff > 3) neglected.push(idx.name);
        } else {
            // Never done?
            neglected.push(idx.name);
        }
    });

    // --- 3. Tasks ---
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false);

    const pendingTasks = tasks || [];
    const topTasks = pendingTasks.slice(0, 3).map(t => t.title);

    return {
        finance: {
            balance,
            spentToday,
            spentMonth,
            spentLastMonth,
            incomeMonth
        },
        habits: {
            total: totalHabits,
            completedToday,
            score: `${completedToday}/${totalHabits}`,
            neglected: neglected.slice(0, 5) // Limit
        },
        tasks: {
            pendingCount: pendingTasks.length,
            priorityTasks: topTasks
        },
        calendar: {
            todayEvents: 0
        },
        timestamp: now.toLocaleString('pt-BR')
    };
}
