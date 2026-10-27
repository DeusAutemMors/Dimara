import React from 'react';
import { Sparkles, Shield, Compass } from 'lucide-react';

export const BrandStatement: React.FC = () => {
  return (
    <section id="identidad" className="py-20 bg-[#F4EFEA]/40 border-y border-[#E6DFD5]/70">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C8276] font-medium block mb-4">
          Identidad DIMARA
        </span>
        
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1C1A19] font-light leading-relaxed mb-6">
          Prendas creadas para expresarte con naturalidad. Cortes equilibrados, tonos esenciales y la practicidad de consultar directamente con nosotras.
        </h2>

        <div className="w-16 h-px bg-[#1C1A19]/30 mx-auto mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
          <div className="bg-white p-6 border border-[#E6DFD5]/70">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] flex items-center justify-center mb-4">
              <Sparkles className="w-4 h-4 text-[#8C8276]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C1A19] font-normal mb-2">Siluetas Atemporales</h3>
            <p className="text-xs text-[#8C8276] leading-relaxed">
              Diseños que trascienden temporadas pasajeras, pensados para combinarse con facilidad y adaptarse a tu día a día.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#E6DFD5]/70">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] flex items-center justify-center mb-4">
              <Shield className="w-4 h-4 text-[#8C8276]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C1A19] font-normal mb-2">Confección Cuidada</h3>
            <p className="text-xs text-[#8C8276] leading-relaxed">
              Trabajamos con atención en las costuras, caídas de tela y acabados de cada referencia antes de su publicación.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#E6DFD5]/70">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6DFD5] flex items-center justify-center mb-4">
              <Compass className="w-4 h-4 text-[#8C8276]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C1A19] font-normal mb-2">Atención Directa</h3>
            <p className="text-xs text-[#8C8276] leading-relaxed">
              Resolvemos tus inquietudes de talla, medidas y disponibilidad de forma humana a través de nuestras líneas de WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
