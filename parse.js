const FontStatsDir = require("./src/FontStatsDir");

(async function() {
	let stats = new FontStatsDir("fonts/");
	console.log( stats.fetchAll() );
})();
