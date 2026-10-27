import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Search,
  Filter,
  Check,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Product } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { FirebaseGuideModal } from './FirebaseGuideModal';
import { createProduct, updateProduct, deleteProduct, purgeDemoProducts } from '../../services/api';

interface AdminDashboardProps {
  products: Product[];
  adminEmail?: string;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  adminEmail,
  onRefresh,
  onLogout,
  onClose
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Product | null>(null);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Métricas
  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const soldOutCount = products.filter((p) => p.availability === 'sold_out').length;
  const hasDemoProducts = products.some((p) => p.isDemo);

  const categories = ['Todas', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filtrado en tabla
  const visibleProducts = products.filter((p) => {
    if (filterStatus === 'published' && p.status !== 'published') return false;
    if (filterStatus === 'draft' && p.status !== 'draft') return false;
    if (filterCategory !== 'Todas' && p.category !== filterCategory) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveProduct = async (payload: Partial<Product>) => {
    if (productEditing) {
      await updateProduct(productEditing.id, payload);
      showNotification(`Prenda "${payload.name}" actualizada con éxito.`);
    } else {
      await createProduct(payload);
      showNotification(`Prenda "${payload.name}" publicada con éxito.`);
    }
    await onRefresh();
    setProductEditing(null);
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    await updateProduct(product.id, { status: nextStatus });
    await onRefresh();
    showNotification(
      nextStatus === 'published'
        ? `Prenda "${product.name}" visible en el catálogo público.`
        : `Prenda "${product.name}" guardada como borrador (oculta al público).`
    );
  };

  const handleToggleAvailability = async (product: Product) => {
    const nextAvailability = product.availability === 'available' ? 'sold_out' : 'available';
    await updateProduct(product.id, { availability: nextAvailability });
    await onRefresh();
    showNotification(
      nextAvailability === 'available'
        ? `"${product.name}" marcada como Disponible.`
        : `"${product.name}" marcada como Agotada.`
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteProduct(deleteConfirmTarget.id);
      await onRefresh();
      showNotification(`Prenda "${deleteConfirmTarget.name}" eliminada.`);
      setDeleteConfirmTarget(null);
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar', 'error');
    }
  };

  const handlePurgeDemos = async () => {
    try {
      const res = await purgeDemoProducts();
      await onRefresh();
      setPurgeConfirmOpen(false);
      showNotification(`Se eliminaron ${res.removedCount} prendas demostrativas. Catálogo 100% limpio.`);
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar prendas demo', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] overflow-y-auto text-[#1C1A19]">
      {/* Barra de cabecera del Administrador */}
      <header className="sticky top-0 z-20 bg-[#1C1A19] text-[#FAF8F5] px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-serif text-2xl tracking-[0.25em] font-light text-white">DIMARA</span>
          <span className="text-[10px] uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded text-[#E6DFD5]">
            Panel de Administración
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {adminEmail && (
            <span className="hidden md:inline text-xs text-[#8C8276]">
              Sesión activa: <strong className="text-white font-normal">{adminEmail}</strong>
            </span>
          )}

          <button
            onClick={() => setShowGuide(true)}
            className="text-xs text-[#E6DFD5] hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-white/10 transition-colors"
            title="Guía de Almacenamiento y Conexión Firebase"
          >
            <HelpCircle className="w-4 h-4 text-[#C5A880]" />
            <span className="hidden sm:inline">Persistencia & Firebase</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.2em] px-3.5 py-1.5 border border-white/25 text-[#FAF8F5] hover:bg-white hover:text-[#1C1A19] transition-all"
          >
            Ver Tienda
          </button>

          <button
            onClick={onLogout}
            title="Cerrar Sesión de Administración"
            className="p-1.5 text-[#8C8276] hover:text-white rounded hover:bg-white/10 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notificación flotante */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div
            className={`p-3.5 border text-xs flex items-center gap-2.5 shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Métricas y Acciones Principales */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 border border-[#E6DFD5] shadow-xs">
          {/* Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="bg-[#FAF8F5] p-4 border border-[#E6DFD5]/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] block mb-1">Prendas Totales</span>
              <span className="font-serif text-3xl text-[#1C1A19] font-light">{totalCount}</span>
            </div>
            <div className="bg-[#FAF8F5] p-4 border border-[#E6DFD5]/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] block mb-1">Publicadas</span>
              <span className="font-serif text-3xl text-emerald-700 font-light">{publishedCount}</span>
            </div>
            <div className="bg-[#FAF8F5] p-4 border border-[#E6DFD5]/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] block mb-1">Borradores</span>
              <span className="font-serif text-3xl text-[#8C8276] font-light">{draftCount}</span>
            </div>
            <div className="bg-[#FAF8F5] p-4 border border-[#E6DFD5]/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] block mb-1">Agotadas</span>
              <span className="font-serif text-3xl text-amber-700 font-light">{soldOutCount}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap items-center gap-3">
            {hasDemoProducts && (
              <button
                onClick={() => setPurgeConfirmOpen(true)}
                className="px-4 py-3 text-xs uppercase tracking-[0.2em] border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                title="Elimina todas las prendas de prueba para dejar el catálogo limpio"
              >
                Eliminar Prendas Demo
              </button>
            )}

            <button
              onClick={() => {
                setProductEditing(null);
                setFormOpen(true);
              }}
              className="px-6 py-3.5 bg-[#1C1A19] text-white hover:bg-[#0E0D0C] text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2.5 shadow-md transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar nueva prenda</span>
            </button>
          </div>
        </div>

        {/* Listado / Tabla de Gestión */}
        <div className="bg-white border border-[#E6DFD5] shadow-xs">
          
          {/* Barra de Filtros Internos */}
          <div className="p-4 sm:p-5 border-b border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF8F5]/50">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Filtro estado */}
              <div className="inline-flex border border-[#E6DFD5] bg-white text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 transition-colors ${filterStatus === 'all' ? 'bg-[#1C1A19] text-white' : 'text-[#8C8276]'}`}
                >
                  Todas ({totalCount})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-3 py-1.5 transition-colors ${filterStatus === 'published' ? 'bg-[#1C1A19] text-white' : 'text-[#8C8276]'}`}
                >
                  Publicadas ({publishedCount})
                </button>
                <button
                  onClick={() => setFilterStatus('draft')}
                  className={`px-3 py-1.5 transition-colors ${filterStatus === 'draft' ? 'bg-[#1C1A19] text-white' : 'text-[#8C8276]'}`}
                >
                  Borradores ({draftCount})
                </button>
              </div>

              {/* Filtro categoría */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-[#E6DFD5] bg-white text-xs text-[#1C1A19] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda rápida */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Buscar prenda..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E6DFD5] bg-white focus:outline-none focus:border-[#1C1A19]"
              />
              <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Tabla de Prendas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1C1A19]">
              <thead className="bg-[#FAF8F5] text-[#8C8276] uppercase tracking-[0.2em] text-[10px] border-b border-[#E6DFD5]">
                <tr>
                  <th className="py-3 px-4">Fotografía & Prenda</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio COP</th>
                  <th className="py-3 px-4">Tallas</th>
                  <th className="py-3 px-4">Disponibilidad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD5]/60">
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8C8276]">
                      No se encontraron prendas con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map((p) => {
                    const isAvailable = p.availability === 'available';
                    const isPublished = p.status === 'published';
                    const displayPrice = p.priceCOP
                      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.priceCOP)
                      : 'Consultar precio';

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        {/* Foto y Nombre */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-[#E6DFD5]/30 flex-shrink-0 border border-[#E6DFD5] overflow-hidden">
                              <img
                                src={p.images[0] || 'https://via.placeholder.com/80x100?text=DIMARA'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-[#1C1A19] flex items-center gap-2">
                                <span>{p.name}</span>
                                {p.isDemo && (
                                  <span className="text-[9px] bg-[#E6DFD5]/80 text-[#8C8276] px-1.5 py-0.2 rounded">
                                    Demo
                                  </span>
                                )}
                                {p.isNew && (
                                  <span className="text-[9px] bg-[#1C1A19] text-white px-1.5 py-0.2">
                                    Novedad
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8C8276]">
                                {p.images.length} fotografía(s)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="py-3 px-4 text-[#8C8276]">{p.category}</td>

                        {/* Precio */}
                        <td className="py-3 px-4 font-medium text-[#1C1A19]">{displayPrice}</td>

                        {/* Tallas */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {p.sizes.map((s) => (
                              <span key={s} className="bg-[#FAF8F5] border border-[#E6DFD5] text-[9px] px-1.5 py-0.5 text-[#1C1A19]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Disponibilidad */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p)}
                            title="Cambiar disponibilidad"
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border transition-colors ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {isAvailable ? 'Disponible' : 'Agotado'}
                          </button>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            title="Cambiar estado publicado / borrador"
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border transition-colors ${
                              isPublished
                                ? 'bg-[#1C1A19] text-white border-[#1C1A19]'
                                : 'bg-white text-[#8C8276] border-[#E6DFD5] hover:border-[#1C1A19]'
                            }`}
                          >
                            {isPublished ? 'Publicado' : 'Borrador'}
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              title={isPublished ? 'Ocultar prenda (pasar a borrador)' : 'Publicar prenda'}
                              className="p-1.5 text-[#8C8276] hover:text-[#1C1A19] hover:bg-[#FAF8F5] rounded transition-colors"
                            >
                              {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setProductEditing(p);
                                setFormOpen(true);
                              }}
                              title="Editar prenda"
                              className="p-1.5 text-[#8C8276] hover:text-[#1C1A19] hover:bg-[#FAF8F5] rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmTarget(p)}
                              title="Eliminar prenda"
                              className="p-1.5 text-[#8C8276] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Formulario (Crear / Editar) */}
      {formOpen && (
        <ProductFormModal
          productToEdit={productEditing}
          onSave={handleSaveProduct}
          onClose={() => {
            setFormOpen(false);
            setProductEditing(null);
          }}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full border border-[#E6DFD5] shadow-2xl animate-fadeIn">
            <h3 className="font-serif text-lg text-[#1C1A19] font-normal mb-2">
              ¿Eliminar "{deleteConfirmTarget.name}"?
            </h3>
            <p className="text-xs text-[#8C8276] leading-relaxed mb-6">
              Esta prenda se removerá del catálogo y de la base de datos de manera definitiva.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs uppercase tracking-[0.2em] border border-[#E6DFD5] text-[#1C1A19]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs uppercase tracking-[0.2em] bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación Purga de Demos */}
      {purgeConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full border border-[#E6DFD5] shadow-2xl animate-fadeIn">
            <h3 className="font-serif text-lg text-[#1C1A19] font-normal mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>¿Eliminar todas las prendas de demostración?</span>
            </h3>
            <p className="text-xs text-[#8C8276] leading-relaxed mb-6">
              Se eliminarán todas las prendas que tengan la marca de "Demo" para que puedas comenzar tu catálogo oficial desde cero. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPurgeConfirmOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-[0.2em] border border-[#E6DFD5] text-[#1C1A19]"
              >
                Cancelar
              </button>
              <button
                onClick={handlePurgeDemos}
                className="px-4 py-2 text-xs uppercase tracking-[0.2em] bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Eliminar Prendas Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guía Firebase */}
      {showGuide && <FirebaseGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};
