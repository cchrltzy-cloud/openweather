import { API_KEY } from "./config.js";

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const result = document.getElementById("weather-result");
const error = document.getElementById("error");
const loading = document.getElementById("loading");
const toggleBtn = document.getElementById("theme-toggle");

/* ================= THEME TOGGLE ================= */
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("night");
  document.body.classList.toggle("day");

  toggleBtn.textContent =
    document.body.classList.contains("night")
      ? "Switch to Day Mode"
      : "Switch to Night Mode";
});

/* ================= WEATHER FETCH ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    error.textContent = "Please enter a city name.";
    return;
  }

  error.textContent = "";
  loading.textContent = "Loading weather data...";
  result.innerHTML = "";

  try {
    const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("City not found");
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    displayCurrent(current);
    displayForecast(forecast);
  } catch (err) {
    error.textContent = err.message;
  } finally {
    loading.textContent = "";
  }
});

/* ================= DISPLAY FUNCTIONS ================= */
function displayCurrent(data) {
  result.innerHTML = `
    <div class="weather-card">
      <h2>${data.name}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
      <p>Temperature: ${data.main.temp}°C</p>
      <p>Humidity: ${data.main.humidity}%</p>
    </div>
  `;
}

function displayForecast(data) {
  const days = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  const forecastHTML = days.map(day => `
    <div class="forecast-card">
      <p>${new Date(day.dt_txt).toDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      <p>${day.main.temp}°C</p>
    </div>
  `).join("");

  result.innerHTML += `
    <div class="forecast">
      ${forecastHTML}
    </div>
  `;
}
