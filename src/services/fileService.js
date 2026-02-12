import api from './api';

export const fileService = {
  // Subir imagen
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Eliminar imagen
  deleteImage: async (filename) => {
    return api.delete('/files/delete', {
      params: { filename }
    });
  },

  // Obtener URL completa de la imagen
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return null;
    // Si ya es una URL completa, retornarla tal cual
    if (imageUrl.startsWith('http')) return imageUrl;
    // Obtener la URL base del backend SIN el /api
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return baseUrl + imageUrl;
  }
};
