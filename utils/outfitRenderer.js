// utils/outfitRenderer.js
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs').promises;
const { getColorRgb } = require('./colorMap');

/* Diretório onde você salvou as PNGs geradas do .spr */
const SPRITES_DIR = path.join(__dirname, '../public/assets/images/characters');

/* Cores-chave das máscaras (6ª coluna)           */
const MASK_COLORS_REF = {
  head : { r: 255, g:   0, b:   0 }, // vermelho
  body : { r:   0, g: 255, b:   0 }, // verde
  legs : { r: 255, g: 255, b:   0 }, // amarelo
  feet : { r:   0, g:   0, b: 255 }  // azul
};

const COLOR_TOLERANCE = 10;   // ±10 → aceita pequenas variações
const TOTAL_COLUMNS   = 8;    // sprite OT padrão 8 colunas
const BASE_COL        = 4;    // 5ª coluna (índice 4) = sprite de frente
const MASK_COL        = 5;    // 6ª coluna (índice 5) = máscara

/* Utilitário para comparar cores com tolerância */
const areClose = (c1, c2, tol) =>
  Math.abs(c1.r - c2.r) <= tol &&
  Math.abs(c1.g - c2.g) <= tol &&
  Math.abs(c1.b - c2.b) <= tol;

/* Blend multiply  → mantém sombreado da sprite base                    *
 * Fórmula: out = base * (target / 255)                                 */
const multiplyTint = (base, target) => ({
  r: Math.round((base.r * target.r) / 255),
  g: Math.round((base.g * target.g) / 255),
  b: Math.round((base.b * target.b) / 255),
  a: base.a
});

/* Gera PNG 64×64 do look informado                                     */
async function renderOutfit ({ looktype, lookhead, lookbody, looklegs, lookfeet }) {
  /* 1. localiza o arquivo da sprite                                     */
  const fileName = `outfit_${looktype}.png`;
  let spritePath = path.join(SPRITES_DIR, fileName);

  try { await fs.access(spritePath); }
  catch {
    spritePath = path.join(SPRITES_DIR, 'outfit_128.png'); // fallback
    await fs.access(spritePath);                           // lança se não existir
  }

  /* 2. lê a imagem bruta                                                */
  const { data: raw, info: meta } = await sharp(spritePath).raw().toBuffer({ resolveWithObject: true });

  const frameSize = Math.floor(meta.width / TOTAL_COLUMNS);   // normalmente 64
  const rows      = Math.floor(meta.height / frameSize);      // 3 ou 4 linhas

  const outW = frameSize;
  const outH = frameSize * rows;
  const out  = Buffer.alloc(outW * outH * 4);

  /* 3. converte índices de cor (0-131) → RGB                            */
  const target = {
    head: getColorRgb(lookhead),
    body: getColorRgb(lookbody),
    legs: getColorRgb(looklegs),
    feet: getColorRgb(lookfeet)
  };

  /* 4. loop nos pixels que interessam                                   */
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {

      const baseX = BASE_COL * frameSize + x;   // coluna 5
      const maskX = MASK_COL   * frameSize + x; // coluna 6

      const baseOff = (y * meta.width + baseX) * meta.channels;
      const maskOff = (y * meta.width + maskX) * meta.channels;

      const basePx = {
        r: raw[baseOff    ],
        g: raw[baseOff + 1],
        b: raw[baseOff + 2],
        a: raw[baseOff + 3]
      };

      const maskPx = {
        r: raw[maskOff    ],
        g: raw[maskOff + 1],
        b: raw[maskOff + 2]
      };

      let final = basePx; // default: sem cor (ex.: outline preto)

      if (areClose(maskPx, MASK_COLORS_REF.head, COLOR_TOLERANCE))
        final = multiplyTint(basePx, target.head);
      else if (areClose(maskPx, MASK_COLORS_REF.body, COLOR_TOLERANCE))
        final = multiplyTint(basePx, target.body);
      else if (areClose(maskPx, MASK_COLORS_REF.legs, COLOR_TOLERANCE))
        final = multiplyTint(basePx, target.legs);
      else if (areClose(maskPx, MASK_COLORS_REF.feet, COLOR_TOLERANCE))
        final = multiplyTint(basePx, target.feet);

      const outOff = (y * outW + x) * 4;
      out[outOff    ] = final.r;
      out[outOff + 1] = final.g;
      out[outOff + 2] = final.b;
      out[outOff + 3] = final.a;
    }
  }

  /* 5. corta só o 1º frame da frente e redimensiona pra 64×64           */
  return sharp(out, { raw: { width: outW, height: outH, channels: 4 } })
    .extract({ left: 0, top: 0, width: frameSize, height: frameSize })
    .resize(64, 64, { kernel: 'nearest' })
    .png()
    .toBuffer();
}

module.exports = { renderOutfit };
