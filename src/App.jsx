import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy Load Pages for Performance Optimization
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));
const ContactUs = lazy(() => import("./pages/ContactUs.jsx"));
const Faq = lazy(() => import("./pages/FAQ.jsx"));

// ✅ Newly Added Pages
const SettingsPage = lazy(() => import("./pages/Settings"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const MessagesPage = lazy(() => import("./pages/Messages"));
const UserPermissions = lazy(() => import("./pages/admin/UserPermissions"));
const SecurityAlerts = lazy(() => import("./pages/admin/SecurityAlerts"));
const AuditTrail = lazy(() => import("./pages/admin/AuditTrail"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-16 min-h-screen">
          <Suspense
            fallback={
              <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/collaboration" element={<CollaborationPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<Faq />} />

              {/* Protected Routes (Logged-in Users Only) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminPanel />} />
                <Route
                  path="/admin/user-permissions"
                  element={<UserPermissions />}
                />
                <Route
                  path="/admin/security-alerts"
                  element={<SecurityAlerts />}
                />
                <Route path="/admin/audit-trail" element={<AuditTrail />} />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
