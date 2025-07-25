import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TechnicianMaintenance = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [notes, setNotes] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchMaintenances();
  }, [refresh]);

  const fetchMaintenances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenances(response.data.filter(m => m.status === 'scheduled'));
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/maintenance/${id}/complete`, 
        new URLSearchParams({ notes: notes[id] }), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setRefresh(!refresh);
    } catch (error) {
      console.error("Erreur lors de la complétion :", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mes maintenances à compléter</h2>

      {maintenances.length === 0 ? (
        <p className="text-gray-600">Aucune maintenance en attente.</p>
      ) : (
        maintenances.map((m) => (
          <div key={m.id} className="bg-white p-6 rounded shadow space-y-4">
            <div>
              <p><strong>Engin ID:</strong> {m.engine_id}</p>
              <p><strong>Type:</strong> {m.type}</p>
              <p><strong>Description:</strong> {m.description}</p>
              <p><strong>Date prévue:</strong> {new Date(m.scheduled_date).toLocaleString()}</p>
            </div>

            <textarea
              placeholder="Ajouter des remarques..."
              value={notes[m.id] || ''}
              onChange={(e) => setNotes({ ...notes, [m.id]: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />

            <button
              onClick={() => handleComplete(m.id)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Marquer comme complétée
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TechnicianMaintenance;
