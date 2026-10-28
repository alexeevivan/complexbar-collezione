const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../src/assets/img');

async function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await walk(full);
		} else if (/\.(png|jpe?g)$/i.test(entry.name)) {
			const out = full.replace(/\.(png|jpe?g)$/i, '.webp');
			if (fs.existsSync(out)) continue;
			await sharp(full).webp({ quality: 80 }).toFile(out);
			console.log('→', path.relative(root, out));
		}
	}
}

walk(root);