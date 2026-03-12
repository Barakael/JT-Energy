import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExitManagement from "./pages/ExitManagement";
import LeaveManagement from "./pages/LeaveManagement";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Documents from "./pages/Documents";
import Surveys from "./pages/Surveys";
import Recruitment from "./pages/Recruitment";
import Training from "./pages/Training";
import Transfers from "./pages/Transfers";
import Performance from "./pages/Performance";
import Approvals from "./pages/Approvals";
import Reports from "./pages/Reports";
import Payslips from "./pages/Payslips";
import MyTraining from "./pages/MyTraining";
import MyProfile from "./pages/MyProfile";
import Onboarding from "./pages/Onboarding";
import HelpDesk from "./pages/HelpDesk";
import Attendance from "./pages/Attendance";
import Stations from "./pages/Stations";
import BankTax from "./pages/BankTax";
import MyInterviews from "./pages/MyInterviews";
import Policies from "./pages/Policies";
import Assets from "./pages/Assets";
import { PlaceholderPage } from "./components/PlaceholderPage";
import NotFound from "./pages/NotFound";
import {
  Target, Network, Landmark, HelpCircle,
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <AuthProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/my-training" element={<ProtectedRoute><MyTraining /></ProtectedRoute>} />
          <Route path="/my-performance" element={<ProtectedRoute><PlaceholderPage title="My Performance" subtitle="View your goals and feedback" icon={Target} /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute role="hr_admin"><Employees /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute role="hr_admin"><Departments /></ProtectedRoute>} />
          <Route path="/stations" element={<ProtectedRoute role="hr_admin"><Stations /></ProtectedRoute>} />
          <Route path="/org-chart" element={<ProtectedRoute role="hr_admin"><PlaceholderPage title="Org Chart" subtitle="Visual reporting hierarchy" icon={Network} /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/surveys" element={<ProtectedRoute><Surveys /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute role="hr_admin"><Recruitment /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute role="hr_admin"><Training /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute role="hr_admin"><Transfers /></ProtectedRoute>} />
          <Route path="/exit" element={<ProtectedRoute role="hr_admin"><ExitManagement /></ProtectedRoute>} />
          <Route path="/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
          <Route path="/bank-tax" element={<ProtectedRoute role="hr_admin"><BankTax /></ProtectedRoute>} />
          <Route path="/my-interviews" element={<ProtectedRoute><MyInterviews /></ProtectedRoute>} />
          <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute role="hr_admin"><Assets /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute role="hr_admin"><Approvals /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute role="hr_admin"><Performance /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute role="hr_admin"><Reports /></ProtectedRoute>} />
          <Route path="/help-desk" element={<ProtectedRoute><HelpDesk /></ProtectedRoute>} />
          <Route path="/user-manual" element={<ProtectedRoute><PlaceholderPage title="User Manual" subtitle="System documentation" icon={HelpCircle} /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
  </ThemeProvider>
);

export default App;
