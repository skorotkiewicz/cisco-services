import express from "express";
import ping from "ping";
import {
  getSimulatedLottoData,
  processWeatherData,
  formatTemperature,
  send,
  formatTime,
} from "./utils.js";
import { urlServer, weather } from "./../config.js";
const router = express.Router();

const weatherCache = {
  data: null,
  timestamp: null,
};

router.get("/Cisco/services.xml", (_req, res) => {
  const xml = `
    <CiscoIPPhoneMenu>
      <Title>Available Services</Title>
      <Prompt>Select a service:</Prompt>
      <MenuItem>
        <Name>Weather Forecast</Name>
        <URL>${urlServer}/Cisco/Weather</URL>
      </MenuItem>
      <MenuItem>
        <Name>Phone Book</Name>
        <URL>${urlServer}/Cisco/PhoneBook</URL>
      </MenuItem>
      <MenuItem>
        <Name>Lotto Results</Name>
        <URL>${urlServer}/Cisco/Lotto</URL>
      </MenuItem>
      <MenuItem>
        <Name>Ping</Name>
        <URL>${urlServer}/Cisco/Ping</URL>
      </MenuItem>
    </CiscoIPPhoneMenu>`;

  return send(xml, res);
});

router.get("/Cisco/Weather", async (_req, res) => {
  try {
    // Check cache
    if (weatherCache.data && weatherCache.timestamp > Date.now() - 1800000) {
      const forecasts = processWeatherData(weatherCache.data);
      sendWeatherResponse(res, forecasts);
      return;
    }

    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${weather.LATITUDE}&lon=${weather.LONGITUDE}`,
      {
        headers: {
          "User-Agent": "Cisco Phone Services",
        },
      },
    );

    if (!response.ok) {
      return sendErrorResponse(res, `HTTP error! Status: ${response.status}`);
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

function sendWeatherResponse(res, forecasts) {
  const xml = `
    <CiscoIPPhoneMenu>
      <Title>Weather Forecast</Title>
      <Prompt>Select day:</Prompt>
      ${forecasts
        .map(
          (forecast) => `
        <MenuItem>
          <Name>${formatTime(forecast.time)}: ${formatTemperature(forecast.temperature)}, ${forecast.condition}</Name>
          <URL>${urlServer}/Cisco/Weather/Details/${forecast.id}</URL>
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
      return sendErrorResponse(res, "No weather data available");
    }

    const forecast = processWeatherData(weatherCache.data)[req.params.id];
    if (!forecast) {
      return sendErrorResponse(res, "Forecast not found");
    }

    const details = forecast.details;
    const xml = `
      <CiscoIPPhoneText>
        <Title>Weather Details</Title>
        <Text>
Date: ${new Date(forecast.time).toLocaleString("en-US")}
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

router.get("/Cisco/Lotto", async (_req, res) => {
  // WIP TODO
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

router.get("/Cisco/Ping", async (_req, res) => {
  try {
    const pingResult = await ping.promise.probe("google.com");

    const xml = `
      <CiscoIPPhoneText>
        <Title>Ping google.com</Title>
        <Text>
        Ping: ${pingResult.time} ms
        </Text>
      </CiscoIPPhoneText>`;

    return send(xml, res);
  } catch (error) {
    console.error("Error generating lotto response:", error);
    sendErrorResponse(res);
  }
});

function sendErrorResponse(
  res,
  text = "There was an error while fetching the data.",
) {
  const errorXml = `
    <CiscoIPPhoneText>
      <Title>Error</Title>
      <Text>${text}</Text>
    </CiscoIPPhoneText>`;

  return send(errorXml, res);
}

export default router;
