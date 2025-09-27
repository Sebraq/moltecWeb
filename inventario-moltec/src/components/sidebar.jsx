// components/Sidebar.jsx - Componente Sidebar con Roles
import React from 'react';
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
  Shield
} from 'lucide-react';

const Sidebar = ({ 
  activeSection, 
  onSectionChange, 
  userName = "Usuario", 
  userRole = "Empleado", 
  isAdmin = false,
  onLogout 
}) => {
  // Función para manejar el logout
  const handleLogout = () => {
    console.log(`👋 ${userName} está cerrando sesión desde el sidebar`);
    if (onLogout) {
      onLogout();
    }
  };

  // Elementos del menú (sin filtros de rol aquí)
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
    },
    // Elemento SOLO para administradores
    // {
    //   id: 'solo-admin',
    //   label: 'Solo Admin',
    //   icon: Shield,
    //   color: '#805ad5',
    //   requireAdmin: true // ⚠️ Este solo se muestra para admins
    // }
  ];

  // Filtrar elementos según el rol del usuario
  const visibleMenuItems = menuItems.filter(item => {
    // Si el elemento requiere admin y el usuario no es admin, no mostrarlo
    if (item.requireAdmin && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <div style={styles.sidebar}>
      {/* Header del usuario */}
      <div style={styles.userSection}>
        <div style={styles.userAvatar}>
          <User size={32} color="#666" />
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>
            {userName}
          </div>
          <div style={styles.userRole}>
            {userRole}
            {isAdmin}
          </div>
        </div>
      </div>

      {/* Separador */}
      <div style={styles.separator}></div>

      {/* Menú de navegación */}
      <nav style={styles.navigation}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange && onSectionChange(item.id)}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.menuItemActive : {}),
                // Estilo especial para elementos de admin
                ...(item.requireAdmin ? styles.adminMenuItem : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = item.requireAdmin ? '#f0e6ff' : '#f7fafc';
                  e.target.style.borderLeftColor = item.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderLeftColor = 'transparent';
                }
              }}
            >
              <div style={styles.menuItemIcon}>
                <Icon 
                  size={20} 
                  color={isActive ? '#131F2B' : (item.requireAdmin ? '#805ad5' : '#6c757d')} 
                />
              </div>
              <span style={{
                ...styles.menuItemText,
                color: isActive ? '#131F2B' : (item.requireAdmin ? '#805ad5' : '#4a5568')
              }}>
                {item.label}
                {item.requireAdmin && ' 👑'}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Información de rol (si es admin) */}
      {/* {isAdmin && (
        <div style={styles.adminBadge}>
          <Shield size={16} color="#805ad5" />
          <span style={styles.adminBadgeText}>
            Permisos de Admin
          </span>
        </div>
      )} */}

      {/* Botón de cerrar sesión */}
      <div style={styles.logoutSection}>
        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fed7d7';
            e.target.style.borderLeftColor = '#e53e3e';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderLeftColor = 'transparent';
          }}
        >
          <div style={styles.menuItemIcon}>
            <LogOut size={20} color="#e53e3e" />
          </div>
          <span style={styles.logoutText}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};

// Estilos del componente
const styles = {
  sidebar: {
    width: '280px',
    height: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000
  },

  userSection: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e2e8f0'
  },

  userAvatar: {
    width: '70px',
    height: '70px',
    backgroundColor: '#e2e8f0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    border: '3px solid #cbd5e0'
  },

  userInfo: {
    textAlign: 'center'
  },

  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px',
    fontFamily: 'Arial, sans-serif'
  },

  userRole: {
    fontSize: '14px',
    color: '#718096',
    fontFamily: 'Arial, sans-serif',
    fontWeight: '500'
  },

  separator: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '0 20px'
  },

  navigation: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto'
  },

  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'left'
  },

  menuItemActive: {
    backgroundColor: '#edf2f7',
    borderLeftColor: '#131F2B'
  },

  // Estilo especial para elementos de admin
  adminMenuItem: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d8fd'
  },

  menuItemIcon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px'
  },

  menuItemText: {
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: 'Arial, sans-serif',
    whiteSpace: 'nowrap'
  },

  // Badge de admin
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#f0e6ff',
    borderTop: '1px solid #e9d8fd',
    borderBottom: '1px solid #e9d8fd',
    gap: '8px'
  },

  adminBadgeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#805ad5',
    fontFamily: 'Arial, sans-serif'
  },

  logoutSection: {
    padding: '20px 0',
    borderTop: '1px solid #e2e8f0'
  },

  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'left'
  },

  logoutText: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#e53e3e',
    fontFamily: 'Arial, sans-serif'
  }
};

export default Sidebar;















// import React from 'react';
// import './sidebar.css';
// import { 
//   User, 
//   LayoutDashboard, 
//   Package, 
//   Wrench, 
//   Users, 
//   UserCog, 
//   FolderOpen, 
//   FileText, 
//   LogOut 
// } from 'lucide-react';

// const Sidebar = ({ 
//   activeSection, 
//   onSectionChange, 
//   userName = "Administrador", 
//   userRole = "Administrador", 
//   isAdmin = true,
//   onLogout 
// }) => {
//   const handleLogout = () => {
//     console.log(`👋 ${userName} está cerrando sesión desde el sidebar`);
//     if (onLogout) onLogout();
//   };

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#667eea' },
//     { id: 'materiales', label: 'Inventario de Materiales', icon: Package, color: '#48bb78' },
//     { id: 'herramientas', label: 'Inventario de Herramientas', icon: Wrench, color: '#ed8936' },
//     { id: 'clientes', label: 'Clientes', icon: Users, color: '#38b2ac' },
//     { id: 'empleados', label: 'Empleados', icon: UserCog, color: '#9f7aea' },
//     { id: 'proyectos', label: 'Proyectos', icon: FolderOpen, color: '#4299e1' },
//     { id: 'bitacora', label: 'Bitácora', icon: FileText, color: '#f56565' },
//   ];

//   return (
//     <div className="sidebar">
//       <div className="user-section">
//         <div className="user-avatar"><User size={32} color="#666" /></div>
//         <div className="user-info">
//           <div className="user-name">{userName}</div>
//           <div className="user-role">{userRole}{isAdmin && ' 👑'}</div>
//         </div>
//       </div>

//       <div className="separator"></div>

//       <nav className="navigation">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = activeSection === item.id;

//           return (
//             <button
//               key={item.id}
//               className={`menu-item ${isActive ? 'active' : ''}`}
//               onClick={() => onSectionChange && onSectionChange(item.id)}
//               onMouseEnter={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.backgroundColor = '#f7fafc';
//                   e.currentTarget.style.borderLeftColor = item.color;
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.backgroundColor = 'transparent';
//                   e.currentTarget.style.borderLeftColor = 'transparent';
//                 }
//               }}
//             >
//               <div className="menu-icon">
//                 <Icon size={20} color={isActive ? '#131F2B' : '#6c757d'} />
//               </div>
//               <span className="menu-text" style={{ color: isActive ? '#131F2B' : '#4a5568' }}>
//                 {item.label}
//               </span>
//             </button>
//           );
//         })}
//       </nav>

//       <div className="logout-section">
//         <button
//           className="logout-button"
//           onClick={handleLogout}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.backgroundColor = '#fed7d7';
//             e.currentTarget.style.borderLeftColor = '#e53e3e';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.backgroundColor = 'transparent';
//             e.currentTarget.style.borderLeftColor = 'transparent';
//           }}
//         >
//           <div className="menu-icon"><LogOut size={20} color="#e53e3e" /></div>
//           <span className="logout-text">Cerrar Sesión</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
