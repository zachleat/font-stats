const FontStatsDir = require("./src/FontStatsDir");

let stats = new FontStatsDir("fonts/");
console.log( stats.fetchAll() );
