import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Join from "./pages/Join";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";
import HouseholdForm from "./pages/HouseholdForm";
import AssistantForm from "./pages/AssistantForm";
import ReferenceForm from "./pages/ReferenceForm";
import CochildminderForm from "./pages/CochildminderForm";
import About from "./pages/About";
import Parents from "./pages/Parents";
import Childminders from "./pages/Childminders";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FindChildminder from "./pages/FindChildminder";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import AdminApplicationDetail from "./pages/admin/ApplicationDetailNew";
import AdminEmployees from "./pages/admin/Employees";
import AdminEmployeeDetail from "./pages/admin/EmployeeDetail";
import OfstedForm from "./pages/OfstedForm";
import LAForm from "./pages/LAForm";
import AdminEnforcement from "./pages/admin/Enforcement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/childminders" element={<Childminders />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/find-childminder" element={<FindChildminder />} />
          <Route path="/join" element={<Join />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/household-form" element={<HouseholdForm />} />
          <Route path="/assistant-form" element={<AssistantForm />} />
          <Route path="/reference-form" element={<ReferenceForm />} />
          <Route path="/cochildminder-form" element={<CochildminderForm />} />
          <Route path="/ofsted-form" element={<OfstedForm />} />
          <Route path="/la-form" element={<LAForm />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/employees/:id" element={<AdminEmployeeDetail />} />
          <Route path="/admin/enforcement" element={<AdminEnforcement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
