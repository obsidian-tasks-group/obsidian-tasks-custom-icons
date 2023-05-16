const path = require('node:path');
const fs = require('node:fs');
const webfont = require('webfont').webfont;
/*
    https://github.com/itgalaxy/webfont
    https://github.com/nfroidure/svgicons2svgfont
    https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AEmoji%3DYes%3A%5D&g=&i=
    https://publish.obsidian.md/tasks/Reference/Task+Formats/Tasks+Emoji+Format

    Obsidian Tasks Custom Icons
    https://github.com/replete
*/

const getDirectories = (path) => fs.readdirSync(path).filter(file => fs.statSync(`${path}/${file}`).isDirectory());
const iconFontFolders = getDirectories(__dirname).filter(dir => !dir.match(/\.git|node_modules/));

iconFontFolders.forEach(iconFontFolderName => {
    const [ iconFontName ] = path.parse(iconFontFolderName).name.split('-');
    let iconSetGlyphs = [];
    webfont({
        files: `${__dirname}/${iconFontFolderName}/*.svg`,
        fontName: iconFontName,
        formats: ['woff2'],
        ligatures: false,
        normalize: true,
        verbose: false,
        fontHeight:2000,
        glyphTransformFn: (glyphData) => {
            iconSetGlyphs.push({
                ...glyphData,
                filename: path.parse(glyphData.path).name + '.svg',
                code: path.parse(glyphData.path).name.split('-')[0].substring(1)
            });
            return glyphData
        }
    })
    .then((result) => {
        const woff2 = Buffer.from(result.woff2);

        const iconLicenseInformation = !fs.existsSync(`${__dirname}/${iconFontFolderName}/LICENSE.TXT`) ? '' : `/*
${fs.readFileSync(`${__dirname}/${iconFontFolderName}/LICENSE.TXT`).toString()}
*/
`;
        const fontFaceCSS = `${iconLicenseInformation}@font-face {
    font-family: '${iconFontName}';
    src: url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
    unicode-range: ${iconSetGlyphs.map(g => `U+${g.code}`).join(', ')};
}
`;
        const ImplementationCSS = `${fontFaceCSS}
span.tasks-list-text,
.cm-line:has(.task-list-label) .cm-list-1 {
    font-family: '${iconFontName}', var(--font-text);
}`;
        const demoHTML = `<!DOCTYPE html>
<style>
    ${fontFaceCSS}
    tr td:last-child {font-family: '${iconFontName}', sans-serif; text-align:center}
    td {padding:0 4px;}
</style>
<table><tbody>
${iconSetGlyphs.map(g => `<tr><td>${g.unicode[0]}</td><td>${g.filename}</td><td>U+${g.code}</td><td>${g.unicode[0]}</td></tr>`).join('')}</tbody></table>`;

        // Write demo file to disk:
        fs.writeFileSync(`${__dirname}/${iconFontFolderName}/${iconFontFolderName}.html`, demoHTML);

        // Write CSS snippet file to disk:
        fs.writeFileSync(`${__dirname}/${iconFontFolderName}/${iconFontFolderName}.css`, ImplementationCSS);

        const cspPath = `${__dirname}/${iconFontFolderName}/copysnippetpath.txt`;
        if (fs.existsSync(cspPath)) {
            const cspTargetPath = fs.readFileSync(cspPath).toString();
            if (fs.existsSync(cspTargetPath)) {
                const cspTargetSnippetFilepath = `${cspTargetPath}${iconFontFolderName}.css`;
                fs.writeFileSync(cspTargetSnippetFilepath, ImplementationCSS);
                console.log(`csp: Copied '${iconFontFolderName}.css' to ${cspTargetSnippetFilepath}`)
            } else {
                console.log(`csp: Target path '${cspTargetPath}' does not exist, ignoring.`)
            }
        }
        // Write binary font file to disk:
        fs.writeFileSync(`${__dirname}/${iconFontFolderName}/${iconFontFolderName}.woff2`, woff2, 'binary');
        console.log(`Created webfont '${iconFontFolderName}'`);
    })
    .catch((error) => {
        throw error
    });
});
