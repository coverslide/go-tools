import CustomElement from "@cover-slide/customelement";

class RequestTool extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();

    const form: HTMLFormElement = this.querySelector("form.request-form")!;
    const output: HTMLPreElement = this.querySelector("pre.output")!;
    const outputHeaders: HTMLPreElement = this.querySelector("pre.output.headers")!;

    form.addEventListener("submit", (event: SubmitEvent) => {
      output.textContent = "";
      event.preventDefault();
      try {
        const methodInput: HTMLSelectElement = form.querySelector("select[name=method]")!;
        const urlInput: HTMLInputElement = form.querySelector("input[name=url]")!;
        const headersInput: HTMLInputElement = form.querySelector("textarea[name=headers]")!;
        const bodyInput: HTMLInputElement = form.querySelector("textarea[name=body]")!;

        const method = methodInput.value;
        const body = bodyInput.value;
        const url = urlInput.value;
        const headers: HeadersInit = headersInput.value.trim().split(/[\r\n]+/).reduce((currentHeaders, line) => {
          if (line.match(/^\s*$/)) {
            return currentHeaders;
          }
          const pair = line.split(/\s*:\s*/, 2);
          if (pair.length != 2) {
            throw new Error(`Invalid header line: "${line}"`);
          }
          currentHeaders.set(pair[0], pair[1]);
          return currentHeaders;
        }, new Headers());

        const requestInit: RequestInit = {
          method,
          headers
        };
        if (body != "") {
          requestInit.body = body;
        }
        fetch(new Request(url, requestInit))
          .then(async response => {
            const headerOutput: string[] = [response.statusText];
            response.headers.forEach(header => {
              headerOutput.push(header);
            });

            outputHeaders.textContent = headerOutput.join("\n");
            return await response.text();
          })
          .then(responseData => {
            output.textContent = responseData;
          })
          .catch(e => {
            this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
          });
      } catch (e) {
        this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
      }
    });
  }
}

CustomElement.register(
  RequestTool,
  "request-tool",
  `
<app-header></app-header>
<error-box></error-box>
<form class="request-form">
    <section>
        <select name="method">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
            <option>OPTIONS</option>
            <option>HEAD</option>
        </select>
        <input placeholder="url" name="url" type="text" />
    </section>
    <section><textarea name="headers" placeholder="headers"></textarea></section>
    <section><textarea name="body" placeholder="body"></textarea></section>
    <input type="submit">
</form>
<hr />
<pre class="output headers"></pre>

<pre class="output"></pre>
`,
);

export default RequestTool;
