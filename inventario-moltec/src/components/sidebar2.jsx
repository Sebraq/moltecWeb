// components/Sidebar.jsx - Sidebar Responsive con Toggle Mejorado
import React, { useState, useEffect } from 'react';
import { 
  User, 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Users, 
  UserCog, 
  FolderOpen, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './sidebar2.css';

const Sidebar = ({ 
  activeSection, 
  onSectionChange, 
  userName = "Usuario", 
  userRole = "Empleado", 
  isAdmin = false,
  onLogout 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para manejar el logout
  const handleLogout = () => {
    console.log(`👋 ${userName} está cerrando sesión desde el sidebar`);
    if (onLogout) {
      onLogout();
    }
  };

  // Toggle del sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Cerrar sidebar en móvil al seleccionar un item
  const handleItemClick = (itemId) => {
    if (onSectionChange) {
      onSectionChange(itemId);
    }
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Elementos del menú
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: '#667eea',
      requireAdmin: false
    },
    {
      id: 'materiales',
      label: 'Inventario de Materiales',
      icon: Package,
      color: '#48bb78',
      requireAdmin: false
    },
    {
      id: 'herramientas',
      label: 'Inventario de Herramientas',
      icon: Wrench,
      color: '#ed8936',
      requireAdmin: false
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      color: '#38b2ac',
      requireAdmin: false
    },
    {
      id: 'empleados',
      label: 'Empleados',
      icon: UserCog,
      color: '#9f7aea',
      requireAdmin: false
    },
    {
      id: 'proyectos',
      label: 'Proyectos',
      icon: FolderOpen,
      color: '#4299e1',
      requireAdmin: false
    },
    {
      id: 'bitacora',
      label: 'Bitácora',
      icon: FileText,
      color: '#f56565',
      requireAdmin: false
    }
  ];

  // Filtrar elementos según el rol
  const visibleMenuItems = menuItems.filter(item => {
    if (item.requireAdmin && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Botón hamburguesa para móviles */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {isMobileOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>
      )}

      {/* Overlay para cerrar en móvil */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Botón toggle con animación hamburguesa/X (solo desktop) */}
        {!isMobile && (
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar} 
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <div className="toggle-icon">
              <div className="toggle-icon-line"></div>
              <div className="toggle-icon-line"></div>
              <div className="toggle-icon-line"></div>
            </div>
          </button>
        )}

        {/* Header del usuario */}
        <div className="sidebar-user-section">
          <div className="sidebar-user-avatar">
            <User size={isCollapsed ? 24 : 32} color="#666" />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role">{userRole}</div>
          </div>
        </div>

        {/* Separador */}
        <div className="sidebar-separator"></div>

        {/* Menú de navegación */}
        <nav className="sidebar-navigation">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`sidebar-menu-item ${isActive ? 'active' : ''} ${item.requireAdmin ? 'admin-only' : ''}`}
                style={{
                  borderLeftColor: isActive ? item.color : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isMobile) {
                    e.currentTarget.style.borderLeftColor = item.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }
                }}
              >
                <div className="sidebar-menu-icon">
                  <Icon 
                    size={20} 
                    color={isActive ? '#131F2B' : (item.requireAdmin ? '#805ad5' : '#6c757d')} 
                  />
                </div>
                <span className="sidebar-menu-text">
                  {item.label}
                  {item.requireAdmin && ' 👑'}
                </span>
                {/* Tooltip para cuando está colapsado */}
                {isCollapsed && !isMobile && (
                  <span className="menu-tooltip">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="sidebar-logout-section">
          <button
            onClick={handleLogout}
            className="sidebar-logout-button"
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = '#fed7d7';
                e.currentTarget.style.borderLeftColor = '#e53e3e';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }}
          >
            <div className="sidebar-menu-icon">
              <LogOut size={20} color="#e53e3e" />
            </div>
            <span className="sidebar-logout-text">Cerrar Sesión</span>
            {/* Tooltip para cuando está colapsado */}
            {isCollapsed && !isMobile && (
              <span className="menu-tooltip">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;