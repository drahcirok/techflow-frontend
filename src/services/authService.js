import api from '../api/axiosConfig'; // Asegúrate que la ruta al axiosConfig sea correcta

export const loginService = async (email, password) => {
    // Axios devuelve todo el objeto HTTP, nosotros solo queremos el JSON del body (.data)
    const response = await api.post('/auth/login', { email, password });
    return response.data; 
};

export const registerService = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};