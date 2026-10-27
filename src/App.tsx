import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BrandStatement } from './components/BrandStatement';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { Footer } from './components/Footer';
import { AdminModal } from './components/admin/AdminModal';
import { Product, WHATSAPP_CONTACTS, INSTAGRAM_URL, INSTAGRAM_HANDLE } from './types';
import { fetchProducts, checkAuthStatus } from './services/api';
import { Search, Sparkles, Filter, SlidersHorizontal, Instagram, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Filtros del catálogo
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hideSoldOut, setHideSoldOut] = useState<boolean>(false);

  // Cargar catálogo de productos
  const loadCatalog = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchProducts(true);
      setProducts(data);
    } catch (err: any) {
      console.error('Error al cargar catálogo:', err);
      setFetchError(err.message || 'No se pudo conectar con el catálogo de prendas.');
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial y verificación de estado de autenticación
  useEffect(() => {
    loadCatalog();
    checkAuthStatus()
      .then((status) => setIsAdminAuthenticated(status.authenticated))
      .catch(() => {});
  }, []);

  // Extraer categorías dinámicamente de los productos publicados
  const availableCategories = useMemo(() => {
    const published = products.filter((p) => p.status === 'published');
    const setCats = new Set<string>();
    published.forEach((p) => {
      if (p.category) setCats.add(p.category);
    });
    return ['Todas', ...Array.from(setCats)];
  }, [products]);

  // Prendas públicas filtradas para la cuadrícula principal
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Solo prendas publicadas en la tienda pública
      if (p.status !== 'published') return false;

      // Filtro de agotados
      if (hideSoldOut && p.availability !== 'available') return false;

      // Filtro por categoría
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) return false;

      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = p.name.toLowerCase().includes(query);
        const inDesc = p.description.toLowerCase().includes(query);
        const inCat = p.category.toLowerCase().includes(query);
        return inName || inDesc || inCat;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, hideSoldOut]);

  // Sección "Nuevas Prendas" (Automática: prendas publicadas marcadas como novedad o recientes)
  const newArrivals = useMemo(() => {
    return products
      .filter((p) => p.status === 'published' && p.isNew)
      .slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1A19]">
      {/* Encabezado Principal */}
      <Header
        onOpenAdmin={() => setAdminModalOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        totalProductsCount={products.filter((p) => p.status === 'published').length}
      />

      {/* Portada Hero Editorial */}
      <Hero />

      {/* Sección 1: Nuevas Prendas (Novedades) */}
      {newArrivals.length > 0 && (
        <section id="novedades" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C8276] font-medium block mb-2">
              Recién Incorporadas
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1C1A19] font-light">
              Nuevas Prendas
            </h2>
            <div className="w-12 h-px bg-[#1C1A19]/25 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Declaración de Identidad DIMARA */}
      <BrandStatement />

      {/* Sección 2: Catálogo Completo */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C8276] font-medium block mb-2">
            Colección Femenina
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1C1A19] font-light">
            Catálogo de Prendas
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8276] max-w-md mx-auto mt-3 font-light leading-relaxed">
            Explora cada fotografía, conoce los detalles de confección y consulta la disponibilidad directa con nosotras.
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mb-10 bg-white p-4 sm:p-6 border border-[#E6DFD5] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Categorías deslizables */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {availableCategories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#1C1A19] text-white font-medium shadow-xs'
                        : 'bg-[#FAF8F5] text-[#1C1A19] hover:bg-[#F4EFEA] border border-[#E6DFD5]/60'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Input de Búsqueda */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prenda o detalle..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E6DFD5] bg-[#FAF8F5]/50 focus:outline-none focus:border-[#1C1A19]"
              />
              <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#8C8276] hover:text-[#1C1A19]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sub-barra de conteo y opciones */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#E6DFD5]/50 text-xs text-[#8C8276]">
            <span>
              Mostrando <strong className="text-[#1C1A19] font-medium">{filteredProducts.length}</strong> prenda(s)
            </span>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#1C1A19] select-none">
              <input
                type="checkbox"
                checked={hideSoldOut}
                onChange={(e) => setHideSoldOut(e.target.checked)}
                className="rounded border-[#E6DFD5] text-[#1C1A19] focus:ring-[#1C1A19]"
              />
              <span>Ocultar prendas agotadas</span>
            </label>
          </div>
        </div>

        {/* Estado de Carga o Error */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#1C1A19] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C8276]">Cargando prendas DIMARA...</p>
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center bg-white border border-[#E6DFD5] p-8 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-[#1C1A19] mb-2">No se pudo cargar el catálogo</h3>
            <p className="text-xs text-[#8C8276] mb-6 leading-relaxed">{fetchError}</p>
            <button
              onClick={loadCatalog}
              className="px-6 py-2.5 bg-[#1C1A19] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0E0D0C] inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Intentar nuevamente</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Estado Vacío cuando no coinciden filtros */
          <div className="py-20 text-center bg-white border border-[#E6DFD5] p-8 max-w-lg mx-auto">
            <p className="font-serif text-2xl text-[#1C1A19] mb-2 font-light">No encontramos prendas</p>
            <p className="text-xs text-[#8C8276] mb-6 leading-relaxed">
              No hay prendas que coincidan con los filtros seleccionados. Puedes cambiar la categoría o limpiar el término de búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todas');
                setSearchQuery('');
                setHideSoldOut(false);
              }}
              className="px-6 py-2.5 border border-[#1C1A19] text-[#1C1A19] text-xs uppercase tracking-[0.2em] hover:bg-[#1C1A19] hover:text-white transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          /* Cuadrícula de Fotografías y Tarjetas */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner de Contacto y Redes Oficiales */}
      <section className="bg-[#F4EFEA]/60 py-14 border-t border-[#E6DFD5]/70">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C8276] font-medium block">
            Canales Directos
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1A19] font-light">
            ¿Tienes dudas sobre una prenda o tu talla?
          </h3>
          <p className="text-xs sm:text-sm text-[#8C8276] max-w-md mx-auto leading-relaxed">
            Escríbenos a cualquiera de nuestras dos líneas de WhatsApp. Te responderemos personalmente para brindarte medidas y ayudarte con tu pedido.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-3">
            <a
              href={`https://wa.me/${WHATSAPP_CONTACTS[0].cleanIntl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1A19] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0E0D0C] shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Línea WhatsApp: {WHATSAPP_CONTACTS[0].formatted}</span>
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#1C1A19] text-[#1C1A19] text-xs uppercase tracking-[0.2em] font-medium hover:bg-white transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Síguenos en Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* Pie de Página */}
      <Footer onOpenAdmin={() => setAdminModalOpen(true)} />

      {/* Botón Flotante Discreto de WhatsApp */}
      <WhatsAppFloating />

      {/* Modal Ficha Detalle Producto */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Modal de Administración (/admin) */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        products={products}
        onRefreshProducts={loadCatalog}
        onAuthChange={(auth) => setIsAdminAuthenticated(auth)}
      />
    </div>
  );
}
