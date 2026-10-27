import React, { useState } from 'react';
import { MessageCircle, X, Phone, ArrowUpRight } from 'lucide-react';
import { WHATSAPP_CONTACTS } from '../types';

export const WhatsAppFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover con las 2 líneas oficiales */}
      {isOpen && (
        <div className="mb-3 w-80 max-w-[calc(100vw-3rem)] bg-white border border-[#E6DFD5] shadow-2xl p-5 animate-fadeIn text-[#1C1A19]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6DFD5]/60">
            <div>
              <span className="font-serif text-base text-[#1C1A19] font-normal block">Atención DIMARA</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C8276]">Ventas y Asesoría</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#8C8276] hover:text-[#1C1A19] rounded-full hover:bg-[#FAF8F5]"
              aria-label="Cerrar ventana de WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#8C8276] mb-3 leading-relaxed">
            Escríbenos directamente a cualquiera de nuestras dos líneas en Colombia para consultar prendas, tallas o coordinar tu envío:
          </p>

          <div className="space-y-2">
            {WHATSAPP_CONTACTS.map((contact) => (
              <a
                key={contact.id}
                href={`https://wa.me/${contact.cleanIntl}?text=${encodeURIComponent('Hola DIMARA, me gustaría recibir asesoría sobre su colección de ropa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 border border-[#E6DFD5] hover:border-[#1C1A19] hover:bg-[#FAF8F5] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1C1A19] group-hover:text-[#0E0D0C]">
                      {contact.formatted}
                    </div>
                    <div className="text-[10px] text-[#8C8276]">{contact.description}</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C8276] group-hover:text-[#1C1A19] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ))}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[#E6DFD5]/50 text-[10px] text-center text-[#8C8276]">
            Atención humana y personalizada de lunes a sábado.
          </div>
        </div>
      )}

      {/* Botón Circular Discreto Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir opciones de WhatsApp DIMARA"
        className="w-13 h-13 rounded-full bg-[#1C1A19] text-white hover:bg-[#0E0D0C] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group border border-[#FAF8F5]/20"
      >
        <MessageCircle className="w-6 h-6 text-emerald-400 group-hover:rotate-6 transition-transform" />
      </button>
    </div>
  );
};
