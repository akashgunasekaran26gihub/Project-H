import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

export const ChartsSection = () => {
  const { trendsData, loading } = useHabits();

  if (loading || !trendsData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-surface rounded-2xl border border-border animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  const { dailyTrend, habitComparison, weekdayStats } = trendsData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      
      {/* 1. Monthly Completion Trend Chart */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                MONTHLY COMPLETION TREND
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Daily percentage of active habits executed successfully
            </p>
          </div>
        </div>

        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tickFormatter={(val) => val.replace('Day ', '')}
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                minTickGap={12}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-md border border-slate-800">
                        <p className="font-bold">{data.day}</p>
                        <p className="text-emerald-300 font-semibold">{data.rate}% completed</p>
                        <p className="text-[10px] text-slate-300">{data.completed} of {data.total} habits</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 2, fill: '#4f46e5' }}
                activeDot={{ r: 4, fill: '#4338ca' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Habit Comparison Bar Chart */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                HABIT COMPARISON
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Total monthly completion rates by individual habit
            </p>
          </div>
        </div>

        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitComparison} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                interval={0}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-md border border-slate-800">
                        <p className="font-bold">{data.name}</p>
                        <p className="text-emerald-300 font-semibold">{data.completionRate}% monthly rate</p>
                        <p className="text-[10px] text-slate-300">{data.completions} completions logged</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="completionRate" radius={[6, 6, 0, 0]}>
                {habitComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ChartsSection;
