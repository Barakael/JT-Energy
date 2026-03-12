import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { BookOpen, CheckCircle, PlayCircle, Clock, Loader2 } from "lucide-react";
import { useMyEnrollments } from "@/hooks/api/useTraining";

const MyTraining = () => {
  const { data: enrollments = [], isLoading } = useMyEnrollments();

  const completed = enrollments.filter((e) => e.status === "Completed").length;
  const inProgress = enrollments.filter((e) => e.status === "In Progress").length;
  const notStarted = enrollments.filter((e) => e.status !== "Completed" && e.status !== "In Progress").length;

  return (
    <HRLayout title="My Training" subtitle="Track your learning progress and certifications">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-info/10">
            <PlayCircle className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-secondary">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{notStarted}</p>
            <p className="text-sm text-muted-foreground">Not Started</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((course) => (
            <div key={course.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.category} · {course.duration}</p>
                  </div>
                </div>
                <StatusBadge
                  label={course.status}
                  variant={course.status === "Completed" ? "success" : course.status === "In Progress" ? "info" : "default"}
                />
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${course.progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{course.progress}% complete</p>
            </div>
          ))}
        </div>
      )}
    </HRLayout>
  );
};

export default MyTraining;
