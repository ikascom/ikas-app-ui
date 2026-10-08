/**
 * Applies the preview's URL options before first paint, so an embedded preview never
 * flashes the wrong theme or alignment (static export has no searchParams on the server):
 *
 *   ?theme=light|dark       toggles the `dark` class on <html> (default light), which
 *                           switches registry/theme.css to its `.dark` tokens.
 *   ?align=center|start|stretch  sets <html data-align>, read by globals.css on demo pages.
 *
 * It also listens for `{ type: "ikas-ui:theme", theme: "light" | "dark" }` from the
 * embedding window, so builders.ikas.com can follow its own theme toggle without
 * reloading the iframe. Plain inline JS in <head>, so the listener exists before
 * React hydrates and a message posted on the iframe's `load` event is never missed.
 */
const source = `(function () {
  var root = document.documentElement;
  function setTheme(theme) { root.classList.toggle("dark", theme === "dark"); }
  try {
    var query = new URLSearchParams(window.location.search);
    setTheme(query.get("theme"));
    var align = query.get("align");
    if (align) root.dataset.align = align;
  } catch (e) {}
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (event.source === window.parent && data && data.type === "ikas-ui:theme") setTheme(data.theme);
  });
})();`

export function PreviewQueryScript() {
  return <script dangerouslySetInnerHTML={{ __html: source }} />
}
