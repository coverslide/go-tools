import CustomElement from "@cover-slide/customelement";
import "../style/error-row.css";

class ErrorBox extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    this.root.appendChild(document.createTextNode(this.getAttribute("message")!));
  }
}

CustomElement.register(
  ErrorBox,
  "error-row",
  /* html */
  `
<span class="dismiss">×</span>
`);

export default ErrorBox;
