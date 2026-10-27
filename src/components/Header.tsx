import React, { useState } from 'react';
import { Menu, X, Instagram, MessageCircle, Lock, ShieldCheck, Phone } from 'lucide-react';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_CONTACTS } from '../types';

interface HeaderProps {
  onOpenAdmin: () => void;
  isAdminAuthenticated: boolean;
  totalProductsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  isAdminAuthenticated,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6DFD5]/70 transition-all duration-300">
      {/* Barra superior de anuncios sutil */}
      <div className="bg-[#1C1A19] text-[#FAF8F5] text-[11px] py-1.5 px-4 tracking-widest uppercase text-center font-light flex items-center justify-center gap-3">
        <span className="hidden sm:inline">Envíos a toda Colombia</span>
        <span className="hidden sm:inline text-[#8C8276]">•</span>
        <span>Atención y pedidos personalizados por WhatsApp</span>
        <span className="hidden md:inline text-[#8C8276]">•</span>
        <span className="hidden md:inline text-[#C5A880]">Línea directa: 305 428 6540</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Navegación izquierda (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-[0.2em] font-medium text-[#1C1A19]/80">
            <a href="#catalogo" className="hover:text-[#0E0D0C] hover:opacity-100 transition-colors">
              Catálogo
            </a>
            <a href="#novedades" className="hover:text-[#0E0D0C] hover:opacity-100 transition-colors">
              Novedades
            </a>
            <a href="#identidad" className="hover:text-[#0E0D0C] hover:opacity-100 transition-colors">
              Identidad
            </a>
            <a href="#contacto" className="hover:text-[#0E0D0C] hover:opacity-100 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Wordmark DIMARA */}
          <div className="flex-1 md:flex-none text-center">
            <a href="#" className="inline-block group focus:outline-none">
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] text-[#0E0D0C] font-light transition-opacity group-hover:opacity-80">
                DIMARA
              </span>
            </a>
          </div>

          {/* Acciones Derecha */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1C1A19]/80 hover:text-[#0E0D0C] transition-colors p-1.5 flex items-center gap-1.5 text-xs tracking-wider"
              title="Instagram @dimara_dr"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-[11px] font-normal">{INSTAGRAM_HANDLE}</span>
            </a>

            {/* WhatsApp Directo */}
            <a
              href={`https://wa.me/${WHATSAPP_CONTACTS[0].cleanIntl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-white border border-[#1C1A19]/20 px-3.5 py-2 hover:bg-[#1C1A19] hover:text-white transition-all duration-300 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
              <span>WhatsApp</span>
            </a>

            {/* Acceso Admin */}
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-full border transition-all relative ${
                isAdminAuthenticated
                  ? 'border-[#1C1A19] bg-[#1C1A19] text-white shadow-xs'
                  : 'border-transparent text-[#8C8276] hover:text-[#1C1A19] hover:border-[#E6DFD5]'
              }`}
              title={isAdminAuthenticated ? 'Panel de Administración Activo' : 'Acceso Privado de Administración'}
              aria-label="Acceso Administración"
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isAdminAuthenticated && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Botones Móvil */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-full border ${
                isAdminAuthenticated
                  ? 'border-[#1C1A19] bg-[#1C1A19] text-white'
                  : 'text-[#8C8276] border-transparent'
              }`}
              aria-label="Admin"
            >
              {isAdminAuthenticated ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#1C1A19] focus:outline-none"
              aria-label="Abrir Menú"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E6DFD5] px-6 pt-4 pb-8 space-y-6 animate-fadeIn">
          <nav className="flex flex-col space-y-4 text-xs uppercase tracking-[0.2em] font-medium text-[#1C1A19]">
            <a
              href="#catalogo"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 border-b border-[#E6DFD5]/50 flex justify-between items-center"
            >
              <span>Catálogo Completo</span>
              <span className="text-[#8C8276] text-[10px]">Ver prendas</span>
            </a>
            <a
              href="#novedades"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 border-b border-[#E6DFD5]/50 flex justify-between items-center"
            >
              <span>Nuevas Prendas</span>
              <span className="text-[#8C8276] text-[10px]">Novedades</span>
            </a>
            <a
              href="#identidad"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 border-b border-[#E6DFD5]/50 flex justify-between items-center"
            >
              <span>Sobre DIMARA</span>
              <span className="text-[#8C8276] text-[10px]">Esencia</span>
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 border-b border-[#E6DFD5]/50 flex justify-between items-center"
            >
              <span>Canales de Contacto</span>
              <span className="text-[#8C8276] text-[10px]">Atención</span>
            </a>
          </nav>

          <div className="space-y-3 pt-2">
            <div className="text-[10px] uppercase tracking-widest text-[#8C8276]">Líneas directas WhatsApp:</div>
            {WHATSAPP_CONTACTS.map(contact => (
              <a
                key={contact.id}
                href={`https://wa.me/${contact.cleanIntl}?text=${encodeURIComponent('Hola DIMARA, deseo consultar sobre las prendas de su colección.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-[#E6DFD5] text-xs"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-[#1C1A19]">{contact.formatted}</span>
                </div>
                <span className="text-[10px] text-[#8C8276]">{contact.label}</span>
              </a>
            ))}

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border border-[#1C1A19] text-[#1C1A19] text-xs uppercase tracking-widest hover:bg-[#1C1A19] hover:text-white transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Síguenos {INSTAGRAM_HANDLE}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
