const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const connection = require('../db');

const RECAPTCHA_SECRET_KEY = '6LeKnNwqAAAAABQIgzfvCZI37Ikyxvdi5dMgQqnz';
const loginAttempts = {}; // Almacena los intentos de inicio de sesión

// Registrar un nuevo usuario
exports.registerUser = (req, res) => {
    const { nombre, telefono, email, password, id_rol } = req.body;

    // Verificar si el rol existe
    connection.query('SELECT * FROM tb_roles WHERE id_rol = ?', [id_rol], (err, roleResults) => {
        if (err) {
            console.error('Error al verificar el rol:', err);
            return res.status(500).json({ message: 'Error al verificar el rol' });
        }

        if (roleResults.length === 0) {
            return res.status(400).json({ message: 'El rol especificado no existe.' });
        }

        // Verificar si el usuario ya existe
        connection.query('SELECT * FROM tb_usuarios WHERE email = ? OR telefono = ?', [email, telefono], (err, results) => {
            if (err) {
                console.error('Error al verificar el usuario:', err);
                return res.status(500).json({ message: 'Error al verificar el usuario' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            // Hashear la contraseña
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Insertar el nuevo usuario
            connection.query('INSERT INTO tb_usuarios (nombre, telefono, email, password, id_rol) VALUES (?, ?, ?, ?, ?)',
                [nombre, telefono, email, hashedPassword, id_rol],
                (err, results) => {
                    if (err) {
                        console.error('Error al registrar el usuario:', err);
                        return res.status(500).json({ message: 'Error al registrar el usuario' });
                    }
                    res.status(201).json({ message: 'Usuario registrado con éxito' });
                }
            );
        });
    });
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
    const { email, password, captchaResponse } = req.body;

    // Verificar si el usuario está bloqueado
    if (loginAttempts[email] && loginAttempts[email].attempts >= 4) {
        const timeBlocked = Date.now() - loginAttempts[email].lastAttempt;
        if (timeBlocked < 3 * 60 * 1000) { // 3 minutos
            return res.status(403).json({ message: 'Demasiados intentos fallidos. Intenta de nuevo más tarde.' });
        } else {
            // Reiniciar intentos después de 3 minutos
            loginAttempts[email] = { attempts: 0, lastAttempt: null };
        }
    }

    // Verificar el CAPTCHA si hay más de 3 intentos fallidos
    if (loginAttempts[email] && loginAttempts[email].attempts >= 3) {
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaResponse}`;
        const response = await axios.post(verificationUrl);
        const { success } = response.data;

        if (!success) {
            return res.status(400).json({ message: 'Verificación de reCAPTCHA fallida.' });
        }
    }

    connection.query('SELECT * FROM tb_usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).json({ message: 'Error al buscar el usuario' });
        }

        if (results.length === 0) {
            // Incrementar intentos fallidos
            if (!loginAttempts[email]) {
                loginAttempts[email] = { attempts: 0, lastAttempt: Date.now() };
            }
            loginAttempts[email].attempts++;
            loginAttempts[email].lastAttempt = Date.now();
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            // Incluir el nombre del usuario en el token
            const token = jwt.sign({ id: user.id_usuario, role: user.id_rol, nombre: user.nombre }, 'tu_secreto', { expiresIn: '1h' });
            res.json({ token, role: user.id_rol });
        } else {
            // Incrementar intentos fallidos
            if (!loginAttempts[email]) {
                loginAttempts[email] = { attempts: 0, lastAttempt: Date.now() };
            }
            loginAttempts[email].attempts++;
            loginAttempts[email].lastAttempt = Date.now();
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    });
};

// Obtener todos los usuarios
exports.getAllUsers = (req, res) => {
    connection.query('SELECT * FROM tb_usuarios', (err, results) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            return res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
        res.json(results); // Enviar la lista de usuarios en formato JSON
    });
};

// Obtener usuarios por rol
exports.getUsersByRole = (req, res) => {
    const { rol } = req.params;
    connection.query('SELECT * FROM tb_usuarios WHERE id_rol = ?', [rol], (err, results) => {
        if (err) {
            console.error('Error al obtener los usuarios por rol:', err);
            return res.status(500).json({ message: 'Error al obtener los usuarios por rol' });
        }
        res.json(results);
    });
};

// Obtener un usuario por ID
exports.getUserById = (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM tb_usuarios WHERE id_usuario = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario por ID:', err);
            return res.status(500).json({ message: 'Error al obtener el usuario por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
};
