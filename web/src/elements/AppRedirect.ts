import CustomElement from "@cover-slide/customelement";
import { updateRoute } from "../helpers/routeHelper";

class Redirect extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    updateRoute(this, this.getAttribute("path")!);
  }
}

CustomElement.register(
  Redirect,
  "app-redirect",
);

export default Redirect;
