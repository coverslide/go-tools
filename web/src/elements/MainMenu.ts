import CustomElement from "@cover-slide/customelement";
import { routeListener } from "../helpers/routeHelper";

class AppMenu extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    this.addEventListener("click", routeListener);
  }
}

CustomElement.register(
  AppMenu,
  "main-menu",
  /* html */
  `
<ul>
  <li><a route href="/">Home</a></li>
  <li><a route href="/json">Json Tool</a></li>
  <li><a route href="/base64">Base64 Tool</a></li>
  <li><a route href="/timestamp">Timestamp Tool</a></li>
  <li><a route href="/timer">Timer Tool</a></li>
  <li><a route href="/stopwatch">Stopwatch Tool</a></li>
  <li><a route href="/portscan">Port Scan Tool</a></li>
  <li><a route href="/request">Request Tool</a></li>
  <li><a route href="/qrcode">QR Code Tool</a></li>
</ul>
`,
);

export default AppMenu;
