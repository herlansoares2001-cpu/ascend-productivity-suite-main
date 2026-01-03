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
    // --- 1. Finance Data (Optimized via RPC) ---
    // @ts-ignore
    const { data: financeData } = await supabase.rpc('get_finance_summary', { p_user_id: userId }) as any;

    // Default values if RPC data is empty
    const summary = (financeData && Array.isArray(financeData) && financeData.length > 0) ? financeData[0] : {
        spent_today: 0,
        spent_month: 0,
        spent_last_month: 0,
        income_month: 0
    };

    const spentToday = Number(summary.spent_today) || 0;
    const spentMonth = Number(summary.spent_month) || 0;
    const spentLastMonth = Number(summary.spent_last_month) || 0;
    const incomeMonth = Number(summary.income_month) || 0;

    // Prefer passed balance, otherwise 0
    const balance = currentBalance !== undefined ? currentBalance : 0;

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
