const uniq = require( "lodash.uniq" );
const union = require( "lodash.union" );
const concat = require( "lodash.concat" );

class FontStatsGsub {
	constructor(gsubObj) {
		this.gsubObj = gsubObj;
	}

	get gsub() {
		return this.gsubObj;
	}

	getAllFeatures() {
		let features = [];
		let indeces = this.getAllFeatureIndeces();
		for( let index of indeces ) {
			features.push( this.gsub.features[ index ] );
		}
		return features;
	}

	getAllFeatureIndeces() {
		let indeces = [];
		for(let script of this.gsub.scripts) {
			indeces = union(indeces, script.script.defaultLangSys.featureIndexes);
			for(let record of script.script.langSysRecords) {
				indeces = union(indeces, record.langSys.featureIndexes);
			}
		}
		return indeces;
	}

	getFontFeatureSettings() {
		let settings = [];
		let features = this.gsub.features;
		for( let feature of features ) {
			if( feature.feature.lookupListIndexes.length ) {
				settings.push( feature.tag );
			}
		}
		return uniq(settings);
	}

	getLookupIndecesForTag(tag) {
		let indeces = [];
		let features = this.gsub.features;

		for( let feature of features ) {
			if( feature.tag === tag && feature.feature.lookupListIndexes.length ) {
				indeces = union( indeces, feature.feature.lookupListIndexes );
			}
		}

		return indeces;
	}

	getGlyphIndecesForTag(tag) {
		let lookupIndeces = this.getLookupIndecesForTag(tag);
		let lookups = this.getLookupsFromIndeces(lookupIndeces);
		let glyphIndeces = [];
		for( let lookup of lookups ) {
			glyphIndeces = union( glyphIndeces, this.getGlyphIndecesFromLookup(lookup));
		}
		return glyphIndeces;
	}

	getLookups() {
		return this.gsub.lookups;
	}

	getLookupsFromIndeces(indeces) {
		let lookups = [];
		for( let index of indeces ) {
			lookups.push(this.gsub.lookups[index]);
		}
		return lookups;
	}

	getGlyphIndecesFromLookup(lookup) {
		let glyphs = [];
		for( let subtable of lookup.subtables ) {
			if( subtable.ligatureSets ) {
				for( let ligatureSet of subtable.ligatureSets ) {
					for( let ligature of ligatureSet ) {
						let ligatureGlyphs = concat( [], this.getCoverageGlyphs(subtable.coverage), ligature.components );
						glyphs = union( glyphs, [ligatureGlyphs] );
					}
				}
			} else if( subtable.coverage ) {
				glyphs = union( glyphs, this.getCoverageGlyphs(subtable.coverage) );
			}
		}
		return glyphs;
	}

	getCoverageGlyphs(coverage) {
		if( coverage.format === 1 ) {
			return this.getGlyphsFormat1(coverage);
		} else if( coverage.format === 2 ) {
			return this.getGlyphsFormat2(coverage);
		// TODO types 3, 4, 5, 6, 7, 8
		} else if( coverage.format && coverage.format >= 3) {
			throw new Error( `Unsupported coverage format type ${coverage.format} (only types 1 and 2 are supported).`)
		}
		return [];
	}

	getGlyphsFormat1(coverage) {
		return coverage.glyphs;
	}

	getGlyphsFormat2(coverage) {
		let glyphs = [];
		for( let range of coverage.ranges ) {
			for( let start = range.start; start <= range.end; start++ ) {
				glyphs.push(start);
			}
		}
		return glyphs;
	}
}

module.exports = FontStatsGsub;