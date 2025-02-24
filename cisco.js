import express from "express";
const router = express.Router();

// Cache dla danych pogodowych
const weatherCache = {
  data: null,
  timestamp: null,
};

// Funkcja do formatowania temperatury dla Cisco IP Phone
function formatTemperature(temp) {
  return `${Math.round(temp)}*C`;
}

function send(tosend, res) {
  const xml = `<?xml version="1.0"?>${tosend}`;
  res.set("Content-Type", "text/xml");
  res.send(xml);
}

router.get("/Cisco/services.xml", (req, res) => {
  const xml = `
    <CiscoIPPhoneMenu>
      <Title>Available Services</Title>
      <Prompt>Select a service:</Prompt>
      <MenuItem>
        <Name>Weather Forecast</Name>
        <URL>http://192.168.0.124:3000/Cisco/Weather</URL>
      </MenuItem>
      <MenuItem>
        <Name>Lotto Results</Name>
        <URL>http://192.168.0.124:3000/Cisco/Lotto</URL>
      </MenuItem>
    </CiscoIPPhoneMenu>`;

  return send(xml, res);
});

router.get("/Cisco/Weather", async (req, res) => {
  const LATITUDE = 48.8082;
  const LONGITUDE = 11.7551;

  try {
    // Sprawdź cache
    if (weatherCache.data && weatherCache.timestamp > Date.now() - 1800000) {
      const forecasts = processWeatherData(weatherCache.data);
      sendWeatherResponse(res, forecasts);
      return;
    }

    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LATITUDE}&lon=${LONGITUDE}`,
      {
        headers: {
          "User-Agent": "Cisco 7942G/1.0 (skorotkiewicz@gmail.com)",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    weatherCache.data = data;
    weatherCache.timestamp = Date.now();

    const forecasts = processWeatherData(data);
    sendWeatherResponse(res, forecasts);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    sendErrorResponse(res);
  }
});

function processWeatherData(data) {
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

function sendWeatherResponse(res, forecasts) {
  const xml = `
    <CiscoIPPhoneMenu>
      <Title>Weather Forecast</Title>
      <Prompt>Select day:</Prompt>
      ${forecasts
        .map(
          (forecast) => `
        <MenuItem>
          <Name>${new Date(forecast.time).toLocaleString("pl-PL")}: ${formatTemperature(forecast.temperature)}, ${forecast.condition}</Name>
          <URL>http://192.168.0.124:3000/Cisco/Weather/Details/${forecast.id}</URL>
        </MenuItem>
      `,
        )
        .join("")}
    </CiscoIPPhoneMenu>`;

  return send(xml, res);
}

router.get("/Cisco/Weather/Details/:id", async (req, res) => {
  try {
    if (!weatherCache.data) {
      throw new Error("No weather data available");
    }

    const forecast = processWeatherData(weatherCache.data)[req.params.id];
    if (!forecast) {
      throw new Error("Forecast not found");
    }

    const details = forecast.details;
    const xml = `
      <CiscoIPPhoneText>
        <Title>Weather Details</Title>
        <Text>
Date: ${new Date(forecast.time).toLocaleString("pl-PL")}
Temperature: ${formatTemperature(details.air_temperature)}
Pressure: ${Math.round(details.air_pressure_at_sea_level)} hPa
Humidity: ${Math.round(details.relative_humidity)}%
Cloud Coverage: ${Math.round(details.cloud_area_fraction)}%
Wind Direction: ${Math.round(details.wind_from_direction)}*
Wind Speed: ${Math.round(details.wind_speed)} m/s
Conditions: ${forecast.condition}
        </Text>
      </CiscoIPPhoneText>`;

    return send(xml, res);
  } catch (error) {
    console.error("Error generating weather details:", error);
    sendErrorResponse(res);
  }
});

// Symulowane dane Lotto dla Bawarii
function getSimulatedLottoData() {
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

router.get("/Cisco/Lotto", async (req, res) => {
  try {
    const lottoData = getSimulatedLottoData();
    const xml = `
      <CiscoIPPhoneText>
        <Title>Lotto Bayern</Title>
        <Text>
Ostatnie losowanie: ${lottoData.drawDate}
Numery: ${lottoData.numbers.join(", ")}
Super Number: ${lottoData.superNumber}
Nastepne losowanie: ${lottoData.nextDrawDate}
        </Text>
      </CiscoIPPhoneText>`;

    return send(xml, res);
  } catch (error) {
    console.error("Error generating lotto response:", error);
    sendErrorResponse(res);
  }
});

function sendErrorResponse(res) {
  const errorXml = `
    <CiscoIPPhoneText>
      <Title>Blad</Title>
      <Text>Wystapil blad podczas pobierania danych.</Text>
    </CiscoIPPhoneText>`;

  return send(errorXml, res);
}

export default router;
