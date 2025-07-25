import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin/support-tickets`;

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Erreur chargement tickets:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTickets();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Support - Administration</h2>

      {tickets.length === 0 ? (
        <p>Aucun ticket trouvé.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-300 p-4 rounded-lg bg-white shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  {ticket.category} | {ticket.user_email || ticket.user_id}
                </h3>
                <span
                  className={`text-sm font-medium ${
                    ticket.status === 'fermé'
                      ? 'text-red-600'
                      : ticket.status === 'résolu'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="mb-2">{ticket.message}</p>

              <div className="flex items-center gap-4 mt-2">
                <label htmlFor={`status-${ticket.id}`}>Statut :</label>
                <select
                  id={`status-${ticket.id}`}
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en cours">En cours</option>
                  <option value="résolu">Résolu</option>
                  <option value="fermé">Fermé</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
