import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Client Pages
import ClientLayout from './components/client/ClientLayout';
import Landing from './pages/client/Landing';
import Services from './pages/client/Services';
import Contact from './pages/client/Contact';
import BookingFlow from './pages/client/BookingFlow';
import BookingSuccess from './pages/client/BookingSuccess';
import MyBookings from './pages/client/MyBookings';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageStaff from './pages/admin/ManageStaff';
import ManageBookings from './pages/admin/ManageBookings';
import Settings from './pages/admin/Settings';
import Login from './pages/admin/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Client Routes with Layout */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/success" element={<BookingSuccess />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
