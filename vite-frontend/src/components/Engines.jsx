import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Settings, Edit, Trash2, MapPin } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

import EngineModal from './EngineModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-100';
    case 'rented':
      return 'text-orange-600 bg-orange-100';
    case 'maintenance':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'rented':
      return 'Loué';
    case 'maintenance':
      return 'Maintenance';
    default:
      return status;
  }
};

const Engines = () => {
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEngines();
  }, [searchTerm, selectedCategory, selectedBrand]);

  const fetchEngines = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);

      const response = await axios.get(`${API}/engines?${params}`);
      setEngines(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des engins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (engineId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet engin ?')) {
      try {
        await axios.delete(`${API}/engines/${engineId}`);
        fetchEngines();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Catalogue d'Engins</h2>
        {user.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajouter un engin</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un engin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              <option value="excavatrice">Excavatrice</option>
              <option value="bulldozer">Bulldozer</option>
              <option value="grue">Grue</option>
              <option value="tractopelle">Tractopelle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les marques</option>
              <option value="Caterpillar">Caterpillar</option>
              <option value="Komatsu">Komatsu</option>
              <option value="Liebherr">Liebherr</option>
              <option value="Volvo">Volvo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des engins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engines.map((engine) => (
          <div key={engine.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {engine.images?.length ? (
                <img
                  src={engine.images[0]}
                  alt={engine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Settings className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{engine.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engine.status)}`}
                >
                  {getStatusLabel(engine.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{engine.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{engine.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(engine.daily_rate)}/jour
                </span>
                {user.role === 'admin' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEngine(engine)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(engine.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {engines.length === 0 && (
        <div className="text-center py-8 text-gray-500">Aucun engin trouvé</div>
      )}

      {(showAddModal || editingEngine) && (
        <EngineModal
          engine={editingEngine}
          onClose={() => {
            setShowAddModal(false);
            setEditingEngine(null);
          }}
          onSave={() => {
            fetchEngines();
            setShowAddModal(false);
            setEditingEngine(null);
          }}
        />
      )}
    </div>
  );
};

export default Engines;
