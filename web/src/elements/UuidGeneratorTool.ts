
import CustomElement from "@cover-slide/customelement";
import { generateUuid, UuidVersion, extractTimestamp } from "../helpers/uuidHelper";

class UuidGeneratorTool extends CustomElement {
    connectedCallback() {
        super.connectedCallback();

        const generateButton = this.root.querySelector(".generate-button") as HTMLButtonElement;
        const copyButton = this.root.querySelector(".copy-button") as HTMLButtonElement;
        const outputElement = this.root.querySelector(".uuid-output") as HTMLInputElement;
        const errorBox = this.root.querySelector("error-box")!;
        const versionSelector = this.root.querySelector(".uuid-version") as HTMLSelectElement;
        const conditionalInputs = this.root.querySelector(".conditional-inputs") as HTMLDivElement;
        const namespaceInput = this.root.querySelector(".namespace") as HTMLInputElement;
        const nameInput = this.root.querySelector(".name") as HTMLInputElement;

        versionSelector.addEventListener("change", () => {
            const version = versionSelector.value;
            if (version === 'v3' || version === 'v5') {
                conditionalInputs.style.display = 'block';
            } else {
                conditionalInputs.style.display = 'none';
            }
        });

        const updateUuid = () => {
            try {
                const version = versionSelector.value as UuidVersion;
                const namespace = namespaceInput.value;
                const name = nameInput.value;

                outputElement.value = generateUuid({ version, namespace, name });
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: message }));
            }
        };

        generateButton.addEventListener("click", updateUuid);

        copyButton.addEventListener("click", () => {
            if (outputElement.value) {
                navigator.clipboard.writeText(outputElement.value)
                    .catch(err => {
                        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: `Failed to copy: ${err}` }));
                    });
            }
        });

        const uuidToParseInput = this.root.querySelector(".uuid-to-parse") as HTMLInputElement;
        const extractTimestampButton = this.root.querySelector(".extract-timestamp-button") as HTMLButtonElement;
        const extractedTimestampSpan = this.root.querySelector(".extracted-timestamp") as HTMLSpanElement;
        const extractedDateSpan = this.root.querySelector(".extracted-date") as HTMLSpanElement;

        extractTimestampButton.addEventListener("click", () => {
            try {
                const uuidString = uuidToParseInput.value;
                const timestamp = extractTimestamp(uuidString);

                if (timestamp !== null) {
                    extractedTimestampSpan.textContent = timestamp.toString();
                    extractedDateSpan.textContent = new Date(timestamp).toLocaleString();
                } else {
                    extractedTimestampSpan.textContent = "N/A";
                    extractedDateSpan.textContent = "Not a v1 or v7 UUID, or no timestamp found.";
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: message }));
                extractedTimestampSpan.textContent = "Error";
                extractedDateSpan.textContent = "Error";
            }
        });

        // Generate one on load
        updateUuid();
    }
}

CustomElement.register(
    UuidGeneratorTool,
    "uuid-generator-tool",
    /* html */
    `
<style>
    .uuid-output {
        width: 36ch; /* A UUID is 36 chars long */
        font-size: 1.2em;
    }
    .conditional-inputs {
        display: none;
    }
    .timestamp-output-section input {
        width: 36ch;
    }
</style>
<main-header></main-header>
<error-box></error-box>
<section>
    <form class="options-form">
        <label for="uuid-version">UUID Version:</label>
        <select id="uuid-version" class="uuid-version">
            <option value="v4" selected>v4 (Random)</option>
            <option value="v1">v1 (Timestamp)</option>
            <option value="v3">v3 (Namespace-MD5)</option>
            <option value="v5">v5 (Namespace-SHA1)</option>
            <option value="v7">v7 (Timestamp)</option>
        </select>
        <div class="conditional-inputs">
            <label for="namespace">Namespace UUID:</label>
            <input id="namespace" class="namespace" type="text" placeholder="Enter a valid UUID">
            <label for="name">Name:</label>
            <input id="name" class="name" type="text" placeholder="Enter a name">
        </div>
    </form>
</section>
<hr/>
<section>
    <label for="uuid-output">Generated UUID:</label>
    <input class="uuid-output" id="uuid-output" type="text" readonly placeholder="Click generate to get a new UUID">
    <button class="copy-button">Copy</button>
</section>
<section>
    <button class="generate-button">Generate</button>
</section>
<hr/>
<section class="timestamp-output-section">
    <h3>Extract Timestamp from UUID</h3>
    <label for="uuid-to-parse">UUID to parse:</label>
    <input id="uuid-to-parse" class="uuid-to-parse" type="text" placeholder="Paste v1 or v7 UUID here">
    <button class="extract-timestamp-button">Extract Timestamp</button>
    <p>Timestamp (ms): <span class="extracted-timestamp"></span></p>
    <p>Date: <span class="extracted-date"></span></p>
</section>
`
);

export default UuidGeneratorTool;
