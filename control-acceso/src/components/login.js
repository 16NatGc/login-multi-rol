import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import './LoginStyles.css'; 
import logoint2 from '../img/logoint2.png'; 


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [captchaResponse, setCaptchaResponse] = useState('');
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const handleLogin = async (e) => {
        e.preventDefault();

        // Verifica si se deben completar el reCAPTCHA
        if (failedAttempts >= 3 && !captchaResponse) {
            alert('Por favor completa el reCAPTCHA.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, password, captchaResponse });
            const { token, role } = response.data;
            localStorage.setItem('token', token);

            // Redirige según el rol del usuario
            if (role === '1') {
                navigate('/admin');
            } else {
                navigate(`/role-panel/${role}`);
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Error en el inicio de sesión. Verifica tus credenciales.');
            setFailedAttempts(prev => prev + 1);
            if (failedAttempts >= 3 && recaptchaRef.current) {
                recaptchaRef.current.reset(); // Reinicia el reCAPTCHA si es necesario
            }
        }
    };

    const handleRecaptchaChange = (value) => {
        setCaptchaResponse(value);
    };

    return (
        <div className="login-container"> 
            <div className="login-box"> 
                <img src={logoint2} alt="Logo" className="login-logo" /> 
                <h2>Iniciar Sesión</h2> 
                <form onSubmit={handleLogin}>
                    <div className="input-group"> 
                        <label htmlFor="email">Correo Electrónico:</label> 
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> {/* Input Email */}
                    </div>
                    <div className="input-group"> 
                        <label htmlFor="password">Contraseña:</label> 
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> {/* Input Contraseña */}
                    </div>

                    {failedAttempts >= 3 && (
                        <div className="recaptcha-container"> {/* Contenedor reCAPTCHA */}
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LeKnNwqAAAAAJFOjvm6lZIsTZgeQvOUguuJWTSa"
                                onChange={handleRecaptchaChange}
                            />
                        </div>
                    )}

                    <button type="submit" className="login-button">Acceder</button> 

                    {failedAttempts >= 3 && !captchaResponse && (
                        <p className="recaptcha-error">Por favor completa el reCAPTCHA antes de continuar.</p>
                    )}
                </form>

                <div className="signup-link"> 
                    <p>¿No tienes una cuenta? <button onClick={() => navigate('/register')}>Registrar</button></p>
                </div>
            </div>
        </div>
    );
};

export default Login;