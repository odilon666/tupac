import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/payments/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
      }
    };

    fetchPayments();
  }, [token]);

  const downloadInvoice = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/payments/${id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paiements</h1>
      {payments.map((payment) => (
        <div key={payment._id} className="border p-4 mb-4 rounded-md shadow-sm bg-white">
          <p className="text-lg font-semibold text-gray-800">
            Réservation : {payment.reservation_title || payment.reservation_id}
          </p>
          <p className="text-sm text-gray-600">
            Client : {payment.user_email || payment.user_id}
          </p>
          <p className="text-sm text-gray-600">Montant : {(payment.amount / 100).toFixed(2)} €</p>
          <p className="text-sm text-gray-600">Statut : {payment.status}</p>

          {payment.status === 'completed' && (
            <button
              onClick={() => downloadInvoice(payment._id)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Télécharger la facture
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminPayments;
