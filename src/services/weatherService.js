/**
 * Fetches weather data for a given city.
 * Uses OpenWeatherMap API.
 * 
 * @param {String} city - City name
 * @returns {Promise<Object>} - formatted weather data or null
 */
export const getWeather = async (city) => {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    // Fallback if no key (for demo/testing without breaking immediately, though it won't allow valid data)
    // Actually, let's strictly require the key or fail gracefully.
    if (!API_KEY) {
        console.warn("VITE_WEATHER_API_KEY is missing");
        return null;
    }

    try {
        // 1. Get coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.length) return null;

        const { lat, lon, local_names } = geoData[0];
        const cityName = local_names?.tr || geoData[0].name;

        // 2. Get weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        if (weatherData.cod !== 200) return null;

        return {
            city: cityName,
            temp: Math.round(weatherData.main.temp),
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity
        };

    } catch (error) {
        console.error("Weather API Error:", error);
        return null;
    }
};
