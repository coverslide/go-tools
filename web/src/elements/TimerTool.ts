import CustomElement from "@cover-slide/customelement";
import bell from "../../assets/audio/bell.mp3";
import blank from "../../assets/audio/blank.mp3";

class TimerTool extends CustomElement {
  started: boolean = false;
  remaining: number = 0;
  blankAudio = new Audio(blank);
  bellAudio = new Audio(bell);
  waitFrame = false;
  connectedCallback (): void {
    super.connectedCallback();

    const display: HTMLElement = this.root.querySelector(".display")!;
    const startBtn = this.root.querySelector("button.start")!;
    const stopBtn = this.root.querySelector("button.stop")!;
    const resetBtn = this.root.querySelector("button.reset")!;

    const hoursInput: HTMLInputElement = this.root.querySelector("input[name=hours]")!;
    const minutesInput: HTMLInputElement = this.root.querySelector("input[name=minutes]")!;
    const secondsInput: HTMLInputElement = this.root.querySelector("input[name=seconds]")!;

    startBtn.addEventListener("click", (_) => {
      void this.blankAudio.play();

      if (this.started) {
        return;
      }
      this.started = true;
      if (this.remaining <= 0) {
        const hours = parseInt(hoursInput.value, 10);
        const minutes = parseInt(minutesInput.value, 10);
        const seconds = parseInt(secondsInput.value, 10);

        const total = (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);

        this.remaining = total;
      }
      this.updateDisplay(display, 0);
    });
    stopBtn.addEventListener("click", (_) => {
      this.started = false;
    });
    resetBtn.addEventListener("click", (_) => {
      this.resetTimer();
      this.updateDisplay(display, 0);
    });
  }

  resetTimer (): void {
    const hoursInput: HTMLInputElement = this.root.querySelector("input[name=hours]")!;
    const minutesInput: HTMLInputElement = this.root.querySelector("input[name=minutes]")!;
    const secondsInput: HTMLInputElement = this.root.querySelector("input[name=seconds]")!;

    const hours = parseInt(hoursInput.value, 10);
    const minutes = parseInt(minutesInput.value, 10);
    const seconds = parseInt(secondsInput.value, 10);

    const total = (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);

    this.remaining = total;
  }

  shouldRepeat (): boolean {
    const repeatInput: HTMLInputElement = this.querySelector("input[name=repeat]")!;
    return repeatInput.checked;
  }

  updateDisplay (display: HTMLElement, delta: number): void {
    const now = Date.now();
    let elapsed = (this.remaining -= delta);
    if (elapsed < 0) {
      elapsed = 0;
      this.bellAudio.currentTime = 0.0;
      void this.bellAudio.play();
      if (this.shouldRepeat()) {
        this.resetTimer();
      } else {
        this.started = false;
      }
    }
    if (this.waitFrame) {
      return;
    }
    this.waitFrame = true;
    requestAnimationFrame(() => {
      this.waitFrame = false;
      if (!this.isConnected) {
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
    const minuteFmt = Math.floor((elapsed % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const secondFmt = Math.floor((elapsed % 60000) / 1000)
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
  /* html */
  `
<main-header></main-header>
<h1 class="display">00:00:00.0</h1>
<hr />
<section>
  <span class="timer">
    <input type="number" name="hours" value="0" min="0" max="99" step="1"  pattern="\\d{1,2}"/>
    <span>:</span>
    <input type="number" name="minutes" value="0" min="0" max="99" step="1" pattern="\\d{1,2}" />
    <span>:</span>
    <input type="number"name="seconds" value="0" min="0" max="99" step="1"  pattern="\\d{1,2}" />
  </span>
  <button class="start">Start</button>
  <button class="stop">Stop</button>
  <button class="reset">Reset</button>
  <label><input type="checkbox" name="repeat" /> Repeat</label>
</section>
`,
);

export default TimerTool;
