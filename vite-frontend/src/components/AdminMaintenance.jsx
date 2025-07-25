import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api/admin/maintenances`;

const AdminMaintenance = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [form, setForm] = useState({
    engine_id: '',
    type: '',
    description: '',
    scheduled_date: '',
    technician_id: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchMaintenances = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMaintenances(res.data);
    } catch (err) {
      console.error('Erreur chargement maintenance:', err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessage('Maintenance mise à jour.');
      } else {
        await axios.post(API, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessage('Maintenance créée.');
      }
      setForm({ engine_id: '', type: '', description: '', scheduled_date: '', technician_id: '' });
      setEditingId(null);
      fetchMaintenances();
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setForm({
      engine_id: m.engine_id,
      type: m.type,
      description: m.description,
      scheduled_date: m.scheduled_date.slice(0, 16),
      technician_id: m.technician_id,
    });
    setEditingId(m.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette maintenance ?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchMaintenances();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API}/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchMaintenances();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Maintenance - Admin</h2>

      <form onSubmit={handleCreateOrUpdate} className="grid gap-4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">
          {editingId ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
        </h3>
        <input
          type="text"
          name="engine_id"
          placeholder="ID de l'engin"
          value={form.engine_id}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="type"
          placeholder="Type de maintenance"
          value={form.type}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="datetime-local"
          name="scheduled_date"
          value={form.scheduled_date}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="technician_id"
          placeholder="ID du technicien"
          value={form.technician_id}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'En cours...' : editingId ? 'Mettre à jour' : 'Créer la maintenance'}
        </button>
        {message && <p className="text-sm text-center text-green-600">{message}</p>}
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Liste des maintenances</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Engin</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Date prévue</th>
              <th className="p-2 border">Technicien</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((m) => (
              <tr key={m.id}>
                <td className="p-2 border">{m.engine_id}</td>
                <td className="p-2 border">{m.type}</td>
                <td className="p-2 border">{new Date(m.scheduled_date).toLocaleString()}</td>
                <td className="p-2 border">{m.technician_id}</td>
                <td className="p-2 border">{m.status}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleEdit(m)} className="text-blue-600 hover:underline">✏️</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">🗑️</button>
                  <select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="en attente">En attente</option>
                    <option value="en cours">En cours</option>
                    <option value="validée">Validée</option>
                    <option value="annulée">Annulée</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaintenance;
