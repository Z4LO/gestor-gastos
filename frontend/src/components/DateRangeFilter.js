import React from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './DateRangeFilter.css';

const DateRangeFilter = ({ dateRange, onChange }) => {
  const handleStartDateChange = (date) => {
    onChange({
      ...dateRange,
      startDate: date
    });
  };

  const handleEndDateChange = (date) => {
    onChange({
      ...dateRange,
      endDate: date
    });
  };

  const setPresetRange = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(today);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onChange({ startDate, endDate });
  };

  return (
    <div className="date-range-filter">
      <div className="date-range-header">
        <h3>
          <Calendar size={20} />
          Filtrar por Fecha
        </h3>
      </div>

      <div className="date-range-content">
        <div className="date-inputs">
          <div className="date-input-group">
            <label>Fecha Inicio</label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              maxDate={dateRange.endDate}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              portalId="root-portal"
              withPortal
            />
          </div>

          <div className="date-input-group">
            <label>Fecha Fin</label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              portalId="root-portal"
              withPortal
            />
          </div>
        </div>

        <div className="preset-buttons">
          <button 
            className="filter-btn filter-btn-success"
            onClick={() => setPresetRange('today')}
          >
            Hoy
          </button>
          <button 
            className="filter-btn filter-btn-primary"
            onClick={() => setPresetRange('week')}
          >
            Última Semana
          </button>
          <button 
            className="filter-btn filter-btn-highlighted"
            onClick={() => setPresetRange('month')}
          >
            Este Mes
          </button>
          <button 
            className="filter-btn filter-btn-primary"
            onClick={() => setPresetRange('lastMonth')}
          >
            Mes Anterior
          </button>
          <button 
            className="filter-btn filter-btn-secondary"
            onClick={() => setPresetRange('quarter')}
          >
            Este Trimestre
          </button>
          <button 
            className="filter-btn filter-btn-secondary"
            onClick={() => setPresetRange('year')}
          >
            Este Año
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;