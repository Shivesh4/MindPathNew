'use client';

import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"

export default function StatCard({ stat, loading }) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-3 rounded-full ${stat.color} backdrop-blur-sm shadow-inner`}>
                    {stat.icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                    {loading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        stat.value
                    )}
                </div>
                <p className={`text-xs ${stat.changeColor} mt-2 font-medium flex items-center`}>
                    <span className="relative">
                        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                        <span className="ml-3">{stat.change}</span>
                    </span>
                </p>
            </CardContent>
        </Card>
    )
}