import React, { useState, useEffect } from 'react';
import { Lock, Shield, ArrowLeft, Loader2, AlertCircle, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';
import { Product, AdminAuthStatus } from '../../types';
import { checkAuthStatus, setupFirstAdmin, loginAdmin, logoutAdmin } from '../../services/api';
import { AdminDashboard } from './AdminDashboard';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => Promise<void>;
  onAuthChange: (authenticated: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
  onAuthChange
}) => {
  const [authStatus, setAuthStatus] = useState<AdminAuthStatus>({
    hasAdmin: true,
    authenticated: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);
      onAuthChange(status.authenticated);
    } catch {
      // fallo silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Si está autenticado, mostrar directamente el Dashboard
  if (authStatus.authenticated) {
    return (
      <AdminDashboard
        products={products}
        adminEmail={authStatus.adminEmail}
        onRefresh={onRefreshProducts}
        onLogout={async () => {
          await logoutAdmin();
          await refreshStatus();
        }}
        onClose={onClose}
      />
    );
  }

  // Manejo de Configuración Inicial (Primer Administrador)
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await setupFirstAdmin(email, password);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || 'Error en la configuración inicial.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await loginAdmin(email, password);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || 'Credenciales no válidas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md border border-[#E6DFD5] shadow-2xl p-7 sm:p-9 text-[#1C1A19] animate-fadeIn">
        
        {/* Botón Volver */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#8C8276] hover:text-[#1C1A19] rounded-full hover:bg-[#FAF8F5] transition-colors"
          title="Volver a la tienda"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="text-center pt-3 mb-6">
          <span className="font-serif text-3xl tracking-[0.25em] text-[#0E0D0C] font-light block mb-2">
            DIMARA
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-[#E6DFD5] text-[10px] uppercase tracking-[0.2em] text-[#8C8276]">
            <Lock className="w-3 h-3 text-[#1C1A19]" />
            <span>Panel de Administración</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-[#8C8276]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1C1A19]" />
            <span className="text-xs">Verificando estado de seguridad...</span>
          </div>
        ) : !authStatus.hasAdmin ? (
          /* CONFIGURACIÓN INICIAL DEL PRIMER USUARIO ADMINISTRADOR */
          <div className="space-y-5">
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>Configuración Inicial Segura:</strong> Aún no se ha registrado un administrador para DIMARA. Define ahora tu correo y contraseña oficial. Una vez registrado, nadie más podrá crear cuentas de administración.
            </div>

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1 font-medium">
                  Correo Electrónico Oficial *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dimara.com"
                  className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1 font-medium">
                  Contraseña Segura *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1 font-medium">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#1C1A19] text-white hover:bg-[#0E0D0C] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-md transition-all mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 text-[#C5A880]" />
                )}
                <span>{submitting ? 'Guardando...' : 'Crear Administrador de DIMARA'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* FORMULARIO DE INICIO DE SESIÓN CON CREDENCIALES REALES */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Correo Administrador
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: contacto@dimara.com"
                className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#1C1A19] mb-1.5 font-medium">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#1C1A19]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#1C1A19] text-white hover:bg-[#0E0D0C] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-md transition-all mt-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 text-[#C5A880]" />
              )}
              <span>{submitting ? 'Verificando...' : 'Entrar al Administrador'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#E6DFD5]/60 text-center text-[11px] text-[#8C8276]">
          Acceso reservado exclusivamente para la gestión de catálogo de DIMARA.
        </div>
      </div>
    </div>
  );
};
