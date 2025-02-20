import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RolePanelStyles.css'; // Importa el archivo de estilos CSS

const RolePanel = () => {
    const { role } = useParams();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="role-panel-container"> 
            <div className="role-panel-box"> 
                <h2>Panel de {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
                <p>Bienvenido, {role}. Tienes acceso limitado a ciertas funciones.</p>
                <div className="role-panel-buttons"> 
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                </div>
            </div>
        </div>
    );
};

export default RolePanel;