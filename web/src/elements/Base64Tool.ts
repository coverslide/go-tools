import CustomElement from "@cover-slide/customelement";

class Base64Tool extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();
    const form: HTMLFormElement = this.querySelector("form.base64-form")!;
    const textInput: HTMLTextAreaElement = this.querySelector("textarea[name=text]")!;
    const output: HTMLPreElement = this.querySelector("pre.output.body")!;

    form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      const submitter = event.submitter as HTMLInputElement;
      try {
        const inputValue = textInput.value;
        if (submitter.getAttribute("name") === "convert-from") {
          output.textContent = atob(inputValue);
        } else {
          output.textContent = btoa(inputValue);
        }
      } catch (e) {
        this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
      }
    });
  }
}

CustomElement.register(Base64Tool, "base64-tool", `

<app-header></app-header>
<error-box></error-box>
<form class="base64-form">
    <section><textarea name="text" placeholder="Enter text"></textarea></section>
    <section>
        <input type="submit" name="convert-to" value="Convert to Base64"/>
        <input type="submit" name="convert-from" value="Convert from Base64">
    </section>
</form>
<hr />
<pre class="output body"></pre>
`);

export default Base64Tool;
