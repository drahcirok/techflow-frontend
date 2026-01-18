import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

// Factory Visual: Campos dinámicos según tipo
const ORDER_TYPES = {
  MANTENIMIENTO: {
    label: 'Mantenimiento',
    color: 'blue',
    description: 'Revisión y mantenimiento preventivo',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    fields: [
      { name: 'ultimoMantenimiento', label: 'Fecha último mantenimiento', type: 'date' },
      { name: 'kmActual', label: 'Kilometraje / Horas de uso', type: 'number' },
    ]
  },
  REPARACION: {
    label: 'Reparación',
    color: 'orange',
    description: 'Diagnóstico y reparación de fallas',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
    fields: [
      { name: 'descripcionFalla', label: 'Descripción de la falla', type: 'textarea' },
      { name: 'urgencia', label: 'Nivel de urgencia', type: 'select', options: ['Baja', 'Media', 'Alta'] },
    ]
  },
  ENSAMBLE: {
    label: 'Ensamble',
    color: 'purple',
    description: 'Ensamble de equipos nuevos',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    fields: [
      { name: 'componentesPrincipales', label: 'Componentes principales', type: 'textarea' },
      { name: 'tiempoEstimado', label: 'Tiempo estimado (horas)', type: 'number' },
    ]
  },
};

const colorClasses = {
  blue: {
    selected: 'border-blue-500 bg-blue-500/10 text-blue-400',
    icon: 'text-blue-400',
  },
  orange: {
    selected: 'border-orange-500 bg-orange-500/10 text-orange-400',
    icon: 'text-orange-400',
  },
  purple: {
    selected: 'border-purple-500 bg-purple-500/10 text-purple-400',
    icon: 'text-purple-400',
  },
};

const NewOrder = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    equipoDescripcion: '',
    equipoMarca: '',
    equipoModelo: '',
    equipoSerial: '',
  });
  const [dynamicData, setDynamicData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicChange = (e) => {
    const { name, value } = e.target;
    setDynamicData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Selecciona un tipo de servicio');
      return;
    }
    
    if (!formData.clienteNombre || !formData.clienteTelefono || !formData.equipoDescripcion) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        ...formData,
        type: selectedType,
        details: dynamicData,
      };
      
      // Descomentar cuando el backend esté listo
      // await orderService.create(orderData);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Orden creada exitosamente');
      navigate('/tecnico/dashboard');
    } catch (error) {
      // Error manejado por interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Nueva Orden de Servicio</h1>
        <p className="text-slate-400">Completa el formulario para crear una nueva orden</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Paso 1: Tipo de servicio (Factory Visual) */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">1</span>
            Tipo de Servicio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(ORDER_TYPES).map(([key, type]) => {
              const isSelected = selectedType === key;
              const colors = colorClasses[type.color];
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedType(key);
                    setDynamicData({});
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left
                    ${isSelected 
                      ? colors.selected 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  <div className={isSelected ? colors.icon : 'text-slate-400'}>
                    {type.icon}
                  </div>
                  <h3 className={`font-semibold mt-3 mb-1 ${isSelected ? '' : 'text-white'}`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Paso 2: Datos del cliente */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">2</span>
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Nombre completo *</label>
              <input
                type="text"
                name="clienteNombre"
                value={formData.clienteNombre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                type="email"
                name="clienteEmail"
                value={formData.clienteEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Teléfono *</label>
              <input
                type="tel"
                name="clienteTelefono"
                value={formData.clienteTelefono}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="0999123456"
                required
              />
            </div>
          </div>
        </section>

        {/* Paso 3: Datos del equipo */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">3</span>
            Datos del Equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-2">Descripción del equipo *</label>
              <input
                type="text"
                name="equipoDescripcion"
                value={formData.equipoDescripcion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Ej: Laptop, PC de escritorio, Impresora..."
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Marca</label>
              <input
                type="text"
                name="equipoMarca"
                value={formData.equipoMarca}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="HP, Dell, Lenovo..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Modelo</label>
              <input
                type="text"
                name="equipoModelo"
                value={formData.equipoModelo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Pavilion 15, XPS 13..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Número de serie</label>
              <input
                type="text"
                name="equipoSerial"
                value={formData.equipoSerial}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="SN123456789"
              />
            </div>
          </div>
        </section>

        {/* Paso 4: Campos dinámicos según tipo */}
        {selectedType && (
          <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">4</span>
              Detalles de {ORDER_TYPES[selectedType].label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORDER_TYPES[selectedType].fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm text-slate-300 mb-2">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={dynamicData[field.name] || ''}
                      onChange={handleDynamicChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all min-h-[100px]"
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={dynamicData[field.name] || ''}
                      onChange={handleDynamicChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    >
                      <option value="">Seleccionar...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={dynamicData[field.name] || ''}
                      onChange={handleDynamicChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedType}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Orden'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;
