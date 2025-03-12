import { services } from "./cisco.js";
import { urlServer } from "../config.js";
import * as sass from "sass";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to format temperature for Cisco IP Phone
export function formatTemperature(temp) {
  return `${Math.round(temp)}*C`;
}

export function send(tosend, res) {
  const xml = `<?xml version="1.0"?>${tosend}`;
  res.set("Content-Type", "text/xml");
  res.send(xml);
}

export function processWeatherData(data) {
  return data.properties.timeseries.slice(0, 5).map((entry, id) => {
    const time = entry.time;
    const temperature = entry.data.instant.details.air_temperature;
    const condition =
      entry.data.next_1_hours?.summary.symbol_code ||
      entry.data.next_6_hours?.summary.symbol_code ||
      entry.data.next_12_hours?.summary.symbol_code;
    return {
      time,
      temperature,
      condition,
      id,
      details: entry.data.instant.details,
    };
  });
}

// Simulated Lotto data for Bavaria.
export function getSimulatedLottoData() {
  // Generating random numbers for Lotto Bayern (6 aus 49).
  const numbers = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 49) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  numbers.sort((a, b) => a - b);

  // Super Number (0-9) generation
  const superNumber = Math.floor(Math.random() * 10);

  // Current date
  const currentDate = new Date();

  // Next draw (Wednesday and Saturday).
  const nextDrawDate = new Date(currentDate);
  const currentDay = currentDate.getDay();

  if (currentDay < 3) {
    // Before Wednesday
    nextDrawDate.setDate(nextDrawDate.getDate() + (3 - currentDay));
  } else if (currentDay < 6) {
    // Before Saturday
    nextDrawDate.setDate(nextDrawDate.getDate() + (6 - currentDay));
  } else {
    // After Saturday
    nextDrawDate.setDate(nextDrawDate.getDate() + (3 + (7 - currentDay)));
  }

  return {
    numbers,
    superNumber,
    drawDate: currentDate
      .toLocaleDateString("de-DE")
      .replace(/[^\w\s\-,.]/g, ""),
    nextDrawDate: nextDrawDate
      .toLocaleDateString("de-DE")
      .replace(/[^\w\s\-,.]/g, ""),
  };
}

export function formatTime(rdate = new Date()) {
  const date = new Date(rdate);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function mainPage(res, url) {
  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cisco Phone Services</title>
  <style>${sass.compile(`${__dirname}/main.scss`, { style: "compressed" }).css}</style>
</head>
<body>
  <header>Cisco Phone Services</header>
  <main>
    <div>
      <p>Available services: <a href="${url}">${url}</a></p>
      <ul>${services
        .map(
          (service) => `
          <li>
            <a href="${service.url}">${service.name}</a>
          </li>`,
        )
        .join("")}
      </ul>
    </div>
    <div>
    <h3>Configure the Phone</h3>
<pre>&lt;<span class="pl-ent">device</span>&gt;
    <span class="pl-c"><span class="pl-c">&lt;!--</span>&gt;Other config infos &lt;<span class="pl-c">--&gt;</span></span>
    &lt;<span class="pl-ent">servicesURL</span>&gt;${urlServer}/Cisco/services.xml&lt;/<span class="pl-ent">servicesURL</span>&gt;
&lt;/<span class="pl-ent">device</span>&gt;</pre>
    </div>
  </main>
  <footer>Opensource: <a href="https://github.com/skorotkiewicz/cisco-services">GitHub</a></footer>
</body>
</html>`);
}
