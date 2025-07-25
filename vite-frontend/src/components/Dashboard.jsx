import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Settings,
  Calendar,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8">Erreur lors du chargement des statistiques</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Tableau de bord</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engins Total</p>
              <p className="text-3xl font-bold text-blue-600">{stats.engines.total}</p>
            </div>
            <Settings className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{stats.engines.available}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Réservations</p>
              <p className="text-3xl font-bold text-orange-600">{stats.reservations.total}</p>
            </div>
            <Calendar className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(stats.revenue.total)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Status des Engins</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Disponibles</span>
              <span className="text-green-600 font-semibold">{stats.engines.available}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Loués</span>
              <span className="text-orange-600 font-semibold">{stats.engines.rented}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En maintenance</span>
              <span className="text-red-600 font-semibold">{stats.engines.maintenance}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Réservations</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En attente</span>
              <span className="text-yellow-600 font-semibold">{stats.reservations.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approuvées</span>
              <span className="text-green-600 font-semibold">{stats.reservations.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-blue-600 font-semibold">{stats.reservations.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
