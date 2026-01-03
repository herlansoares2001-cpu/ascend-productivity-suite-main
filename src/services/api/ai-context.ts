import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, format, isSameDay, parseISO } from "date-fns";

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
        score: string;
        neglected: string[];
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

    // --- 1. Finance Data (OTIMIZADO via RPC) ---
    let spentToday = 0;
    let spentMonth = 0;
    let spentLastMonth = 0;
    let incomeMonth = 0;

    interface FinanceSummaryRow {
        spent_today: number;
        spent_month: number;
        spent_last_month: number;
        income_month: number;
    }

    try {
        const { data, error: financeError } = await supabase
            .rpc('get_finance_summary', { p_user_id: userId });

        if (!financeError && data && (data as any[]).length > 0) {
            // Safe casting and checking
            const row = (data as any[])[0] as FinanceSummaryRow;
            spentToday = Number(row.spent_today) || 0;
            spentMonth = Number(row.spent_month) || 0;
            spentLastMonth = Number(row.spent_last_month) || 0;
            incomeMonth = Number(row.income_month) || 0;
        }
    } catch (error) {
        console.warn("Erro ao buscar resumo financeiro (RPC):", error);
        // Fallback or just keep zeros
    }

    const balance = currentBalance !== undefined ? currentBalance : 0;

    // --- 2. Habits Data ---
    const { data: habits } = await supabase
        .from('habits')
        .select('*, habit_completions(*)');

    const totalHabits = habits?.length || 0;
    let completedToday = 0;
    const neglected: string[] = [];

    habits?.forEach(habit => {
        const completions = habit.habit_completions || [];
        const doneToday = completions.some(c => isSameDay(parseISO(c.completed_at), now));
        if (doneToday) completedToday++;

        const sorted = completions.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        const lastCompletion = sorted[0];

        if (lastCompletion) {
            const daysDiff = (now.getTime() - new Date(lastCompletion.completed_at).getTime()) / (1000 * 3600 * 24);
            if (daysDiff > 3) neglected.push(habit.name);
        } else {
            neglected.push(habit.name);
        }
    });

    // --- 3. Tasks ---
    const { data: tasks } = await supabase
        .from('tasks')
        .select('title')
        .eq('user_id', userId)
        .eq('completed', false)
        .limit(5);

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
            neglected: neglected.slice(0, 5)
        },
        tasks: {
            pendingCount: pendingTasks.length,
            priorityTasks: topTasks
        },
        calendar: {
            todayEvents: 0
        },
        timestamp: now.toLocaleString('pt-PT')
    };
}
