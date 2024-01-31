import CustomElement from "@cover-slide/customelement";

class ErrorBox extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    this.appendChild(document.createTextNode(this.getAttribute("message")!));
  }
}

CustomElement.register(ErrorBox, "error-row", `
<span class="dismiss">×</span>
`);

export default ErrorBox;
