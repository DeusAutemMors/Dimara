import React from 'react';
import { Product } from '../types';
import { MessageCircle, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickWhatsApp?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickWhatsApp
}) => {
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

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80';

  const secondaryImage = product.images && product.images.length > 1
    ? product.images[1]
    : null;

  return (
    <article
      onClick={() => onSelect(product)}
      className="group cursor-pointer flex flex-col bg-white border border-[#E6DFD5]/60 hover:border-[#8C8276]/60 transition-all duration-300 shadow-xs hover:shadow-md"
    >
      {/* Contenedor de Fotografía Editorial (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F4EFEA]/40">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
          }`}
        />

        {/* Segunda imagen al hover si existe */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - detalle`}
            loading="lazy"
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        )}

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && isAvailable && (
            <span className="bg-[#1C1A19] text-[#FAF8F5] text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium shadow-xs">
              Novedad
            </span>
          )}
          {product.isDemo && (
            <span className="bg-[#FAF8F5]/90 backdrop-blur-xs text-[#8C8276] text-[8px] uppercase tracking-wider px-2 py-0.5 border border-[#E6DFD5]">
              Demo
            </span>
          )}
        </div>

        {/* Badge de Agotado (Sobreimpreso claro) */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-[#1C1A19]/55 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="bg-white text-[#1C1A19] text-[10px] uppercase tracking-[0.25em] px-4 py-2 font-medium shadow-sm border border-[#E6DFD5]">
              Agotado
            </span>
          </div>
        )}

        {/* Tallas disponibles flotantes al pasar el cursor */}
        {product.sizes && product.sizes.length > 0 && isAvailable && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <span
                key={s}
                className="text-[9px] uppercase tracking-wider bg-white/95 text-[#1C1A19] px-2 py-0.5 font-medium shadow-xs"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Botón flotante rápido para ver detalle */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="p-2 bg-white/90 hover:bg-white text-[#1C1A19] rounded-full shadow-sm flex items-center justify-center">
            <Eye className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Información Editorial */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white text-center">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8276] font-medium block mb-1.5">
            {product.category}
          </span>
          <h3 className="font-serif text-base sm:text-lg text-[#1C1A19] font-normal line-clamp-1 group-hover:text-[#0E0D0C] transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E6DFD5]/50 flex items-center justify-between">
          <p className="text-xs sm:text-sm tracking-wider font-light text-[#1C1A19]">
            {formatCOP(product.priceCOP)}
          </p>

          <span className="text-[11px] text-[#8C8276] group-hover:text-[#1C1A19] transition-colors flex items-center gap-1">
            <span className="hidden sm:inline">Ver prenda</span>
            <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </div>
    </article>
  );
};
