const API_KEY = "9cc4edd6d8064a5b7d8fea55305f7c1d"
const geocode_API_KEY = "5333f43e8a7a4553abee4745425cae8b"
const geocode_API_URL = "https://api.opencagedata.com/geocode/v1/json"
const API_URL = "https://api.openweathermap.org/data/2.5/"

let forcast = {
  fetchForcast: function(city) {
    fetch(`${API_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`)
      .then((responce) => {
        if (!responce.ok) {
          alert("No forcast found");
          throw new Error("No forcast found.");
        }
        return responce.json();
      }).then((data) => this.displayForcast(data));
  },
  displayForcast: function(data) {
    // Get latest weather data for each day
    let days = [];
    for (let i = 0; i < data.list.length; i++) {
      let exists = false
      for (let j = 0; j < days.length; j++) {
        if (days[j].dt_txt.substr(0, 10) == data.list[i].dt_txt.substr(0, 10)) {
          days[j] = data.list[i]
          exists = true
          break
        }
      }

      if (!exists) days.push(data.list[i])
    }

    // Display todays data
    document.querySelector(".city").innerText = `Weather in ${data.city.name}`;
    document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${days[0].weather[0].icon}.png`;
    document.querySelector(".description").innerText = days[0].weather[0].description;
    document.querySelector(".temp").innerText = `${days[0].main.temp} °C`;
    document.querySelector(".humidity").innerText = `Humidity: ${days[0].main.humidity}%`;
    document.querySelector(".wind").innerText = `Wind speed: ${days[0].wind.speed}km/h`;
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage = `var(--${days[0].weather[0].main})`;

    // Display next 5 days data
  },
  search: function() {
    this.fetchForcast(document.querySelector(".search-bar").value);
  }
}

let geocode = {
  reverseGeocode: function (latitude, longitude) {
    var request_url = `${geocode_API_URL}?key=${geocode_API_KEY}&q=${encodeURIComponent(latitude+","+longitude)}&pretty=1&no_annotations=1`

    // see full list of required and optional parameters:
    // https://opencagedata.com/api#forward

    var request = new XMLHttpRequest();
    request.open("GET", request_url, true);

    request.onload = function () {
      // see full list of possible response codes:
      // https://opencagedata.com/api#codes

      if (request.status == 200) {
        // Success!
        var data = JSON.parse(request.responseText);
        forcast.fetchForcast(data.results[0].components.city);
        console.log(data.results[0].components.city)
      } else if (request.status <= 500) {
        // We reached our target server, but it returned an error

        console.log("unable to geocode! Response code: " + request.status);
        var data = JSON.parse(request.responseText);
        console.log("error msg: " + data.status.message);
      } else {
        console.log("server error");
      }
    };

    request.onerror = function () {
      // There was a connection error of some sort
      console.log("unable to connect to server");
    };

    request.send(); // make the request
  },
  getLocation: function() {
    function success (data) {
      geocode.reverseGeocode(data.coords.latitude, data.coords.longitude);
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, console.error);
    }
    else {
      forcast.fetchForcast("Surrey");
    }
  }
};

document.querySelector(".search button").addEventListener("click", function () {
  forcast.search();
});

document.querySelector(".search-bar")
.addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    forcast.search();
  }
});

geocode.getLocation();
