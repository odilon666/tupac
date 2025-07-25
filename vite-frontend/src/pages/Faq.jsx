// src/pages/Faq.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api/faq`;

const Faq = () => {
  const [groupedFaqs, setGroupedFaqs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(API);
      const faqs = response.data;

      // Grouper par catégorie et trier par ordre
      const grouped = {};
      faqs.forEach((faq) => {
        const cat = faq.categorie || 'Autre';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(faq);
      });

      // Trier les FAQs dans chaque catégorie
      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
      });

      setGroupedFaqs(grouped);
    } catch (error) {
      console.error("Erreur de chargement des FAQs :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Foire aux Questions (FAQ)</h1>

      {loading ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : Object.keys(groupedFaqs).length === 0 ? (
        <div className="text-center text-gray-500">Aucune question trouvée.</div>
      ) : (
        Object.entries(groupedFaqs).map(([categorie, faqs]) => (
          <div key={categorie} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{categorie}</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                  <p className="text-gray-600 mt-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Faq;
