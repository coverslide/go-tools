import CustomElement from "@cover-slide/customelement";

class PortScanTool extends CustomElement {
  connectedCallback (): void {
    super.connectedCallback();

    const form: HTMLFormElement = this.querySelector("form.portscan-form")!;
    const output :HTMLPreElement = this.querySelector("pre.output")!;

    form.addEventListener("submit", (event: SubmitEvent) => {
      output.textContent = "";
      event.preventDefault();
      try {
        const hostInput :HTMLInputElement = form.querySelector("input[name=host]")!;
        const portInput :HTMLInputElement = form.querySelector("input[name=port]")!;
        const host = hostInput.value;
        const port = parseInt(portInput.value, 10);

        const requestInit : RequestInit = {
            method: "POST",
            body: JSON.stringify({ host: host, port: port}),
        };
        fetch(new Request("/api/portscan", requestInit))
            .then(response => response.json())
            .then(responseData => {
                if (responseData.success) {
                    output.textContent = "OK";
                } else {
                    output.textContent = responseData.errorMessage;
                }
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
    PortScanTool,
  "portscan-tool",
  `
<app-header></app-header>
<error-box></error-box>
<form class="portscan-form">
    <input placeholder="host" name="host" type="text" />
    <input placeholder="port" name="port" type="number" />
    <input type="submit">
</form>
<hr />
<pre class="output"></pre>
`,
);

export default PortScanTool;