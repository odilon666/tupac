import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Payments = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    }
  };

  const handlePayment = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/payments/create-checkout-session`,
        { reservation_id: reservationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.checkout_url;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du paiement:", error);
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/payments/${paymentId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // important pour le fichier PDF
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture :", error);
    }
  };


  

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes Paiements</h2>
      {payments.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white p-4 rounded shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Réservation: {payment.reservation_id}
                  </p>
                  <p className="text-gray-500">
                    Montant : {formatCurrency(payment.amount)}
                  </p>
                  <p className={`mt-1 font-medium ${
                    payment.status === 'completed'
                      ? 'text-green-600'
                      : payment.status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    Statut: {payment.status}
                  </p>
                </div>

                <div className="flex flex-col space-y-2 items-end">
                  {payment.status !== 'completed' ? (
                    <button
                      onClick={() => handlePayment(payment.reservation_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Payer
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadInvoice(payment.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Télécharger facture
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
