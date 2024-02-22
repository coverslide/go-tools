import CustomElement from "@cover-slide/customelement";

class ErrorBox extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    this.root.addEventListener("click", ((event: MouseEvent) => {
      event.preventDefault();
      const target = event.target! as HTMLSpanElement;
      if (target.classList.contains("dismiss")) {
        const errorRow = target.parentNode!;
        this.root.removeChild(errorRow);
      }
    }) as EventListener);

    this.addEventListener("app-error", ((event: CustomEvent<string>) => {
      const row = document.createElement("error-row");
      row.setAttribute("message", event.detail);
      this.root.appendChild(row);
    }) as EventListener);
  }
}

CustomElement.register(ErrorBox, "error-box");

export default ErrorBox;
