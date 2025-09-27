// pages/MaterialesPage.jsx - Página de prueba para materiales
import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';

const MaterialesPage = () => {
  // Estado de ejemplo para materiales
  const [materiales, setMateriales] = useState([
    {
      id: 1,
      nombre: 'Cemento Portland',
      descripcion: 'Cemento de alta calidad para construcción',
      medida: 'Sacos de 50kg',
      cantidadActual: 45,
      cantidadMinima: 10
    },
    {
      id: 2,
      nombre: 'Arena de río',
      descripcion: 'Arena fina para mezclas de concreto',
      medida: 'Metros cúbicos',
      cantidadActual: 25.5,
      cantidadMinima: 5
    },
    {
      id: 3,
      nombre: 'Varilla de acero #4',
      descripcion: 'Varilla corrugada de 12mm',
      medida: 'Varillas de 12m',
      cantidadActual: 200,
      cantidadMinima: 50
    },
    {
      id: 4,
      nombre: 'Block de concreto',
      descripcion: 'Block de 15x20x40 cm',
      medida: 'Unidades',
      cantidadActual: 500,
      cantidadMinima: 100
    },
    {
      id: 5,
      nombre: 'Pintura blanca',
      descripcion: 'Pintura látex para interiores',
      medida: 'Galones',
      cantidadActual: 15,
      cantidadMinima: 5
    }
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Filtrar materiales por búsqueda
  const materialesFiltrados = materiales.filter(material =>
    material.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    material.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para determinar el estado del stock
  const getEstadoStock = (actual, minima) => {
    if (actual <= minima) {
      return { texto: 'Stock Crítico', color: '#e53e3e', bg: '#fed7d7' };
    } else if (actual <= minima * 2) {
      return { texto: 'Stock Bajo', color: '#dd6b20', bg: '#feebc8' };
    } else {
      return { texto: 'Stock Normal', color: '#38a169', bg: '#c6f6d5' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            <Package size={32} style={{ marginRight: '12px' }} />
            📦 Inventario de Materiales
          </h1>
          <p style={styles.subtitle}>
            Gestión y control del inventario de materiales de construcción
          </p>
        </div>
        
        <div style={styles.headerActions}>
          <button 
            style={styles.addButton}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <Plus size={20} />
            Agregar Material
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Materiales</h3>
          <p style={styles.statNumber}>{materiales.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Stock Crítico</h3>
          <p style={{ ...styles.statNumber, color: '#e53e3e' }}>
            {materiales.filter(m => m.cantidadActual <= m.cantidadMinima).length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Stock Normal</h3>
          <p style={{ ...styles.statNumber, color: '#38a169' }}>
            {materiales.filter(m => m.cantidadActual > m.cantidadMinima * 2).length}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar materiales por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Formulario de agregar (condicional) */}
      {mostrarFormulario && (
        <div style={styles.formContainer}>
          <h3>➕ Agregar Nuevo Material</h3>
          <p style={styles.formNote}>🚧 Formulario en desarrollo - Funcionalidad próximamente</p>
          <button 
            onClick={() => setMostrarFormulario(false)}
            style={styles.cancelButton}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tabla de materiales */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Medida</th>
              <th style={styles.th}>Stock Actual</th>
              <th style={styles.th}>Stock Mínimo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materialesFiltrados.length > 0 ? (
              materialesFiltrados.map((material) => {
                const estado = getEstadoStock(material.cantidadActual, material.cantidadMinima);
                return (
                  <tr key={material.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{material.nombre}</strong>
                    </td>
                    <td style={styles.td}>{material.descripcion}</td>
                    <td style={styles.td}>{material.medida}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                      {material.cantidadActual}
                    </td>
                    <td style={styles.td}>{material.cantidadMinima}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.estadoBadge,
                        color: estado.color,
                        backgroundColor: estado.bg
                      }}>
                        {estado.texto}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.editButton} title="Editar">
                          <Edit size={16} />
                        </button>
                        <button style={styles.deleteButton} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={styles.noResults}>
                  {busqueda ? 
                    `No se encontraron materiales que coincidan con "${busqueda}"` : 
                    'No hay materiales registrados'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer informativo */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 <strong>Tip:</strong> Los materiales con stock crítico (rojo) necesitan reabastecimiento urgente.
        </p>
        <p style={styles.footerText}>
          📊 Total de materiales mostrados: {materialesFiltrados.length} de {materiales.length}
        </p>
      </div>
    </div>
  );
};

// Estilos del componente
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    color: '#2d3748'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e2e8f0'
  },

  titleSection: {
    flex: 1
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 8px 0'
  },

  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0'
  },

  headerActions: {
    display: 'flex',
    gap: '12px'
  },

  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  statCard: {
    backgroundColor: '#f7fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },

  statTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#718096',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0'
  },

  searchContainer: {
    marginBottom: '25px'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    gap: '12px',
    maxWidth: '500px'
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif'
  },

  formContainer: {
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    marginBottom: '25px',
    textAlign: 'center'
  },

  formNote: {
    color: '#718096',
    fontSize: '14px',
    margin: '10px 0'
  },

  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  tableHeader: {
    backgroundColor: '#f7fafc'
  },

  th: {
    padding: '16px 12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0'
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease'
  },

  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#2d3748'
  },

  estadoBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  actionButtons: {
    display: 'flex',
    gap: '8px'
  },

  editButton: {
    padding: '6px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  deleteButton: {
    padding: '6px',
    backgroundColor: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
    fontStyle: 'italic'
  },

  footer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },

  footerText: {
    margin: '5px 0',
    fontSize: '14px',
    color: '#4a5568'
  }
};

export default MaterialesPage;