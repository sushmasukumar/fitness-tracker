const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.onload = () => {
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById('home').classList.remove('hidden');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀️ Light Mode';
    }
};

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        sections.forEach(section => section.classList.add('hidden'));

        const targetId = link.getAttribute('href').substring(1);
        document.getElementById(targetId).classList.remove('hidden');
    });
});

const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙 Dark Mode';
    }
});

let totalSteps = 0;
let totalCaloriesBurned = 0;

document.getElementById('activity-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const stepsInput = parseInt(document.getElementById('steps').value);
    const unit = document.getElementById('unit').value;

    if (isNaN(stepsInput) || stepsInput <= 0) {
        alert("Please enter a valid number of steps or kilometers.");
        return;
    }

    if (unit === 'km') {
        totalSteps += stepsInput * 1312;  
        totalCaloriesBurned += stepsInput * 50;  
    } else {
        totalSteps += stepsInput;
        totalCaloriesBurned += stepsInput * 0.04;  
    }

    document.getElementById('total-steps').textContent = totalSteps;
    document.getElementById('total-calories').textContent = `${totalCaloriesBurned.toFixed(2)} kcal`;
    document.getElementById('steps').value = '';

    updateChart();
});

let totalCaloriesConsumed = 0;
let calorieGoal = 0;  

document.getElementById('meal-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const mealName = document.getElementById('meal-name').value;
    const calories = parseInt(document.getElementById('calories').value);

    if (!mealName || isNaN(calories) || calories <= 0) {
        alert("Please enter a valid meal and calorie amount.");
        return;
    }

    addMeal(mealName, calories);

    totalCaloriesConsumed += calories;
    updateCalories();

    document.getElementById('meal-name').value = '';
    document.getElementById('calories').value = '';
});

function addMeal(name, calories) {
    const mealList = document.getElementById('meal-list');

    const mealItem = document.createElement('li');
    mealItem.innerHTML = `
        ${name} - ${calories} kcal 
        <span class="remove-btn" style="cursor: pointer; font-weight: bold;">❌</span>
    `;

    mealItem.querySelector('.remove-btn').addEventListener('click', () => {
        mealList.removeChild(mealItem);
        totalCaloriesConsumed -= calories;
        updateCalories();
    });

    mealList.appendChild(mealItem);
}

function updateCalories() {
    const remainingCalories = document.getElementById('remaining-calories');

    remainingCalories.textContent = (calorieGoal - totalCaloriesConsumed).toFixed(2) + " kcal";

    const warningMsg = document.getElementById('warning');
    warningMsg.textContent = (totalCaloriesConsumed > calorieGoal) 
        ? "⚠️ You have exceeded your calorie goal!" 
        : "";
}

function calculateBMR() {
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight-bmr').value);
    const height = parseFloat(document.getElementById('height-bmr').value);

    if (!age || !weight || !height) {
        alert("Please fill in all fields!");
        return;
    }

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    calorieGoal = Math.round(bmr);

    document.getElementById('bmr-result').textContent = `Your BMR is: ${calorieGoal} kcal/day`;
    
    updateCalories();
}


function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100;

    if (!weight || !height) {
        alert("Please enter valid values.");
        return;
    }

    const bmi = weight / (height * height);
    const result = document.getElementById('bmi-result');
    result.textContent = `Your BMI: ${bmi.toFixed(2)}`;

    let label = "";
    let color = "";

    if (bmi < 18.5) {
        label = "Underweight";
        color = "blue";
    } else if (bmi < 24.9) {
        label = "Normal";
        color = "green";
    } else if (bmi < 29.9) {
        label = "Overweight";
        color = "orange";
    } else {
        label = "Obese";
        color = "red";
    }

    result.style.color = color;
    result.textContent += ` (${label})`;

    updateBMIChart(bmi);
}

let bmiChart;

function updateBMIChart(bmi) {
    const ctx = document.getElementById('bmi-chart').getContext('2d');

    if (bmiChart) {
        bmiChart.destroy();
    }

    bmiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Underweight', 'Normal', 'Overweight', 'Obesity'],
            datasets: [{
                data: [18.5, 6.4, 5, 10],
                backgroundColor: ['#4C97FF', '#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            rotation: 270, 
            circumference: 180, 
            plugins: {
                tooltip: {
                    enabled: false
                }
            },
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}


let weather = {
    apiKey: "b30f885a245570783a56c082b0ed9ae8",
    fetchWeather: function (city) {
      fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          city +
          "&units=metric&appid=" +
          this.apiKey
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("City not found");
          }
          return response.json();
        })
        .then((data) => this.displayWeather(data))
        .catch((error) => this.displayError(error.message));
    },
    displayWeather: function (data) {
      const { name } = data;
      const { lon, lat } = data.coord;
      const { icon, description } = data.weather[0];
      const { temp, feels_like, temp_min, temp_max, pressure, humidity } =
        data.main;
      const { speed } = data.wind;
  
      document.querySelector(".city").innerHTML = "Weather in " + name;
      document.querySelector(".long").innerHTML = "( " + lon + " , " + lat + " )";
      document.querySelector(".icon").src =
        "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      document.querySelector(".description").innerText = description;
      document.querySelector(".temp").innerText = temp + "°C";
      document.querySelector(".feelslike").innerText =
        "Feels like: " +
        feels_like +
        "°C  ||  Max: " +
        temp_max +
        "°C  ||  Min: " +
        temp_min +
        "°C";
      document.querySelector(".pressure").innerText =
        "Pressure: " +
        pressure +
        "pa  ||  Humidity: " +
        humidity +
        "%  ||  Wind: " +
        speed +
        "km/h";
    },
    displayError: function (message) {
      document.querySelector(".city").innerText = message;
      document.querySelector(".long").innerText = "";
      document.querySelector(".description").innerText = "";
      document.querySelector(".temp").innerText = "- °C";
      document.querySelector(".feelslike").innerText = "";
      document.querySelector(".pressure").innerText = "";
    },
    search: function () {
      const cityInput = document.querySelector(".search-bar").value;
      if (cityInput.trim() !== "") {
        this.fetchWeather(cityInput);
      }
    },
  };
  
  document.querySelector(".search button").addEventListener("click", function () {
    weather.search();
  });
  
  document.querySelector(".search-bar").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      weather.search();
    }
  });
