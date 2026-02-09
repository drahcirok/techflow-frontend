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
    // Si es una ruta relativa, agregar la URL del backend
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const fullUrl = baseUrl + imageUrl;
    console.log('🖼️ Construyendo URL de imagen:', { imageUrl, baseUrl, fullUrl });
    return fullUrl;
  }
};
