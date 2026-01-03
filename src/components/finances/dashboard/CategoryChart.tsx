import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryChartProps {
    data: { name: string; value: number; color: string }[];
    privacyMode: boolean;
}

export function CategoryChart({ data, privacyMode }: CategoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                Sem dados de gastos.
            </div>
        );
    }

    const chartData = data.filter(d => d.value > 0);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Despesas por Categoria</h3>

            <div className="h-[220px] w-full flex items-center">
                {/* Gráfico */}
                <div className="h-full w-1/2 min-w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={65} // Reduzido para caber melhor
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => privacyMode ? "R$ •••••" : `R$ ${value.toFixed(2)}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legenda Lateral Customizada */}
                <div className="w-1/2 pl-4 space-y-2 max-h-[220px] overflow-y-auto">
                    {chartData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="truncate max-w-[80px] text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium whitespace-nowrap">
                                {Math.round((item.value / chartData.reduce((a, b) => a + b.value, 0)) * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
