const webfont = require('webfont').webfont;
const fs = require('fs');
/*
    https://github.com/itgalaxy/webfont
    https://github.com/nfroidure/svgicons2svgfont
    https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AEmoji%3DYes%3A%5D&g=&i=
    https://publish.obsidian.md/tasks/Reference/Task+Formats/Tasks+Emoji+Format

    Obsidian Tasks Custom Icons
    https://github.com/replete
*/

const FONTNAME = 'ObsidianTasksEmojis';
const SYMBOLS = {
    created: ['➕', 'U+2795'],
    scheduled: ['⏳', 'U+23F3'],
    start: ['🛫', 'U+1F6EB'],
    due: ['📅', 'U+1F4C5'],
    done: ['✅', 'U+2705'],
    low: ['🔽', 'U+1F53D'],
    medium: ['🔼', 'U+1F53C'],
    high: ['⏫', 'U+23EB'],
    recurring: ['🔁', 'U+1F501']
};

const getDirectories = (path) => fs.readdirSync(path).filter(file => fs.statSync(path+'/'+file).isDirectory());
const iconFolders = getDirectories(__dirname).filter(dir => !dir.match(/\.git|node_modules/));

iconFolders.forEach(folderName => {
    webfont({
        files: `${__dirname}/${folderName}/*.svg`,
        fontName: FONTNAME,
        formats: ['woff2'],
        ligatures: false,
        normalize: true,
        verbose: true,
        fontHeight:2000
    })
    .then((result) => {
        const woff2 = Buffer.from(result.woff2);
        const licenseComment = !fs.existsSync(`${__dirname}/${folderName}/LICENSE.TXT`) ? '' : `/*
${fs.readFileSync(`${__dirname}/${folderName}/LICENSE.TXT`).toString()}
*/
`;
        const fontFaceCSSDefinition = `${licenseComment}@font-face {
    font-family: '${FONTNAME}';
    src: url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
    unicode-range: ${Object.keys(SYMBOLS).map(i => SYMBOLS[i][1]).join(', ')};
}
`;
        const cssSnippetFileContents = `${fontFaceCSSDefinition}
span.tasks-list-text,
.cm-line:has(.task-list-label) .cm-list-1 {
    font-family: '${FONTNAME}', var(--font-text);
}`;

        const demoFileContents = `<!DOCTYPE html>
<style>
    ${fontFaceCSSDefinition}
    body {font-family: '${FONTNAME}', sans-serif}
</style>
${Object.keys(SYMBOLS).map(i => `${SYMBOLS[i][0]}${i}` ).join(' ')}`;

        // Write demo file to disk:
        fs.writeFileSync(`${__dirname}/${folderName}/demo.html`, demoFileContents);

        // Write CSS snippet file to disk:
        fs.writeFileSync(`${__dirname}/${folderName}/obsidian-tasks-${folderName}-icons.css`, cssSnippetFileContents);

        // Write copy of CSS snippet to another folder:
        const copySnippetPathFilePath = `${__dirname}/${folderName}/copysnippetpath.txt`;
        if (fs.existsSync(copySnippetPathFilePath)) {
            // this icon folder contains a 'copysnippetpath.txt' file
            const copySnippetPath = fs.readFileSync(copySnippetPathFilePath).toString();
            if (fs.existsSync(copySnippetPath)) {
                // 'copysnippetspath.txt' contains an absolute path to a directory that exists
                const copySnippetFileFullPath = `${copySnippetPath}obsidian-tasks-${folderName}-icons.css`;
                fs.writeFileSync(copySnippetFileFullPath, cssSnippetFileContents);
                console.log(`copysnippetpath.txt: Copied '${folderName}' CSS snippet to ${copySnippetFileFullPath}`)
            } else {
                console.log(`WARNING: copysnippetpath.txt: Path '${copySnippetPath}' within ${copySnippetPathFilePath} '${folderName}' does not exist, ignoring.`)
            }
        }
        // Write binary font file to disk:
        // fs.writeFileSync(`${__dirname}/${folderName}/obsidian-tasks-${folderName}-icons.woff2`, woff2, 'binary');
    })
    .catch((error) => {
        throw error
    });
});

