import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center bg-[#F4EFEA] overflow-hidden">
      {/* Fotografía de portada de moda protagonista */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=85"
          alt="DIMARA Colección de Moda Femenina"
          className="w-full h-full object-cover object-[center_28%] filter brightness-[0.88]"
        />
        {/* Capa de contraste y gradiente sutil a la paleta marfil */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-black/25 to-black/35" />
      </div>

      {/* Contenido Editorial Protagonista */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto text-white mt-12 sm:mt-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full">
          <Sparkles className="w-3 h-3 text-[#E6DFD5]" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-light text-[#FAF8F5]">
            Edición Actual
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-wide leading-[1.08] drop-shadow-sm mb-6 text-[#FAF8F5]">
          Encuentra tu próximo favorito
        </h1>

        <p className="text-sm sm:text-base md:text-lg font-light text-[#FAF8F5]/90 max-w-xl mx-auto tracking-wide leading-relaxed mb-9">
          Piezas con diseño limpio y confección pensada para acompañar tu estilo con sutileza y carácter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#catalogo"
            className="w-full sm:w-auto px-9 py-3.5 bg-[#FAF8F5] text-[#0E0D0C] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#E6DFD5] transition-all duration-300 shadow-md text-center"
          >
            Explorar colección
          </a>
          <a
            href="#novedades"
            className="w-full sm:w-auto px-8 py-3.5 bg-black/20 backdrop-blur-xs border border-white/70 text-[#FAF8F5] text-xs uppercase tracking-[0.25em] font-medium hover:bg-white/20 transition-all duration-300 text-center"
          >
            Ver novedades
          </a>
        </div>
      </div>

      {/* Indicador de desplazamiento inferior */}
      <a
        href="#catalogo"
        aria-label="Desplazarse al catálogo"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 hover:text-white z-10 transition-colors p-2 flex flex-col items-center gap-1 group"
      >
        <span className="text-[9px] uppercase tracking-[0.2em] font-light opacity-75 group-hover:opacity-100">
          Descubrir
        </span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
};
