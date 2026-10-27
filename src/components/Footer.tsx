import React from 'react';
import { Instagram, MessageCircle, Lock, Phone } from 'lucide-react';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_CONTACTS } from '../types';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer id="contacto" className="bg-[#0E0D0C] text-[#FAF8F5] pt-16 pb-12 border-t border-[#1C1A19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Marca e Información */}
          <div className="md:col-span-2">
            <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-light text-[#FAF8F5] block mb-4">
              DIMARA
            </span>
            <p className="text-xs sm:text-sm text-[#E6DFD5]/70 max-w-sm leading-relaxed mb-6 font-light">
              Boutique de moda femenina contemporánea. Siluetas esenciales y atención directa para todo el territorio colombiano.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-4 py-2 bg-white/5 border border-white/15 text-[#FAF8F5] hover:bg-white hover:text-[#0E0D0C] transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram {INSTAGRAM_HANDLE}</span>
              </a>
            </div>
          </div>

          {/* Líneas de WhatsApp */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-medium mb-4">
              Ventas y Consultas
            </h4>
            <ul className="space-y-3 text-xs text-[#FAF8F5]/80 font-light">
              {WHATSAPP_CONTACTS.map((contact) => (
                <li key={contact.id}>
                  <a
                    href={`https://wa.me/${contact.cleanIntl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-start gap-2.5 group"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-normal text-white">{contact.formatted}</div>
                      <div className="text-[10px] text-[#8C8276]">{contact.description}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navegación y Acceso Privado */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-medium mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF8F5]/70 font-light">
              <li>
                <a href="#catalogo" className="hover:text-white transition-colors">
                  Catálogo de Colección
                </a>
              </li>
              <li>
                <a href="#novedades" className="hover:text-white transition-colors">
                  Prendas Nuevas
                </a>
              </li>
              <li>
                <a href="#identidad" className="hover:text-white transition-colors">
                  Identidad DIMARA
                </a>
              </li>
              <li className="pt-3">
                <button
                  onClick={onOpenAdmin}
                  className="text-[#8C8276] hover:text-white transition-colors inline-flex items-center gap-1.5 text-xs tracking-wider"
                >
                  <Lock className="w-3 h-3" />
                  <span>Panel Privado de Administración</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador inferior */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C8276] font-light">
          <p>© {new Date().getFullYear()} DIMARA. Marca de moda femenina en Colombia.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-2">
            <span>Consultas directas por WhatsApp</span>
            <span>•</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram Oficial
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
