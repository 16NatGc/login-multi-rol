import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanelStyles.css'; // Importa el archivo de estilos CSS

const AdminPanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="admin-panel-container">
            <div className="admin-panel-box"> 
                <h1>Bienvenido al Panel de Administración</h1>
                <div className="admin-panel-buttons"> 
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;