import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Palette } from 'lucide-react';

const CategoryManager = ({ categories, onCategoryAdd, onCategoryEdit, onCategoryDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'egreso',
    color: '#3498db'
  });

  const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#27ae60',
    '#8e44ad', '#d35400', '#c0392b', '#16a085', '#f1c40f'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    if (editingCategory) {
      onCategoryEdit(editingCategory.id, formData);
    } else {
      onCategoryAdd(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', tipo: 'egreso', color: '#3498db' });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setFormData({
      nombre: category.nombre,
      tipo: category.tipo,
      color: category.color
    });
    setEditingCategory(category);
    setShowForm(true);
    
    // Scroll rápido hacia el 20% de la pantalla
    setTimeout(() => {
      const scrollPosition = window.innerHeight * 0.2;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
      });
    }, 50);
  };

  const handleDelete = (category) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.nombre}"?`)) {
      onCategoryDelete(category.id);
    }
  };

  const ingresoCategories = categories.filter(cat => cat.tipo === 'ingreso');
  const egresoCategories = categories.filter(cat => cat.tipo === 'egreso');

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Gestión de Categorías</h2>
        <button 
          className="btn btn-success"
          onClick={() => {
        setShowForm(true);
        // Scroll rápido hacia el 20% de la pantalla para nuevo formulario
        setTimeout(() => {
          const scrollPosition = window.innerHeight * 0.2;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
          });
        }, 50);
      }}
        >
          <PlusCircle size={20} />
          Nueva Categoría
        </button>
      </div>

      {showForm && (
        <div className="category-form">
          <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="form-control"
                  placeholder="Ej: Gimnasio"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="form-control"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, color})}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-success">
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        <div className="category-section">
          <h3 className="section-title">
            Ingresos ({ingresoCategories.length})
          </h3>
          <div className="category-list">
            {ingresoCategories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-info">
                  <div 
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="category-name">{category.nombre}</span>
                </div>
                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-secondary"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="btn btn-danger"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="category-section">
          <h3 className="section-title">
            Egresos ({egresoCategories.length})
          </h3>
          <div className="category-list">
            {egresoCategories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-info">
                  <div 
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="category-name">{category.nombre}</span>
                </div>
                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-secondary"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="btn btn-danger"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;