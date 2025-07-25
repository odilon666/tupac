import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technique');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [refresh]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur de chargement des tickets :", err);
    }
  };

  const submitTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/support`, {
        subject,
        category,
        message,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubject('');
      setMessage('');
      setCategory('technique');
      setRefresh(!refresh);
    } catch (err) {
      console.error("Erreur d’envoi :", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Support Client</h2>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Envoyer une demande</h3>
        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="technique">Problème technique</option>
          <option value="facturation">Facturation</option>
          <option value="autre">Autre</option>
        </select>
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
          rows={4}
        />
        <button
          onClick={submitTicket}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Envoyer
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Mes demandes</h3>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white p-4 mb-3 rounded shadow">
            <div className="flex justify-between">
              <span className="font-bold">{ticket.subject}</span>
              <span className={`text-sm ${
                ticket.status === 'open' ? 'text-yellow-500' :
                ticket.status === 'in_progress' ? 'text-blue-500' :
                'text-green-600'
              }`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-gray-600">{ticket.message}</p>
            <p className="text-gray-400 text-sm">{new Date(ticket.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
