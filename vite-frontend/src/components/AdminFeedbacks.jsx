import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api/admin/feedbacks`;

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem('token');

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Erreur chargement des feedbacks:', err);
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedbacks();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Avis des clients</h2>
      {feedbacks.length === 0 ? (
        <p>Aucun avis pour le moment.</p>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((f) => (
            <div key={f.id} className="border p-4 rounded shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <strong>{f.user_email || f.user_id}</strong>
                <button
                  onClick={() => deleteFeedback(f.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Supprimer
                </button>
              </div>
              <p className="italic text-sm text-gray-700">{new Date(f.created_at).toLocaleString()}</p>
              <p className="mt-2">{f.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbacks;
