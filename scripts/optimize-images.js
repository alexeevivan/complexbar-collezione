// scripts/optimize-images.js
// Запускается ПОСЛЕ webpack (см. "build" в package.json):
//  1) конвертирует PNG/JPG из dist/assets/img в WebP,
//  2) удаляет оригиналы из dist (в src они остаются нетронутыми),
//  3) переписывает ссылки .png/.jpg -> .webp в dist (html, css, js),
//  4) предупреждает о ссылках на файлы, которых в dist нет.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIST = path.resolve(__dirname, '../dist');
const IMG_DIR = path.join(DIST, 'assets', 'img');

// Эти файлы не конвертируем (превью в соцсетях и favicon лучше оставлять в PNG/JPG)
const KEEP = [/favicon/i, /apple-touch/i, /og[-_]?image/i];

const RASTER = /\.(png|jpe?g)$/i;
const TEXT_EXT = new Set(['.html', '.css', '.js']);
// Ссылка вида assets/img/... .png|.jpg|.jpeg (подходит и для ../assets/img/... в CSS)
const REF = /assets\/img\/[^"'()\s?#<>]+?\.(?:png|jpe?g)/gi;

function walk(dir) {
	const out = [];
	if (!fs.existsSync(dir)) return out;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

const relFromDist = (file) => path.relative(DIST, file).split(path.sep).join('/');

async function main() {
	if (!fs.existsSync(DIST)) {
		throw new Error('Папка dist не найдена. Сначала выполните сборку webpack.');
	}

	const converted = new Set(); // например 'assets/img/recipes/Book.jpg'
	let sizeBefore = 0;
	let sizeAfter = 0;

	// 1–2. Конвертация и удаление оригиналов
	for (const file of walk(IMG_DIR)) {
		if (!RASTER.test(file) || KEEP.some((re) => re.test(file))) continue;

		const webpFile = file.replace(RASTER, '.webp');
		const isPng = /\.png$/i.test(file);

		await sharp(file)
			.rotate() // учитываем EXIF-ориентацию (sharp по умолчанию её теряет)
			.webp(isPng ? { quality: 85, alphaQuality: 100 } : { quality: 80 })
			.toFile(webpFile);

		sizeBefore += fs.statSync(file).size;
		sizeAfter += fs.statSync(webpFile).size;
		fs.unlinkSync(file);
		converted.add(relFromDist(file));
	}

	// 3–4. Правка ссылок и проверка битых
	const missing = new Set();
	let changedFiles = 0;

	for (const file of walk(DIST)) {
		if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;

		const source = fs.readFileSync(file, 'utf8');
		const result = source.replace(REF, (match) => {
			if (converted.has(match)) return match.replace(RASTER, '.webp');
			if (!fs.existsSync(path.join(DIST, match))) {
				missing.add(`${relFromDist(file)}  →  ${match}`);
			}
			return match;
		});

		if (result !== source) {
			fs.writeFileSync(file, result);
			changedFiles++;
		}
	}

	const kb = (n) => (n / 1024).toFixed(0);
	console.log(
		`[optimize-images] конвертировано: ${converted.size}, ` +
		`${kb(sizeBefore)} КБ → ${kb(sizeAfter)} КБ, ` +
		`обновлено файлов со ссылками: ${changedFiles}`
	);

	if (missing.size > 0) {
		console.warn('[optimize-images] ВНИМАНИЕ: ссылки на несуществующие файлы (проверьте регистр имён и динамические пути):');
		for (const item of missing) console.warn('  - ' + item);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});