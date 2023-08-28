/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/
import Gm from "gm";
import { Dimensions } from "./Dimensions.js";
import { Space } from "./Space.js";

const COLOURS = [
  "000000", // Black
  "00009C", // Duke blue
  "0000FF", // Blue
  "0018A8", // Blue (Pantone
  "0040FF", // Cerulean (RGB
  "0048BA", // Absolute Zero
  "004B49", // Deep jungle green
  "006400", // Dark green (X11
  "006B3C", // Cadmium green
  "0072BB", // French blue
  "007BA7", // Cerulean
  "007FFF", // Azure
  "0087BD", // Blue (NCS
  "008B8B", // Dark cyan
  "0093AF", // Blue (Munsell
  "00B7EB", // Cyan (process
  "00BFFF", // Deep sky blue
  "00CC99", // Caribbean green
  "00CED1", // Dark turquoise
  "00FF40", // Erin
  "00FFFF", // Aqua
  "00FFFF", // Cyan
  "126180", // Blue sapphire
  "1560BD", // Denim
  "177245", // Dark spring green
  "1A2421", // Dark jungle green
  "1B1B1B", // Eerie black
  "1DACD6", // Cerulean (Crayola
  "1E90FF", // Dodger blue
  "1F75FE", // Blue (Crayola
  "2243B6", // Denim blue
  "228B22", // Forest green (web
  "2A52BE", // Cerulean blue
  "2E2D88", // Cosmic cobalt
  "2E5894", // B'dazzled blue
  "2F4F4F", // Dark slate gray
  "301934", // Dark purple
  "318CE7", // Bleu de France
  "333399", // Blue (pigment
  "36454F", // Charcoal
  "3B3C36", // Black olive
  "3B7A57", // Amazon
  "3C1414", // Dark sienna
  "3C69E7", // Bluetiful
  "3D0C02", // Black bean
  "3D2B1F", // Bistre
  "3DDC84", // Android green
  "483C32", // Dark lava
  "483D8B", // Dark slate blue
  "4A412A", // Drab dark brown
  "4A646C", // Deep Space Sparkle
  "4B3621", // Café noir
  "4B6F44", // Artichoke green
  "4F7942", // Fern green
  "5072A7", // Blue yonder
  "50C878", // Emerald
  "536878", // Dark electric blue
  "543D37", // Dark liver (horses
  "54626F", // Black coral
  "555555", // Davy's grey
  "555D50", // Ebony
  "556B2F", // Dark olive green
  "563C5C", // English violet
  "56A0D3", // Carolina blue
  "58427C", // Cyber grape
  "5D3954", // Dark byzantium
  "5DADEC", // Blue jeans
  "5F9EA0", // Cadet blue
  "614051", // Eggplant
  "6495ED", // Cornflower blue
  "654321", // Dark brown
  "660000", // Blood red
  "665D1E", // Antique bronze
  "6699CC", // Blue-gray (Crayola
  "683068", // Finn
  "696969", // Dim gray
  "6C3082", // Eminence
  "6C541E", // Field drab
  "6D9BC3", // Cerulean frost
  "6F4E37", // Coffee
  "702963", // Byzantium
  "703642", // Catawba
  "72A0C1", // Air superiority blue
  "77B5FE", // French sky blue
  "79443B", // Bole
  "7B3F00", // Chocolate (traditional
  "7BB661", // Bud green
  "7C0A02", // Barn red
  "7CB9E8", // Aero
  "7E5E60", // Deep taupe
  "7F1734", // Claret
  "7FFFD4", // Aquamarine
  "800020", // Burgundy
  "801818", // Falu red
  "80FF00", // Chartreuse (web
  "81613C", // Coyote brown
  "841B2D", // Antique ruby
  "848482", // Battleship grey
  "856088", // Chinese violet
  "856D4D", // French bistre
  "86608E", // French lilac
  "87421F", // Fuzzy Wuzzy
  "8806CE", // French violet
  "88540B", // Brown
  "893F45", // Cordovan
  "89CFF0", // Baby blue
  "8A2BE2", // Blue-violet
  "8A3324", // Burnt umber
  "8B0000", // Dark red
  "8B008B", // Dark magenta
  "8C92AC", // Cool grey
  "8CBED6", // Dark sky blue
  "8F00FF", // Electric violet
  "8FBC8F", // Dark sea green
  "915C83", // Antique fuchsia
  "91A3B0", // Cadet grey
  "9400D3", // Dark violet
  "954535", // Chestnut
  "960018", // Carmine
  "967117", // Bistre brown
  "96C8A2", // Eton blue
  "98817B", // Cinereous
  "9932CC", // Dark orchid
  "996666", // Copper rose
  "9966CC", // Amethyst
  "9C2542", // Big dip o’ruby
  "9E1B32", // Crimson (UA
  "9EFD38", // French lime
  "9F2B68", // Amaranth deep purple
  "9F8170", // Beaver
  "9FA91F", // Citron
  "A17A74", // Burnished brown
  "A1CAF1", // Baby blue eyes
  "A2006D", // Flirt
  "A2A2D0", // Blue bell
  "A3C1AD", // Cambridge blue
  "A57164", // Blast-off bronze
  "A67B5B", // Café au lait
  "A67B5B", // French beige
  "AA381E", // Chinese red
  "AB274F", // Amaranth purple
  "AB4B52", // English red
  "ACE1AF", // Celadon
  "ACE5EE", // Blizzard blue
  "AD6F69", // Copper penny
  "AF6E4D", // Brown sugar
  "B0BF1A", // Acid green
  "B22222", // Firebrick
  "B284BE", // African violet
  "B2BEB5", // Ash gray
  "B2FFFF", // Celeste
  "B31B1B", // Carnelian
  "B48395", // English lavender
  "B53389", // Fandango
  "B87333", // Copper
  "B8860B", // Dark goldenrod
  "B94E48", // Deep chestnut
  "B9D9EB", // Columbia Blue
  "BCD4E6", // Beau blue
  "BD33A4", // Byzantine
  "BDB76B", // Dark khaki
  "BF00FF", // Electric purple
  "BFAFB2", // Black Shadows
  "C154C1", // Fuchsia (Crayola
  "C19A6B", // Camel
  "C19A6B", // Desert
  "C19A6B", // Fallow
  "C2B280", // Ecru
  "C41E3A", // Cardinal
  "C46210", // Alloy orange
  "C72C48", // French raspberry
  "C95A49", // Cedar Chest
  "CAE00D", // Bitter lemon
  "CB4154", // Brick red
  "CB6D51", // Copper red
  "CC474B", // English vermillion
  "CC5500", // Burnt orange
  "CCFF00", // Electric lime
  "CD607E", // Cinnamon Satin
  "CD7F32", // Bronze
  "CD9575", // Antique brass
  "CE2029", // Fire engine red
  "D0FF14", // Arctic lime
  "D2691E", // Chocolate (web
  "D473D4", // French mauve
  "D70040", // Carmine (M&P
  "D891EF", // Bright lilac
  "DA1884", // Barbie Pink
  "DA3287", // Deep cerise
  "DA8A67", // Copper (Crayola
  "DB2D43", // Alizarin
  "DC143C", // Crimson
  "DE3163", // Cerise
  "DE5285", // Fandango pink
  "DE5D83", // Blush
  "DE6FA1", // China pink
  "DEB887", // Burlywood
  "E23D28", // Chili red
  "E25822", // Flame
  "E34234", // Cinnabar
  "E3DAC9", // Bone
  "E4717A", // Candy pink
  "E48400", // Fulvous
  "E4D00A", // Citrine
  "E5AA70", // Fawn
  "E68FAC", // Charm pink
  "E936A7", // Frostbite
  "E97451", // Burnt sienna
  "E9967A", // Dark salmon
  "E9D66B", // Arylide yellow
  "ED872D", // Cadmium orange
  "ED9121", // Carrot orange
  "EDC9AF", // Desert sand
  "EEDC82", // Flax
  "EFBBCC", // Cameo pink
  "EFDECD", // Almond
  "EFDFBB", // Dutch white
  "F0EAD6", // Eggshell
  "F0F8FF", // Alice blue
  "F0FFFF", // Azure (X11/web color
  "F19CBB", // Amaranth pink
  "F1DDCF", // Champagne pink
  "F4C2C2", // Baby pink
  "F56FA1", // Cyclamen
  "F5F5DC", // Beige
  "F5F5F5", // Cultured Pearl
  "F7E7CE", // Champagne
  "F88379", // Congo pink
  "F88379", // Coral pink
  "FAD6A5", // Deep champagne
  "FAE7B5", // Banana Mania
  "FAEBD7", // Antique white
  "FBCEB1", // Apricot
  "FBEC5D", // Corn
  "FD3F92", // French fuchsia
  "FD6C9E", // French pink
  "FDEE00", // Aureolin
  "FED85D", // Dandelion
  "FEFEFA", // Baby powder
  "FF00FF", // Fuchsia
  "FF1493", // Deep pink
  "FF3800", // Coquelicot
  "FF5470", // Fiery rose
  "FF7F50", // Coral
  "FF8C00", // Dark orange
  "FF91AF", // Baker-Miller pink
  "FF9933", // Deep saffron
  "FF9966", // Atomic tangerine
  "FFA6C9", // Carnation pink
  "FFAA1D", // Bright yellow (Crayola
  "FFB200", // Chinese yellow
  "FFB7C5", // Cherry blossom pink
  "FFBCD9", // Cotton candy
  "FFBF00", // Amber
  "FFC680", // Buff
  "FFD300", // Cyber yellow
  "FFE4C4", // Bisque
  "FFEBCD", // Blanched almond
  "FFEF00", // Canary yellow
  "FFF8DC", // Cornsilk
  "FFF8E7", // Cosmic latte
  "FFFAF0", // Floral white
  "FFFDD0", // Cream
  "FFFF99", // Canary
];

