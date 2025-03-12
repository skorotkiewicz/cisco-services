// Funkcja do formatowania temperatury dla Cisco IP Phone
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

// Symulowane dane Lotto dla Bawarii
export function getSimulatedLottoData() {
  // Generowanie losowych liczb dla Lotto Bayern (6 aus 49)
  const numbers = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 49) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  numbers.sort((a, b) => a - b);

  // Generowanie Super Number (0-9)
  const superNumber = Math.floor(Math.random() * 10);

  // Aktualna data
  const currentDate = new Date();

  // Następne losowanie (środa i sobota)
  const nextDrawDate = new Date(currentDate);
  const currentDay = currentDate.getDay();

  if (currentDay < 3) {
    // Przed środą
    nextDrawDate.setDate(nextDrawDate.getDate() + (3 - currentDay));
  } else if (currentDay < 6) {
    // Przed sobotą
    nextDrawDate.setDate(nextDrawDate.getDate() + (6 - currentDay));
  } else {
    // Po sobocie
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
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f7fa;
      color: #333;
      line-height: 1.6;
    }
    main {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    h2 {
      color: #049fd9;
      border-bottom: 2px solid #e6e6e6;
      padding-bottom: 0.5rem;
      margin-top: 0;
    }
    p { margin-bottom: 1.5rem; }
    a {
      color: #005073;
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 500;
    }
    a:hover {
      color: #049fd9;
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      main {
        margin: 1rem;
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <main>
    <h2>Cisco Phone Services</h2>
    <p>
      Available services:
      <a href="${url}">${url}</a>
    </p>
  </main>
</body>
</html>`);
}
