import React from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import './TransactionList.css';

const TransactionList = ({ transactions, categories, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = parseFloat(amount).toFixed(2);
    return type === 'ingreso' ? `+$${formattedAmount}` : `-$${formattedAmount}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>No hay transacciones</h3>
          <p>Comienza agregando tu primera transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Transacciones ({transactions.length})</h2>
      </div>

      <div className="transactions-list">
        {transactions.map(transaction => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-icon">
              {transaction.tipo === 'ingreso' ? (
                <TrendingUp className="icon-income" size={20} />
              ) : (
                <TrendingDown className="icon-expense" size={20} />
              )}
            </div>

            <div className="transaction-info">
              <div className="transaction-main">
                <h4 className="transaction-description">{transaction.descripcion}</h4>
                <span 
                  className="transaction-category"
                  style={{ 
                    backgroundColor: transaction.categoria_color + '20',
                    color: transaction.categoria_color,
                    border: `1px solid ${transaction.categoria_color}30`
                  }}
                >
                  {transaction.categoria_nombre}
                </span>
              </div>
              <div className="transaction-meta">
                <span className="transaction-date">{formatDate(transaction.fecha)}</span>
              </div>
            </div>

            <div className="transaction-amount">
              <span className={`amount ${transaction.tipo}`}>
                {formatAmount(transaction.monto, transaction.tipo)}
              </span>
            </div>

            <div className="transaction-actions">
              <button
                onClick={() => onEdit(transaction)}
                className="btn btn-secondary"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className="btn btn-danger"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;