/**
 * A Layout is a complete background. A layout contains a list of
 * spaces. Each space may be an empty space, or an image space.
 * Empty spaces can overlap each other, image spaces cannot.
 */
class Layout extends Dimensions {

  static next_layout = 0;

  /**
   * @param {Dimensions} bounds size of layout
   * @param {Dimensions} minr minimum rectangle size
   */
  constructor(bounds, minr) {
    super(bounds);
    /**
     * Unique ID for the layout
     * @member {number}
     */
    this.id = Layout.next_layout++;
    /**
     * Minimum size for a Space in the Layout
     * @member {Dimensions}
     */
    this.minr = minr;
    /**
     * List of Spaces in the Layout
     * @member {Space[]}
     */
    this.spaces = [ new Space(this, bounds) ];
  }

  /**
   * Generate a string representation for debugging
   * @return {String} a string describing the image
   */
  toString() {
    return `{Layout ${this.name} `
    + this.spaces.map(sp => sp.toString()).join(" ") + "}";
  }

  /**
   * Get a unique name for the layout, usable for a filename.
   * @return {String} the name of the layout
   */
  get name() {
    return `layout${this.id}`;
  }

  /**
   * Add a space to this layout. It may overlap other spaces until it has
   * an image associated with it.
   * @param {Space} space space to add
   */
  add_space(space) {
    console.debug(`Add ${space.id} ${space.toString()} to ${this.name}`);
    this.spaces.push(space);
  }

