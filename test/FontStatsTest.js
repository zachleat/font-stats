import test from "ava";
import FontStats from "../src/FontStats";
import CharacterSet from "characterset";

let opensans = new FontStats("./fonts/OpenSans-Regular.ttf");
let roboto = new FontStats("./fonts/Roboto-Regular.ttf");
let eightbit = new FontStats("./fonts/8BitArtSansNeue.ttf");
let lato = new FontStats("./fonts/LatoLatin-Regular.ttf");

test(t => {
  t.truthy(opensans._getGlyphSet().length);
  t.truthy(opensans.getUnicodes().length);
  t.truthy(opensans.getUnicodeRange());
});

test(t => {
  // throws on missing characters
  t.throws(() => {
    opensans.getUnicodesFromString("❤️")
  });
});

test("getGlyphsFromIndex", t => {
  t.is(opensans.getGlyphFromIndex(36).name, "A");
  t.is(opensans.getGlyphFromIndex(36).unicode, parseInt(0x0041, 10));

  t.is(opensans.getGlyphFromIndex(0).name, ".notdef");
  t.is(opensans.getGlyphFromIndex(0).unicode, undefined);

  t.is(opensans.getGlyphFromIndex(918).name, "I");
  t.is(opensans.getGlyphFromIndex(918).unicode, 73);
  t.is(opensans.getGlyphFromIndex(44).name, "I.alt");
  t.is(opensans.getGlyphFromIndex(44).unicode, undefined);
});

test("getFontFeatureSettings", t => {
  t.truthy( opensans.getFontFeatureSettings() );
  t.true( opensans.hasFontFeatureSetting("liga") );
  t.false( opensans.hasFontFeatureSetting("sdlkjf") );
});

test("getLigatureCodePoints", t => {
  t.deepEqual( String.fromCharCode(102,102,108), "ffl" );
  t.deepEqual( String.fromCharCode(102,102,105), "ffi" );
  t.deepEqual( String.fromCharCode(102,102), "ff" );
  t.deepEqual( String.fromCharCode(102,108), "fl" );
  t.deepEqual( String.fromCharCode(102,105), "fi" );

  t.deepEqual( opensans.getLigatureCodePoints()[0], [102,102,108] );
  t.deepEqual( opensans.getLigatureCodePoints()[1], [102,102,105] );
  t.deepEqual( opensans.getLigatureCodePoints()[2], [102,102] );
  t.deepEqual( opensans.getLigatureCodePoints()[3], [102,108] );
  t.deepEqual( opensans.getLigatureCodePoints()[4], [102,105] );
});
