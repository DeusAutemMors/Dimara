import { Product, AdminAuthStatus } from '../types';

const TOKEN_KEY = 'dimara_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string, remember = false): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// SERVICIOS DE AUTENTICACIÓN
// ==========================================

export async function checkAuthStatus(): Promise<AdminAuthStatus> {
  try {
    const res = await fetch('/api/auth/status', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al verificar autenticación');
    return await res.json();
  } catch (err) {
    console.warn('Fallo verificando estado auth:', err);
    return { hasAdmin: true, authenticated: false };
  }
}

export async function setupFirstAdmin(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await fetch('/api/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al configurar el administrador');
  }

  setAdminToken(data.token, true);
  return data;
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciales no válidas');
  }

  setAdminToken(data.token, true);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // ignorar error en logout
  } finally {
    clearAdminToken();
  }
}

// ==========================================
// SERVICIOS DE PRODUCTOS
// ==========================================

export async function fetchProducts(includeDrafts = false): Promise<Product[]> {
  const url = includeDrafts ? '/api/products?includeDrafts=true' : '/api/products';
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error('No se pudo cargar el catálogo de prendas.');
  }

  return await res.json();
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al guardar la prenda');
  }

  return data;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar la prenda');
  }

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al eliminar la prenda');
  }
}

export async function purgeDemoProducts(): Promise<{ removedCount: number }> {
  const res = await fetch('/api/products/purge-demo', {
    method: 'POST',
    headers: getAuthHeaders()
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al depurar prendas de demostración');
  }

  return data;
}

// ==========================================
// OPTIMIZACIÓN Y SUBIDA DE FOTOGRAFÍAS
// ==========================================

/**
 * Optimiza la imagen en el cliente usando HTML5 Canvas:
 * Redimensiona proporcionalmente a máximo 1600px y comprime a JPEG calidad 85%
 * Convierte a DataURL Base64 para envío seguro al servidor
 */
export async function optimizeImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen corrupto o no admitido'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador de imágenes'));
          return;
        }

        // Fondo blanco neutro para transparencias
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una fotografía optimizada al servidor de almacenamiento persistente
 */
export async function uploadImageToServer(file: File): Promise<string> {
  const optimizedDataUrl = await optimizeImageFile(file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      filename: file.name,
      data: optimizedDataUrl
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al subir la fotografía al servidor');
  }

  return data.url;
}
