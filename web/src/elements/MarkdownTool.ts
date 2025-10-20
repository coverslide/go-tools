import CustomElement from "@cover-slide/customelement";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { html_beautify } from "js-beautify";
import TurndownService from "turndown";

class MarkdownTool extends CustomElement {
    private markdownInput!: HTMLTextAreaElement;
    private renderedOutput!: HTMLDivElement;
    private rawHtmlOutput!: HTMLTextAreaElement;

    connectedCallback() {
        super.connectedCallback();

        this.markdownInput = this.root.querySelector(".markdown-input") as HTMLTextAreaElement;
        this.renderedOutput = this.root.querySelector(".rendered-output") as HTMLDivElement;
        this.rawHtmlOutput = this.root.querySelector(".raw-html-output") as HTMLTextAreaElement;

        this.markdownInput.addEventListener("input", this.handleInput.bind(this));

        const copyButton = this.root.querySelector(".copy-button") as HTMLButtonElement;
        copyButton.addEventListener("click", () => {
            if (this.rawHtmlOutput.value) {
                navigator.clipboard.writeText(this.rawHtmlOutput.value);
            }
        });

        const htmlToMarkdownButton = this.root.querySelector(".html-to-markdown-button") as HTMLButtonElement;
        const turndownService = new TurndownService();
        htmlToMarkdownButton.addEventListener("click", () => {
            const html = this.rawHtmlOutput.value;
            const markdown = turndownService.turndown(html);
            this.markdownInput.value = markdown;
            this.handleInput();
        });

        this.handleInput();
    }

    handleInput() {
        const markdownText = this.markdownInput.value;
        const html = micromark(markdownText, {
            extensions: [gfm()],
            htmlExtensions: [gfmHtml()]
        });
        this.renderedOutput.innerHTML = html;
        this.rawHtmlOutput.value = html_beautify(html);
    }
}

CustomElement.register(
    MarkdownTool,
    "markdown-tool",
    /* html */
    `
<style>
    section {
        padding-bottom: 2em;
    }
    .top-section {
        display: flex;
        gap: 1em;
        height: 60vh;
    }
    .top-section > * {
        flex: 1;
        height: 100%;
        overflow: auto;
        border: 1px solid #ccc;
        padding: 1em;
        box-sizing: border-box;
    }
    textarea {
        width: 100%;
        height: 100%;
        font-family: monospace;
        box-sizing: border-box;
        resize: none;
    }
    .bottom-section {
        margin-top: 1em;
    }
    .raw-html-output {
        height: 60vh;
        padding: 1em;
        white-space: pre-wrap;
        word-wrap: break-word;
        border: 1px solid #ccc;
        overflow: auto;
    }
    .button-row {
        margin-top: 1em;
        margin-bottom: 1em;
    }
</style>
<main-header></main-header>
<error-box></error-box>
<section>
    <h3>Markdown Tool</h3>
            <div class="top-section">
                            <textarea class="markdown-input" placeholder="Enter Markdown here..."></textarea>
                            <div class="rendered-output"></div>            </div>    <div class="bottom-section">
        <label>Raw HTML Output:</label>
        <textarea class="raw-html-output"></textarea>
        <div class="button-row">
            <button class="copy-button">Copy</button>
            <button class="html-to-markdown-button">HTML to Markdown</button>
        </div>
    </div>
</section>
`
);

export default MarkdownTool;
