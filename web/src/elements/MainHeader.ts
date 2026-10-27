import CustomElement from "@coverslide/customelement";
import { routeListener } from "@coverslide/customelement-router";

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
