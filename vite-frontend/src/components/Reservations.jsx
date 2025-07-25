import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

import ReservationModal from './ReservationModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'approved':
      return 'text-green-600 bg-green-100';
    case 'rejected':
      return 'text-red-600 bg-red-100';
    case 'completed':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'approved':
      return 'Approuvée';
    case 'rejected':
      return 'Rejetée';
    case 'completed':
      return 'Terminée';
    default:
      return status;
  }
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
    fetchEngines();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API}/reservations`);
      setReservations(res.data);
    } catch (err) {
      console.error('Erreur chargement réservations :', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngines = async () => {
    try {
      const res = await axios.get(`${API}/engines?status=available`);
      setEngines(res.data);
    } catch (err) {
      console.error('Erreur chargement engins :', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/reservations/${id}/approve`);
      fetchReservations();
    } catch (err) {
      alert("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API}/reservations/${id}/reject`);
      fetchReservations();
    } catch (err) {
      alert('Erreur lors du rejet');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Réservations</h2>
        {user.role === 'client' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nouvelle réservation</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                {user.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td className="px-6 py-4 whitespace-nowrap">#{res.engine_id.slice(-8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(res.start_date)} - {formatDate(res.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(res.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
                      {getStatusLabel(res.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(res.created_at)}</td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {res.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button onClick={() => handleApprove(res.id)} className="text-green-600 hover:text-green-900">
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={() => handleReject(res.id)} className="text-red-600 hover:text-red-900">
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-8 text-gray-500">Aucune réservation trouvée</div>
      )}

      {showAddModal && (
        <ReservationModal
          engines={engines}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            fetchReservations();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Reservations;
