import CustomElement from "@cover-slide/customelement";

class AppRouter extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    const current = window.location.pathname;
    this.updateRoutes(current);

    this.addEventListener("route-change", ((event: CustomEvent<string>) => {
      this.updateRoutes(event.detail);
    }) as EventListener);

    this.addEventListener("route-ready", ((event: CustomEvent<string>) => {
      this.updateRoutes(window.location.pathname);
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
      console.log("default");
      defaultRoute.dispatchEvent(
        new CustomEvent("update-route", { detail: "" }),
      );
    }
  }
}

CustomElement.register(
  AppRouter,
  "app-router"
);

export default AppRouter;
