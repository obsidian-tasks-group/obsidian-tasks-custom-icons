const webfont = require('webfont').webfont;
const fs = require('fs');
/*
    https://github.com/itgalaxy/webfont
    https://github.com/nfroidure/svgicons2svgfont
    https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AEmoji%3DYes%3A%5D&g=&i=

    Obsidian Tasks Custom Icons
    https://github.com/replete
*/

const FONTNAME = 'ObsidianTasksEmojis';
const SYMBOLS = {
    created: ['➕', 'U+2795'],
    scheduled: ['⌛️', 'U+231B'],
    start: ['🛫', 'U+1F6EB'],
    due: ['📅', 'U+1F4C5'],
    done: ['✅', 'U+2705'],
    low: ['🔽', 'U+1F53D'],
    medium: ['🔼', 'U+1F53C'],
    high: ['⏫', 'U+23EB'],
    recurring: ['🔁', 'U+1F501']
};

webfont({
    files: './icons/*.svg',
    fontName: FONTNAME,
    formats: ['woff2'],
    ligatures: false,
    normalize: true,
    verbose: true,
    fontHeight:2000
})
.then((result) => {
    const woff2 = Buffer.from(result.woff2);

    const fontFaceCSSDefinition = `@font-face {
    font-family: '${FONTNAME}';
    src: url('data:@file/octet-stream;base64,${woff2.toString('base64')}') format('woff2');
    unicode-range: ${Object.keys(SYMBOLS).map(i => SYMBOLS[i][1]).join(', ')};
}`;

    fs.writeFileSync('./obsidian-tasks-icons-demo.html',`<!DOCTYPE html>
<style>
    ${fontFaceCSSDefinition}
    body {font-family: '${FONTNAME}', sans-serif}
</style>
${Object.keys(SYMBOLS).map(i => `${SYMBOLS[i][0]}${i}` ).join(' ')}`);

    fs.writeFileSync('./obsidian-tasks-icons-snippet.css',`${fontFaceCSSDefinition}

span.tasks-list-text,
.cm-line:has(.task-list-label) .cm-list-1 {
    font-family: '${FONTNAME}', var(--font-text);
}`);

    fs.writeFileSync('./obsidian-tasks-icons.woff2', woff2, 'binary');
})
.catch((error) => {
    throw error
});
