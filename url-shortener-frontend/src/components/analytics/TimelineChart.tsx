// src/components/analytics/TimelineChart.tsx - Corrigido
import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TimelineData } from "@/types/analytics.types";

interface TimelineChartProps {
    data?: TimelineData;
    loading?: boolean;
    granularity: "daily" | "hourly" | "weekly";
    onGranularityChange: (granularity: "daily" | "hourly" | "weekly") => void;
    detailed?: boolean;
}

export function TimelineChart({
                                  data,
                                  loading = false,
                                  granularity,
                                  onGranularityChange,
                                  detailed = false
                              }: TimelineChartProps) {
    const [chartType, setChartType] = useState<"line" | "area">("area");
    const [showUniqueVisitors, setShowUniqueVisitors] = useState(false);

    const formatDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);

            switch (granularity) {
                case "hourly":
                    return format(date, "HH:mm", { locale: ptBR });
                case "daily":
                    return format(date, "dd/MM", { locale: ptBR });
                case "weekly":
                    return format(date, "dd/MM", { locale: ptBR });
                default:
                    return format(date, "dd/MM", { locale: ptBR });
            }
        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return dateString;
        }
    };

    const formatTooltipDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);

            switch (granularity) {
                case "hourly":
                    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
                case "daily":
                    return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
                case "weekly":
                    return format(date, "'Semana de' dd/MM/yyyy", { locale: ptBR });
                default:
                    return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
            }
        } catch (error) {
            console.warn('Error formatting tooltip date:', dateString, error);
            return dateString;
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    // Verificação mais segura dos dados
    console.log('TimelineChart - data received:', data);

    // Verificar se temos dados válidos
    const hasValidData = data &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0;

    if (!hasValidData) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                {data && (
                    <p className="text-xs text-gray-400 mt-2">
                        Debug: {JSON.stringify(data, null, 2)}
                    </p>
                )}
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium mb-2">{formatTooltipDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-semibold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                        {(data?.totalClicks || 0).toLocaleString()} cliques totais
                    </Badge>
                    {data?.totalUniqueVisitors && (
                        <Badge variant="outline" className="font-mono">
                            {data.totalUniqueVisitors.toLocaleString()} visitantes únicos
                        </Badge>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {detailed && (
                        <>
                            <ToggleGroup
                                type="single"
                                value={chartType}
                                onValueChange={(value: string) => value && setChartType(value as "line" | "area")}
                                size="sm"
                            >
                                <ToggleGroupItem value="area">Área</ToggleGroupItem>
                                <ToggleGroupItem value="line">Linha</ToggleGroupItem>
                            </ToggleGroup>

                            {data?.totalUniqueVisitors && (
                                <Button
                                    variant={showUniqueVisitors ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowUniqueVisitors(!showUniqueVisitors)}
                                >
                                    Visitantes únicos
                                </Button>
                            )}
                        </>
                    )}

                    <ToggleGroup
                        type="single"
                        value={granularity}
                        onValueChange={(value: any) => value && onGranularityChange(value as any)}
                        size="sm"
                    >
                        <ToggleGroupItem value="hourly">Hora</ToggleGroupItem>
                        <ToggleGroupItem value="daily">Dia</ToggleGroupItem>
                        <ToggleGroupItem value="weekly">Semana</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                        <AreaChart data={data.data}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                            />
                            <YAxis fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.2}
                                strokeWidth={2}
                                name="Cliques"
                            />
                            {showUniqueVisitors && data?.totalUniqueVisitors && (
                                <Area
                                    type="monotone"
                                    dataKey="uniqueVisitors"
                                    stroke="hsl(var(--secondary))"
                                    fill="hsl(var(--secondary))"
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                    name="Visitantes únicos"
                                />
                            )}
                        </AreaChart>
                    ) : (
                        <LineChart data={data.data}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                            />
                            <YAxis fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="clicks"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                                name="Cliques"
                            />
                            {showUniqueVisitors && data?.totalUniqueVisitors && (
                                <Line
                                    type="monotone"
                                    dataKey="uniqueVisitors"
                                    stroke="hsl(var(--secondary))"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="Visitantes únicos"
                                />
                            )}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}