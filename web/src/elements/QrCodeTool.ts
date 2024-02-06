import CustomElement from "@cover-slide/customelement";
import qrcode from "qrcode";

class QrCodeTool extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    const form: HTMLFormElement = this.querySelector("form[name=qr-form]")!;
    console.log(form);

    form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      const inputElement: HTMLTextAreaElement = form.querySelector("textarea[name=input]")!;
      const value = inputElement.value;
      qrcode.toDataURL(value).then(dataUrl => {
        this.querySelector("div.output")!.innerHTML = "";
        const img = document.createElement("img");
        img.src = dataUrl;
        this.querySelector("div.output")!.appendChild(img);
      }).catch(e => {
        console.error(e);
        this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
      });
    });
  }
}

CustomElement.register(
  QrCodeTool,
  "qrcode-tool",
  `
<app-header></app-header>
<error-box></error-box>
<form name="qr-form">
    <textarea name="input" placeholder="Enter text"></textarea>
    <input type="submit" />
</form>
<hr />
<div class="output"></div>
`,
);

export default QrCodeTool;
