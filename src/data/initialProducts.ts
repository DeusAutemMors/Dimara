import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'demo-vestido-degrade-dimara',
    name: 'Vestido Midi Degradé DIMARA',
    description: 'Vestido midi de silueta ceñida con efecto degradé tonal y cuello mock contemporáneo. Una prenda exclusiva para lucir un look único y sofisticado.',
    priceCOP: 189000,
    category: 'Vestidos',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Degradé Tonal', 'Arena'],
    images: [
      '/assets/aistudio/image_abdd3463.png'
    ],
    featured: true,
    isNew: true,
    status: 'published',
    availability: 'available',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now(),
  },
  {
    id: 'demo-chaqueta-oversize',
    name: 'Chaqueta Oversize',
    description: 'Chaqueta bomber oversize en efecto cuero tono borgoña/chocolate. Cuello camisero clásico, cremallera frontal, bolsillos laterales y terminaciones elásticas en pretina y puños para una silueta contemporánea y sofisticada.',
    priceCOP: 195000,
    category: 'Chaquetas y Abrigos',
    sizes: ['S', 'M', 'L', 'Talla única'],
    colors: ['Chocolate Borgoña'],
    images: [
      '/assets/aistudio/image_e7ab0bee.png'
    ],
    featured: true,
    isNew: true,
    status: 'published',
    availability: 'available',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now(),
  },
  {
    id: 'demo-pantalon-palazzo-cafe',
    name: 'Pantalón Palazzo Fluido Mocca',
    description: 'Pantalón sastre de bota ancha con pinzas profundas y pretina alta reforzada. Textura con peso noble que favorece la caída y estiliza la figura. Incluye bolsillos laterales funcionales tipo ojal.',
    priceCOP: null, // Ejemplo de "Consultar precio"
    category: 'Pantalones',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Mocca Suave', 'Negro'],
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=85'
    ],
    featured: true,
    isNew: false,
    status: 'published',
    availability: 'available',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'demo-conjunto-california',
    name: 'Conjunto Casual California',
    description: 'Crop top blanco estampado “California”\n🧥 Suéter tejido verde (ideal para llevar al hombro o abrigar en las tardes)\n👖 Short en denim clásico',
    priceCOP: 175000,
    category: 'Conjuntos',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blanco, Verde y Denim'],
    images: [
      '/assets/aistudio/image_58e89ac0.png'
    ],
    featured: true,
    isNew: true,
    status: 'published',
    availability: 'available',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now(),
  },
  {
    id: 'demo-enterizo-minimal-negro',
    name: 'Enterizo Minimalista Escote Cruzado',
    description: 'Pieza de diseño integral con escote drapeado cruzado y cinturón de la misma tela. Pierna recta amplia confeccionada en crepé liviano de alto confort. Ideal para eventos nocturnos o cóctel.',
    priceCOP: 220000,
    category: 'Enterizos',
    sizes: ['S', 'M', 'L'],
    colors: ['Negro Azabache'],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    ],
    featured: false,
    isNew: false,
    status: 'published',
    availability: 'sold_out', // Prenda de demostración agotada
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
  {
    id: 'demo-falda-midi-satinada',
    name: 'Falda Midi Satinada al Sesgo',
    description: 'Falda midi cortada al sesgo en satén sedoso de brillo sutil. Pretina elástica interna que no marca y movimiento fluido que acompaña cada paso.',
    priceCOP: 138000,
    category: 'Faldas',
    sizes: ['XS', 'S', 'M'],
    colors: ['Champaña', 'Negro'],
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=85'
    ],
    featured: false,
    isNew: false,
    status: 'published',
    availability: 'available',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 60 * 120,
  }
];
