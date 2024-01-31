import CustomElement from "@cover-slide/customelement";

class AppRouter extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    const current = window.location.pathname;
    this.updateRoutes(current);

    this.addEventListener("route-change", ((event: CustomEvent<string>) => {
      this.updateRoutes(event.detail);
    }) as EventListener);

    window.addEventListener("popstate", (_: PopStateEvent) => {
      this.updateRoutes(window.location.pathname);
    });
  }

  updateRoutes (newRoute: string): void {
    for (const route of this.querySelectorAll("app-route")) {
      route.dispatchEvent(
        new CustomEvent("update-route", { detail: newRoute }),
      );
    }
  }
}

CustomElement.register(
  AppRouter,
  "app-router",
  `
<app-route route="/" title="Tools"><app-menu></app-menu></app-route>
<app-route route="/timer" title="Timer Tool"><timer-tool></timer-tool></app-route>
<app-route route="/timestamp" title="Timestamp Tool"><timestamp-tool></timestamp-tool></app-route>
<app-route route="/json" title="Json Tool"><json-tool></json-tool></app-route>
`,
);

export default AppRouter;
