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
  "app-menu",
  `
<ul>
  <li><a route href="/">Home</a></li>
  <li><a route href="/json">Json Tool</a></li>
  <li><a route href="/timestamp">Timestamp Tool</a></li>
  <li><a route href="/timer">Timer Tool</a></li>
</ul>
`,
);

export default AppMenu;