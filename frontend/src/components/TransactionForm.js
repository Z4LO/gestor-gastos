import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X, Save } from 'lucide-react';
import './TransactionForm.css';
import './Modal.css';

Modal.setAppElement('#root');

const TransactionForm = ({ transaction, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    tipo: 'egreso',
    categoria_id: '',
    fecha: new Date().toISOString().split('T')[0],
    esRecurrente: false,
    dia_mes: 1
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        descripcion: transaction.descripcion,
        monto: transaction.monto.toString(),
        tipo: transaction.tipo,
        categoria_id: transaction.categoria_id.toString(),
        fecha: transaction.fecha.split('T')[0],
        esRecurrente: false,
        dia_mes: 1
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcion || !formData.monto || !formData.categoria_id) {
      alert('Por favor completa todos los campos');
      return;
    }

    const submitData = {
      ...formData,
      monto: parseFloat(formData.monto)
    };

    // Si es recurrente, crear tanto la transacción como el gasto recurrente
    if (formData.esRecurrente) {
      try {
        // Crear gasto recurrente
        const recurringData = {
          descripcion: formData.descripcion,
          monto: parseFloat(formData.monto),
          tipo: formData.tipo,
          categoria_id: parseInt(formData.categoria_id),
          dia_mes: parseInt(formData.dia_mes),
          activo: true
        };

        await fetch('http://localhost:3001/api/gastos-recurrentes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recurringData),
        });

        alert('Transacción y gasto recurrente creados exitosamente');
      } catch (error) {
        console.error('Error creando gasto recurrente:', error);
        alert('Error creando gasto recurrente, pero la transacción se creará normalmente');
      }
    }

    onSubmit(submitData);
  };

  const filteredCategories = categories.filter(cat => cat.tipo === formData.tipo);

  return (
    <Modal
      isOpen={true}
      onRequestClose={onCancel}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>{transaction ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
        <button onClick={onCancel} className="btn-close">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: Almuerzo en restaurante"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="monto">Monto</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              className="form-control"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="egreso">Egreso</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="categoria_id">Categoría</label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
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
              name="esRecurrente"
              checked={formData.esRecurrente}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Hacer este gasto recurrente (se repetirá automáticamente cada mes)
          </label>
        </div>

        {formData.esRecurrente && (
          <div className="form-group recurring-options">
            <label htmlFor="dia_mes">Día del mes para repetir</label>
            <select
              id="dia_mes"
              name="dia_mes"
              value={formData.dia_mes}
              onChange={handleChange}
              className="form-control"
            >
              {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  {day === 1 ? '1er día del mes' : `${day} del mes`}
                </option>
              ))}
            </select>
            <small className="form-text">
              Se creará automáticamente una transacción cada mes en esta fecha
            </small>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-success">
            <Save size={16} />
            {transaction ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;