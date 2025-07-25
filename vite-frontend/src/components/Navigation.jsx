import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>MonApp</h2>
      <ul style={styles.navList}>
        <li>
          <Link to="/" style={styles.link}>Accueil</Link>
        </li>
        <li>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        </li>
        <li>
          <span style={styles.userInfo}>
            {user ? `Bonjour, ${user.name}` : 'Non connecté'}
          </span>
        </li>
        {user && (
          <li>
            <button onClick={logout} style={styles.logoutButton}>
              Déconnexion
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#282c34',
    color: '#fff',
  },
  logo: {
    margin: 0,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  },
  userInfo: {
    fontStyle: 'italic',
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '4px',
  }
};

export default Navigation;
