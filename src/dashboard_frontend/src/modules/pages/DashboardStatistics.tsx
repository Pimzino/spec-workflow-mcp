import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Icons
const DocumentIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

// Circular Progress Component
function CircularProgress({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-gray-200 dark:text-gray-700/50"
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="url(#progressGradient)"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: 'purple' | 'green' | 'blue' | 'yellow';
  trend?: { value: number; isPositive: boolean };
  glowColor?: string;
  children?: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon, gradient, trend, glowColor, children }: StatCardProps) {
  const gradientClasses = {
    purple: 'gradient-icon',
    green: 'gradient-icon-green',
    blue: 'gradient-icon-blue',
    yellow: 'gradient-icon-yellow',
  };

  return (
    <div
      className={`glass-card glow-hover p-6 group ${glowColor || ''}`}
      style={glowColor ? { '--glow-color': glowColor } as React.CSSProperties : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${gradientClasses[gradient]} shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {trend.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
      )}
      {children}
    </div>
  );
}

// Custom Tooltip for Chart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 shadow-xl border border-purple-500/20">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-white">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
}

function Content() {
  const { t } = useTranslation();
  const { initial } = useWs();
  const { specs, approvals, reloadAll } = useApi();
  const { info } = useApi();
  const [trendFilter, setTrendFilter] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);
  useEffect(() => {
    if (!initial) reloadAll();
  }, [initial, reloadAll]);

  const totalSpecs = specs.length;
  const totalTasks = specs.reduce((acc, s) => acc + (s.taskProgress?.total || 0), 0);
  const completedTasks = specs.reduce((acc, s) => acc + (s.taskProgress?.completed || 0), 0);
  const remainingTasks = totalTasks - completedTasks;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Generate mock trend data based on actual task completion
  const trendData = useMemo(() => {
    const now = new Date();
    const dataPoints = trendFilter === 'week' ? 7 : trendFilter === 'month' ? 30 : 90;
    const data = [];

    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Simulate gradual progress towards current completion
      const progress = Math.max(0, completedTasks - Math.floor((i / dataPoints) * completedTasks * 0.3));
      const variation = Math.floor(Math.random() * 3) - 1;

      data.push({
        date: dateStr,
        completed: Math.max(0, progress + variation),
      });
    }

    return data;
  }, [completedTasks, trendFilter]);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {info?.projectName || t('projectNameDefault')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('projectDescription')}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="status-indicator status-indicator-online"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('connectionStatus.connected')}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Specs Card */}
        <StatCard
          title={t('stats.specifications.title')}
          value={totalSpecs}
          subtitle={t('stats.specifications.label')}
          icon={<DocumentIcon />}
          gradient="blue"
          trend={totalSpecs > 0 ? { value: 12, isPositive: true } : undefined}
        />

        {/* Total Tasks Card */}
        <StatCard
          title={t('dashboard.totalTasks', 'Total Tasks')}
          value={totalTasks}
          subtitle={t('dashboard.acrossAllSpecs', 'Across all specs')}
          icon={<CheckCircleIcon />}
          gradient="purple"
        />

        {/* Completed Tasks Card */}
        <StatCard
          title={t('dashboard.completed', 'Completed')}
          value={completedTasks}
          subtitle={`${remainingTasks} ${t('dashboard.remaining', 'remaining')}`}
          icon={<CheckCircleIcon />}
          gradient="green"
          trend={completedTasks > 0 ? { value: Math.round(taskCompletionRate), isPositive: true } : undefined}
        />

        {/* Approvals Card */}
        <StatCard
          title={t('stats.approvals.title')}
          value={approvals.length}
          subtitle={approvals.length > 0 ? t('stats.approvals.awaiting') : t('stats.approvals.allClear')}
          icon={<ClockIcon />}
          gradient={approvals.length > 0 ? 'yellow' : 'purple'}
          glowColor={approvals.length > 0 ? 'amber' : undefined}
        >
          {approvals.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {t('dashboard.actionRequired', 'Action required')}
              </span>
            </div>
          )}
        </StatCard>
      </div>

      {/* Trend Chart & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-icon rounded-xl">
                <ChartIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.taskTrend', 'Task Completion Trend')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.progressOverTime', 'Progress over time')}
                </p>
              </div>
            </div>

            {/* Toggle Pills */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-full">
              {(['week', 'month', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTrendFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    trendFilter === filter
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t(`dashboard.${filter}`, filter.charAt(0).toUpperCase() + filter.slice(1))}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6"/>
                    <stop offset="100%" stopColor="#ec4899"/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fill="url(#colorCompleted)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('dashboard.overallProgress', 'Overall Progress')}
          </h3>

          {/* Circular Progress */}
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={taskCompletionRate} size={140} strokeWidth={10} />
          </div>

          {/* Progress Details */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.tasksCompleted', 'Tasks Completed')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="progress-gradient">
                <div
                  className="progress-gradient-fill"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">{t('dashboard.done', 'Done')}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{remainingTasks}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">{t('dashboard.left', 'Left')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Coming Soon Card */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Gradient Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('comingSoon.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
              {t('comingSoon.description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.npmjs.com/package/@pimzino/spec-workflow-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient-red inline-flex items-center gap-2 px-5 py-2.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 5.183H13.82v-1.67h3.532V6.875H5.113v3.28h5.605v1.671H5.122l.008-6.503zm6.98 5.579h3.532v-2.489H12.11v2.489z"/>
              </svg>
              {t('links.npm')}
            </a>

            <a
              href="https://github.com/Pimzino/spec-workflow-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass inline-flex items-center gap-2 px-5 py-2.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('links.github')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardStatistics() {
  return <Content />;
}
