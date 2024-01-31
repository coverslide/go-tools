export function updateRoute (element: HTMLElement, route: string): void {
  history.pushState(null, "", route);
  element.dispatchEvent(
    new CustomEvent("route-change", { detail: route, bubbles: true }),
  );
}

export function routeListener (event: MouseEvent): void {
  const target = event.target! as HTMLElement;
  if (target.hasAttribute("route")) {
    event.preventDefault();
    event.stopPropagation();
    updateRoute(target, target.getAttribute("href")!);
  }
}
