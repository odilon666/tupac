// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Engins', path: '/admin/engines' },
    { label: 'Réservations', path: '/admin/reservations' },
    { label: 'Maintenances', path: '/admin/maintenances' },
    { label: 'Technicien', path: '/admin/technician' },
    { label: 'Support client', path: '/admin/support' },
    { label: 'Paiements', path: '/admin/payments' },
    { label: 'Support Admin', path: '/admin/adminsupport' },
    { label: 'FAQ', path: '/admin/faq' },
    { label: 'FAQ Admin', path: '/admin/adminfaq' },
    { label: 'Admin Réservations', path: '/admin/adminreservations' },
    { label: 'Utilisateurs', path: '/admin/adminusers' },
    { label: 'Feedbacks', path: '/admin/feedbacks' },
     { label: 'Paiements', path: '/admin/adminpayments' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 p-4">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="flex flex-col space-y-3">
        {navLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded transition ${
              currentPath === path
                ? 'bg-blue-600 font-semibold'
                : 'hover:bg-gray-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
