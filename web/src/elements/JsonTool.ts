import CustomElement from "@cover-slide/customelement";
import { raw, json } from "jq-wasm";

class JsonTool extends CustomElement {
    connectedCallback() {
        super.connectedCallback();

        const jsonInput = this.root.querySelector(".json-input") as HTMLTextAreaElement;
        const filterInput = this.root.querySelector(".filter-input") as HTMLTextAreaElement;
        const outputArea = this.root.querySelector(".output-area") as HTMLTextAreaElement;
        const parseButton = this.root.querySelector(".parse-button") as HTMLButtonElement;
        const outputTypeSelect = this.root.querySelector(".output-type-select") as HTMLSelectElement;
        const errorBox = this.root.querySelector("error-box")!;

        parseButton.addEventListener("click", async () => {
            try {
                const inputJson = jsonInput.value;
                let filter = filterInput.value;
                if (!filter) {
                    filter = ".";
                }
                const outputType = outputTypeSelect.value;

                if (!inputJson) {
                    errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: "Input JSON cannot be empty." }));
                    return;
                }



                // Validate JSON input
                let parsedJson;
                try {
                    parsedJson = JSON.parse(inputJson);
                } catch (e) {
                    errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: `Invalid JSON input: ${(e as Error).message}` }));
                    return;
                }

                if (outputType === 'json') {
                    const result = await json(parsedJson, filter);
                    outputArea.value = JSON.stringify(result, null, 2);
                } else { // raw output
                    const rawResult = await raw(parsedJson, filter);
                    outputArea.value = rawResult.stdout;
                    if (rawResult.stderr) {
                        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: `JQ STDERR: ${rawResult.stderr}` }));
                    }
                    if (rawResult.exitCode !== 0) {
                        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: `JQ exited with code: ${rawResult.exitCode}` }));
                    }
                }

            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: `JQ Error: ${message}` }));
            }
        });
    }
}

CustomElement.register(
    JsonTool,
    "json-tool",
    /* html */
    `
<style>
    textarea, input.filter-input {
        width: 100%;
        font-family: monospace;
        box-sizing: border-box;
    }
    textarea.json-input {
        min-height: 300px;
    }
    input.filter-input {
        min-height: 2em;
        padding: 0.5em;
    }
    textarea.output-area {
        min-height: 400px;
    }
</style>
<main-header></main-header>
<error-box></error-box>
<section>
    <h3>JSON Tool</h3>
    <div>
        <label for="json-input">Input JSON:</label>
        <textarea class="json-input" placeholder="Enter JSON here..."></textarea>
    </div>
    <div>
        <label for="filter-input">JQ Filter:</label>
        <input type="text" class="filter-input" placeholder=". | .key">
    </div>
    <label for="output-type">Output Type:</label>
    <select id="output-type" class="output-type-select">
        <option value="json">JSON Output</option>
        <option value="raw">Raw Output</option>
    </select>
    <button class="parse-button">Parse</button>
    <div>
        <label for="output-area">Output:</label>
        <textarea class="output-area" readonly></textarea>
    </div>
</section>
`
);

export default JsonTool;
