// const moment = require("moment");


//Namespacing our app
const app = {};

// Variables
const $form = $("form");
const $landing = $(".landing");
const $result = $(".result");
const $gender = $("#gender");
const $country = $("#country");
const $year = $("#year");
const $month = $("#month");
const $day = $("#day");
const $button = $("button");

// object to store countdown values
app.timeValues = {};

// object to store countries that don't have data for remaining life expectancy
app.unsupportedRegions = [
  "AFRICA",
  "ASIA",
  "Australia/New Zealand",
  "Eastern Africa",
  "Eastern Asia",
  "Eastern Europe",
  "EUROPE",
  "LATIN AMERICA AND THE CARIBBEAN",
  "Least developed countries",
  "Less developed regions",
  "Less developed regions, excluding China",
  "Less developed regions, excluding least developed countries",
  "Middle Africa",
  "More developed regions",
  "Northern Africa",
  "NORTHERN AMERICA",
  "Northern Europe",
  "OCEANIA",
  "Other non-specified areas",
  "South America",
  "South-Central Asia",
  "South-Eastern Asia",
  "Southern Africa",
  "Southern Asia",
  "Southern Europe",
  "Sub-Saharan Africa",
  "Western Africa",
  "Western Asia",
  "Western Europe"
];

//Function for event listeners (form submit and button to return to form page)
app.eventHandler = () => {
  $form.on("submit", function(e) {
    e.preventDefault();
    //Assign form values to variables
    let gender = $gender.val();
    // assign random gender if value is nonBinary or unspecified
    if (gender === "nonBinary" || gender === "unspecified") {
      gender = app.randomGender();
    }
    const country = $country.val();
    // convert birthday values into yyyy-mm-dd
    const year = $year.val();
    ("0" + $month.val()).slice(-2);
    const month = ("0" + $month.val()).slice(-2);
    const day = ("0" + $day.val()).slice(-2);
    const birthday = [year, month, day].join("-");
    // get todays date and convert into yyyy-mm-dd format
    const todayDate = moment().format("YYYY-MM-DD");
    //get todays date and convert it to milliseconds
    const nowMilliseconds = moment().valueOf();
    // convert the birthdate to milliseconds and subtract it from the current date in milliseconds, which gives us age in milliseconds and then convert age from milliseconds to days.
    const age = Math.floor(
      (nowMilliseconds - moment(birthday).valueOf()) / (60 * 60 * 24 * 1000)
      );
    const test = moment(birthday).valueOf(); 
    // reset form and clear interval from previous results
    clearInterval(app.interval);
    setTimeout(() => {
      $form[0].reset();
    }, 3000);
    // get API results
    app.getResult(gender, country, todayDate, age);
  });

  // return to landing section and hide result section again
  $button.on("click", function() {
    $form[0].reset();
    $("HTML, BODY").animate({ scrollTop: 0 }, 3000);
    setTimeout(() => {
      $landing.css("overflow", "hidden");
      $result.hide();
    }, 3000);
  });
};

// function to randomly generate gender
app.randomGender = () => {
  number = Math.floor(Math.random() * 2 + 1);
  if (number === 1) {
    return "female";
  } else {
    return "male";
  }
};

//make Ajax request using variables
//extract remaining life expectancy from returned data
app.getResult = (gender, country, date, age) => {
  $.ajax({
    url: `http://api.population.io:80/1.0/life-expectancy/remaining/${gender}/${country}/${date}/${age}d/`,
    method: "GET",
    dataType: "json"
  }).then(
    data => {
      if (data.remaining_life_expectancy === undefined) {
        alert(
          "Sorry we don't have the data for those parameters. This app only supports ages 0-100."
        );
      } else {
        // convert remaining life expectancy into milliseconds and add it today todays date and time (also converted to milliseconds)
        lifeExpectancyMilliseconds =
          data.remaining_life_expectancy * 365.25 * 24 * 60 * 60 * 1000 +
          moment().valueOf();
        app.startCountDown(lifeExpectancyMilliseconds);
        // show results section and scroll smoothly down the page
        $landing.css("overflow", "visible");
        $result.css("display", "flex");
        app.position = $result.offset().top;
        $("HTML, BODY").animate({ scrollTop: app.position }, 3000);
      }
    },
    () => {
      alert(
        "Sorry we don't have the data for those parameters. This app only supports ages 0-100."
      );
    }
  );
};

//initialize the countdown
app.startCountDown = lifeExpectancy => {
  // show initial remaining life expectancy
  app.getCountDownValues(lifeExpectancy);
  if (app.timeValues.second >= 5) {
    app.timeValues.second = app.timeValues.second - 5;
    app.displayNumbers();
    //start countdown after 5 seconds, and reprint minutes, hours, days, months, and years every second
    setTimeout(() => {
      app.interval = setInterval(function() {
        app.getCountDownValues(lifeExpectancy);
        app.displayNumbers();
      }, 1000);
    }, 5000);
  } else {
    app.interval = setInterval(function() {
      app.getCountDownValues(lifeExpectancy);
      app.displayNumbers();
    }, 1000);
  }
};

// calculate countdown values
app.getCountDownValues = lifeExpectancy => {
  // find the difference between life expectancy in milliseconds and the instant date and time converted to milliseconds (this value will change by a second everytime the function is called)
  difference = lifeExpectancy - moment().valueOf();
  // convert this difference into seconds, minutes, hours, days, months, and years
  app.timeValues.second = Math.floor((difference / 1000) % 60);
  app.timeValues.minute = Math.floor((difference / 1000 / 60) % 60);
  app.timeValues.hour = Math.floor((difference / (1000 * 60 * 60)) % 24);
  app.timeValues.day = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30);
  app.timeValues.month = Math.floor(
    (difference / (1000 * 60 * 60 * 24 * 30)) % 12
  );
  app.timeValues.year = Math.floor(
    difference / (1000 * 60 * 60 * 24 * 30 * 12)
  );
};

//display countdown on page
app.displayNumbers = () => {
  for (let unit in app.timeValues) {
    $(`.${unit}`).text(app.timeValues[unit]);
  }
};

// get all countries supported by the popluation app and filter to remove those which don't have data on remaining life expectancy
app.getCountries = () => {
  $.ajax({
    url: "http://api.population.io:80/1.0/countries/",
    method: "GET",
    dataType: "json"
  }).then(data => {
    app.unfiltered = data.countries;
    app.filtered = app.unfiltered.filter(function(element) {
      return app.unsupportedRegions.indexOf(element) === -1;
    });
    app.displayCountries(app.filtered);
  });
};

// display filtered list of countries in the form under the countries select input
app.displayCountries = data => {
  data.forEach(country => {
    if (country !== "Less developed regions") {
      $(`select[name="country"]`).append(
        `<option value="${country}">${country}</option>`
      );
    }
  });
};

// initialize app
app.init = () => {
  app.eventHandler();
  app.getCountries();
};

//Document Ready
$(function() {
  app.init();
});
