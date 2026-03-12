import { HRLayout } from "@/components/HRLayout";
import { StatsCard } from "@/components/StatsCard";
import { Users, TrendingUp, CalendarDays, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useDashboardStats } from "@/hooks/api/useDashboard";
import { useDepartments } from "@/hooks/api/useDepartments";

const leaveData = [
  { month: "Sep", days: 45 },
  { month: "Oct", days: 38 },
  { month: "Nov", days: 52 },
  { month: "Dec", days: 68 },
  { month: "Jan", days: 42 },
  { month: "Feb", days: 35 },
];

const performanceData = [
  { name: "Exceptional (8-10)", value: 35 },
  { name: "Good (5-7)", value: 45 },
  { name: "Needs Improvement (1-4)", value: 20 },
];

const COLORS = ["hsl(152, 60%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const Reports = () => {
  const { data: stats } = useDashboardStats();
  const { data: departments = [] } = useDepartments();

  const deptData = departments.map((d) => ({
    name: d.name,
    count: d.profiles_count ?? 0,
  }));

  return (
    <HRLayout title="Reports" subtitle="HR analytics and insights">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Employees" value={stats?.employee_count ?? 0} icon={Users} variant="accent" />
        <StatsCard title="Avg. Performance" value="7.5/10" icon={TrendingUp} variant="success" />
        <StatsCard title="Leave Utilization" value="62%" icon={CalendarDays} variant="info" />
        <StatsCard title="Monthly Payroll" value="$1.2M" icon={DollarSign} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData.length > 0 ? deptData : [{ name: "No data", count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 89%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(3, 40%, 79%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Leave Days Taken (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={leaveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="hsl(190, 50%, 14%)" strokeWidth={2} dot={{ fill: "hsl(3, 40%, 79%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <h3 className="font-semibold text-card-foreground mb-4">Performance Distribution</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={performanceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {performanceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </HRLayout>
  );
};

export default Reports;
