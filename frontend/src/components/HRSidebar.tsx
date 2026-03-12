import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Users,
  Building2,
  MapPin,
  Network,
  FileText,
  ClipboardList,
  UserPlus,
  GraduationCap,
  ArrowRightLeft,
  LogOut,
  Receipt,
  Landmark,
  CalendarDays,
  Clock,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Headphones,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Menu,
  X,
  User,
  ListChecks,
  ShieldCheck,
  Video,
  ScrollText,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const hrAdminSections: NavSection[] = [
  {
    label: "",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Employees", url: "/employees", icon: Users },
      { title: "Departments", url: "/departments", icon: Building2 },
      { title: "Stations", url: "/stations", icon: MapPin },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { title: "Job Postings", url: "/recruitment", icon: UserPlus },
      // { title: "Onboarding", url: "/onboarding", icon: ListChecks },
      // { title: "Transfers", url: "/transfers", icon: ArrowRightLeft },
      { title: "Exit", url: "/exit", icon: LogOut },
    ],
  },
  {
    label: "Time & Leave",
    items: [
      // { title: "Leave", url: "/leave", icon: CalendarDays },
      { title: "Attendance", url: "/attendance", icon: Clock },
      { title: "Approvals", url: "/approvals", icon: CheckSquare },
    ],
  },
  {
    label: "Payroll",
    items: [
      { title: "Payslips", url: "/payslips", icon: Receipt },
      { title: "Bank & Tax", url: "/bank-tax", icon: Landmark },
    ],
  },
  {
    label: "Development",
    items: [
      { title: "Training", url: "/training", icon: GraduationCap },
      { title: "Performance", url: "/performance", icon: TrendingUp },
      { title: "Surveys", url: "/surveys", icon: ClipboardList },
    ],
  },
  {
    label: "Reports & Docs",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Documents", url: "/documents", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Assets", url: "/assets", icon: Package },
      { title: "Help Desk", url: "/help-desk", icon: Headphones },
    ],
  },
  {
    label: "Communication",
    items: [{ title: "Policies & Rules", url: "/policies", icon: ScrollText }],
  },
];

const employeeSections: NavSection[] = [
  {
    label: "",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "My Info",
    items: [
      { title: "My Profile", url: "/profile", icon: User },
      { title: "Documents", url: "/documents", icon: FileText },
      // { title: "Onboarding", url: "/onboarding", icon: ListChecks },
    ],
  },
  {
    label: "Time & Leave",
    items: [
      { title: "Leave", url: "/leave", icon: CalendarDays },
      { title: "Attendance", url: "/attendance", icon: Clock },
    ],
  },
  {
    label: "Payroll",
    items: [{ title: "Payslips", url: "/payslips", icon: Receipt }],
  },
  {
    label: "Development",
    items: [
      { title: "My Training", url: "/my-training", icon: BookOpen },
      { title: "My Performance", url: "/my-performance", icon: Target },
      { title: "Assignments", url: "/my-interviews", icon: Video },
      { title: "Surveys", url: "/surveys", icon: ClipboardList },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Help Desk", url: "/help-desk", icon: Headphones },
      { title: "User Manual", url: "/user-manual", icon: HelpCircle },
    ],
  },
];


export function HRSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isHRAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sections = isHRAdmin ? hrAdminSections : employeeSections;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => { if (s.label) initial[s.label] = true; });
    return initial;
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar dark:bg-sidebar border-r border-sidebar-border transition-all duration-300 z-30",
        "text-sidebar-foreground h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-20 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-lg bg-white/50 from-primary to-accent p-2 shadow-md">
              <img src="/images/JTlogo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-base tracking-tight">
              JN Energy
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-muted transition-colors"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label || "top"}>
            {section.label && !collapsed && (
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-2 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                {section.label}
                {openSections[section.label] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {(section.label === "" || collapsed || openSections[section.label]) && (
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <li key={item.url}>
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
                          "hover:bg-sidebar-muted hover:text-sidebar-foreground",
                          collapsed && "justify-center px-0"
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-accent-foreground")} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {currentUser?.avatar ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isHRAdmin
                  ? <ShieldCheck className="h-3 w-3 text-gold shrink-0" />
                  : <User className="h-3 w-3 text-primary shrink-0" />}
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  {isHRAdmin ? "HR Admin" : "Employee"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-md hover:bg-sidebar-muted hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center justify-center w-full p-2 rounded-md hover:bg-sidebar-muted hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
