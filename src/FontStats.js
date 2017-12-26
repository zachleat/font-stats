const uniq = require("lodash.uniq");
const opentype = require("opentype.js");
const FontStatsGsub = require("./FontStatsGsub");
const CharacterSet = require("characterset");

let unicodeRangeSubsets = {
	"cyrillic-ext": CharacterSet.parseUnicodeRange("U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F"),
	"cyrillic": CharacterSet.parseUnicodeRange("U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116"),
	"greek-ext": CharacterSet.parseUnicodeRange("U+1F00-1FFF"),
	"greek": CharacterSet.parseUnicodeRange("U+0370-03FF"),
	"vietnamese": CharacterSet.parseUnicodeRange("U+0102-0103, U+0110-0111, U+1EA0-1EF9, U+20AB"),
	"latin-ext": CharacterSet.parseUnicodeRange("U+0100-024F, U+0259, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF"),
	"latin": CharacterSet.parseUnicodeRange("U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2212, U+2215"),
};

class FontStats {
	constructor(path) {
		this.path = path;
		this.font = opentype.loadSync(path);
		this.gsub = new FontStatsGsub(this.font.tables.gsub);
	}

	get name() {
		return this.font.names.fontFamily.en;
	}

	get stats() {
		let chars = this.getCharacters();
		return {
			id: this.font.names.uniqueID.en,
			name: this.name,
			metadata: this.font.names,
			glyphCount: this.font.numGlyphs,
			characterCount: chars.length,
			fontFeatureSettings: this.getFontFeatureSettings(),
			ligatures: this.getLigatureStrings(),
			unicodeRange: this.getUnicodeRange(),
			unicodeRangeSubsets: this.getUnicodeRangeSubsets(),
			characters: chars
		};
	}

	_getGlyphSet() {
		return this.font.glyphs;
	}

	getCharacters() {
		return this.getUnicodes().map(function(char) {
			return {
				unicode: char,
				character: String.fromCharCode(char)
			}
		});
	}

	getUnicodes() {
		return this.getUnicodesFromGlyphs( this._getGlyphSet().glyphs );
	}

	getCharacterSet() {
		let codes = this.getUnicodes();
		return new CharacterSet( codes );
	}

	getSubsetCharacterSets() {
		let set = this.getCharacterSet();
		let keys = [ "cyrillic-ext", "cyrillic", "greek-ext", "greek", "vietnamese", "latin-ext", "latin" ];
		let obj = {};
		for( let key of keys ) {
			obj[ key ] = set.intersect(unicodeRangeSubsets[key]);
		}

		return obj;
	}

	getUnicodeRangeSubsets() {
		let sets = this.getSubsetCharacterSets();
		let ranges = {};
		for( let key in sets ) {
			ranges[key] = sets[key].toHexRangeString();
		}
		return ranges;
	}

	getUnicodeRange() {
		return this.getCharacterSet().toHexRangeString();
	}

	getLigatureCodePoints() {
		return this.gsub.getGlyphIndecesForTag("liga").map(function(indeces) {
			return this.getUnicodesFromIndeces(indeces);
		}.bind(this));
	}

	getLigatureStrings() {
		return this.getLigatureCodePoints().map(function(ligature) {
			return String.fromCharCode(...ligature);
		});
	}

	// glyphs is an obj not an array
	getUnicodesFromGlyphs(glyphs, mapFunc) {
		let unicodes = [];
		for( let j in glyphs ) {
			let mapped = mapFunc ? mapFunc(glyphs[j]) : glyphs[j];
			if( mapped !== false && mapped.unicode ) {
				unicodes.push( mapped.unicode );
			}
		}
		return unicodes;
	}

	getUnicodesFromIndeces(glyphIndeces) {
		return glyphIndeces.map(function(index) {
			return this.getGlyphFromIndex(index).unicode;
		}.bind(this));
	}

	getGlyphFromIndex(glyphIndex) {
		let glyph = this._getGlyphSet().glyphs[ glyphIndex ];
		if( !glyph ) {
			throw new Error( `glyphIndex ${glyphIndex} is out of range for ${this.name}`);
		}

		return glyph;
	}

	getFontFeatureSettings() {
		return this.gsub.getFontFeatureSettings();
	}

	hasFontFeatureSetting(tag) {
		return this.gsub.getLookupIndecesForTag(tag).length > 0;
	}
}

module.exports = FontStats;
