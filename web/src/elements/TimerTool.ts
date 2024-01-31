import CustomElement from "@cover-slide/customelement";

class TimerTool extends CustomElement {
  started: boolean = false;
  elapsed: number = 0;
  // connected :boolean = false;
  connectedCallback (): void {
    super.connectedCallback();

    const display: HTMLElement = this.querySelector(".display")!;
    const startBtn = this.querySelector("button.start")!;
    const stopBtn = this.querySelector("button.stop")!;
    const resetBtn = this.querySelector("button.reset")!;

    startBtn.addEventListener("click", (_) => {
      this.started = true;
      this.updateDisplay(display, 0);
    });
    stopBtn.addEventListener("click", (_) => {
      this.started = false;
    });
    resetBtn.addEventListener("click", (_) => {
      this.elapsed = 0;
    });
  }

  updateDisplay (display: HTMLElement, delta: number): void {
    const now = Date.now();
    const elapsed = (this.elapsed += delta);
    requestAnimationFrame(() => {
      if (!this.isConnected) {
        console.log("dis");
        return;
      }
      this.setDisplayToElapsed(display, elapsed);
      if (this.started) {
        this.updateDisplay(display, Date.now() - now);
      }
    });
  }

  setDisplayToElapsed (display: HTMLElement, elapsed: number): void {
    const hourFmt = Math.floor(elapsed / 3600000)
      .toString()
      .padStart(2, "0");
    const minuteFmt = Math.floor(elapsed / 60000)
      .toString()
      .padStart(2, "0");
    const secondFmt = Math.floor(elapsed / 1000)
      .toString()
      .padStart(2, "0");
    const millisFmt = (elapsed % 1000).toString().padStart(3, "0");
    const displayValue = `${hourFmt}:${minuteFmt}:${secondFmt}.${millisFmt}`;
    display.textContent = displayValue;
  }
}

CustomElement.register(
  TimerTool,
  "timer-tool",
  `
<app-header></app-header>
<h1 class="display">00:00:00.0</h1>
<button class="start">Start</button>
<button class="stop">Stop</button>
<button class="reset">Reset</button>
`,
);

export default TimerTool;
