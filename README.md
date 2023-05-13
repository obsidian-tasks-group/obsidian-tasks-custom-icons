# Obsidian Tasks Custom Icons

This simple application generates a custom font from monotone SVGs to replace the emojis used in Obsidian Tasks, also embedded within a CSS snippet.

It generates three files:

- `obsidian-tasks-icons-snippets.css`
drop/export to `<your-vault-path>/.obsidian/snippets` to replace emojis in your task lines in obsidian with new icons
- `obsidian-tasks-icons-demo.html`
an HTML file to quickly preview your icons during development
- `obsidian-tasks-icons.woff2`
the unembedded font itself in case you want to integrate with a plugin or theme

I've very quickly made some icons to avoid licensing issues for the proof of concept. If I ever get a chance I will make some decent ones, but I'm actually hoping that somehow else can use this repository to come up with some good alternatives to the garish Emojis.

[Tasks Emoji Format](https://publish.obsidian.md/tasks/Reference/Task+Formats/Tasks+Emoji+Format)

## How to use
- run `npm install` in the directory to install dependencies
- make some pretty icons as SVGs
- run `npm run build`

## Support development
<a href="https://www.buymeacoffee.com/replete"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=replete&button_colour=BD5FFF&font_colour=ffffff&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" /></a>