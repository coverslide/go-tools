import CustomElement from "@cover-slide/customelement";

class AppRoute extends CustomElement {
  watchedSlot?: HTMLSlotElement;
  childContent: DocumentFragment;
  active: boolean = false;
  constructor () {
    super();
    this.childContent = new DocumentFragment();
    for (const child of this.children) {
      this.childContent.appendChild(child.cloneNode(true));
      this.removeChild(child);
    }
  }

  connectedCallback (): void {
    this.innerHTML = "";
    const route = this.getAttribute("route");
    this.addEventListener("update-route", ((event: CustomEvent<string>) => {
      if (event.detail !== route) {
        this.active = false;
        this.innerHTML = "";
        return;
      }
      if (!this.active) {
        this.active = true;
        this.appendChild(this.childContent.cloneNode(true));
        if (this.hasAttribute("title")) {
          document.title = this.getAttribute("title")!;
        }
      }
    }) as EventListener);
  }
}

CustomElement.register(AppRoute, "app-route", "");

export default AppRoute;
