import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { fileService } from '../../services/fileService';
import toast from 'react-hot-toast';

const Tienda = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAvailableProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.sku === product.sku);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock disponible');
        return;
      }
      const newCart = cart.map(item =>
        item.sku === product.sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newCart);
      toast.success('Cantidad actualizada en el carrito');
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      saveCart(newCart);
      toast.success('Producto agregado al carrito');
    }
  };

  const updateQuantity = (sku, newQuantity) => {
    const product = products.find(p => p.sku === sku);
    if (newQuantity > product.stock) {
      toast.error('No hay suficiente stock');
      return;
    }
    if (newQuantity === 0) {
      removeFromCart(sku);
      return;
    }
    const newCart = cart.map(item =>
      item.sku === sku ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (sku) => {
    const newCart = cart.filter(item => item.sku !== sku);
    saveCart(newCart);
    toast.success('Producto eliminado del carrito');
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tienda de Repuestos</h1>
        <p className="text-slate-500">Encuentra los mejores componentes para tu equipo</p>
      </div>

      {/* Search and Cart */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={() => navigate('/cliente/carrito')}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Carrito
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category === 'all' ? 'Todos' : category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No se encontraron productos</h3>
          <p className="text-slate-500">Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inCart = cart.find(item => item.sku === product.sku);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    <img
                      src={fileService.getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('svg').style.display = 'block';
                      }}
                    />
                  ) : null}
                  <svg
                    className="w-20 h-20 text-slate-300 absolute"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ display: product.imageUrl ? 'none' : 'block' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {product.category && (
                    <span className="inline-block px-2 py-1 bg-sky-100 text-sky-600 text-xs font-medium rounded-lg mb-2">
                      {product.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-sky-600">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-slate-500">Stock: {product.stock}</span>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.sku, inCart.quantity - 1)}
                        className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="flex-1 text-center font-semibold text-slate-800">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.sku, inCart.quantity + 1)}
                        className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                        disabled={inCart.quantity >= product.stock}
                      >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFromCart(product.sku)}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agregar al Carrito
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Summary (Mobile) */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800">{getTotalItems()} productos</span>
            <span className="text-xl font-bold text-sky-600">${getTotalPrice().toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/cliente/carrito')}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
          >
            Ver Carrito y Pagar
          </button>
        </div>
      )}
    </div>
  );
};

export default Tienda;
