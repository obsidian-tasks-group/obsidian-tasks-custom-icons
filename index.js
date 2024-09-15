const path = require('path');
const fs = require('fs');
const webfont = require('webfont').webfont;

const getDirectories = (path) => fs.readdirSync(path).filter(file => fs.statSync(`${path}/${file}`).isDirectory());
const { version, url, name } = require('./package.json');
/*
https://github.com/itgalaxy/webfont
https://github.com/nfroidure/svgicons2svgfont
https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AEmoji%3DYes%3A%5D&g=&i=
https://publish.obsidian.md/tasks/Reference/Task+Formats/Tasks+Emoji+Format

Obsidian Tasks Custom Icons
https://github.com/obsidian-tasks-group/obsidian-tasks-custom-icons
*/

const testingVaultPath = path.resolve('./_vault/.obsidian/snippets/');

const iconFontFolders = getDirectories(__dirname).filter(dir => !dir.match(/\.git|node_modules|_vault/));
iconFontFolders.forEach(folderName => {
    const folderPath = `${__dirname}/${folderName}`;
    const [ fontName ] = path.parse(folderName).name.split('-');
    let glyphs = [];
    webfont({
        files: `${folderName}/*.svg`,
        fontName: fontName,
        formats: ['woff2', 'svg'],
        ligatures: false,
        normalize: true,
        verbose: false,
        fontHeight:2000,
        glyphTransformFn: (glyphData) => {
            glyphs.push({
                ...glyphData,
                filename: path.parse(glyphData.path).name + '.svg',
                code: path.parse(glyphData.path).name.split('-')[0].substring(1)
            });
            return glyphData
        }
    })
    .then(result => render(result, folderName, folderPath, fontName, glyphs))
    .catch(error => { throw error });
});

function render(result, folderName, folderPath, fontName, glyphs) {
	const woff2 = Buffer.from(result.woff2);
	const headerCSS = fs.existsSync(`${folderPath}/LICENSE.TXT`) ?
`/*!
${fs.readFileSync(`${folderPath}/LICENSE.TXT`).toString()}
*/` : '';
	const fontFaceCSS =
`${headerCSS}
@font-face {
	font-family: '${fontName}';
	src:url('data:image/svg+xml;charset=utf-8,${result.svg.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()}') format('svg),
		url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
	unicode-range: ${glyphs.map(g => `U+${g.code}`).join(', ')};
	/* ${glyphs.map(g => `${g.unicode[0]}`).join(', ')} */
	/*! Generator: ${name} v${version} ${url} */
}
`;
	const implementationCSS =
`${fontFaceCSS}

span.tasks-list-text,
.cm-line:has(.task-list-label) [class^=cm-list-],
span.task-extras,
.tasks-postpone,
.tasks-backlink,
.tasks-edit:after {
	font-family: '${fontName}', var(--font-text);
}
span.task-extras {
	display: inline-flex;
	align-items: flex-start;
	margin-left: 0.33em;
}
`;
	const demoHTML =
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${folderName} Demo </title>
	<style>

	@font-face {
		font-family: '${fontName}';
		src: url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
		unicode-range: ${glyphs.map(g => `U+${g.code}`).join(', ')};
		/* ${glyphs.map(g => `${g.unicode[0]}`).join(', ')} */
		/*! Generator: ${name} v${version} ${url} */
	}
		html {font-family: sans-serif}
		table {width:100%; max-width: 600px}
		tr td:last-child {font-family: '${fontName}', sans-serif; font-size:120%}
		td, th {padding:6px 4px 4px 4px; border-top: 1px solid #ccc}
		td img {height:28px; width:28px;}
		th {text-align:left}
	</style>
</head>
<body>
	<h1>${folderName}</h1>
	<small>Iconfont column should display the same icon as SVG column</small><br>
	<table>
		<thead>
			<tr>
				<th>SVG</th>
				<th>Filename</th>
				<th>Codepoint</th>
				<th>Emoji</th>
				<th>Iconfont</th>
			</tr>
		</thead>
		<tbody>
			${glyphs.map(g => `<tr>
				<td><img src="${g.filename}"/></td>
				<td>${g.filename}</td>
				<td>U+${g.code}</td>
				<td>${g.unicode[0]}</td>
				<td>${g.unicode[0]}</td>
			</tr>`).join('')}
		</tbody>
	</table>
</body>
</html>`;

	console.log(`Created '${folderName}' webfont:`);

	// Write CSS snippet file to disk:
	fs.writeFileSync(`${folderPath}/${folderName}.css`, implementationCSS);
	console.log(`...Saved ${folderName}.css to ./${folderName}/`)

	// Write demo file to disk:
	fs.writeFileSync(`${folderPath}/${folderName}.html`, demoHTML);
	console.log(`...Saved ${folderName}.html to ./${folderName}/`)

	/*
		If copysnippetpath.txt exists inside a icon font folder, the directory path inside
		will have a copy of the obsidian snippet .css file copied to, overwriting it.
		Optional convenience feature to copy snippets while you are working on an icon set
		to your home obsidian vault for testing.
	*/
	const cspPath = path.resolve(`${folderPath}/copysnippetpath.txt`)
	if (fs.existsSync(cspPath)) {
		const cspTargetPath = fs.readFileSync(cspPath).toString().trim();
		const resolvedCspTargetPath = path.resolve(cspTargetPath)
		if (fs.existsSync(resolvedCspTargetPath)) {
			const cspTargetSnippetFilepath = `${resolvedCspTargetPath}/${folderName}.css`;
			fs.writeFileSync(cspTargetSnippetFilepath, implementationCSS);
			console.log(`...csp: Copied '${folderName}.css' snippet to ${cspTargetSnippetFilepath}`)
		} else {
			console.log(`...csp: Target path '${cspTargetPath}' does not exist, ignoring.`)
		}
	}

	// Write binary font file to disk (unused by generated HTML CSS snipets, purely for theme developers):
	fs.writeFileSync(`${folderPath}/${folderName}.woff2`, woff2, 'binary');
	console.log(`...Saved ${folderName}.woff2 to ./${folderName}/`)

	// Copy CSS snippet to repo testing vault in _vault
	fs.writeFileSync(`${testingVaultPath}/${folderName}.css`, implementationCSS);
	console.log(`...Duped ${folderName}.css at ./_vault/.obsidian/snippets/`)
}
