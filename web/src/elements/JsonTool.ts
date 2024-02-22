import CustomElement from "@cover-slide/customelement";

class JsonTool extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();

    const form: HTMLFormElement = this.querySelector("form.json-form")!;

    form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      const textArea: HTMLTextAreaElement = form.querySelector("textarea.json")!;
      try {
        const data = JSON.parse(textArea.value);
        this.querySelector("pre.output")!.textContent = JSON.stringify(data, null, 4);
      } catch (e) {
        this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
      }
    });
  }
}

CustomElement.register(
  JsonTool,
  "json-tool",
  /* html */
  `
<main-header></main-header>
<error-box></error-box>
<form class="json-form">
    <textarea class="json"></textarea>
    <input type="submit">
</form>
<hr />
<pre class="output"></pre>
`,
);

export default JsonTool;
