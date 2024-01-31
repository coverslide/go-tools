import CustomElement from "@cover-slide/customelement";

enum Mode {
  Seconds,
  Millis
}

class TimestampTool extends CustomElement {
  timestampInput?: HTMLInputElement;
  pauseButton?: HTMLButtonElement;
  paused: boolean = false;
  mode: Mode = Mode.Millis;
  connectedCallback (): void {
    super.connectedCallback();
    this.timestampInput = this.querySelector("input.timestamp")!;
    this.pauseButton = this.querySelector("button.pause")!;
    const enterForm = this.querySelector("form.enter-form")!;
    const errorBox = this.querySelector("error-box")!;

    this.pauseButton.addEventListener("click", (_) => {
      if (this.paused) {
        this.resume();
      } else {
        this.pause();
      }
    });

    enterForm.addEventListener("submit", ((event: SubmitEvent) => {
      event.preventDefault();
      const timestampInput: HTMLInputElement = enterForm.querySelector("input.timestamp-input")!;
      const value = timestampInput.value;
      try {
        const timestampValue = parseInt(value, 10);
        if (isNaN(timestampValue)) {
          throw new Error("invalid timestamp value");
        }
        this.updateTicker(timestampValue);
        this.pause();
      } catch (error) {
        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: (error as Error).message }));
      }
    }) as EventListener);

    this.updateTimestamp(true);
  }

  pause (): void {
    this.pauseButton!.textContent = "Resume";
    this.paused = true;
  }

  resume (): void {
    this.pauseButton!.textContent = "Pause";
    this.paused = false;
    this.updateTimestamp(false);
  }

  updateTimestamp (allowFixed: boolean): void {
    if (!this.isConnected) {
      return;
    }
    if (this.paused) {
      return;
    }
    let now = Date.now();
    if (!allowFixed) {
      now = now - now % 1000;
    }
    const toNextMillis = 1000 - (now % 1000);
    setTimeout(() => { this.updateTimestamp(false); }, toNextMillis);
    this.updateTicker(now);
  }

  updateTicker (timestamp: number): void {
    this.querySelector("pre.timestamp-output")!.textContent = (this.mode === Mode.Millis ? timestamp : Math.floor(timestamp / 1000)).toString(10);
    this.querySelector("dd.iso-date")!.textContent = new Date(timestamp).toISOString();
    this.querySelector("dd.rfc-date")!.textContent = new Date(timestamp).toString();
    this.querySelector("dd.locale-date")!.textContent = new Date(timestamp).toLocaleString();
  }
}

CustomElement.register(
  TimestampTool,
  "timestamp-tool",
  `
<error-box></error-box>
<app-header></app-header>
<section>
  <pre class="timestamp-output"></pre>
  <button class="pause">Pause</button>
</section>
<hr />
<section>
  <dl>
    <dt>ISO Date<dt>
    <dd class="iso-date"></dd>
    <dt>RFC 822 Date<dt>
    <dd class="rfc-date"></dd>
    <dt>Locale Date<dt>
    <dd class="locale-date"></dd>
  </dl>
</section>
<hr />
<section>
  <form class="enter-form">
    <input class="timestamp-input" plaseholder="Enter timestamp" type="text" />
    <input type="submit" />
  </form>
</section>
`,
);

export default TimestampTool;
