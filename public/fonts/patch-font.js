const opentype = require("opentype.js");
const fs = require("fs");
const path = require("path");

const fontPath = path.join(
  __dirname,
  "../goudy-master/goudy-bookletter-1911-master/GoudyBookletter1911.otf",
);
const outputPath = path.join(
  __dirname,
  "./GoudyBookletter1911-Regular-Patched.ttf",
);

if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

opentype.load(fontPath, (err, font) => {
  if (err) {
    console.error("Font could not be loaded: " + err);
    return;
  }

  const findGlyph = (name) => {
    return font.glyphs.glyphs[
      Object.keys(font.glyphs.glyphs).find(
        (k) => font.glyphs.glyphs[k].name === name,
      )
    ];
  };

  // Romanian characters to add:
  // Ș (0x0218), ș (0x0219), Ț (0x021A), ț (0x021B)

  // Find a template for the comma
  const commaTemplate =
    findGlyph("tcommaaccent") ||
    findGlyph("Tcommaaccent") ||
    findGlyph("comma") ||
    font.charToGlyph("ț");

  if (!commaTemplate) {
    console.error("Could find a comma template glyph");
    return;
  }

  const createCommaPatchedGlyph = (
    baseGlyph,
    name,
    unicode,
    xOffsetMult = 0.5,
  ) => {
    const baseWidth = baseGlyph.advanceWidth;

    // Clone the base glyph's path
    const newPath = new opentype.Path();
    baseGlyph.path.commands.forEach((cmd) => newPath.commands.push({ ...cmd }));

    // Identify comma contours (below baseline or specific commands)
    // In Goudy, the comma part from tcommaaccent is usually below y=0.
    const isFromComma = commaTemplate.name === "comma";
    const verticalShift = isFromComma ? -250 : 0;

    const templateCenter = commaTemplate.advanceWidth / 2;
    const baseCenter = baseGlyph.advanceWidth * xOffsetMult;
    const horizontalShift = baseCenter - templateCenter;

    commaTemplate.path.commands.forEach((cmd) => {
      // If from tcommaaccent, only take the bottom part. If from 'comma', take everything.
      if (!isFromComma && (cmd.y > 100 || cmd.y1 > 100 || cmd.y2 > 100)) return;

      const newCmd = { ...cmd };
      if (newCmd.x !== undefined) newCmd.x += horizontalShift;
      if (newCmd.y !== undefined) newCmd.y += verticalShift;
      if (newCmd.x1 !== undefined) newCmd.x1 += horizontalShift;
      if (newCmd.y1 !== undefined) newCmd.y1 += verticalShift;
      if (newCmd.x2 !== undefined) newCmd.x2 += horizontalShift;
      if (newCmd.y2 !== undefined) newCmd.y2 += verticalShift;
      newPath.commands.push(newCmd);
    });

    return new opentype.Glyph({
      name: name,
      unicode: unicode,
      advanceWidth: baseWidth,
      path: newPath,
    });
  };

  const SGlyph = findGlyph("S") || font.charToGlyph("S");
  const sGlyph = findGlyph("s") || font.charToGlyph("s");
  const TGlyph = findGlyph("T") || font.charToGlyph("T");
  const tGlyph = findGlyph("t") || font.charToGlyph("t");

  // Create all 4 characters
  const SComma = createCommaPatchedGlyph(SGlyph, "Scommaaccent", 0x0218);
  const sComma = createCommaPatchedGlyph(sGlyph, "scommaaccent", 0x0219);
  const TComma = createCommaPatchedGlyph(TGlyph, "Tcommaaccent", 0x021a);
  const tComma = createCommaPatchedGlyph(tGlyph, "tcommaaccent", 0x021b);

  // Add glyphs to the font
  [SComma, sComma, TComma, tComma].forEach((glyph) => {
    const index = font.glyphs.length;
    font.glyphs.push(index, glyph);
  });

  // Save
  const buffer = font.toArrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(
    "Font successfully patched with 4 Romanian characters and saved to " +
      outputPath,
  );
});
