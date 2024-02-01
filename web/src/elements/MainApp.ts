import CustomElement from "@cover-slide/customelement";

class MainApp extends CustomElement {
}

CustomElement.register(
  MainApp,
  "main-app",
  `
<app-router></app-router>
<app-modal></app-modal>`,
);

export default MainApp;
