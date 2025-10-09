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
      const convertFrom = submitter.getAttribute("name") === "convert-from";
      const inputValue = textInput.value;
      this.convert(convertFrom, inputValue)
        .then((outputValue: string) => {
          output.textContent = outputValue;
        })
        .catch(e => {
          this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
        });
    });
  }

  async convert (convertFrom: boolean, inputValue: string): Promise<string> {
    if (inputValue.trim() === "" && navigator.clipboard !== undefined) {
      inputValue = await navigator.clipboard.readText();
    }
    if (convertFrom) {
      return atob(inputValue);
    } else {
      return btoa(inputValue);
    }
  }
}

CustomElement.register(
  Base64Tool,
  "base64-tool",
  /* html */
  `
<style>
    .base64-form textarea {
        width: 100%;
        height: 400px;
    }
    .output {
        white-space: pre-wrap;
        width: 100%;
        height: 400px;
        border: 1px solid;
    }
</style>
<main-header></main-header>
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
