import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { LandingPage } from './app/public/LandingPage';
import { LoginPage } from './app/auth/LoginPage';
import { RegisterPage } from './app/auth/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './app/DashboardPage';
import { EventsPage } from './app/events/EventsPage';
import { EventDetailsPage } from './app/events/EventDetailsPage';
import { MapViewPage } from './app/events/MapViewPage';
import { SchedulePage } from './app/events/SchedulePage';
import { MyParticipationPage } from './app/user/MyParticipationPage';
import { NotificationsPage } from './app/user/NotificationsPage';
import { SettingsPage } from './app/user/SettingsPage';
import { OrganizerMyEventsPage } from './app/organizer/OrganizerMyEventsPage';
import { EventSubmissionsPage } from './app/organizer/EventSubmissionsPage';
import { EventApprovalsPage } from './app/admin/EventApprovalsPage';
import { UserVerificationPage } from './app/admin/UserVerificationPage';
import { OrganizerRequestsPage } from './app/admin/OrganizerRequestsPage';
import { AdminAllEventsPage } from './app/admin/AdminAllEventsPage';
import { AdminUsersPage } from './app/admin/AdminUsersPage';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sileo';

export function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailsPage />} />
              <Route path="map" element={<MapViewPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="participation" element={<MyParticipationPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Organizer routes */}
              <Route
                path="organizer/my-events"
                element={<OrganizerMyEventsPage />} />

              <Route
                path="organizer/submissions"
                element={<EventSubmissionsPage />} />

              {/* Admin routes */}
              <Route path="admin/approvals" element={<EventApprovalsPage />} />
              <Route
                path="admin/verification"
                element={<UserVerificationPage />} />

              <Route
                path="admin/organizer-requests"
                element={<OrganizerRequestsPage />} />

              <Route path="admin/all-events" element={<AdminAllEventsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" duration={1500} />

      </TooltipProvider>
    </AuthProvider>);
}