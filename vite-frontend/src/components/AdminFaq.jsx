import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api/faq`;

const AdminFaq = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [categorie, setCategorie] = useState('');
  const [ordre, setOrdre] = useState(0);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(API);
      setFaqs(res.data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const faqData = {
      question,
      answer,
      categorie,
      ordre: Number(ordre),
    };

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, faqData);
      } else {
        await axios.post(API, faqData);
      }

      // Reset form
      setQuestion('');
      setAnswer('');
      setCategorie('');
      setOrdre(0);
      setEditId(null);
      fetchFaqs();
    } catch (err) {
      console.error("Erreur d'enregistrement :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette FAQ ?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchFaqs();
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const handleEdit = (faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategorie(faq.categorie || '');
    setOrdre(faq.ordre || 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Gestion des FAQs</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Réponse</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          ></textarea>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Catégorie</label>
          <input
            type="text"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Ordre</label>
          <input
            type="number"
            value={ordre}
            onChange={(e) => setOrdre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editId ? "Modifier" : "Ajouter"} FAQ
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setQuestion('');
                setAnswer('');
                setCategorie('');
                setOrdre(0);
              }}
              className="ml-4 text-red-500"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-4 rounded shadow flex justify-between">
              <div>
                <p className="font-semibold">{faq.question}</p>
                <p className="text-gray-600">{faq.answer}</p>
                <p className="text-sm text-gray-500">
                  Catégorie : {faq.categorie || 'Aucune'} | Ordre : {faq.ordre}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="text-blue-600 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFaq;
