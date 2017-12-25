const uniq = require("lodash.uniq");
const opentype = require("opentype.js");
const FontStatsGsub = require("./FontStatsGsub");
const CharacterSet = require("characterset");

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
