import React, { useState } from 'react';
import { X, Upload, Trash2, Star, Loader2, AlertCircle, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Product, ProductStatus, AvailabilityStatus } from '../../types';
import { uploadImageToServer } from '../../services/api';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  onSave: (product: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = [
  'Vestidos',
  'Blusas y Tops',
  'Pantalones',
  'Conjuntos',
  'Enterizos',
  'Faldas',
  'Chaquetas y Abrigos'
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Talla única'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [hasPrice, setHasPrice] = useState(
    productToEdit ? productToEdit.priceCOP !== null && productToEdit.priceCOP !== undefined : true
  );
  const [priceCOP, setPriceCOP] = useState<string>(
    productToEdit?.priceCOP ? productToEdit.priceCOP.toString() : ''
  );
  const [category, setCategory] = useState(productToEdit?.category || DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(
    productToEdit ? !DEFAULT_CATEGORIES.includes(productToEdit.category) : false
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    productToEdit?.sizes || ['S', 'M', 'L']
  );
  const [customSizeInput, setCustomSizeInput] = useState('');

  const [status, setStatus] = useState<ProductStatus>(productToEdit?.status || 'published');
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    productToEdit?.availability || 'available'
  );
  const [isNew, setIsNew] = useState(productToEdit?.isNew ?? true);
  const [featured, setFeatured] = useState(productToEdit?.featured ?? false);
  const [images, setImages] = useState<string[]>(productToEdit?.images || []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Manejo de carga de archivos (cámara o galería)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadImageToServer(file);
        uploadedUrls.push(url);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || 'Error al procesar las fotografías');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    const val = customSizeInput.trim().toUpperCase();
    if (val && !selectedSizes.includes(val)) {
      setSelectedSizes((prev) => [...prev, val]);
      setCustomSizeInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica el nombre de la prenda.');
      return;
    }

    if (images.length === 0) {
      setError('Debes subir al menos una fotografía de la prenda.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() || 'General' : category;

    setSaving(true);
    setError(null);

    try {
      let finalPriceCOP: number | null = null;
      if (hasPrice && priceCOP.trim()) {
        const parsed = parseInt(priceCOP.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          finalPriceCOP = parsed;
        }
      }

      const payload: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        priceCOP: finalPriceCOP,
        category: finalCategory,
        sizes: selectedSizes,
        images,
        status,
        availability,
        isNew,
        featured,
        isDemo: false
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const formattedDisplayPrice = hasPrice && priceCOP
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
        parseInt(priceCOP.replace(/\D/g, '') || '0', 10)
      )
    : 'Consultar precio';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl max-h-[94vh] overflow-y-auto border border-[#E6DFD5] shadow-2xl p-6 sm:p-8 text-[#1C1A19]">
        
        {/* Encabezado del Formulario */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6DFD5]">
          <div>
            <h2 className="font-serif text-2xl text-[#1C1A19] font-normal">
              {productToEdit ? 'Editar Prenda' : 'Agregar Nueva Prenda a DIMARA'}
            </h2>
            <p className="text-xs text-[#8C8276]">
              Configura fotografías, precio, tallas y visibilidad para el catálogo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#1C1A19] rounded-full hover:bg-[#FAF8F5]"
            aria-label="Cerrar formulario"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Fila 1: Nombre y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Nombre de la Prenda *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Vestido Lino Midi con Abertura"
                className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19] bg-[#FAF8F5]/30"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Categoría *
              </label>
              {!isCustomCategory ? (
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm bg-white focus:outline-none focus:border-[#1C1A19]"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Otra categoría...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Escribe categoría"
                    className="w-full px-3 py-2 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-2 text-xs text-[#8C8276] hover:text-[#1C1A19]"
                    title="Volver a lista"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: Configuración de Precio en COP */}
          <div className="bg-[#FAF8F5] p-4 sm:p-5 border border-[#E6DFD5]/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#1C1A19] font-medium block">
                  Precio de Venta (Pesos Colombianos - COP)
                </span>
                <span className="text-[11px] text-[#8C8276]">
                  Si no especificas un valor numérico, el catálogo mostrará automáticamente "Consultar precio".
                </span>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#1C1A19] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPrice}
                  onChange={(e) => setHasPrice(e.target.checked)}
                  className="rounded border-[#E6DFD5] text-[#1C1A19] focus:ring-[#1C1A19]"
                />
                <span>Definir precio fijo</span>
              </label>
            </div>

            {hasPrice && (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3.5 top-2.5 text-sm text-[#8C8276] font-medium">$</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required={hasPrice}
                    value={priceCOP}
                    onChange={(e) => setPriceCOP(e.target.value)}
                    placeholder="180000"
                    className="w-full pl-8 pr-4 py-2 border border-[#E6DFD5] text-sm bg-white focus:outline-none focus:border-[#1C1A19]"
                  />
                </div>
                <div className="text-xs text-[#8C8276]">
                  Vista en catálogo: <strong className="text-[#1C1A19]">{formattedDisplayPrice}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Fila 3: Descripción de la Prenda */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
              Descripción y Detalles de la Prenda
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el corte, tipo de tela (lino, satén, algodón), caída, acabados y recomendaciones..."
              className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19] bg-[#FAF8F5]/30 leading-relaxed"
            />
          </div>

          {/* Fila 4: Tallas Disponibles */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-2 font-medium">
              Tallas Disponibles
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {STANDARD_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3.5 py-1.5 text-xs uppercase tracking-wider border transition-all ${
                      isSelected
                        ? 'bg-[#1C1A19] text-white border-[#1C1A19] font-medium shadow-xs'
                        : 'bg-white text-[#1C1A19] border-[#E6DFD5] hover:border-[#8C8276]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}

              {/* Tallas personalizadas añadidas */}
              {selectedSizes
                .filter((s) => !STANDARD_SIZES.includes(s))
                .map((custom) => (
                  <span
                    key={custom}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider bg-[#1C1A19] text-white"
                  >
                    <span>{custom}</span>
                    <button
                      type="button"
                      onClick={() => toggleSize(custom)}
                      className="text-white/70 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))}

              {/* Agregar talla manual */}
              <div className="inline-flex items-center gap-1 ml-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize(e)}
                  placeholder="+ Talla"
                  className="w-18 px-2 py-1.5 border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#1C1A19]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-2 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#1C1A19] hover:bg-[#E6DFD5]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Fila 5: Administrador de Fotografías (PRIORITARIO) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-[#1C1A19] font-medium block">
                  Fotografías de la Prenda ({images.length}) *
                </label>
                <span className="text-[11px] text-[#8C8276]">
                  La primera fotografía se utilizará como portada en el catálogo. Puedes cambiar el orden o la portada con la estrella.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="text-xs text-[#8C8276] hover:text-[#1C1A19] flex items-center gap-1 underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showLivePreview ? 'Ocultar vista previa' : 'Ver cómo lucirá'}</span>
              </button>
            </div>

            {/* Cuadrícula de fotos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-[3/4] border border-[#E6DFD5] group bg-[#F4EFEA]/30 overflow-hidden"
                >
                  <img
                    src={imgUrl}
                    alt={`Prenda foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Indicador de portada */}
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#1C1A19] text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-medium shadow-xs">
                      Portada
                    </span>
                  )}

                  {/* Barra de herramientas sobre foto */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleMakeMain(index)}
                          title="Hacer foto de portada"
                          className="p-1.5 bg-white text-[#1C1A19] rounded-full hover:bg-[#E6DFD5]"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      ) : <span />}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title="Eliminar foto"
                        className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mover orden */}
                    <div className="flex justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index - 1)}
                          title="Mover a la izquierda"
                          className="p-1 bg-white/80 hover:bg-white text-[#1C1A19] rounded"
                        >
                          <ArrowUp className="w-3 h-3 rotate-270" />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index + 1)}
                          title="Mover a la derecha"
                          className="p-1 bg-white/80 hover:bg-white text-[#1C1A19] rounded"
                        >
                          <ArrowDown className="w-3 h-3 rotate-270" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para subir imágenes */}
              <label className="relative aspect-[3/4] border-2 border-dashed border-[#E6DFD5] hover:border-[#1C1A19] flex flex-col items-center justify-center p-4 cursor-pointer text-center bg-[#FAF8F5]/60 hover:bg-[#F4EFEA]/40 transition-colors group">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#1C1A19] mb-2" />
                ) : (
                  <Upload className="w-6 h-6 text-[#8C8276] mb-2 group-hover:text-[#1C1A19] transition-colors" />
                )}
                <span className="text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                  {uploading ? 'Optimizando...' : 'Subir Fotos'}
                </span>
                <span className="text-[9px] text-[#8C8276] mt-1">Computador o móvil</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Vista previa en vivo opcional */}
          {showLivePreview && (
            <div className="p-4 bg-[#FAF8F5] border border-[#E6DFD5] mt-4">
              <span className="text-[10px] uppercase tracking-widest text-[#8C8276] font-medium block mb-3">
                Previsualización de Tarjeta en Catálogo:
              </span>
              <div className="max-w-xs mx-auto bg-white border border-[#E6DFD5] p-3 text-center">
                <div className="aspect-[3/4] w-full bg-[#E6DFD5]/30 mb-3 overflow-hidden">
                  <img
                    src={images[0] || 'https://via.placeholder.com/600x800?text=DIMARA'}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[#8C8276] mb-1">
                  {isCustomCategory ? customCategory || 'General' : category}
                </div>
                <div className="font-serif text-base text-[#1C1A19] mb-2">
                  {name || 'Nombre de la Prenda'}
                </div>
                <div className="text-xs font-medium text-[#1C1A19]">
                  {formattedDisplayPrice}
                </div>
              </div>
            </div>
          )}

          {/* Fila 6: Estado de Publicación y Disponibilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6DFD5]">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Estado de la Prenda
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-xs bg-white focus:outline-none focus:border-[#1C1A19]"
              >
                <option value="published">Publicado (Visible en el catálogo público)</option>
                <option value="draft">Borrador (Oculto al público, solo visible para ti)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Disponibilidad
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-xs bg-white focus:outline-none focus:border-[#1C1A19]"
              >
                <option value="available">Disponible para consultas y compra</option>
                <option value="sold_out">Agotado (Muestra etiqueta clara de agotado)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-1 text-xs">
            <label className="flex items-center gap-2 text-[#1C1A19] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="rounded border-[#E6DFD5]"
              />
              <span>Mostrar en sección "Nuevas Prendas" (Novedades)</span>
            </label>

            <label className="flex items-center gap-2 text-[#1C1A19] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-[#E6DFD5]"
              />
              <span>Prenda Destacada</span>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E6DFD5]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-[#1C1A19] border border-[#E6DFD5] hover:bg-[#FAF8F5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-7 py-2.5 text-xs uppercase tracking-[0.2em] bg-[#1C1A19] text-white hover:bg-[#0E0D0C] flex items-center gap-2 shadow-md transition-all font-medium"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Guardando...' : productToEdit ? 'Actualizar Prenda' : 'Publicar Prenda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
