import CustomElement from "@cover-slide/customelement";

class ErrorBox extends CustomElement {
  constructor () {
    super();
    this.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      const target = event.target! as HTMLSpanElement;
      if (target.classList.contains("dismiss")) {
        const errorRow = target.parentNode!;
        this.removeChild(errorRow);
      }
    });

    this.addEventListener("app-error", ((event: CustomEvent<string>) => {
      const row = document.createElement("error-row");
      row.setAttribute("message", event.detail);
      this.appendChild(row);
    }) as EventListener);
  }
}

CustomElement.register(ErrorBox, "error-box", "");

export default ErrorBox;
