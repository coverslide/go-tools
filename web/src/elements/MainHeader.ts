import CustomElement from "@cover-slide/customelement";
import { routeListener } from "../helpers/routeHelper";

class AppHeader extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    this.addEventListener("click", routeListener);
  }
}

CustomElement.register(
  AppHeader,
  "main-header",
  /* html */
  `
<div>
  <a route href="/">Home</a>
</div>
<hr />
`,
);

export default AppHeader;
