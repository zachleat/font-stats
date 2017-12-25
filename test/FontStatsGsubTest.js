import test from "ava";
import FontStats from "../src/FontStats";
import FontStatsGsub from "../src/FontStatsGsub";

test(t => {
	let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");

  t.truthy(opensans.gsub);
  t.is(opensans.gsub.getAllFeatureIndeces().length, 29);
});

test(t => {
	let roboto = new FontStats("./fonts/Roboto-Regular.ttf");
  t.is(roboto.gsub.getAllFeatureIndeces().length, 24);

	let features = roboto.gsub.getAllFeatures();
// console.log( features[0].tag, features[0].feature.lookupListIndexes );
	t.truthy(features.length);
});

test("getFontFeatureSettings", t => {
	let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");
  t.truthy( opensans.gsub.getFontFeatureSettings() );
});


test("getLookupIndecesForTag", t => {
	let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");

  t.deepEqual( opensans.gsub.getLookupIndecesForTag("liga"), [9]);
  t.deepEqual( opensans.gsub.getLookupIndecesForTag("lnum"), [7]);
  t.deepEqual( opensans.gsub.getLookupIndecesForTag("onum"), [2,3]);
  t.deepEqual( opensans.gsub.getLookupIndecesForTag("salt"), [0,1]);
});

test("getLookupIndecesForTag", t => {
	let roboto = new FontStats("./fonts/Roboto-Regular.ttf");

  t.deepEqual( roboto.gsub.getLookupIndecesForTag("frac"), [22,23,25]);
  t.deepEqual( roboto.gsub.getLookupIndecesForTag("liga"), [9,8]);
});

test("getLookupsFromIndeces", t => {
	let roboto = new FontStats("./fonts/Roboto-Regular.ttf");
  t.is( roboto.gsub.getLookupsFromIndeces([0])[0].lookupType, 1);
  t.is( roboto.gsub.getLookupsFromIndeces([2])[0].lookupType, 6);
});

test("getGlyphIndecesFromLookup Roboto", t => {
	let roboto = new FontStats("./fonts/Roboto-Regular.ttf");
	let lookups = roboto.gsub.getLookups();
  t.is( roboto.gsub.getGlyphIndecesFromLookup(lookups[0]).length, 250);
  t.is( roboto.gsub.getGlyphIndecesFromLookup(lookups[1]).length, 235);
  // t.is( roboto.gsub.getGlyphIndecesFromLookup(lookups[2]).length, 235);
});

test("getGlyphIndecesFromLookup OpenSans", t => {
	let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");
	let lookups = opensans.gsub.getLookups();
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[0]).length, 5);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[1]).length, 20);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[2]).length, 10);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[3]).length, 10);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[4]).length, 1);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[5]).length, 10);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[6]).length, 1);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[7]).length, 10);
  t.is( opensans.gsub.getGlyphIndecesFromLookup(lookups[8]).length, 4);
})

test("getGlyphIndecesForTag OpenSans", t => {
	let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");
	t.deepEqual( opensans.gsub.getGlyphIndecesForTag("onum"), [19,20,21,22,23,24,25,26,27,28,898]);
	t.deepEqual( opensans.gsub.getGlyphIndecesForTag("liga"), [[73,73,79], [73,73,76], [73,73], [73,79], [73, 76]]);
});