import CustomElement from "@cover-slide/customelement";

class AppRoute extends CustomElement {
  childContent: DocumentFragment;
  active: boolean = false;
  constructor () {
    super();
    this.childContent = new DocumentFragment();

    const childrenToRemove = [];
    for (const child of this.childNodes) {
      childrenToRemove.push(child);
    }
    for (const child of childrenToRemove) {
      this.removeChild(child);
      this.childContent.appendChild(child);
    }
  }

  connectedCallback (): void {
    this.innerHTML = "";
    this.addEventListener("update-route", ((event: CustomEvent<string>) => {
      const route = this.getAttribute("route");
      console.log("route:", route, "event.detail", event.detail);
      if (event.detail !== route) {
        this.active = false;
        this.innerHTML = "";
        return;
      }
      if (!this.active) {
        this.active = true;
        console.log(route, this.childContent);
        this.appendChild(this.childContent.cloneNode(true));
        if (this.hasAttribute("title")) {
          document.title = this.getAttribute("title")!;
        }
      }
    }) as EventListener);

    this.dispatchEvent(new CustomEvent("route-ready", { detail: this.getAttribute("route"), bubbles: true }));
  }
}

CustomElement.register(AppRoute, "app-route");

export default AppRoute;
