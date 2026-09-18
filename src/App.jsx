import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedPlatform } from "./components/layout/ProtectedPlatform.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { CompaniesPage } from "./pages/CompaniesPage.jsx";
import { CompanyNewPage } from "./pages/CompanyNewPage.jsx";
import { CompanyDetailsPage } from "./pages/CompanyDetailsPage.jsx";
import { IntegrationsOverviewPage } from "./pages/IntegrationsOverviewPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/platform" element={<ProtectedPlatform />}>
        <Route index element={<DashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/new" element={<CompanyNewPage />} />
        <Route path="companies/:companyId" element={<CompanyDetailsPage />} />
        <Route path="integrations" element={<IntegrationsOverviewPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/platform" replace />} />
      <Route path="*" element={<Navigate to="/platform" replace />} />
    </Routes>
  );
}
