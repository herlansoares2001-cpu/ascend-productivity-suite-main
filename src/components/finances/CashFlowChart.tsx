import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DailyBalance } from '@/lib/forecasting-engine';

interface CashFlowChartProps {
    data: DailyBalance[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as DailyBalance;
        return (
            <div className="bg-background border border-border p-3 rounded-lg shadow-xl text-xs min-w-[200px]">
                <p className="font-bold mb-2">{label}</p>
                <div className="flex justify-between mb-1">
                    <span>Saldo Previsto:</span>
                    <span className={`font-bold ${data.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {data.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                {data.income > 0 && (
                    <div className="flex justify-between text-green-500">
                        <span>Entradas:</span>
                        <span>+{data.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                )}
                {data.expense > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span>Saídas:</span>
                        <span>-{data.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                )}

                {/* Major Transactions */}
                {(data.transactions && data.transactions.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-muted">
                        <p className="text-muted-foreground mb-1">Movimentações:</p>
                        <div className="space-y-1">
                            {data.transactions.slice(0, 3).map((t, idx) => (
                                <div key={idx} className="flex justify-between opacity-80">
                                    <span className="truncate max-w-[120px]">{t.description}</span>
                                    <span className={t.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                                        {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            ))}
                            {data.transactions.length > 3 && <p className="text-[10px] text-muted-foreground italic">e mais {data.transactions.length - 3}...</p>}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export function CashFlowChart({ data }: CashFlowChartProps) {
    const offset = useMemo(() => {
        const dataMax = Math.max(...data.map((i) => i.balance));
        const dataMin = Math.min(...data.map((i) => i.balance));

        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;

        return dataMax / (dataMax - dataMin);
    }, [data]);

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    Fluxo de Caixa Projetado (90 dias)
                    {data.some(d => d.balance < 0) && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                            Risco de Saldo Negativo
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full px-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={offset} stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset={offset} stopColor="#ef4444" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={offset} stopColor="#10b981" stopOpacity={1} />
                                <stop offset={offset} stopColor="#ef4444" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `R$${val / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="url(#splitStroke)"
                            fill="url(#splitColor)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
