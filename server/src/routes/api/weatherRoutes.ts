import { Router } from "express";
const router = Router();
//  import fs from 'node:fs/promises';

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: POST Request with city name to retrieve weather data

// TODO: GET weather data from city name
//got from parkRoutes.ts api
//idenify lat and lon
// openweathermap geo weather point returns lat and lon
// openweathermap endpoint by city name - resources channel
// https://openweathermap.org/current#name
router.get("/", async (req, res) => {
  try {
    const city = req.body.city;

    //gets send to the front end, then the front end parses the data

    console.log("city" + city);

    const cityData = await WeatherService.getWeatherForCity(city);

    console.log("cityData" + cityData);

    if (typeof cityData === "string") {
      res.status(404).json({ message: "No events found" });

      console.log("city" + cityData);
    } else {
      res.json(cityData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// TODO: save city to search history
//* `GET /api/weather/history` should read the `searchHistory.json` file and return all saved cities as JSON.

router.post("/", async (req, res) => {
  try {
    const city = req.body.cityName;
    await HistoryService.addCity(city);

    const cityData = await WeatherService.getWeatherForCity(city);
    res.json(cityData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// TODO: GET search history
router.get("/history", async (_req, res) => {
  try {
    const savedCities = await HistoryService.getCities();

    res.json(savedCities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// how do we know if we want to get the data from the parameter endpoints or the body?
// ????????????????????????????????????????????????????????????????????????????????????????????????

// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ msg: "City id is required" });
    }
    await HistoryService.removeCity(req.params.id);
    res.json({ success: "City successfully removed from search history" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Listen for connections
app.listen(PORT, () =>
  console.info(`Example app listening at http://localhost:${PORT}`)
);

export default router;
