import dotenv from "dotenv";
// import axios from 'axios';
//import e from 'express';
dotenv.config();

// TODO: Define an interface for the Coordinates object

interface Coordinates {
  latitude: number;
  longitude: number;
}

// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  coordinates: Coordinates;

  constructor(
    temp: number,
    hum: number,
    windS: number,
    coordinates: Coordinates
  ) {
    this.temperature = temp;
    this.humidity = hum;
    this.windSpeed = windS;
    this.coordinates = coordinates;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  //what is this? from the homework readme
  //[5-day weather forecast API](https://openweathermap.org/forecast5)
  //[Full-Stack Blog on how to use API keys](https://coding-boot-camp.github.io/full-stack/apis/how-to-use-api-keys).

  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey?: string;
  cityName: string = "";

  constructor(cityName: string = "") {
    this.baseURL = process.env.API_BASE_URL || "Your_Base_URL";
    this.apiKey = process.env.API_KEY || "YOUR_API_KEY";
    this.cityName = cityName;
  }

  // // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const response = await fetch(query);

    if (!response.ok) {
      throw new Error("Failed to fetch location data.");
    }
    const data = await response.json();

    const coordinates = [data[0].lat, data[0].lon];

    console.log("data.latitude: " + data[0].lon);

    return coordinates;
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    let myCord: Coordinates;
    console.log("destructureLocationData");
    console.log("locationData.latitude: ", locationData);
    console.log("locationData.latitude: " + locationData[0]);
    console.log("locationData.latitude: " + locationData[1]);
    //console.log("locationData[0]: " + locationData[]);

    console.log("destructureLocationData");

    myCord = { latitude: locationData[0], longitude: locationData[0] };
    return myCord;
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    let query = `http://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&limit=5&appid=${this.apiKey}`;
    console.log("buildGeocodeQuery: ");
    console.log("query: " + query);
    console.log("buildGeocodeQuery: ");
    console.log(" ");

    return query;
  }

  // // TODO: Create buildWeatherQuery method
  private buildCurrentWeatherQuery(coordinates: Coordinates): string {
    let query = `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}`;
    console.log("query: " + query);

    return query;
  }

  private buildForecastWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}`;
    console.log("query: " + query);

    return query;
  }

  // // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    let locationDataDestructured = await this.destructureLocationData(
      await this.fetchLocationData(this.buildGeocodeQuery())
    );
    return locationDataDestructured;
  }

  // // TODO: Create fetchWeatherData method
  private async fetchCurrentWeatherData() {
    const response = await fetch(
      this.buildCurrentWeatherQuery(
        await this.fetchAndDestructureLocationData()
      )
    );

    console.log("response: ", response);

    if (!response.ok) {
      throw new Error("Failed to fetch weather data.");
    }

    const data = await response.json();

    return data;
  }

  private async fetchForecastWeatherData() {
    const response = await fetch(
      this.buildForecastWeatherQuery(
        await this.fetchAndDestructureLocationData()
      )
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data.");
    }

    const data = await response.json();
    const dailyForecast = this.extractDailyData(data.list);

    return {
      city: data.city,
      list: dailyForecast,
    };
  }

  private extractDailyData(dataPoints: any[]): any[] {
    const numberOfDays = 5;
    const chunkSize = 8; // 40 data points / 5 days
    const dailyData: any[] = [];

    for (let i = 0; i < numberOfDays; i++) {
      const chunk = dataPoints.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length > 0) {
        // Assuming the best match is the one with the highest temperature
        const bestMatch = chunk.reduce((best, current) =>
          current.main.temp > best.main.temp ? current : best
        );
        dailyData.push(bestMatch);
      }
    }

    return dailyData;
  }

  // // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const temperature = response.main.temp;
    const humidity = response.main.humidity;
    const windSpeed = response.wind.speed;

    const coordinates: Coordinates = {
      latitude: response.coord.lat,
      longitude: response.coord.long,
    };

    return new Weather(temperature, humidity, windSpeed, coordinates);
  }

  private parseForecastDay(day: any, coordinates: Coordinates): Weather {
    const temperature = day.main.temp;
    const humidity = day.main.humidity;
    const windSpeed = day.wind.speed;

    return new Weather(temperature, humidity, windSpeed, coordinates);
  }

  private parseForecastWeather(response: any): Weather[] {
    const forecast: Weather[] = [];
    const coordinates: Coordinates = {
      latitude: response.city.coord.lat,
      longitude: response.city.coord.lon,
    };
    response.list.forEach((day: any) => {
      forecast.push(this.parseForecastDay(day, coordinates));
    });

    return forecast;
  }

  // // TODO: Complete getWeatherForCity method

  async getWeatherForCity(cityName: string): Promise<Weather[]> {
    this.cityName = cityName;

    const weatherData = await this.fetchCurrentWeatherData();

    const forecast = await this.fetchForecastWeatherData();

    console.log("weatherData: " + weatherData[0]);

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastWeather = this.parseForecastWeather(forecast);

    forecastWeather.unshift(currentWeather);

    return forecastWeather;
  }
}

export default new WeatherService();
