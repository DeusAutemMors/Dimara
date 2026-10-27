import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Database, HardDrive, Lock } from 'lucide-react';

interface FirebaseGuideModalProps {
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla catch-all por defecto
    match /{document=**} {
      allow read, write: if false;
    }

    // Catálogo DIMARA: Lectura pública, escritura solo para administradores
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  const storageRulesSnippet = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Fotografías de DIMARA: Lectura pública, subida y eliminación solo administradores
    match /dimara-catalog/{allImages=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  const envSnippet = `# Variables de entorno para conectar Firebase a DIMARA
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="dimara-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="dimara-app"
VITE_FIREBASE_STORAGE_BUCKET="dimara-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-[#E6DFD5] shadow-2xl p-6 sm:p-8 text-[#1C1A19]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6DFD5]">
          <div>
            <h2 className="font-serif text-2xl text-[#1C1A19] font-normal flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <span>Arquitectura, Persistencia y Conexión Externa</span>
            </h2>
            <p className="text-xs text-[#8C8276] mt-0.5">
              Estado actual del almacenamiento y guía para sincronización con Firebase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#1C1A19] rounded-full hover:bg-[#FAF8F5]"
            aria-label="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado Actual */}
        <div className="mb-6 p-4 bg-[#FAF8F5] border border-[#E6DFD5] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1A19]">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>Almacenamiento Local Persistente Activo (Listo para Usar)</span>
          </div>
          <p className="text-xs text-[#8C8276] leading-relaxed">
            Tu aplicación cuenta con un servidor backend Express con persistencia real en disco. Los productos se guardan en <code className="bg-[#E6DFD5]/60 px-1 py-0.5 rounded text-[#1C1A19]">/data/products.json</code> y las fotografías en <code className="bg-[#E6DFD5]/60 px-1 py-0.5 rounded text-[#1C1A19]">/data/uploads/</code> con optimización Canvas. Los datos persisten entre reinicios y cambios de dispositivo.
          </p>
        </div>

        {/* Pasos para Conectar Firebase en la Nube */}
        <div className="space-y-6 text-xs text-[#1C1A19]">
          <section className="space-y-2">
            <h3 className="font-serif text-base font-normal text-[#1C1A19] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#8C8276]" />
              <span>1. Cloud Firestore (Base de Datos en la Nube)</span>
            </h3>
            <p className="text-[#8C8276] leading-relaxed">
              En tu consola de Firebase (<a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline text-[#1C1A19] inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a>), crea una base de datos Firestore y copia esta regla en la pestaña <em>Rules</em>:
            </p>
            <div className="relative">
              <pre className="bg-[#0E0D0C] text-[#FAF8F5] p-3 rounded text-[11px] font-mono overflow-x-auto">
                {firestoreRulesSnippet}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(firestoreRulesSnippet, 'firestore')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-[10px] rounded flex items-center gap-1"
              >
                {copiedSection === 'firestore' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'firestore' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-base font-normal text-[#1C1A19] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#8C8276]" />
              <span>2. Firebase Storage (Almacenamiento de Fotografías)</span>
            </h3>
            <p className="text-[#8C8276] leading-relaxed">
              Habilita Firebase Storage y aplica la regla para la carpeta <code className="text-[#1C1A19]">dimara-catalog</code>:
            </p>
            <div className="relative">
              <pre className="bg-[#0E0D0C] text-[#FAF8F5] p-3 rounded text-[11px] font-mono overflow-x-auto">
                {storageRulesSnippet}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(storageRulesSnippet, 'storage')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-[10px] rounded flex items-center gap-1"
              >
                {copiedSection === 'storage' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'storage' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-base font-normal text-[#1C1A19] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8C8276]" />
              <span>3. Variables de Entorno (.env)</span>
            </h3>
            <p className="text-[#8C8276] leading-relaxed">
              Copia la configuración de tu aplicación web desde la consola de Firebase en las variables de entorno de tu servidor o archivo <code className="text-[#1C1A19]">.env</code>:
            </p>
            <div className="relative">
              <pre className="bg-[#0E0D0C] text-[#FAF8F5] p-3 rounded text-[11px] font-mono overflow-x-auto">
                {envSnippet}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(envSnippet, 'env')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-[10px] rounded flex items-center gap-1"
              >
                {copiedSection === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'env' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </section>
        </div>

        {/* Botón cerrar */}
        <div className="mt-8 pt-4 border-t border-[#E6DFD5] text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1C1A19] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0E0D0C]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
