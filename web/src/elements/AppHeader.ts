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
  "app-header",
  `
<div>
  <a route href="/">Home</a>
</div>
<hr />
`,
);

export default AppHeader;
