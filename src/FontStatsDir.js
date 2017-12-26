const globby = require("globby");
const FontStats = require("./FontStats");

class FontStatsDir {
	constructor(dir) {
		this.dir = dir;
		this.glob = dir + "**/*.ttf";
	}

	getFileList() {
		return globby.sync(this.glob);
	}

	generateStats(fonts) {
		let stats = {};
		for(let font of fonts) {
			stats[font.stats.id] = font.stats;
		}
		return stats;
	}

	fetchAll() {
		let paths = this.getFileList();
		let fonts = [];
		for (let path of paths) {
			fonts.push(new FontStats(path));
		}
		let stats = this.generateStats(fonts);
		return stats;
	}
}

module.exports = FontStatsDir;
