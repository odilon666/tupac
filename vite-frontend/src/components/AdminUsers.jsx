import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin/users`;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'client',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement des utilisateurs', err);
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess('✅ Utilisateur ajouté avec succès');
      setError('');
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'client',
        password: '',
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l’ajout');
      setSuccess('');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`${API}/${id}/toggle-verify`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error("Erreur de mise à jour de l'état", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error("Erreur de suppression", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Liste des utilisateurs</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border border-gray-300 mb-10">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Téléphone</th>
              <th className="p-2 border">Rôle</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.phone}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  {user.is_verified ? '✅ Vérifié' : '⏳ En attente'}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleToggle(user.id)}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    {user.is_verified ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑 Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl font-semibold mb-2">Ajouter un nouvel utilisateur</h2>
      <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4 bg-white p-4 border rounded shadow">
        <input type="text" name="name" placeholder="Nom" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded" required />
        <input type="text" name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} className="border p-2 rounded" required />
        <input type="text" name="address" placeholder="Adresse" value={form.address} onChange={handleChange} className="border p-2 rounded" required />
        <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded">
          <option value="client">Client</option>
          <option value="technicien">Technicien</option>
          <option value="admin">Admin</option>
        </select>
        <input type="password" name="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Ajouter l'utilisateur
        </button>
      </form>
    </div>
  );
};

export default AdminUsers;
