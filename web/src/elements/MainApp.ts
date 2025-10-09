import CustomElement from "@cover-slide/customelement";

class MainApp extends CustomElement {
}

CustomElement.register(
  MainApp,
  "main-app",
  /* html */
  `
<app-router>
  <app-route route="/" title="Tools"><main-menu></main-menu></app-route>
  <app-route route="/timer" title="Timer Tool"><timer-tool></timer-tool></app-route>
  <app-route route="/stopwatch" title="Stopwatch Tool"><stopwatch-tool></stopwatch-tool></app-route>
  <app-route route="/base64" title="Base64 Tool"><base64-tool></base64-tool></app-route>
  <app-route route="/timestamp" title="Timestamp Tool"><timestamp-tool></timestamp-tool></app-route>
  <app-route route="/json" title="JSON Tool"><json-tool></json-tool></app-route>
  <app-route route="/portscan" title="Portscan Tool"><portscan-tool></portscan-tool></app-route>
  <app-route route="/request" title="Request Tool"><request-tool/></request-tool></app-route>
  <app-route route="/qrcode" title="QR Code Tool"><qrcode-tool></qrcode-tool></app-route>
  <app-route route="/uuid" title="UUID Generator"><uuid-generator-tool></uuid-generator-tool></app-route>
  <app-route route="" title="Tools"><app-redirect path="/"></app-redirect></app-route>
</app-router>`,
);

export default MainApp;
