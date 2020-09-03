const connect = require("connect");
const http = require("http");
const static = require("serve-static");
const transform = require("connect-static-transform");

const ignore = "browser/ui/codiconLabel/codicon/codicon.css";

const css = transform({
    root: __dirname,
    match: /node_modules\/(.+)\.css/,
    transform: (path, content, send) => {
        const exec = (c) => (path.includes(ignore) ? c.replace(/:before { content: "/g, `:before { content: "\\`) : c);
        const c = `
        const css = document.createElement('style');
        css.type = "text/css";
        css.textContent = \`${exec(content)}\`;
        document.head.appendChild(css);
        `;
        send(c, { "Content-Type": "application/javascript" });
    },
});

const app = connect().use(css).use(static(__dirname));

http.createServer(app).listen(65500);

console.log("http://127.0.0.1:65500");
