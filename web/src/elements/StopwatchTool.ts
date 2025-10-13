import CustomElement from "@cover-slide/customelement";

class StopwatchTool extends CustomElement {
  started: boolean = false;
  elapsed: number = 0;
  laps: number[] = [];
  // connected :boolean = false;
  connectedCallback (): void {
    super.connectedCallback();

    const display: HTMLElement = this.querySelector(".display")!;
    const startBtn = this.querySelector("button.start")!;
    const stopBtn = this.querySelector("button.stop")!;
    const resetBtn = this.querySelector("button.reset")!;
    const lapBtn = this.querySelector("button.lap")!;

    startBtn.addEventListener("click", (_) => {
      this.started = true;
      this.updateDisplay(display, 0);
    });
    stopBtn.addEventListener("click", (_) => {
      this.started = false;
    });
    resetBtn.addEventListener("click", (_) => {
      this.elapsed = 0;
      this.laps = [];
      this.updateLaps();
      this.setDisplayToElapsed(display, 0);
    });
    lapBtn.addEventListener("click", (_) => {
      this.laps.push(this.elapsed);
      this.updateLaps();
    });
  }

  updateLaps (): void {
    const lapsContainer: HTMLElement = this.querySelector(".laps")!;
    lapsContainer.innerHTML = "";
    let lastLap = 0;
    let lastOffset = 0;
    for (let i = 0; i < this.laps.length; i++) {
      const lap = this.laps[i];
      const lapEl = document.createElement("div");
      const offset = lap - lastLap;
      const offsetDiff = offset - lastOffset;
      const offsetDiffEl = document.createElement("span");
      offsetDiffEl.textContent = ` (${offsetDiff >= 0 ? "+" : ""}${this.formatTime(offsetDiff)})`;
      if (i > 0) {
        if (offsetDiff < 0) {
          offsetDiffEl.classList.add("green");
        } else if (offsetDiff > 0) {
          offsetDiffEl.classList.add("red");
        }
      }
      lapEl.textContent = `Lap ${i + 1}: ${this.formatTime(lap)} (+${this.formatTime(offset)})`;
      lapEl.appendChild(offsetDiffEl);
      lapsContainer.appendChild(lapEl);
      lastLap = lap;
      lastOffset = offset;
    }
  }

  updateDisplay (display: HTMLElement, delta: number): void {
    const now = Date.now();
    const elapsed = (this.elapsed += delta);
    requestAnimationFrame(() => {
      if (!this.isConnected) {
        return;
      }
      this.setDisplayToElapsed(display, elapsed);
      if (this.started) {
        this.updateDisplay(display, Date.now() - now);
      }
    });
  }

  formatTime (elapsed: number): string {
    const sign = elapsed < 0 ? "-" : "";
    elapsed = Math.abs(elapsed);
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
    return `${sign}${hourFmt}:${minuteFmt}:${secondFmt}.${millisFmt}`;
  }

  setDisplayToElapsed (display: HTMLElement, elapsed: number): void {
    display.textContent = this.formatTime(elapsed);
  }
}

CustomElement.register(
  StopwatchTool,
  "stopwatch-tool",
  /* html */
  `
<main-header></main-header>
<h1 class="display">00:00:00.0</h1>
<hr />
<section>
  <button class="start">Start</button>
  <button class="stop">Stop</button>
  <button class="reset">Reset</button>
  <button class="lap">Lap</button>
<section>
<div class="laps"></div>
<style>
  .green {
    color: green;
  }
  .red {
    color: red;
  }
</style>
`,
);

export default StopwatchTool;