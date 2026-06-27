import pool from '../backend/src/config/db.js';

const IMAGES = {
  cabaña: [
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    'https://images.unsplash.com/photo-1621891924147-20ef1fc62e04?w=800',
  ],
  playa: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800',
    'https://images.unsplash.com/photo-1580584127374-51f5a3cc34e0?w=800',
    'https://images.unsplash.com/photo-1564419320508-b5f0e36f7734?w=800',
  ],
  piscina: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    'https://images.unsplash.com/photo-1576013551627-0cc20b1c2b0e?w=800',
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ],
  naturaleza: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    'https://images.unsplash.com/photo-1470071459604-7b8ec44ffd5a?w=800',
    'https://images.unsplash.com/photo-1518173946687-a36a968e1f5c?w=800',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  ],
  atardecer: [
    'https://images.unsplash.com/photo-1505881502353-a1986d3763d4?w=800',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    'https://images.unsplash.com/photo-1540206351-d2eda3f67975?w=800',
  ],
};

const fincaImages = {
  'AGUA AZUL': [...IMAGES.playa, ...IMAGES.atardecer],
  'CIELO MAR': [...IMAGES.piscina, ...IMAGES.playa],
  'LOS CALAMARES': [...IMAGES.playa, ...IMAGES.cabaña],
  'MAR CARIBE': [...IMAGES.playa, ...IMAGES.atardecer],
  'LOS DELFINES': [...IMAGES.piscina, ...IMAGES.naturaleza],
  'LAS ISLA': [...IMAGES.playa, ...IMAGES.cabaña],
  'LOS COCOS': [...IMAGES.cabaña, ...IMAGES.naturaleza],
  'LAS GOLONDRINAS': [...IMAGES.naturaleza, ...IMAGES.cabaña],
  'COSTA AZUL': [...IMAGES.playa, ...IMAGES.atardecer],
};

const SEED_PLACEHOLDER = 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL';

async function seed() {
  console.log('🌱 Iniciando seed de imágenes...\n');

  try {
    await pool.query(`ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT '{}'`);

    const result = await pool.query('SELECT id, nombre FROM alojamientos ORDER BY id');
    const fincas = result.rows;

    if (fincas.length === 0) {
      console.log('⚠️  No hay fincas registradas en la base de datos.');
      await pool.end();
      return;
    }

    console.log(`📋 Se encontraron ${fincas.length} fincas:\n`);

    let actualizadas = 0;

    for (const finca of fincas) {
      const nombreUpper = finca.nombre.toUpperCase().trim();
      const fotos = fincaImages[nombreUpper] || [...IMAGES.cabaña, ...IMAGES.naturaleza];

      const fotosFinales = fotos.slice(0, 4);

      const fotosConPlaceholder = fotosFinales.length > 0 ? fotosFinales : [SEED_PLACEHOLDER];

      await pool.query(
        'UPDATE alojamientos SET imagenes = $1 WHERE id = $2',
        [fotosConPlaceholder, finca.id],
      );

      console.log(`   ✅ ${finca.nombre.padEnd(20)} → ${fotosConPlaceholder.length} imágenes`);
      fotosConPlaceholder.forEach((url, i) => {
        console.log(`      ${i + 1}. ${url}`);
      });
      console.log('');

      actualizadas++;
    }

    console.log(`🎉 Proceso completado: ${actualizadas} fincas actualizadas exitosamente.`);
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
