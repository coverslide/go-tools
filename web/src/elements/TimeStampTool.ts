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
  timezone: string = "UTC";
  timerId?: number;

  connectedCallback (): void {
    super.connectedCallback();
    this.timestampInput = this.root.querySelector("input.timestamp")!;
    this.pauseButton = this.root.querySelector("button.pause")!;
    const enterForm = this.root.querySelector("form.enter-form")!;
    const errorBox = this.root.querySelector("error-box")!;
    const timezoneSelect = this.root.querySelector("select.timezone-select")!;

    timezoneSelect.value = localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.timezone = timezoneSelect.value;

    timezoneSelect.addEventListener("change", () => {
      this.timezone = timezoneSelect.value;
      localStorage.setItem("timezone", this.timezone);
      this.updateTicker(this.paused ? parseInt(this.root.querySelector("pre.timestamp-output")!.textContent!, 10) : Date.now());
    });

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
      const secondsInput: HTMLInputElement = enterForm.querySelector("input.seconds-input")!;
      const millisecondsInput: HTMLInputElement = enterForm.querySelector("input.milliseconds-input")!;
      const value = timestampInput.value;
      const seconds = parseInt(secondsInput.value, 10);
      const milliseconds = parseInt(millisecondsInput.value, 10);
      try {
        const timestampValue = new Date(value).getTime() + (seconds * 1000) + milliseconds;
        if (isNaN(timestampValue)) {
          throw new Error("invalid timestamp value");
        }
        this.updateTicker(timestampValue);
        this.pause();
      } catch (error) {
        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: (error as Error).message }));
      }
    }) as EventListener);

    const dateToTimestampForm = this.root.querySelector("form.date-to-timestamp-form")!;
    dateToTimestampForm.addEventListener("submit", ((event: SubmitEvent) => {
      event.preventDefault();
      const dateInput: HTMLInputElement = dateToTimestampForm.querySelector("input.date-input")!;
      const value = dateInput.value;
      try {
        const timestampValue = new Date(value).getTime();
        if (isNaN(timestampValue)) {
          throw new Error("invalid date string");
        }
        this.updateTicker(timestampValue);
        this.pause();
      } catch (error) {
        errorBox.dispatchEvent(new CustomEvent<string>("app-error", { detail: (error as Error).message }));
      }
    }) as EventListener);

    const secondsInput: HTMLInputElement = this.root.querySelector("input.seconds-input")!;
    secondsInput.addEventListener("input", () => { this.updateTimestampFromInputs(); });

    const millisecondsInput: HTMLInputElement = this.root.querySelector("input.milliseconds-input")!;
    millisecondsInput.addEventListener("input", () => { this.updateTimestampFromInputs(); });

    const timestampInput: HTMLInputElement = this.root.querySelector("input.timestamp-input")!;
    timestampInput.addEventListener("input", () => { this.updateTimestampFromInputs(); });

    this.timerId = window.setInterval(() => { this.updateTimestamp(); }, 1000);
    this.updateTimestamp();
  }

  updateTimestampFromInputs (): void {
    const timestampInput: HTMLInputElement = this.root.querySelector("input.timestamp-input")!;
    const secondsInput: HTMLInputElement = this.root.querySelector("input.seconds-input")!;
    const millisecondsInput: HTMLInputElement = this.root.querySelector("input.milliseconds-input")!;

    const value = timestampInput.value;
    const seconds = parseInt(secondsInput.value, 10) || 0;
    const milliseconds = parseInt(millisecondsInput.value, 10) || 0;

    try {
      const timestampValue = new Date(value).getTime() + (seconds * 1000) + milliseconds;
      if (isNaN(timestampValue)) {
        return;
      }
      this.updateTicker(timestampValue);
      this.pause();
    } catch (error) {
      // ignore
    }
  }

  disconnectedCallback (): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }
  pause (): void {
    this.pauseButton!.textContent = "Resume";
    this.paused = true;
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }

  resume (): void {
    this.pauseButton!.textContent = "Pause";
    this.paused = false;
    this.timerId = window.setInterval(() => { this.updateTimestamp(); }, 1000);
  }

  updateTimestamp (): void {
    if (!this.isConnected) {
      return;
    }
    if (this.paused) {
      return;
    }
    this.updateTicker(Date.now());
  }

  updateTicker (timestamp: number): void {
    this.root.querySelector("pre.timestamp-output")!.textContent = (this.mode === Mode.Millis ? timestamp : Math.floor(timestamp / 1000)).toString(10);
    const date = new Date(timestamp);

    const rfc822Formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: this.timezone,
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "shortOffset",
    });

    const parts = rfc822Formatter.formatToParts(date);
    const rfc822Date = `${parts.find(p => p.type === "weekday")!.value}, ${parts.find(p => p.type === "day")!.value} ${parts.find(p => p.type === "month")!.value} ${parts.find(p => p.type === "year")!.value} ${parts.find(p => p.type === "hour")!.value}:${parts.find(p => p.type === "minute")!.value}:${parts.find(p => p.type === "second")!.value} ${parts.find(p => p.type === "timeZoneName")!.value}`;

    this.root.querySelector("dd.rfc-date")!.textContent = rfc822Date;
    this.root.querySelector("dd.locale-date")!.textContent = date.toLocaleString(undefined, { timeZone: this.timezone, timeZoneName: "longOffset" });
    this.root.querySelector("dd.iso-date")!.textContent = date.toLocaleString("en-CA", { timeZone: "UTC", hourCycle: "h23" }).replace(",", "").replace(" ", "T") + "Z";

    const timestampInput: HTMLInputElement = this.root.querySelector("input.timestamp-input")!;
    const secondsInput: HTMLInputElement = this.root.querySelector("input.seconds-input")!;
    const millisecondsInput: HTMLInputElement = this.root.querySelector("input.milliseconds-input")!;

    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const hh = date.getHours().toString().padStart(2, "0");
    const mi = date.getMinutes().toString().padStart(2, "0");

    timestampInput.value = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    secondsInput.value = date.getSeconds().toString().padStart(2, "0");
    millisecondsInput.value = date.getMilliseconds().toString().padStart(3, "0");
  }
}

