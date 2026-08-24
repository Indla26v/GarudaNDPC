import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';
import ConnectionGuard from './components/ConnectionGuard';
import Login from './pages/Login';
import ForceChangePassword from './pages/ForceChangePassword';
import NoAccess from './pages/NoAccess';
import Dashboard from './pages/Dashboard';
import OffenderList from './pages/offenders/OffenderList';
import OffenderForm from './pages/offenders/OffenderForm';
import CaseManagement from './pages/cases/CaseManagement';
import CaseForm from './pages/cases/CaseForm';
import CaseDetail from './pages/cases/CaseDetail';
import FieldStaff from './pages/field/FieldStaff';
// Phase 2 imports — commented out for Phase 1 deployment
// import Surveillance from './pages/surveillance/Surveillance';
// import FinancialAnalysis from './pages/finance/FinancialAnalysis';
// import NetworkMap from './pages/network/NetworkMap';
import Reports from './pages/reports/Reports';
import DeletionRequests from './pages/workflows/DeletionRequests';
import EditRequests from './pages/workflows/EditRequests';
import CommitApprovals from './pages/approvals/CommitApprovals';
import ApprovalProgress from './pages/approvals/ApprovalProgress';
import UserManagement from './pages/admin/UserManagement';
import TeamManagement from './pages/admin/TeamManagement';
import AuditLogs from './pages/admin/AuditLogs';
import DataImport from './pages/admin/DataImport';
import DeleteOffender from './pages/admin/DeleteOffender';
import DistrictAnalytics from './pages/DistrictAnalytics';
import Enforcement from './pages/Enforcement';
import VehiclesSeized from './pages/vehicles/VehiclesSeized';
import SouthIndiaDataBank from './pages/databank/SouthIndiaDataBank';
import './index.css';

function IndexRedirect() {
  return <Navigate to="/dashboard" replace />;
}

function DashboardRoute() {
  return <Dashboard />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConnectionGuard>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ForceChangePassword />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<IndexRedirect />} />
              <Route path="dashboard" element={<DashboardRoute />} />

              {/* No Access page — for direct navigation */}
              <Route path="no-access" element={<NoAccess />} />

              {/* Offenders — viewable by all, edit/create guarded in backend */}
              <Route path="offenders" element={<OffenderList />} />
              <Route path="consumers" element={<OffenderList isConsumerOnly={true} />} />
              <Route path="enforcement" element={<Enforcement />} />
              <Route path="vehicles-seized" element={<VehiclesSeized />} />
              <Route path="offenders/new" element={<OffenderForm />} />
              <Route path="offenders/:id" element={<OffenderForm />} />
              <Route path="offenders/:id/edit" element={<OffenderForm />} />

              {/* Case Management (Page 3) */}
              <Route path="cases" element={<CaseManagement />} />
              <Route path="cases/new" element={<CaseForm />} />
              <Route path="cases/:id" element={<CaseDetail />} />
              <Route path="cases/:id/edit" element={<CaseForm />} />

              {/* Field Staff Module (Page 4) — Department-restricted: OPERATIONS, STF
              <Route path="mobile" element={
                <RoleGuard permission="FIELD_ENTRY">
                  <FieldStaff />
                </RoleGuard>
              } />
              */}

              {/* South India Data Bank (Interstate Portal) */}
              <Route path="south-india-databank" element={<SouthIndiaDataBank />} />

              {/* Phase 2 routes — redirected to dashboard for Phase 1 deployment */}
              <Route path="surveillance" element={<Navigate to="/dashboard" replace />} />
              <Route path="finance" element={<Navigate to="/dashboard" replace />} />
              <Route path="network" element={<Navigate to="/dashboard" replace />} />

              {/* Reports & Intelligence (Page 8) — Role-restricted: SI and above */}
              <Route path="reports" element={
                <RoleGuard permission="REPORTS_VIEW">
                  <Reports />
                </RoleGuard>
              } />

              {/* Workflow Routes */}
              <Route path="deletion-requests" element={<DeletionRequests />} />
              <Route path="edit-requests" element={
                <RoleGuard minRole="SI">
                  <EditRequests />
                </RoleGuard>
              } />
              <Route path="approvals" element={
                <RoleGuard minRole="SHO">
                  <CommitApprovals />
                </RoleGuard>
              } />
              <Route path="approval-progress" element={<ApprovalProgress />} />

              {/* District Analytics — DSP and above */}
              <Route path="district-analytics" element={
                <RoleGuard permission="DISTRICT_ANALYTICS">
                  <DistrictAnalytics />
                </RoleGuard>
              } />

              {/* Admin Routes (Page 9) */}
              <Route path="admin/users" element={
                <RoleGuard permission="USER_MANAGEMENT">
                  <UserManagement />
                </RoleGuard>
              } />
              <Route path="admin/offenders" element={
                <RoleGuard permission="USER_MANAGEMENT">
                  <DeleteOffender />
                </RoleGuard>
              } />
              <Route path="admin/audit-logs" element={
                <RoleGuard permission="AUDIT_LOGS">
                  <AuditLogs />
                </RoleGuard>
              } />
              <Route path="admin/teams" element={
                <RoleGuard permission="TEAM_MANAGEMENT">
                  <TeamManagement />
                </RoleGuard>
              } />
              <Route path="admin/import" element={
                <RoleGuard permission="USER_MANAGEMENT">
                  <DataImport />
                </RoleGuard>
              } />

              {/* Catch-all: any unknown route within the layout → No Access */}
              <Route path="*" element={<NoAccess />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConnectionGuard>
  </StrictMode>
);
