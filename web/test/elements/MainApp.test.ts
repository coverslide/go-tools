/**
 * @jest-environment jsdom
 */

import "../../src/elements/MainApp";

test("has-app-router", () => {
  document.body.appendChild(document.createElement("main-app"));

  const mainApp = document.querySelector("main-app")!;
  const appRouter = mainApp.querySelector("app-router")!;

  expect(appRouter).not.toBeNull();
});
