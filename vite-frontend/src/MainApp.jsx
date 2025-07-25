import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Engines from './components/Engines';
import Reservations from './components/Reservations';
import Navigation from './components/Navigation';
import AdminMaintenance from './components/AdminMaintenance';
import TechnicianMaintenance from './components/TechnicianMaintenance';
import Support from './components/Support';
import Payments from './components/Payments';
import AdminSupport from './components/AdminSupport';
import Faq from './pages/Faq';
import AdminFaq from './components/AdminFaq';
import AdminReservations from './components/AdminReservations';
import AdminUsers from './components/AdminUsers';
import AdminFeedbacks from './components/AdminFeedbacks';
import Sidebar from './components/Sidebar';
import PrivateRoute from './routes/PrivateRoute'; // <-- ajouté ici
import AdminPayments from './components/AdminPayments';

import { useAuth } from './context/AuthContext';

const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Navigation user={user} onLogout={logout} />

        <div className="p-8">
          <Routes>
            <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin/engines" element={<PrivateRoute><Engines /></PrivateRoute>} />
            <Route path="/admin/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
            <Route path="/admin/maintenances" element={<PrivateRoute><AdminMaintenance /></PrivateRoute>} />
            <Route path="/admin/technician" element={<PrivateRoute><TechnicianMaintenance /></PrivateRoute>} />
            <Route path="/admin/support" element={<PrivateRoute><Support /></PrivateRoute>} />
            <Route path="/admin/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            <Route path="/admin/adminsupport" element={<PrivateRoute><AdminSupport /></PrivateRoute>} />
            <Route path="/admin/faq" element={<PrivateRoute><Faq /></PrivateRoute>} />
            <Route path="/admin/adminfaq" element={<PrivateRoute><AdminFaq /></PrivateRoute>} />
            <Route path="/admin/adminreservations" element={<PrivateRoute><AdminReservations /></PrivateRoute>} />
            <Route path="/admin/adminusers" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/feedbacks" element={<PrivateRoute><AdminFeedbacks /></PrivateRoute>} />
            <Route path="/admin/adminpayments" element={<PrivateRoute><AdminPayments /></PrivateRoute>} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