CustomElement.register(
  TimestampTool,
  "timestamp-tool",
  /* html */
  `
<main-header></main-header>
<error-box></error-box>
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
  <label for="timezone">Timezone:</label>
  <select id="timezone" class="timezone-select">
    <optgroup label="GMT"><option value="Africa/Abidjan">Africa/Abidjan</option><option value="Africa/Accra">Africa/Accra</option><option value="Africa/Bamako">Africa/Bamako</option><option value="Africa/Banjul">Africa/Banjul</option><option value="Africa/Bissau">Africa/Bissau</option><option value="Africa/Conakry">Africa/Conakry</option><option value="Africa/Dakar">Africa/Dakar</option><option value="Africa/Freetown">Africa/Freetown</option><option value="Africa/Lome">Africa/Lome</option><option value="Africa/Monrovia">Africa/Monrovia</option><option value="Africa/Nouakchott">Africa/Nouakchott</option><option value="Africa/Ouagadougou">Africa/Ouagadougou</option><option value="Africa/Sao_Tome">Africa/Sao_Tome</option><option value="America/Danmarkshavn">America/Danmarkshavn</option><option value="Atlantic/Azores">Atlantic/Azores</option><option value="Atlantic/Reykjavik">Atlantic/Reykjavik</option><option value="Atlantic/St_Helena">Atlantic/St_Helena</option></optgroup><optgroup label="GMT+03:00"><option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option><option value="Africa/Asmera">Africa/Asmera</option><option value="Africa/Cairo">Africa/Cairo</option><option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option><option value="Africa/Djibouti">Africa/Djibouti</option><option value="Africa/Kampala">Africa/Kampala</option><option value="Africa/Mogadishu">Africa/Mogadishu</option><option value="Africa/Nairobi">Africa/Nairobi</option><option value="Antarctica/Syowa">Antarctica/Syowa</option><option value="Asia/Aden">Asia/Aden</option><option value="Asia/Amman">Asia/Amman</option><option value="Asia/Baghdad">Asia/Baghdad</option><option value="Asia/Bahrain">Asia/Bahrain</option><option value="Asia/Beirut">Asia/Beirut</option><option value="Asia/Damascus">Asia/Damascus</option><option value="Asia/Famagusta">Asia/Famagusta</option><option value="Asia/Gaza">Asia/Gaza</option><option value="Asia/Hebron">Asia/Hebron</option><option value="Asia/Jerusalem">Asia/Jerusalem</option><option value="Asia/Kuwait">Asia/Kuwait</option><option value="Asia/Nicosia">Asia/Nicosia</option><option value="Asia/Qatar">Asia/Qatar</option><option value="Asia/Riyadh">Asia/Riyadh</option><option value="Europe/Athens">Europe/Athens</option><option value="Europe/Bucharest">Europe/Bucharest</option><option value="Europe/Chisinau">Europe/Chisinau</option><option value="Europe/Helsinki">Europe/Helsinki</option><option value="Europe/Istanbul">Europe/Istanbul</option><option value="Europe/Kiev">Europe/Kiev</option><option value="Europe/Kirov">Europe/Kirov</option><option value="Europe/Mariehamn">Europe/Mariehamn</option><option value="Europe/Minsk">Europe/Minsk</option><option value="Europe/Moscow">Europe/Moscow</option><option value="Europe/Riga">Europe/Riga</option><option value="Europe/Simferopol">Europe/Simferopol</option><option value="Europe/Sofia">Europe/Sofia</option><option value="Europe/Tallinn">Europe/Tallinn</option><option value="Europe/Vilnius">Europe/Vilnius</option><option value="Europe/Volgograd">Europe/Volgograd</option><option value="Indian/Antananarivo">Indian/Antananarivo</option><option value="Indian/Comoro">Indian/Comoro</option><option value="Indian/Mayotte">Indian/Mayotte</option></optgroup><optgroup label="GMT+01:00"><option value="Africa/Algiers">Africa/Algiers</option><option value="Africa/Bangui">Africa/Bangui</option><option value="Africa/Brazzaville">Africa/Brazzaville</option><option value="Africa/Casablanca">Africa/Casablanca</option><option value="Africa/Douala">Africa/Douala</option><option value="Africa/El_Aaiun">Africa/El_Aaiun</option><option value="Africa/Kinshasa">Africa/Kinshasa</option><option value="Africa/Lagos">Africa/Lagos</option><option value="Africa/Libreville">Africa/Libreville</option><option value="Africa/Luanda">Africa/Luanda</option><option value="Africa/Malabo">Africa/Malabo</option><option value="Africa/Ndjamena">Africa/Ndjamena</option><option value="Africa/Niamey">Africa/Niamey</option><option value="Africa/Porto-Novo">Africa/Porto-Novo</option><option value="Africa/Tunis">Africa/Tunis</option><option value="Atlantic/Canary">Atlantic/Canary</option><option value="Atlantic/Faeroe">Atlantic/Faeroe</option><option value="Atlantic/Madeira">Atlantic/Madeira</option><option value="Europe/Dublin">Europe/Dublin</option><option value="Europe/Guernsey">Europe/Guernsey</option><option value="Europe/Isle_of_Man">Europe/Isle_of_Man</option><option value="Europe/Jersey">Europe/Jersey</option><option value="Europe/Lisbon">Europe/Lisbon</option><option value="Europe/London">Europe/London</option></optgroup><optgroup label="GMT+02:00"><option value="Africa/Blantyre">Africa/Blantyre</option><option value="Africa/Bujumbura">Africa/Bujumbura</option><option value="Africa/Ceuta">Africa/Ceuta</option><option value="Africa/Gaborone">Africa/Gaborone</option><option value="Africa/Harare">Africa/Harare</option><option value="Africa/Johannesburg">Africa/Johannesburg</option><option value="Africa/Juba">Africa/Juba</option><option value="Africa/Khartoum">Africa/Khartoum</option><option value="Africa/Kigali">Africa/Kigali</option><option value="Africa/Lubumbashi">Africa/Lubumbashi</option><option value="Africa/Lusaka">Africa/Lusaka</option><option value="Africa/Maputo">Africa/Maputo</option><option value="Africa/Maseru">Africa/Maseru</option><option value="Africa/Mbabane">Africa/Mbabane</option><option value="Africa/Tripoli">Africa/Tripoli</option><option value="Africa/Windhoek">Africa/Windhoek</option><option value="Antarctica/Troll">Antarctica/Troll</option><option value="Arctic/Longyearbyen">Arctic/Longyearbyen</option><option value="Europe/Amsterdam">Europe/Amsterdam</option><option value="Europe/Andorra">Europe/Andorra</option><option value="Europe/Belgrade">Europe/Belgrade</option><option value="Europe/Berlin">Europe/Berlin</option><option value="Europe/Bratislava">Europe/Bratislava</option><option value="Europe/Brussels">Europe/Brussels</option><option value="Europe/Budapest">Europe/Budapest</option><option value="Europe/Busingen">Europe/Busingen</option><option value="Europe/Copenhagen">Europe/Copenhagen</option><option value="Europe/Gibraltar">Europe/Gibraltar</option><option value="Europe/Kaliningrad">Europe/Kaliningrad</option><option value="Europe/Ljubljana">Europe/Ljubljana</option><option value="Europe/Luxembourg">Europe/Luxembourg</option><option value="Europe/Madrid">Europe/Madrid</option><option value="Europe/Malta">Europe/Malta</option><option value="Europe/Monaco">Europe/Monaco</option><option value="Europe/Oslo">Europe/Oslo</option><option value="Europe/Paris">Europe/Paris</option><option value="Europe/Podgorica">Europe/Podgorica</option><option value="Europe/Prague">Europe/Prague</option><option value="Europe/Rome">Europe/Rome</option><option value="Europe/San_Marino">Europe/San_Marino</option><option value="Europe/Sarajevo">Europe/Sarajevo</option><option value="Europe/Skopje">Europe/Skopje</option><option value="Europe/Stockholm">Europe/Stockholm</option><option value="Europe/Tirane">Europe/Tirane</option><option value="Europe/Vaduz">Europe/Vaduz</option><option value="Europe/Vatican">Europe/Vatican</option><option value="Europe/Vienna">Europe/Vienna</option><option value="Europe/Warsaw">Europe/Warsaw</option><option value="Europe/Zagreb">Europe/Zagreb</option><option value="Europe/Zurich">Europe/Zurich</option></optgroup><optgroup label="GMT-09:00"><option value="America/Adak">America/Adak</option><option value="Pacific/Gambier">Pacific/Gambier</option></optgroup><optgroup label="GMT-08:00"><option value="America/Anchorage">America/Anchorage</option><option value="America/Juneau">America/Juneau</option><option value="America/Metlakatla">America/Metlakatla</option><option value="America/Nome">America/Nome</option><option value="America/Sitka">America/Sitka</option><option value="America/Yakutat">America/Yakutat</option><option value="Pacific/Pitcairn">Pacific/Pitcairn</option></optgroup><optgroup label="GMT-04:00"><option value="America/Anguilla">America/Anguilla</option><option value="America/Antigua">America/Antigua</option><option value="America/Aruba">America/Aruba</option><option value="America/Barbados">America/Barbados</option><option value="America/Blanc-Sablon">America/Blanc-Sablon</option><option value="America/Boa_Vista">America/Boa_Vista</option><option value="America/Campo_Grande">America/Campo_Grande</option><option value="America/Caracas">America/Caracas</option><option value="America/Cuiaba">America/Cuiaba</option><option value="America/Curacao">America/Curacao</option><option value="America/Detroit">America/Detroit</option><option value="America/Dominica">America/Dominica</option><option value="America/Grand_Turk">America/Grand_Turk</option><option value="America/Grenada">America/Grenada</option><option value="America/Guadeloupe">America/Guadeloupe</option><option value="America/Guyana">America/Guyana</option><option value="America/Havana">America/Havana</option><option value="America/Indiana/Marengo">America/Indiana/Marengo</option><option value="America/Indiana/Petersburg">America/Indiana/Petersburg</option><option value="America/Indiana/Vevay">America/Indiana/Vevay</option><option value="America/Indiana/Vincennes">America/Indiana/Vincennes</option><option value="America/Indiana/Winamac">America/Indiana/Winamac</option><option value="America/Indianapolis">America/Indianapolis</option><option value="America/Iqaluit">America/Iqaluit</option><option value="America/Kentucky/Monticello">America/Kentucky/Monticello</option><option value="America/Kralendijk">America/Kralendijk</option><option value="America/La_Paz">America/La_Paz</option><option value="America/Louisville">America/Louisville</option><option value="America/Lower_Princes">America/Lower_Princes</option><option value="America/Manaus">America/Manaus</option><option value="America/Marigot">America/Marigot</option><option value="America/Martinique">America/Martinique</option><option value="America/Montserrat">America/Montserrat</option><option value="America/Nassau">America/Nassau</option><option value="America/New_York">America/New_York</option><option value="America/Port-au-Prince">America/Port-au-Prince</option><option value="America/Port_of_Spain">America/Port_of_Spain</option><option value="America/Porto_Velho">America/Porto_Velho</option><option value="America/Puerto_Rico">America/Puerto_Rico</option><option value="America/Santo_Domingo">America/Santo_Domingo</option><option value="America/St_Barthelemy">America/St_Barthelemy</option><option value="America/St_Kitts">America/St_Kitts</option><option value="America/St_Lucia">America/St_Lucia</option><option value="America/St_Thomas">America/St_Thomas</option><option value="America/St_Vincent">America/St_Vincent</option><option value="America/Toronto">America/Toronto</option><option value="America/Tortola">America/Tortola</option></optgroup><optgroup label="GMT-03:00"><option value="America/Araguaina">America/Araguaina</option><option value="America/Argentina/La_Rioja">America/Argentina/La_Rioja</option><option value="America/Argentina/Rio_Gallegos">America/Argentina/Rio_Gallegos</option><option value="America/Argentina/Salta">America/Argentina/Salta</option><option value="America/Argentina/San_Juan">America/Argentina/San_Juan</option><option value="America/Argentina/San_Luis">America/Argentina/San_Luis</option><option value="America/Argentina/Tucuman">America/Argentina/Tucuman</option><option value="America/Argentina/Ushuaia">America/Argentina/Ushuaia</option><option value="America/Asuncion">America/Asuncion</option><option value="America/Bahia">America/Bahia</option><option value="America/Belem">America/Belem</option><option value="America/Buenos_Aires">America/Buenos_Aires</option><option value="America/Catamarca">America/Catamarca</option><option value="America/Cayenne">America/Cayenne</option><option value="America/Cordoba">America/Cordoba</option><option value="America/Fortaleza">America/Fortaleza</option><option value="America/Glace_Bay">America/Glace_Bay</option><option value="America/Goose_Bay">America/Goose_Bay</option><option value="America/Halifax">America/Halifax</option><option value="America/Jujuy">America/Jujuy</option><option value="America/Maceio">America/Maceio</option><option value="America/Mendoza">America/Mendoza</option><option value="America/Moncton">America/Moncton</option><option value="America/Montevideo">America/Montevideo</option><option value="America/Paramaribo">America/Paramaribo</option><option value="America/Punta_Arenas">America/Punta_Arenas</option><option value="America/Recife">America/Recife</option><option value="America/Santarem">America/Santarem</option><option value="America/Santiago">America/Santiago</option><option value="America/Sao_Paulo">America/Sao_Paulo</option><option value="America/Thule">America/Thule</option><option value="Antarctica/Palmer">Antarctica/Palmer</option><option value="Antarctica/Rothera">Antarctica/Rothera</option><option value="Atlantic/Bermuda">Atlantic/Bermuda</option><option value="Atlantic/Stanley">Atlantic/Stanley</option></optgroup><optgroup label="GMT-06:00"><option value="America/Bahia_Banderas">America/Bahia_Banderas</option><option value="America/Belize">America/Belize</option><option value="America/Boise">America/Boise</option><option value="America/Cambridge_Bay">America/Cambridge_Bay</option><option value="America/Chihuahua">America/Chihuahua</option><option value="America/Ciudad_Juarez">America/Ciudad_Juarez</option><option value="America/Costa_Rica">America/Costa_Rica</option><option value="America/Denver">America/Denver</option><option value="America/Edmonton">America/Edmonton</option><option value="America/El_Salvador">America/El_Salvador</option><option value="America/Guatemala">America/Guatemala</option><option value="America/Inuvik">America/Inuvik</option><option value="America/Managua">America/Managua</option><option value="America/Merida">America/Merida</option><option value="America/Mexico_City">America/Mexico_City</option><option value="America/Monterrey">America/Monterrey</option><option value="America/Regina">America/Regina</option><option value="America/Swift_Current">America/Swift_Current</option><option value="America/Tegucigalpa">America/Tegucigalpa</option><option value="Pacific/Galapagos">Pacific/Galapagos</option></optgroup><optgroup label="GMT-05:00"><option value="America/Bogota">America/Bogota</option><option value="America/Cancun">America/Cancun</option><option value="America/Cayman">America/Cayman</option><option value="America/Chicago">America/Chicago</option><option value="America/Coral_Harbour">America/Coral_Harbour</option><option value="America/Eirunepe">America/Eirunepe</option><option value="America/Guayaquil">America/Guayaquil</option><option value="America/Indiana/Knox">America/Indiana/Knox</option><option value="America/Indiana/Tell_City">America/Indiana/Tell_City</option><option value="America/Jamaica">America/Jamaica</option><option value="America/Lima">America/Lima</option><option value="America/Matamoros">America/Matamoros</option><option value="America/Menominee">America/Menominee</option><option value="America/North_Dakota/Beulah">America/North_Dakota/Beulah</option><option value="America/North_Dakota/Center">America/North_Dakota/Center</option><option value="America/North_Dakota/New_Salem">America/North_Dakota/New_Salem</option><option value="America/Ojinaga">America/Ojinaga</option><option value="America/Panama">America/Panama</option><option value="America/Rankin_Inlet">America/Rankin_Inlet</option><option value="America/Resolute">America/Resolute</option><option value="America/Rio_Branco">America/Rio_Branco</option><option value="America/Winnipeg">America/Winnipeg</option><option value="Pacific/Easter">Pacific/Easter</option></optgroup><optgroup label="GMT-07:00"><option value="America/Creston">America/Creston</option><option value="America/Dawson">America/Dawson</option><option value="America/Dawson_Creek">America/Dawson_Creek</option><option value="America/Fort_Nelson">America/Fort_Nelson</option><option value="America/Hermosillo">America/Hermosillo</option><option value="America/Los_Angeles">America/Los_Angeles</option><option value="America/Mazatlan">America/Mazatlan</option><option value="America/Phoenix">America/Phoenix</option><option value="America/Tijuana">America/Tijuana</option><option value="America/Vancouver">America/Vancouver</option><option value="America/Whitehorse">America/Whitehorse</option></optgroup><optgroup label="GMT-01:00"><option value="America/Godthab">America/Godthab</option><option value="America/Scoresbysund">America/Scoresbysund</option><option value="Atlantic/Cape_Verde">Atlantic/Cape_Verde</option></optgroup><optgroup label="GMT-02:00"><option value="America/Miquelon">America/Miquelon</option><option value="America/Noronha">America/Noronha</option><option value="Atlantic/South_Georgia">Atlantic/South_Georgia</option></optgroup><optgroup label="GMT-02:30"><option value="America/St_Johns">America/St_Johns</option></optgroup><optgroup label="GMT+08:00"><option value="Antarctica/Casey">Antarctica/Casey</option><option value="Asia/Brunei">Asia/Brunei</option><option value="Asia/Hong_Kong">Asia/Hong_Kong</option><option value="Asia/Irkutsk">Asia/Irkutsk</option><option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option><option value="Asia/Kuching">Asia/Kuching</option><option value="Asia/Macau">Asia/Macau</option><option value="Asia/Makassar">Asia/Makassar</option><option value="Asia/Manila">Asia/Manila</option><option value="Asia/Shanghai">Asia/Shanghai</option><option value="Asia/Singapore">Asia/Singapore</option><option value="Asia/Taipei">Asia/Taipei</option><option value="Asia/Ulaanbaatar">Asia/Ulaanbaatar</option><option value="Australia/Perth">Australia/Perth</option></optgroup><optgroup label="GMT+07:00"><option value="Antarctica/Davis">Antarctica/Davis</option><option value="Asia/Bangkok">Asia/Bangkok</option><option value="Asia/Barnaul">Asia/Barnaul</option><option value="Asia/Hovd">Asia/Hovd</option><option value="Asia/Jakarta">Asia/Jakarta</option><option value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</option><option value="Asia/Novokuznetsk">Asia/Novokuznetsk</option><option value="Asia/Novosibirsk">Asia/Novosibirsk</option><option value="Asia/Phnom_Penh">Asia/Phnom_Penh</option><option value="Asia/Pontianak">Asia/Pontianak</option><option value="Asia/Saigon">Asia/Saigon</option><option value="Asia/Tomsk">Asia/Tomsk</option><option value="Asia/Vientiane">Asia/Vientiane</option><option value="Indian/Christmas">Indian/Christmas</option></optgroup><optgroup label="GMT+10:00"><option value="Antarctica/DumontDUrville">Antarctica/DumontDUrville</option><option value="Asia/Ust-Nera">Asia/Ust-Nera</option><option value="Asia/Vladivostok">Asia/Vladivostok</option><option value="Australia/Brisbane">Australia/Brisbane</option><option value="Australia/Lindeman">Australia/Lindeman</option><option value="Pacific/Guam">Pacific/Guam</option><option value="Pacific/Port_Moresby">Pacific/Port_Moresby</option><option value="Pacific/Saipan">Pacific/Saipan</option><option value="Pacific/Truk">Pacific/Truk</option></optgroup><optgroup label="GMT+11:00"><option value="Antarctica/Macquarie">Antarctica/Macquarie</option><option value="Asia/Magadan">Asia/Magadan</option><option value="Asia/Sakhalin">Asia/Sakhalin</option><option value="Asia/Srednekolymsk">Asia/Srednekolymsk</option><option value="Australia/Hobart">Australia/Hobart</option><option value="Australia/Lord_Howe">Australia/Lord_Howe</option><option value="Australia/Melbourne">Australia/Melbourne</option><option value="Australia/Sydney">Australia/Sydney</option><option value="Pacific/Bougainville">Pacific/Bougainville</option><option value="Pacific/Efate">Pacific/Efate</option><option value="Pacific/Guadalcanal">Pacific/Guadalcanal</option><option value="Pacific/Kosrae">Pacific/Kosrae</option><option value="Pacific/Noumea">Pacific/Noumea</option><option value="Pacific/Ponape">Pacific/Ponape</option></optgroup><optgroup label="GMT+05:00"><option value="Antarctica/Mawson">Antarctica/Mawson</option><option value="Antarctica/Vostok">Antarctica/Vostok</option><option value="Asia/Almaty">Asia/Almaty</option><option value="Asia/Aqtau">Asia/Aqtau</option><option value="Asia/Aqtobe">Asia/Aqtobe</option><option value="Asia/Ashgabat">Asia/Ashgabat</option><option value="Asia/Atyrau">Asia/Atyrau</option><option value="Asia/Dushanbe">Asia/Dushanbe</option><option value="Asia/Karachi">Asia/Karachi</option><option value="Asia/Oral">Asia/Oral</option><option value="Asia/Qostanay">Asia/Qostanay</option><option value="Asia/Qyzylorda">Asia/Qyzylorda</option><option value="Asia/Samarkand">Asia/Samarkand</option><option value="Asia/Tashkent">Asia/Tashkent</option><option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option><option value="Indian/Kerguelen">Indian/Kerguelen</option><option value="Indian/Maldives">Indian/Maldives</option></optgroup><optgroup label="GMT+13:00"><option value="Antarctica/McMurdo">Antarctica/McMurdo</option><option value="Pacific/Apia">Pacific/Apia</option><option value="Pacific/Auckland">Pacific/Auckland</option><option value="Pacific/Enderbury">Pacific/Enderbury</option><option value="Pacific/Fakaofo">Pacific/Fakaofo</option><option value="Pacific/Tongatapu">Pacific/Tongatapu</option></optgroup><optgroup label="GMT+12:00"><option value="Asia/Anadyr">Asia/Anadyr</option><option value="Asia/Kamchatka">Asia/Kamchatka</option><option value="Pacific/Fiji">Pacific/Fiji</option><option value="Pacific/Funafuti">Pacific/Funafuti</option><option value="Pacific/Kwajalein">Pacific/Kwajalein</option><option value="Pacific/Majuro">Pacific/Majuro</option><option value="Pacific/Nauru">Pacific/Nauru</option><option value="Pacific/Norfolk">Pacific/Norfolk</option><option value="Pacific/Tarawa">Pacific/Tarawa</option><option value="Pacific/Wake">Pacific/Wake</option><option value="Pacific/Wallis">Pacific/Wallis</option></optgroup><optgroup label="GMT+04:00"><option value="Asia/Baku">Asia/Baku</option><option value="Asia/Dubai">Asia/Dubai</option><option value="Asia/Muscat">Asia/Muscat</option><option value="Asia/Tbilisi">Asia/Tbilisi</option><option value="Asia/Yerevan">Asia/Yerevan</option><option value="Europe/Astrakhan">Europe/Astrakhan</option><option value="Europe/Samara">Europe/Samara</option><option value="Europe/Saratov">Europe/Saratov</option><option value="Europe/Ulyanovsk">Europe/Ulyanovsk</option><option value="Indian/Mahe">Indian/Mahe</option><option value="Indian/Mauritius">Indian/Mauritius</option><option value="Indian/Reunion">Indian/Reunion</option></optgroup><optgroup label="GMT+06:00"><option value="Asia/Bishkek">Asia/Bishkek</option><option value="Asia/Dhaka">Asia/Dhaka</option><option value="Asia/Omsk">Asia/Omsk</option><option value="Asia/Thimphu">Asia/Thimphu</option><option value="Asia/Urumqi">Asia/Urumqi</option><option value="Indian/Chagos">Indian/Chagos</option></optgroup><optgroup label="GMT+05:30"><option value="Asia/Calcutta">Asia/Calcutta</option><option value="Asia/Colombo">Asia/Colombo</option></optgroup><optgroup label="GMT+09:00"><option value="Asia/Chita">Asia/Chita</option><option value="Asia/Dili">Asia/Dili</option><option value="Asia/Jayapura">Asia/Jayapura</option><option value="Asia/Khandyga">Asia/Khandyga</option><option value="Asia/Pyongyang">Asia/Pyongyang</option><option value="Asia/Seoul">Asia/Seoul</option><option value="Asia/Tokyo">Asia/Tokyo</option><option value="Asia/Yakutsk">Asia/Yakutsk</option><option value="Pacific/Palau">Pacific/Palau</option></optgroup><optgroup label="GMT+04:30"><option value="Asia/Kabul">Asia/Kabul</option></optgroup><optgroup label="GMT+05:45"><option value="Asia/Katmandu">Asia/Katmandu</option></optgroup><optgroup label="GMT+06:30"><option value="Asia/Rangoon">Asia/Rangoon</option><option value="Indian/Cocos">Indian/Cocos</option></optgroup><optgroup label="GMT+03:30"><option value="Asia/Tehran">Asia/Tehran</option></optgroup><optgroup label="GMT+10:30"><option value="Australia/Adelaide">Australia/Adelaide</option><option value="Australia/Broken_Hill">Australia/Broken_Hill</option></optgroup><optgroup label="GMT+09:30"><option value="Australia/Darwin">Australia/Darwin</option></optgroup><optgroup label="GMT+08:45"><option value="Australia/Eucla">Australia/Eucla</option></optgroup><optgroup label="GMT+13:45"><option value="Pacific/Chatham">Pacific/Chatham</option></optgroup><optgroup label="GMT-10:00"><option value="Pacific/Honolulu">Pacific/Honolulu</option><option value="Pacific/Rarotonga">Pacific/Rarotonga</option><option value="Pacific/Tahiti">Pacific/Tahiti</option></optgroup><optgroup label="GMT+14:00"><option value="Pacific/Kiritimati">Pacific/Kiritimati</option></optgroup><optgroup label="GMT-09:30"><option value="Pacific/Marquesas">Pacific/Marquesas</option></optgroup><optgroup label="GMT-11:00"><option value="Pacific/Midway">Pacific/Midway</option><option value="Pacific/Niue">Pacific/Niue</option><option value="Pacific/Pago_Pago">Pacific/Pago_Pago</option></optgroup>
  </select>
</section>
<hr />
<section>
  <form class="enter-form">
    <input class="timestamp-input" plaseholder="Enter date and time" type="datetime-local" />
    <input class="seconds-input" placeholder="ss" type="number" min="0" max="59" />
    <input class="milliseconds-input" placeholder="ms" type="number" min="0" max="999" />
    <input type="submit" />
  </form>
</section>
<hr />
<section>
  <form class="date-to-timestamp-form">
    <input class="date-input" placeholder="Enter date string" type="text" />
    <input type="submit" value="To Timestamp" />
  </form>
</section>
`,
);

export default TimestampTool;
