import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import DateRangeFilter from './components/DateRangeFilter.js';
import CategoryManager from './components/CategoryManager.js';
import RecurringExpenses from './components/RecurringExpenses';
import { PlusCircle, BarChart3, List, Settings, RotateCcw, Sun, Moon } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import './App.css';
import './components/Common.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [loading, setLoading] = useState(false);

  // Cargar categorías al inicio
  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar transacciones cuando cambie el rango de fechas
  useEffect(() => {
    loadTransactions();
  }, [dateRange]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      alert('Error al cargar las categorías');
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        fechaInicio: dateRange.startDate.toISOString().split('T')[0],
        fechaFin: dateRange.endDate.toISOString().split('T')[0]
      };
      
      const response = await axios.get(`${API_BASE_URL}/transacciones`, { params });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      alert('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      if (editingTransaction) {
        await axios.put(`${API_BASE_URL}/transacciones/${editingTransaction.id}`, transactionData);
      } else {
        await axios.post(`${API_BASE_URL}/transacciones`, transactionData);
      }
      
      loadTransactions();
      setShowTransactionForm(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error guardando transacción:', error);
      alert('Error al guardar la transacción');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await axios.delete(`${API_BASE_URL}/transacciones/${id}`);
        loadTransactions();
      } catch (error) {
        console.error('Error eliminando transacción:', error);
        alert('Error al eliminar la transacción');
      }
    }
  };

  const openNewTransactionForm = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.tipo === 'egreso')
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const handleCategoryAdd = async (categoryData) => {
  try {
    await axios.post(`${API_BASE_URL}/categorias`, categoryData);
    loadCategories();
  } catch (error) {
    console.error('Error creando categoría:', error);
    alert('Error al crear la categoría');
  }
};

const handleCategoryEdit = async (id, categoryData) => {
  try {
    await axios.put(`${API_BASE_URL}/categorias/${id}`, categoryData);
    loadCategories();
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    alert('Error al actualizar la categoría');
  }
};

const handleCategoryDelete = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/categorias/${id}`);
    loadCategories();
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    alert('Error al eliminar la categoría');
  }
};

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Gestión de Gastos</h1>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item income">
              <span className="label">Ingresos</span>
              <span className="value">${getTotalIncome().toFixed(2)}</span>
            </div>
            <div className="stat-item expense">
              <span className="label">Gastos</span>
              <span className="value">${getTotalExpenses().toFixed(2)}</span>
            </div>
            <div className={`stat-item balance ${getBalance() >= 0 ? 'positive' : 'negative'}`}>
              <span className="label">Balance</span>
              <span className="value">${getBalance().toFixed(2)}</span>
            </div>
          </div>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={20} />
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <List size={20} />
          Transacciones
        </button>

        <button 
          className={`nav-btn ${activeTab === 'recurring' ? 'active' : ''}`}
          onClick={() => setActiveTab('recurring')}
        >
          <RotateCcw size={20} />
          Gastos Recurrentes
        </button>

        <button 
          className={`nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Settings size={20} />
          Categorías
        </button>

        <button 
          className="btn-primary"
          onClick={openNewTransactionForm}
        >
          <PlusCircle size={20} />
          Nueva Transacción
        </button>
      </nav>

      <main className="app-main">
        <div className="filters-section">
          <DateRangeFilter 
            dateRange={dateRange}
            onChange={setDateRange}
          />
        </div>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions}
                categories={categories}
                dateRange={dateRange}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionList 
                transactions={transactions}
                categories={categories}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}

            {activeTab === 'recurring' && (
              <RecurringExpenses 
                categories={categories}
                onRefreshTransactions={loadTransactions}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager 
                categories={categories}
                onCategoryAdd={handleCategoryAdd}
                onCategoryEdit={handleCategoryEdit}
                onCategoryDelete={handleCategoryDelete}
              />
            )}


          </>
        )}
      </main>

      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSubmit={handleTransactionSubmit}
          onCancel={() => {
            setShowTransactionForm(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

export default App;