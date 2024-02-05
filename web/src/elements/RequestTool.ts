import CustomElement from "@cover-slide/customelement";

const PROXY_API_URL = "/api/httprequest";

interface HeaderDictionary {
  [key: string]: string[],
}

type HttpRequest = {
  method :string,
  url    :string,
  body   :string,
  headers : HeaderDictionary,
}
type HttpResponse = {
  success      :boolean,
  errorMessage :string,
  statusCode :number,
  body       :string,
  headers    :HeaderDictionary,
}

class RequestTool extends CustomElement {
  output? :HTMLPreElement;
  outputHeaders? :HTMLPreElement;
  
  connectedCallback (): void {
    super.connectedCallback();

    const form: HTMLFormElement = this.querySelector("form.request-form")!;
    const output: HTMLPreElement = this.output = this.querySelector("pre.output")!;
    const outputHeaders: HTMLPreElement = this.outputHeaders = this.querySelector("pre.output.headers")!;

    form.addEventListener("submit", (event: SubmitEvent) => {
      output.textContent = "";
      outputHeaders.textContent = "";
      event.preventDefault();
      try {
        const methodInput: HTMLSelectElement = form.querySelector("select[name=method]")!;
        const urlInput: HTMLInputElement = form.querySelector("input[name=url]")!;
        const headersInput: HTMLInputElement = form.querySelector("textarea[name=headers]")!;
        const bodyInput: HTMLInputElement = form.querySelector("textarea[name=body]")!;
        const proxyInput: HTMLInputElement = form.querySelector("input[name=serverProxy]")!;

        const method = methodInput.value;
        const body = bodyInput.value;
        const url = urlInput.value;
        const headers: HeaderDictionary = headersInput.value.trim().split(/[\r\n]+/).reduce((currentHeaders, line) => {
          if (line.match(/^\s*$/)) {
            return currentHeaders;
          }
          const pair = line.split(/\s*:\s*/, 2);
          if (pair.length != 2) {
            throw new Error(`Invalid header line: "${line}"`);
          }
          if (!(pair[0] in currentHeaders)) {
            currentHeaders[pair[0]] = [];
          }
          currentHeaders[pair[0]].push(pair[1]);
          return currentHeaders;
        }, {} as HeaderDictionary);

        if (proxyInput.checked) {
          this.fetchProxy(method, url, body, headers);
        } else {
          this.fetchDirect(method, url, body, headers);
        }
      } catch(e) {
        this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
      }
    });
  }
      
      async fetchProxy(method :string, url  :string, body :string, headers :HeaderDictionary){
        const bodyData :HttpRequest = {
          method,
          url,
          body,
          headers,
        }
        const requestInit: RequestInit = {
          method: "POST",
          body: JSON.stringify(bodyData),
        };
        try {
          const response = await fetch(new Request(PROXY_API_URL, requestInit));
          const responseData :HttpResponse = await response.json();
          const headerOutput: string[] = [`statusCode: ${responseData.statusCode}`];
          for (let key in responseData.headers) {
            const field = responseData.headers[key];
            for (let value of field) {
              headerOutput.push(`${key}: ${value}`);
            }
          }

          this.outputHeaders!.textContent = headerOutput.join("\n");
          this.output!.textContent = body;
        } catch (e) {
          this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
        }
      }
      
      async fetchDirect(method :string, url  :string, body :BodyInit, headers :HeaderDictionary){
        const headerInit :Headers = Object.entries(headers).reduce((currentHeaders, [key, values]) => {
          values.forEach(value => {
            currentHeaders.append(key, value);
          });
          return currentHeaders;
        }, new Headers());
        const requestInit: RequestInit = {
          method,
          headers: headerInit
        };
        if (body != "") {
          requestInit.body = body;
        }
        try {
          const response = await fetch(new Request(url, requestInit));
          const headerOutput: string[] = [response.statusText];
          response.headers.forEach(header => {
            headerOutput.push(header);
          });

          this.outputHeaders!.textContent = headerOutput.join("\n");
          this.output!.textContent = await response.text();
        } catch (e) {
          this.querySelector("error-box")!.dispatchEvent(new CustomEvent<string>("app-error", { detail: (e as Error).message }));
        }
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
    <section>
        <label><input type="checkbox" name="serverProxy" /> Server Proxy</label>
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
