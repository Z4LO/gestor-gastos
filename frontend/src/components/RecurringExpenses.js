import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Calendar, 
  Play, 
  Pause, 
  RefreshCw,
  DollarSign,
  AlertCircle 
} from 'lucide-react';
import Modal from 'react-modal';
import axios from 'axios';
import './RecurringExpenses.css';
import './Modal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const RecurringExpenses = ({ categories, onRefreshTransactions }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    tipo: 'egreso',
    categoria_id: '',
    dia_mes: 1,
    activo: true
  });

  useEffect(() => {
    loadRecurringExpenses();
  }, []);

  const loadRecurringExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/gastos-recurrentes`);
      setRecurringExpenses(response.data);
    } catch (error) {
      console.error('Error cargando gastos recurrentes:', error);
      alert('Error cargando gastos recurrentes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        descripcion: expense.descripcion,
        monto: expense.monto.toString(),
        tipo: expense.tipo,
        categoria_id: expense.categoria_id.toString(),
        dia_mes: expense.dia_mes,
        activo: expense.activo
      });
    } else {
      setEditingExpense(null);
      setFormData({
        descripcion: '',
        monto: '',
        tipo: 'egreso',
        categoria_id: '',
        dia_mes: 1,
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcion || !formData.monto || !formData.categoria_id) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const submitData = {
      ...formData,
      monto: parseFloat(formData.monto)
    };

    try {
      if (editingExpense) {
        await axios.put(`${API_BASE_URL}/gastos-recurrentes/${editingExpense.id}`, submitData);
      } else {
        await axios.post(`${API_BASE_URL}/gastos-recurrentes`, submitData);
      }
      
      await loadRecurringExpenses();
      closeModal();
    } catch (error) {
      console.error('Error guardando gasto recurrente:', error);
      alert('Error guardando gasto recurrente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto recurrente?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/gastos-recurrentes/${id}`);
      await loadRecurringExpenses();
    } catch (error) {
      console.error('Error eliminando gasto recurrente:', error);
      alert('Error eliminando gasto recurrente');
    }
  };

  const toggleActive = async (expense) => {
    try {
      const updatedExpense = { ...expense, activo: !expense.activo };
      await axios.put(`${API_BASE_URL}/gastos-recurrentes/${expense.id}`, updatedExpense);
      await loadRecurringExpenses();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error actualizando estado del gasto recurrente');
    }
  };

  const processRecurringExpenses = async () => {
    if (!window.confirm('¿Deseas procesar manualmente los gastos recurrentes de hoy?')) {
      return;
    }

    setProcessing(true);
    try {
      await axios.post(`${API_BASE_URL}/gastos-recurrentes/procesar`);
      alert('Procesamiento iniciado exitosamente');
      if (onRefreshTransactions) {
        onRefreshTransactions();
      }
    } catch (error) {
      console.error('Error procesando gastos recurrentes:', error);
      alert('Error procesando gastos recurrentes');
    } finally {
      setProcessing(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.tipo === formData.tipo);

  const getDayLabel = (day) => {
    if (day === 1) return '1er día del mes';
    if (day <= 10) return `${day} del mes`;
    if (day <= 28) return `${day} del mes`;
    return 'Último día del mes';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando gastos recurrentes...</p>
      </div>
    );
  }

  return (
    <div className="recurring-expenses">
      <div className="page-header">
        <div className="header-content">
          <h2>Gastos Recurrentes</h2>
          <p className="header-description">
            Gestiona gastos que se generan automáticamente cada mes
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={processRecurringExpenses}
            disabled={processing}
            className="btn btn-secondary"
            title="Procesar gastos recurrentes manualmente"
          >
            <RefreshCw size={16} className={processing ? 'rotating' : ''} />
            {processing ? 'Procesando...' : 'Procesar Ahora'}
          </button>
          <button onClick={() => openModal()} className="btn btn-primary">
            <PlusCircle size={16} />
            Nuevo Gasto Recurrente
          </button>
        </div>
      </div>

      <div className="alert alert-info">
        <AlertCircle size={16} />
        <div>
          <strong>Información:</strong> Los gastos recurrentes se procesan automáticamente cada día a las 9:00 AM.
          Las transacciones se crean el día especificado de cada mes con la etiqueta "(Automático)".
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Lista de Gastos Recurrentes</h3>
        </div>
        <div className="recurring-expenses-list">
          {recurringExpenses.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No hay gastos recurrentes</h3>
              <p>Crea tu primer gasto recurrente para automatizar tus finanzas</p>
              <button onClick={() => openModal()} className="btn btn-primary">
                <PlusCircle size={16} />
                Crear Gasto Recurrente
              </button>
            </div>
          ) : (
            recurringExpenses.map(expense => (
              <div key={expense.id} className={`expense-item ${!expense.activo ? 'inactive' : ''}`}>
                <div className="expense-main">
                  <div className="expense-info">
                    <div className="expense-header">
                      <h4 className="expense-title">{expense.descripcion}</h4>
                      <div className="expense-badges">
                        <span className={`badge ${expense.tipo}`}>
                          {expense.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                        {!expense.activo && (
                          <span className="badge inactive">Inactivo</span>
                        )}
                      </div>
                    </div>
                    <div className="expense-details">
                      <div className="detail-item">
                        <DollarSign size={14} />
                        <span className={`amount ${expense.tipo}`}>
                          {formatCurrency(expense.monto)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <div 
                          className="category-color"
                          style={{ backgroundColor: expense.categoria_color }}
                        ></div>
                        <span>{expense.categoria_nombre}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={14} />
                        <span>{getDayLabel(expense.dia_mes)}</span>
                      </div>
                    </div>
                    {expense.ultimo_procesado && (
                      <div className="last-processed">
                        Último procesamiento: {new Date(expense.ultimo_procesado).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="expense-actions">
                  <button
                    onClick={() => toggleActive(expense)}
                    className={`btn-icon ${expense.activo ? 'btn-warning' : 'btn-success'}`}
                    title={expense.activo ? 'Desactivar' : 'Activar'}
                  >
                    {expense.activo ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => openModal(expense)}
                    className="btn-icon btn-primary"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="btn-icon btn-danger"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>{editingExpense ? 'Editar Gasto Recurrente' : 'Nuevo Gasto Recurrente'}</h2>
          <button onClick={closeModal} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Ej: Alquiler, Internet, Salario"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monto">Monto *</label>
              <input
                type="number"
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                className="form-control"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dia_mes">Día del mes *</label>
              <select
                id="dia_mes"
                name="dia_mes"
                value={formData.dia_mes}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {getDayLabel(day)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="egreso">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="categoria_id">Categoría *</label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Selecciona una categoría</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Activo (se procesará automáticamente)
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              {editingExpense ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecurringExpenses;