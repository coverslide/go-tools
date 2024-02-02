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
    let foundRoute = false;
    let defaultRoute = null;
    for (const route of this.querySelectorAll("app-route")) {
      const routePath = route.getAttribute("route");
      if (routePath === newRoute) {
        foundRoute = true;
      }
      if (routePath === "") {
        defaultRoute = route;
      }
      route.dispatchEvent(
        new CustomEvent("update-route", { detail: newRoute }),
      );
    }
    if (!foundRoute && defaultRoute != null) {
      defaultRoute.dispatchEvent(
        new CustomEvent("update-route", { detail: "" }),
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
<app-route route="/portscan" title="Json Tool"><portscan-tool></portscan-tool></app-route>
<app-route route="/request" title="Request Tool"><request-tool/></app-route>
<app-route route="" title="Tools"><app-menu/></app-route>
`,
);

export default AppRouter;