  /**
   * Remove a space from this layout. This only happens when a space that
   * overlaps it is used.
   * @param {Space} space space to remove
   */
  remove_space(space) {
    console.debug(`\tRemove overlap ${space.toString()} from ${this.name}`);
    space.unlink_overlaps();
    const i = this.spaces.indexOf(space);
    if (i < 0)
      throw new Error("Tried to kill non-existant overlap");
    this.spaces.splice(i, 1);
  }

  /**
   * Where possible, collapse empty spaces into adjacent spaces. Then
   * remove any remaining empty spaces.
   * @param {boolean} filter_empty true to remove all empty spaces from
   * the final layout (leaving only locked spaces)
   * @return the number of spaces remaining
   */
  simplify(filter_empty) {
    console.debug(`Simplifying ${this.name}...`);
    // Extend spaces into adjacent empty spaces that share an edge
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < this.spaces.length;) {
        let folded = false;
        const spi = this.spaces[i];
        for (let j = 0; j < this.spaces.length; j++) {
          const spj = this.spaces[j];
          // Don't fold image spaces
          if (j === i || spj.lock) continue;
          switch (spi.mergeable(spj)) {
          case "LEFT":
            console.debug(`\tMerge left ${spj} into ${spi}`);
            spi.x = spj.x;
            spi.w += spj.w;
            this.remove_space(spj);
            folded = true;
            break;
          case "RIGHT":
            console.debug(`\tMerge right ${spj} into ${spi}`);
            spi.w += spj.w;
            this.remove_space(spj);
            folded = true;
            break;
          case "TOP":
            console.debug(`\tMerge top ${spj} into ${spi}`);
            spi.y = spj.y;
            spi.h += spj.h;
            this.remove_space(spj);
            folded = true;
            break;
          case "BOTTOM":
            console.debug(`\tMerge bottom ${spj} into ${spi}`);
            spi.h += spj.h;
            this.remove_space(spj);
            folded = true;
            break;
          }
          if (folded) {
            merged = true;
            break;
          }
        }
        if (!folded) i++;
      }
    }
    if (filter_empty) {
      const before = this.spaces.length;
      this.spaces = this.spaces.filter(sp => {
        if (!sp.lock) console.debug(`Filtering ${sp}\n`);
        return sp.lock;
      });
      if (this.spaces.length !== before)
        console.debug(`Filtered ${before - this.spaces.length} empty spaces`);
    }
    return this.spaces.length;
  }

  /**
   * Create an image built from the occupied spaces in the layout.
   * @param {String} destdir destination directory for layouts
   * @return {Promise} Promise that resolves when the image has been
   * composed.
   */
  construct_image(destdir) {
    const comf = `${destdir}/${this.name}.png`;

    // Create an initial blank image for the layout
    let promise = new Promise((resolve, reject) => {
      const bg = `#${COLOURS[this.id % COLOURS.length]}`;
      Gm(this.w, this.h, bg)
      .drawText(0, 0, this.name)
      .write(comf, e => {
        if (e)
          reject(e);
        else
          resolve();
      });
    });

    // Composite the individual spaces, scaling the images into
    // the target spaces
    for (const space of this.spaces) {
      if (!space.lock) continue;
      promise = promise
      .then(() => console.debug(`Compositing ${comf}`))
      .then(() => space.lock.scaled(space))
      .then(image => new Promise((resolve, reject) => {
        //console.debug(`\tadd ${space.lock.basename} at ${space.centre_offset(space.lock)}`);
        Gm(comf)
        .composite(image.path)
        .geometry(space.centre_offset(image))
        .write(comf, e => {
          if (e)
            reject(e);
          else
            resolve();
        });
      }));
    }

    return promise;
  }
}

export { Layout };
