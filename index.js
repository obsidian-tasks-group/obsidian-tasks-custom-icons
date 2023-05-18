const path = require('node:path');
const fs = require('node:fs');
const webfont = require('webfont').webfont;

const getDirectories = (path) => fs.readdirSync(path).filter(file => fs.statSync(`${path}/${file}`).isDirectory());
const { version, url, name } = require('./package.json');
/*
https://github.com/itgalaxy/webfont
https://github.com/nfroidure/svgicons2svgfont
https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AEmoji%3DYes%3A%5D&g=&i=
https://publish.obsidian.md/tasks/Reference/Task+Formats/Tasks+Emoji+Format

Obsidian Tasks Custom Icons
https://github.com/replete
*/

const iconFontFolders = getDirectories(__dirname).filter(dir => !dir.match(/\.git|node_modules/));
iconFontFolders.forEach(folderName => {
    const folderPath = `${__dirname}/${folderName}`;
    const [ fontName ] = path.parse(folderName).name.split('-');
    let glyphs = [];
    webfont({
        files: `${__dirname}/${folderName}/*.svg`,
        fontName: fontName,
        formats: ['woff2'],
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
    .then((result) => {
        const woff2 = Buffer.from(result.woff2);
        const headerCSS = `/*! 
${fs.existsSync(`${folderPath}/LICENSE.TXT`) ? 
    fs.readFileSync(`${folderPath}/LICENSE.TXT`).toString() : ''}
*/`;
        const fontFaceCSS = `${headerCSS}
@font-face {
    font-family: '${fontName}';
    src: url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
    unicode-range: ${glyphs.map(g => `U+${g.code}`).join(', ')};
    /* ${glyphs.map(g => `${g.unicode[0]}`).join(', ')} */
    /*! Generator: ${name} v${version} ${url} */
}
`;
        const ImplementationCSS = `${fontFaceCSS}
span.tasks-list-text,
.cm-line:has(.task-list-label) [class^=cm-list-] {
    font-family: '${fontName}', var(--font-text);
}`;
        const demoHTML = `<!DOCTYPE html>
<style>
${fontFaceCSS}
tr td:last-child {font-family: '${fontName}', sans-serif; text-align:center}
td {padding:0 4px;}
</style>
<table><tbody>
${glyphs.map(g => `<tr><td>${g.unicode[0]}</td><td>${g.filename}</td><td>U+${g.code}</td><td>${g.unicode[0]}</td></tr>`).join('')}</tbody></table>`;

        // Write demo file to disk:
        fs.writeFileSync(`${folderPath}/${folderName}.html`, demoHTML);

        // Write CSS snippet file to disk:
        fs.writeFileSync(`${folderPath}/${folderName}.css`, ImplementationCSS);

        const cspPath = `${folderPath}/copysnippetpath.txt`;
        if (fs.existsSync(cspPath)) {
            const cspTargetPath = fs.readFileSync(cspPath).toString();
            if (fs.existsSync(cspTargetPath)) {
                const cspTargetSnippetFilepath = `${cspTargetPath}${folderName}.css`;
                fs.writeFileSync(cspTargetSnippetFilepath, ImplementationCSS);
                console.log(`csp: Copied '${folderName}.css' to ${cspTargetSnippetFilepath}`)
            } else {
                console.log(`csp: Target path '${cspTargetPath}' does not exist, ignoring.`)
            }
        }
        // Write binary font file to disk:
        fs.writeFileSync(`${folderPath}/${folderName}.woff2`, woff2, 'binary');
        console.log(`Created '${folderName}' webfont`);
    })
    .catch((error) => {
        throw error
    });
});
