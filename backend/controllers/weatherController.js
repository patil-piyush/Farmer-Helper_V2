axios = require("axios");


const getWeather = async (req, res) => {
    try {
      const { location } = req.body; //will change if frontend change
  
      if (!location) {
        return res.status(400).json({ error: "Location query parameter is required" });
      }
  
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
  
      const response = await axios.get(url);
      const data = response.data;
  
      const weather = {
        location: data.name,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        condition: data.weather[0].description,
        wind_speed: data.wind.speed,
        country: data.sys.country,
      };
  
      res.json(weather);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch weather data",
        details: err.response?.data?.message || err.message,
      });
    }
  }


module.exports = {
    getWeather,
};