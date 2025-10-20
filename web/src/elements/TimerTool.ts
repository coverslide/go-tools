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

    this.parseHash();

    startBtn.addEventListener("click", (_) => {
      void this.blankAudio.play();
      this.startTimerLogic();
    });
    stopBtn.addEventListener("click", (_) => {
      this.started = false;
    });
    resetBtn.addEventListener("click", (_) => {
      this.resetTimer();
      this.updateDisplay(display, 0);
    });
  }

  startTimerLogic (): void {
    if (this.started) {
      return;
    }
    this.started = true;
    if (this.remaining <= 0) {
      const hoursInput: HTMLInputElement = this.root.querySelector("input[name=hours]")!;
      const minutesInput: HTMLInputElement = this.root.querySelector("input[name=minutes]")!;
      const secondsInput: HTMLInputElement = this.root.querySelector("input[name=seconds]")!;

      const hours = parseInt(hoursInput.value, 10);
      const minutes = parseInt(minutesInput.value, 10);
      const seconds = parseInt(secondsInput.value, 10);

      const total = (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);

      this.remaining = total;
    }
    this.updateDisplay(this.root.querySelector(".display")!, 0);
  }

  parseHash (): void {
    const hash = window.location.hash.substring(1);
    if (!hash) {
      return;
    }

    const autoStart = hash.endsWith("!");
    const timeString = autoStart ? hash.substring(0, hash.length - 1) : hash;

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timeString.includes(":")) {
      const parts = timeString.split(":").map(part => parseInt(part, 10));
      if (parts.length === 2) {
        minutes = parts[0];
        seconds = parts[1];
      } else if (parts.length === 3) {
        hours = parts[0];
        minutes = parts[1];
        seconds = parts[2];
      }
    } else {
      const time = parseInt(timeString, 10);
      if (!isNaN(time)) {
        if (time > 60) {
          minutes = Math.floor(time / 60);
          seconds = time % 60;
        } else {
          seconds = time;
        }
      }
    }

    const total = (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);
    this.remaining = total;

    const hoursInput: HTMLInputElement = this.root.querySelector("input[name=hours]")!;
    const minutesInput: HTMLInputElement = this.root.querySelector("input[name=minutes]")!;
    const secondsInput: HTMLInputElement = this.root.querySelector("input[name=seconds]")!;

    hoursInput.value = hours.toString();
    minutesInput.value = minutes.toString();
    secondsInput.value = seconds.toString();

    this.updateDisplay(this.root.querySelector(".display")!, 0);

    if (autoStart) {
      this.startTimerLogic();
    }

    // Clear the hash from the URL
    window.history.replaceState({}, document.title, window.location.pathname);
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
<style>
  :host section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin: 0 auto; /* Center the section itself */
    max-width: fit-content; /* Allow section to shrink to content size */
  }

  :host .timer {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  :host .timer input {
    width: 3em;
    font-size: 1.2em;
  }

  :host h1.display {
    text-align: center;
    font-size: 3em;
  }

  :host button {
    margin-top: 5px;
  }

  @media (max-width: 600px) {
    :host .timer input {
      width: 4em;
      font-size: 1.5em;
    }

    :host h1.display {
      font-size: 2.5em;
    }
  }
</style>
`,
);

export default TimerTool;
