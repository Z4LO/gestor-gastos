import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Plugin personalizado para mostrar porcentajes en el gráfico de torta
const percentagePlugin = {
  id: 'percentagePlugin',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    
    if (total === 0) return;
    
    meta.data.forEach((element, index) => {
      const { x, y } = element.tooltipPosition();
      const value = data.datasets[0].data[index];
      const percentage = ((value / total) * 100).toFixed(1);
      
      // Solo mostrar porcentaje si es mayor al 3% para evitar superposición
      if (percentage >= 3) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Agregar sombra al texto para mejor legibilidad
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(`${percentage}%`, x, y);
        
        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });
  }
};

const API_BASE_URL = 'http://localhost:3001/api';

const Dashboard = ({ transactions, categories, dateRange }) => {
  const { isDarkMode } = useTheme();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadCategoryData();
    loadMonthlyData();
  }, [dateRange]);

  const loadCategoryData = async () => {
    try {
      const params = {
        fechaInicio: dateRange.startDate.toISOString().split('T')[0],
        fechaFin: dateRange.endDate.toISOString().split('T')[0]
      };
      
      const response = await axios.get(`${API_BASE_URL}/resumen/categorias`, { params });
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error cargando datos por categoría:', error);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const year = dateRange.endDate.getFullYear();
      const response = await axios.get(`${API_BASE_URL}/resumen/mensual`, { 
        params: { ano: year } 
      });
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Error cargando datos mensuales:', error);
    }
  };

  // Preparar datos para gráfico de dona (gastos por categoría)
  const expenseCategories = categoryData.filter(item => item.tipo === 'egreso');
  const expensePieData = {
    labels: expenseCategories.map(item => item.nombre),
    datasets: [
      {
        data: expenseCategories.map(item => item.total),
        backgroundColor: expenseCategories.map(item => item.color),
        borderColor: expenseCategories.map(item => item.color),
        borderWidth: 2,
      },
    ],
  };

  // Preparar datos para gráfico de dona (ingresos por categoría)
  const incomeCategories = categoryData.filter(item => item.tipo === 'ingreso');
  const incomePieData = {
    labels: incomeCategories.map(item => item.nombre),
    datasets: [
      {
        data: incomeCategories.map(item => item.total),
        backgroundColor: incomeCategories.map(item => item.color),
        borderColor: incomeCategories.map(item => item.color),
        borderWidth: 2,
      },
    ],
  };

  // Preparar datos para gráfico de barras (comparación por categoría)
  const allCategories = [...new Set(categoryData.map(item => item.nombre))];
  const barData = {
    labels: allCategories,
    datasets: [
      {
        label: 'Ingresos',
        data: allCategories.map(cat => {
          const income = categoryData.find(item => item.nombre === cat && item.tipo === 'ingreso');
          return income ? income.total : 0;
        }),
        backgroundColor: '#27ae60',
        borderColor: '#27ae60',
        borderWidth: 1,
      },
      {
        label: 'Gastos',
        data: allCategories.map(cat => {
          const expense = categoryData.find(item => item.nombre === cat && item.tipo === 'egreso');
          return expense ? expense.total : 0;
        }),
        backgroundColor: '#e74c3c',
        borderColor: '#e74c3c',
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para gráfico de líneas (tendencia mensual)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const months = Array.from({length: 12}, (_, i) => i + 1);
  const lineData = {
    labels: months.map(month => monthNames[month - 1]),
    datasets: [
      {
        label: 'Ingresos',
        data: months.map(month => {
          const income = monthlyData.find(item => item.mes === month && item.tipo === 'ingreso');
          return income ? income.total : 0;
        }),
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Gastos',
        data: months.map(month => {
          const expense = monthlyData.find(item => item.mes === month && item.tipo === 'egreso');
          return expense ? expense.total : 0;
        }),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Configuración de colores basada en el tema
  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const gridColor = isDarkMode ? '#475569' : '#e2e8f0';
  const borderColor = isDarkMode ? '#64748b' : '#cbd5e1';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: borderColor,
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        border: {
          color: borderColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          color: gridColor,
        },
        border: {
          color: borderColor,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      percentagePlugin: true,
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Resumen de categorías */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resumen por Categorías</h3>
          </div>
          <div className="category-summary">
            {categoryData.map(item => (
              <div key={`${item.nombre}-${item.tipo}`} className="category-item">
                <div className="category-info">
                  <div 
                    className="category-color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="category-name">{item.nombre}</span>
                  <span className={`category-type ${item.tipo}`}>
                    ({item.tipo})
                  </span>
                </div>
                <div className="category-amount">
                  <span className={`amount ${item.tipo}`}>
                    ${parseFloat(item.total).toFixed(2)}
                  </span>
                  <span className="transaction-count">
                    {item.cantidad} transacciones
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de gastos por categoría */}
        {expenseCategories.length > 0 && (
          <div className="card chart-card">
            <div className="card-header">
              <h3 className="card-title">Distribución de Gastos</h3>
            </div>
            <div className="chart-container">
              <Doughnut data={expensePieData} options={pieOptions} plugins={[percentagePlugin]} />
            </div>
          </div>
        )}

        {/* Gráfico de ingresos por categoría */}
        {incomeCategories.length > 0 && (
          <div className="card chart-card">
            <div className="card-header">
              <h3 className="card-title">Distribución de Ingresos</h3>
            </div>
            <div className="chart-container">
              <Doughnut data={incomePieData} options={pieOptions} plugins={[percentagePlugin]} />
            </div>
          </div>
        )}

        {/* Gráfico de barras comparativo */}
        {allCategories.length > 0 && (
          <div className="card chart-card full-width">
            <div className="card-header">
              <h3 className="card-title">Comparación por Categorías</h3>
            </div>
            <div className="chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Gráfico de tendencia mensual */}
        {monthlyData.length > 0 && (
          <div className="card chart-card full-width">
            <div className="card-header">
              <h3 className="card-title">Tendencia Anual</h3>
            </div>
            <div className="chart-container">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;