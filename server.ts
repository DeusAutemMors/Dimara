import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';
import { Product } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Directorios de persistencia
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Asegurar existencia de directorios
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Inicializar catálogo de productos si no existe
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
}

// Manejo de productos en disco
function readProducts(): Product[] {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch (err) {
    console.error('Error leyendo productos:', err);
    return [];
  }
}

function writeProducts(products: Product[]): void {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

// Manejo de autenticación de Administrador
interface AdminRecord {
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

interface SessionRecord {
  token: string;
  email: string;
  expiresAt: number;
}

function readAdmin(): AdminRecord | null {
  if (!fs.existsSync(AUTH_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as AdminRecord;
  } catch {
    return null;
  }
}

function writeAdmin(admin: AdminRecord): void {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(admin, null, 2), 'utf-8');
}

function readSessions(): SessionRecord[] {
  if (!fs.existsSync(SESSIONS_FILE)) return [];
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')) as SessionRecord[];
    const now = Date.now();
    return sessions.filter(s => s.expiresAt > now);
  } catch {
    return [];
  }
}

function writeSessions(sessions: SessionRecord[]): void {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Middleware de autenticación para rutas protegidas /api/admin/*
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado. Token ausente.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const sessions = readSessions();
  const session = sessions.find(s => s.token === token && s.expiresAt > Date.now());

  if (!session) {
    res.status(401).json({ error: 'Sesión expirada o no válida.' });
    return;
  }

  // Renovar sesión 24 horas adicionales
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  writeSessions(sessions);
  (req as any).adminEmail = session.email;
  next();
}

// Configuración de Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos subidos de manera persistente
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  immutable: true
}));

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// Estado de autenticación y si requiere configuración inicial
app.get('/api/auth/status', (req: Request, res: Response) => {
  const admin = readAdmin();
  const hasAdmin = admin !== null;

  const authHeader = req.headers.authorization;
  let authenticated = false;
  let adminEmail = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const sessions = readSessions();
    const session = sessions.find(s => s.token === token && s.expiresAt > Date.now());
    if (session) {
      authenticated = true;
      adminEmail = session.email;
    }
  }

  res.json({
    hasAdmin,
    authenticated,
    adminEmail: authenticated ? adminEmail : undefined
  });
});

// Configuración inicial del primer administrador (SEGURO: Solo funciona una única vez si no hay admin)
app.post('/api/auth/setup', (req: Request, res: Response) => {
  const existing = readAdmin();
  if (existing) {
    res.status(400).json({ error: 'El administrador ya ha sido configurado previamente.' });
    return;
  }

  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const adminRecord: AdminRecord = {
    email: email.trim().toLowerCase(),
    passwordHash,
    salt,
    createdAt: Date.now()
  };

  writeAdmin(adminRecord);

  // Crear token de sesión inmediato
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readSessions();
  sessions.push({
    token,
    email: adminRecord.email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
  writeSessions(sessions);

  res.json({
    success: true,
    message: 'Administrador configurado con éxito.',
    token,
    email: adminRecord.email
  });
});

// Iniciar sesión
app.post('/api/auth/login', (req: Request, res: Response) => {
  const admin = readAdmin();
  if (!admin) {
    res.status(400).json({ error: 'No hay un administrador configurado todavía. Realiza la configuración inicial.' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Ingresa correo y contraseña.' });
    return;
  }

  const inputEmail = email.trim().toLowerCase();
  if (inputEmail !== admin.email) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  const expectedHash = hashPassword(password, admin.salt);
  if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(admin.passwordHash))) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  // Generar token
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readSessions();
  sessions.push({
    token,
    email: admin.email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
  writeSessions(sessions);

  res.json({
    success: true,
    token,
    email: admin.email
  });
});

// Cerrar sesión
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const sessions = readSessions().filter(s => s.token !== token);
    writeSessions(sessions);
  }
  res.json({ success: true });
});

// ==========================================
// RUTAS DE PRODUCTOS / CATÁLOGO
// ==========================================

// Obtener catálogo
app.get('/api/products', (req: Request, res: Response) => {
  const products = readProducts();
  const includeDrafts = req.query.includeDrafts === 'true';

  // Si pide borradores, verificar si viene con sesión válida
  if (includeDrafts) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const sessions = readSessions();
      if (sessions.some(s => s.token === token && s.expiresAt > Date.now())) {
        res.json(products);
        return;
      }
    }
  }

  // Catálogo público: solo productos publicados
  const publicCatalog = products.filter(p => p.status === 'published');
  res.json(publicCatalog);
});

// Obtener producto por ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  const products = readProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Prenda no encontrada.' });
    return;
  }
  res.json(product);
});

// Crear nuevo producto (Protegido)
app.post('/api/products', requireAdminAuth, (req: Request, res: Response) => {
  const { name, description, priceCOP, category, sizes, colors, images, featured, isNew, status, availability } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'El nombre de la prenda es obligatorio.' });
    return;
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: 'Debes incluir al menos una fotografía de la prenda.' });
    return;
  }

  const products = readProducts();
  const newProduct: Product = {
    id: `dimara-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: name.trim(),
    description: (description || '').trim(),
    priceCOP: priceCOP !== null && priceCOP !== undefined && !isNaN(Number(priceCOP)) ? Math.round(Number(priceCOP)) : null,
    category: (category || 'Vestidos').trim(),
    sizes: Array.isArray(sizes) ? sizes : ['S', 'M'],
    colors: Array.isArray(colors) ? colors : [],
    images: images,
    featured: Boolean(featured),
    isNew: isNew !== undefined ? Boolean(isNew) : true,
    status: status === 'draft' ? 'draft' : 'published',
    availability: availability === 'sold_out' ? 'sold_out' : 'available',
    isDemo: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  products.unshift(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// Actualizar producto (Protegido)
app.put('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const products = readProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Prenda no encontrada.' });
    return;
  }

  const existing = products[index];
  const { name, description, priceCOP, category, sizes, colors, images, featured, isNew, status, availability } = req.body;

  const updatedProduct: Product = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    description: description !== undefined ? String(description).trim() : existing.description,
    priceCOP: priceCOP !== undefined ? (priceCOP === null ? null : Math.round(Number(priceCOP))) : existing.priceCOP,
    category: category !== undefined ? String(category).trim() : existing.category,
    sizes: Array.isArray(sizes) ? sizes : existing.sizes,
    colors: Array.isArray(colors) ? colors : existing.colors,
    images: Array.isArray(images) && images.length > 0 ? images : existing.images,
    featured: featured !== undefined ? Boolean(featured) : existing.featured,
    isNew: isNew !== undefined ? Boolean(isNew) : existing.isNew,
    status: status === 'draft' ? 'draft' : (status === 'published' ? 'published' : existing.status),
    availability: availability === 'sold_out' ? 'sold_out' : (availability === 'available' ? 'available' : existing.availability),
    updatedAt: Date.now(),
    isDemo: false // Toda prenda editada por admin se consolida como real
  };

  products[index] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// Eliminar producto (Protegido)
app.delete('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const products = readProducts();
  const exists = products.some(p => p.id === req.params.id);

  if (!exists) {
    res.status(404).json({ error: 'Prenda no encontrada.' });
    return;
  }

  const filtered = products.filter(p => p.id !== req.params.id);
  writeProducts(filtered);

  res.json({ success: true, message: 'Prenda eliminada correctamente.' });
});

// Eliminar prendas demo del catálogo (Protegido)
app.post('/api/products/purge-demo', requireAdminAuth, (req: Request, res: Response) => {
  const products = readProducts();
  const cleanProducts = products.filter(p => !p.isDemo);
  const removedCount = products.length - cleanProducts.length;

  writeProducts(cleanProducts);
  res.json({
    success: true,
    removedCount,
    remainingCount: cleanProducts.length,
    message: `Se eliminaron ${removedCount} prendas demostrativas con éxito.`
  });
});

// ==========================================
// SUBIDA DE FOTOGRAFÍAS (PERSISTENCIA REAL EN DISCO)
// ==========================================

app.post('/api/upload', requireAdminAuth, (req: Request, res: Response) => {
  const { data, filename } = req.body;

  if (!data || typeof data !== 'string') {
    res.status(400).json({ error: 'Datos de imagen no válidos.' });
    return;
  }

  // Verificar formato Base64 Data URL (data:image/...;base64,...)
  const match = data.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'El archivo enviado no es una imagen válida en Base64.' });
    return;
  }

  const rawExt = match[1].toLowerCase();
  let ext = 'jpg';
  if (rawExt === 'png') ext = 'png';
  else if (rawExt === 'webp') ext = 'webp';

  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Límite de 10 MB tras compresión
  if (buffer.length > 10 * 1024 * 1024) {
    res.status(400).json({ error: 'La fotografía supera el límite máximo permitido (10 MB).' });
    return;
  }

  const safeId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const targetFile = `${safeId}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, targetFile);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error guardando imagen:', err);
      res.status(500).json({ error: 'No se pudo guardar la fotografía en el servidor.' });
      return;
    }

    const publicUrl = `/uploads/${targetFile}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: targetFile,
      size: buffer.length
    });
  });
});

// Iniciar servidor con Vite en desarrollo o estático en producción
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DIMARA server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start DIMARA server:', err);
  process.exit(1);
});
