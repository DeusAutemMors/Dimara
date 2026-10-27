import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ChevronLeft, ChevronRight, Check, Share2, Sparkles } from 'lucide-react';
import { Product, WHATSAPP_CONTACTS, WhatsAppContact } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact>(WHATSAPP_CONTACTS[0]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset al cambiar de prenda
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize(product.sizes && product.sizes.length === 1 ? product.sizes[0] : '');
  }, [product.id]);

  // Cerrar al presionar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isAvailable = product.availability === 'available';

  const formatCOP = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(Number(val))) {
      return 'Consultar precio';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=85'];

  // Generar enlace de consulta a WhatsApp con mensaje prellenado
  const handleOpenWhatsApp = () => {
    const sizePart = selectedSize ? ` en talla ${selectedSize}` : '';
    const message = `Hola DIMARA, me interesa la prenda "${product.name}"${sizePart}. ¿Me podrían confirmar disponibilidad y forma de compra?`;
    const cleanUrl = `https://wa.me/${selectedContact.cleanIntl}?text=${encodeURIComponent(message)}`;
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `DIMARA - ${product.name}`,
        text: `Descubre la prenda ${product.name} en DIMARA.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF8F5] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E6DFD5] flex flex-col md:flex-row text-[#1C1A19]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 hover:bg-[#1C1A19] hover:text-white rounded-full transition-colors shadow-sm"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Galería de Fotografías (Mitad izquierda) */}
        <div className="w-full md:w-1/2 flex flex-col bg-[#F4EFEA]/40 border-b md:border-b-0 md:border-r border-[#E6DFD5]/70">
          <div className="relative aspect-[3/4] w-full bg-[#E6DFD5]/20 overflow-hidden">
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} - Imagen ${activeImageIndex + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges superiores */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.isNew && isAvailable && (
                <span className="bg-[#1C1A19] text-[#FAF8F5] text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-medium shadow-xs">
                  Novedad
                </span>
              )}
              {product.isDemo && (
                <span className="bg-white/90 text-[#8C8276] text-[9px] uppercase tracking-wider px-2.5 py-0.5 border border-[#E6DFD5]">
                  Demostración
                </span>
              )}
            </div>

            {/* Flechas de navegación de imagen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-[#1C1A19] transition-colors shadow-xs"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-[#1C1A19] transition-colors shadow-xs"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Estado Agotado en imagen */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-[#1C1A19]/55 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-white text-[#1C1A19] text-xs uppercase tracking-[0.25em] px-5 py-2 font-medium">
                  Prenda Agotada
                </span>
              </div>
            )}
          </div>

          {/* Miniaturas de Fotografías */}
          {images.length > 1 && (
            <div className="flex gap-2.5 p-3.5 overflow-x-auto bg-white border-t border-[#E6DFD5]/60 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-18 sm:w-16 sm:h-20 flex-shrink-0 border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#1C1A19] ring-1 ring-[#1C1A19]'
                      : 'border-[#E6DFD5] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha de Detalles y Acción de Compra (Mitad derecha) */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Categoría y Compartir */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C8276] font-medium">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-[#8C8276] hover:text-[#1C1A19] flex items-center gap-1 transition-colors"
                title="Compartir prenda"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
              </button>
            </div>

            {/* Nombre */}
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A19] font-normal leading-tight mb-3">
              {product.name}
            </h2>

            {/* Precio */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-xl sm:text-2xl font-light text-[#0E0D0C] tracking-wide">
                {formatCOP(product.priceCOP)}
              </span>
              {isAvailable ? (
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                  Disponible
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 border border-red-200">
                  Agotado
                </span>
              )}
            </div>

            {/* Descripción */}
            <div className="border-t border-b border-[#E6DFD5]/70 py-4 mb-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#1C1A19] font-medium mb-2.5">
                Descripción
              </h3>
              <p className="text-xs sm:text-sm font-light text-[#1C1A19]/80 leading-relaxed whitespace-pre-line">
                {product.description || 'Prenda con confección cuidada y silueta exclusiva DIMARA.'}
              </p>
            </div>

            {/* Selector de Tallas */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#1C1A19] font-medium">
                    Tallas Disponibles
                  </span>
                  {selectedSize && (
                    <span className="text-xs text-[#8C8276]">
                      Seleccionada: <strong className="text-[#1C1A19]">{selectedSize}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                          isSelected
                            ? 'border-[#1C1A19] bg-[#1C1A19] text-white font-medium shadow-xs'
                            : 'border-[#E6DFD5] bg-white text-[#1C1A19] hover:border-[#1C1A19]'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de Línea de WhatsApp */}
            <div className="mb-6 bg-white p-3.5 border border-[#E6DFD5]/80">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] font-medium block mb-2">
                Selecciona la línea de atención para tu consulta:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WHATSAPP_CONTACTS.map((contact) => {
                  const isCurrent = selectedContact.id === contact.id;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      className={`text-left p-2.5 border text-xs transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-[#1C1A19] bg-[#FAF8F5]'
                          : 'border-[#E6DFD5] hover:border-[#8C8276]'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[#1C1A19]">{contact.formatted}</div>
                        <div className="text-[10px] text-[#8C8276]">{contact.label}</div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#1C1A19]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Acción Principal de WhatsApp */}
          <div className="pt-2">
            <button
              onClick={handleOpenWhatsApp}
              disabled={!isAvailable}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-md ${
                isAvailable
                  ? 'bg-[#1C1A19] hover:bg-[#0E0D0C] text-white'
                  : 'bg-[#E6DFD5] text-[#8C8276] cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {isAvailable
                  ? `Consultar por WhatsApp (${selectedContact.formatted})`
                  : 'Prenda No Disponible'}
              </span>
            </button>
            <p className="text-[11px] text-center text-[#8C8276] mt-2.5 font-light">
              Al pulsar se abrirá WhatsApp con el mensaje prellenado para coordinar tu compra con una asesora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
