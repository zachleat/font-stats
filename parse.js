const FontStatsDir = require("./src/FontStatsDir");
const log = require("better-log").setConfig({ depth: 10 });

let stats = new FontStatsDir("fonts/");
log( stats.fetchAll() );
