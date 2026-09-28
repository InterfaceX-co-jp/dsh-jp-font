/**
 * dsh-jp-font — Japanese-first font stack for the DeepSeek Harness web UI.
 *
 * Why this exists: the shipped `--dsw-font-family` stack is
 *   -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
 *   "Hiragino Sans GB", "Microsoft YaHei", ...
 * On Windows none of the CJK entries before "Microsoft YaHei" exist, so every
 * Japanese glyph (kanji and kana alike) is drawn by Microsoft YaHei — a
 * Simplified-Chinese font. The letterforms are subtly wrong for Japanese and
 * the 14px UI weight reads as muddy. The code stack has the same problem.
 *
 * This plugin is host-only: it adds no client bundle and no UI. It answers the
 * web server's `webserver/index-inject` collection point with one `style` row,
 * which `dsh-host-webserver` renders into the <head> of the served index.html.
 *
 * The selector is `html:root` rather than `:root` on purpose: the shipped
 * theme stylesheet is appended to <head> at runtime by the client `ui-theme`
 * plugin, i.e. AFTER this row, and both would otherwise have specificity
 * (0,1,0) — later would win. `html:root` is (0,1,1), so this override wins on
 * specificity and does not depend on load order.
 */

/** Latin stays native to the OS; CJK resolution lands on the Japanese face. */
const FONT_SANS = [
	"-apple-system",
	"BlinkMacSystemFont",
	'"Segoe UI"',
	'"BIZ UDPGothic"',
	'"Yu Gothic UI"',
	'"Noto Sans JP"',
	'"Helvetica Neue"',
	"Helvetica",
	"Arial",
	'"Microsoft YaHei"', // last resort, keeps Simplified-Chinese-only glyphs covered
	"sans-serif"
].join(", ");

/** Latin monospace first, then a Japanese face for comments and full-width text. */
const FONT_MONO = [
	'"SF Mono"',
	'"JetBrains Mono"',
	'"Fira Code"',
	"Consolas",
	'"Liberation Mono"',
	"Menlo",
	"Courier",
	'"BIZ UDGothic"',
	'"Noto Sans JP"',
	'"MS Gothic"',
	'"Microsoft YaHei"',
	"monospace"
].join(", ");

const CSS = `html:root {
  --dsw-font-family: ${FONT_SANS};
  --ds-font-family-code: ${FONT_MONO};
  --dsw-font-mono: ${FONT_MONO};
}
`;

/**
 * Register the style row for every served index.
 * @param ctx - Host context owning the web server.
 */
export function apply(ctx) {
	ctx.on("webserver/index-inject", (table) => {
		table.push({ kind: "style", text: CSS });
	});
}
