import { HRLayout } from "@/components/HRLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAttendance, useClockIn, useClockOut } from "@/hooks/api/useAttendance";
import { useToast } from "@/hooks/use-toast";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Half Day";

const statusVariant: Record<AttendanceStatus, "success" | "destructive" | "warning" | "default"> = {
  Present: "success",
  Absent: "destructive",
  Late: "warning",
  "Half Day": "default",
};

export default function Attendance() {
  const { isHRAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("March 2026");
  const { toast } = useToast();

  const { data: records = [], isLoading } = useAttendance({ search: search || undefined });
  const clockIn  = useClockIn();
  const clockOut = useClockOut();

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync();
      toast({ title: "Clocked in successfully" });
    } catch {
      toast({ title: "Failed to clock in", variant: "destructive" });
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut.mutateAsync();
      toast({ title: "Clocked out successfully" });
    } catch {
      toast({ title: "Failed to clock out", variant: "destructive" });
    }
  };

  const present = records.filter((r) => r.status === "Present").length;
  const absent  = records.filter((r) => r.status === "Absent").length;
  const late    = records.filter((r) => r.status === "Late").length;

  return (
    <HRLayout
      title="Attendance"
      subtitle={isHRAdmin ? "All employee attendance records" : "Your attendance history"}
      actions={
        !isHRAdmin ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleClockIn} disabled={clockIn.isPending}>
              {clockIn.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Clock In
            </Button>
            <Button size="sm" variant="outline" onClick={handleClockOut} disabled={clockOut.isPending}>
              {clockOut.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Clock Out
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Present" value={present} icon={CheckCircle2} variant="success" />
        <StatsCard title="Absent" value={absent} icon={XCircle} variant="accent" />
        <StatsCard title="Late Arrivals" value={late} icon={AlertCircle} variant="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="font-semibold text-foreground flex-1">Attendance Log</h2>
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["March 2026", "February 2026", "January 2026"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isHRAdmin && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee..."
                  className="pl-8 h-8 text-xs w-44"
                />
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                  {isHRAdmin && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Employee</th>}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Clock In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Clock Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Hours</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((rec, i) => (
                  <tr key={rec.id ?? i} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 text-foreground whitespace-nowrap">{rec.date}</td>
                    {isHRAdmin && <td className="px-4 py-3.5 font-medium text-foreground">{rec.employee}</td>}
                    <td className="px-4 py-3.5 font-mono text-sm text-foreground">{rec.clockIn}</td>
                    <td className="px-4 py-3.5 font-mono text-sm text-foreground">{rec.clockOut}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{rec.hours}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={rec.status} variant={statusVariant[rec.status] ?? "default"} />
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HRLayout>
  );
}

