// src/components/AdminReservations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_PENDING = `${BACKEND_URL}/api/admin/reservations/pending`;
const API_APPROVE = (id) => `${BACKEND_URL}/api/admin/reservations/${id}/approve`;
const API_REJECT = (id) => `${BACKEND_URL}/api/admin/reservations/${id}/reject`;

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get(API_PENDING);
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur de chargement des réservations :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const url = action === 'approve' ? API_APPROVE(id) : API_REJECT(id);
    try {
      await axios.put(url);
      fetchPending(); // refresh list
    } catch (err) {
      console.error(`Erreur lors de la ${action} :`, err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Réservations en attente</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : reservations.length === 0 ? (
        <p>Aucune réservation en attente.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div key={res.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p><strong>Réservation ID:</strong> {res.id}</p>
                <p><strong>Utilisateur:</strong> {res.user_id}</p>
                <p><strong>Engin:</strong> {res.engine_id}</p>
                <p><strong>Du:</strong> {new Date(res.start_date).toLocaleDateString()} - <strong>Au:</strong> {new Date(res.end_date).toLocaleDateString()}</p>
                <p><strong>Montant total:</strong> {res.total_amount} Ar</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAction(res.id, 'approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleAction(res.id, 'reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
