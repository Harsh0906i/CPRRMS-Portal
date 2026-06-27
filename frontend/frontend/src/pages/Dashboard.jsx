import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../features/analyticsSlice';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Users, HeartPulse, UserPlus, TrendingUp } from 'lucide-react';

// Custom colors for charts
const COLORS_PASTEL = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
const COLORS_TEAL = ['#0D9488', '#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { summary, distributions, loading, error } = useSelector(state => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Patients',
      value: summary.totalPatients,
      icon: Users,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description: 'Cumulative registered cases'
    },
    {
      title: 'Active Registry Cases',
      value: summary.activeCases,
      icon: HeartPulse,
      colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      description: 'Patients in active treatment'
    },
    {
      title: 'New Registrations',
      value: summary.newCases,
      icon: UserPlus,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Registered this month'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinical Registry Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Overview of patient demographics, diagnostics, and treatment metrics.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full animate-pulse">
          <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
          System Live
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load analytics: {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{kpi.title}</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{kpi.value}</h3>
                <p className="text-[11px] text-muted-foreground">{kpi.description}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${kpi.colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Monthly registrations AreaChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Patient Registrations Trend (Last 12m)</h4>
          <div className="h-64">
            {distributions.monthlyRegistrations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No registration history found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={distributions.monthlyRegistrations}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="New Cases" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Cancer Distribution PieChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Registry Cancer Types</h4>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center">
            {distributions.cancerDistribution.length === 0 ? (
              <div className="text-xs text-muted-foreground">No diagnostic records registered</div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributions.cancerDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distributions.cancerDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_PASTEL[index % COLORS_PASTEL.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="w-full md:w-1/2 mt-4 md:mt-0 max-h-60 overflow-y-auto space-y-2 px-4">
                  {distributions.cancerDistribution.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS_PASTEL[idx % COLORS_PASTEL.length] }} />
                        <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value} ({Math.round((item.value / summary.totalPatients) * 100 || 0)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Stage Statistics BarChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Diagnostic Stages Staging Profile</h4>
          <div className="h-64">
            {distributions.stageDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No staging records found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.stageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                  <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} name="Cases Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Age Groups Distribution BarChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Registry Age Demographics</h4>
          <div className="h-64">
            {distributions.ageDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No demographic data found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Cases Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 5. Treatment Regimen Distribution BarChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Therapeutic Regimens Distribution</h4>
          <div className="h-64">
            {distributions.treatmentDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No active treatment records found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.treatmentDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={9} width={90} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                  <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Patient Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 6. Gender Distribution PieChart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Gender Demographics</h4>
          <div className="h-64 flex items-center justify-center">
            {distributions.genderDistribution.length === 0 ? (
              <div className="text-xs text-muted-foreground">No patient records registered</div>
            ) : (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributions.genderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributions.genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_TEAL[index % COLORS_TEAL.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {distributions.genderDistribution.map((item, idx) => (
                    <div key={item.name} className="flex items-center text-xs">
                      <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS_TEAL[idx % COLORS_TEAL.length] }} />
                      <span className="font-semibold">{item.name}</span>
                      <span className="ml-auto text-muted-foreground font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
