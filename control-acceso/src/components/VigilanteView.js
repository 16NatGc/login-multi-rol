import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VigilanteViewStyles.css';

const VigilanteView = () => {
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/api/vigilante-data', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data);

                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setUserName(decodedToken.nombre);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleViewDetails = (id) => {
        alert(`Ver detalles del vigilante con ID: ${id}`);
    };

    return (
        <div className="vigilante-view-container">
            <div className="header">
                <h2>Vista de Datos de Vigilante</h2>
                <div className="user-info">
                    <span>Bienvenido, {userName}</span>
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Turno</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.nombre}</td>
                            <td>{item.turno}</td>
                            <td>
                                <button onClick={() => handleViewDetails(item.id)}>Ver Detalles</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VigilanteView;