//Namespacing our app
const app = {};

app.timeValues = {
    year: 0,
    month: 0,
    hour: 0,
    minute: 0,
    second: 0
}
//Variables - do this later

//Function for event listeners (form submit and button to return to form page)
app.eventHandler = () => {
    $("form").on("submit", function (e) {
        e.preventDefault();
        $(".landing").css("overflow", "visible");
        let gender = $("#gender").val();
        if (gender === "nonBinary" || gender === "unspecified") {
            gender = app.randomGender();
        }
        //Assign form values to varibale
        const country = $("#country").val();

        // get todays date and convert into yyyy-mm-dd format
        const today = new Date()
        const todayYear = today.getFullYear();
        const todayMonth = (today.getMonth()) + 1;
        const todayDay = today.getDate();
        if (todayMonth.length < 2) {
            todayMonth = "0" + todayMonth;
        }
        if (todayDay.length < 2) {
            todayDay = "0" + todayDay;
        }
        todayDate = [todayYear, todayMonth, todayDay].join("-");

        const birthday = $("#birthday").val();
        console.log(birthday);
        // convert todays date and the birthdate to milliseconds and calculate the difference, which gives us age in milliseconds. Convert age from milliseconds to days.
        console.log(Date.parse(birthday));
        const age = (Date.parse(todayDate) - Date.parse(birthday)) / (60 * 60 * 24 * 1000);
        // get API results
        clearInterval(app.interval);
        setTimeout(() => {
            $("form")[0].reset();
        }, 3000);
        app.getResult(gender, country, todayDate, age);
    });
    
    $("button").on("click", function () {
        $(".landing").css("overflow", "hidden");
        $("form")[0].reset();
        $("HTML, BODY").animate({ scrollTop: 0 }, 3000);
        setTimeout(() => {
            $("section.result").hide();
        }, 3000);
    })
}

// function to randomly generate gender
app.randomGender = () => {
    number = Math.floor(Math.random() * 2 + 1);
    if (number === 1) {
        return "female";
    } else {
        return "male";
    }
}


//make Ajax request using variables
//extract remaining life expectancy from returned data
app.getResult = (gender, country, date, age) => {
    $.ajax({
        url: `http://api.population.io:80/1.0/life-expectancy/remaining/${gender}/${country}/${date}/${age}d/`,
        method: "GET",
        dataType: "json"
    }).then((data) => {
        if (data.remaining_life_expectancy === undefined) {
            alert("Sorry we don't have the data for those parameters. Ages over 100 are not supported by this app.");
        } else {
            // convert ramaining life expectancy into milliseconds and add it today todays date and time(also converted to milliseconds)
            lifeExpectancyMilliseconds = (data.remaining_life_expectancy) * 365.25 * 24 * 60 * 60 * 1000 + Date.parse(new Date());
            app.startCountDown(lifeExpectancyMilliseconds);
            // show results section and scroll smoothly down the page
            $("section.result").css("display", "flex");
            app.position = $("section.result").offset().top;
            $("HTML, BODY").animate({ scrollTop: app.position }, 3000);
        }
    }, () => {
        alert("Sorry we don't have the data for those parameters. Ages over 100 are not supported by this app.");
    });
};


app.getCountDownValues = (lifeExpectancy) => {
    // find the difference between life expectancy in milliseconds and the instant date and time converted to milliseconds (this value will change by a second everytime the function is called)
    difference = lifeExpectancy - Date.parse(new Date());
    // convert this difference into seconds, minutes, hours, days, months, and years
    app.timeValues.second = Math.floor((difference / 1000) % 60);
    app.timeValues.minute = Math.floor((difference / 1000 / 60) % 60);
    app.timeValues.hour = Math.floor((difference / (1000 * 60 * 60)) % 24);
    app.timeValues.day = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30);
    app.timeValues.month = Math.floor((difference / (1000 * 60 * 60 * 24 * 30)) % 12);
    app.timeValues.year = Math.floor(difference / (1000 * 60 * 60 * 24 * 30 * 12));
}

app.startCountDown = (lifeExpectancy) => {
    // show initial remaining life expectancy
    app.getCountDownValues(lifeExpectancy);
    
    if (app.timeValues.second >=5){
        app.timeValues.second = app.timeValues.second - 5;
        app.displayNumbers();
    
        //start countdown after 5 seconds, and reprint minutes, hours, days, months, and years every second
        setTimeout(() => {
            app.interval = setInterval(function () {
                app.getCountDownValues(lifeExpectancy);
                app.displayNumbers();
            }, 1000);
        }, 5000);
    } else {
        app.interval = setInterval(function () {
            app.getCountDownValues(lifeExpectancy);
            app.displayNumbers();
        }, 1000);
    }
}


//display countdown on page
app.displayNumbers = () => {
    for (let unit in app.timeValues) {
        $(`.${unit}`).text(app.timeValues[unit]);
    }
}



app.getCountries = () => {
    $.ajax({
        url: "http://api.population.io:80/1.0/countries/",
        method: "GET",
        dataType: "json"
    }).then((data) => {
        console.log(data.countries);
        app.unfiltered = data.countries;

        console.log(app.unfiltered);

        app.filtered = app.unfiltered.filter(function (element) {
            return app.unsupportedRegions.indexOf(element) === -1;
        })
        console.log(app.filtered);
        app.displayCountries(app.filtered);
    });
}

app.displayCountries = (data) => {
    data.forEach((country) => {
        if (country !== "Less developed regions") {
            $(`select[name="country"]`).append(`<option value="${country}">${country}</option>`)

        }
    });
};




app.unsupportedRegions = ["AFRICA", "ASIA", "Australia/New Zealand", "Eastern Africa", "Eastern Asia", "Eastern Europe", "EUROPE", "LATIN AMERICA AND THE CARIBBEAN", "Least developed countries", "Less developed regions", "Less developed regions, excluding China", "Less developed regions, excluding least developed countries", "Middle Africa", "More developed regions", "Northern Africa", "NORTHERN AMERICA", "Northern Europe", "OCEANIA", "Other non-specified areas", "South America", "South-Central Asia", "South-Eastern Asia", "Southern Africa", "Southern Asia", "Southern Europe", "Sub-Saharan Africa", "Western Africa", "Western Asia", "Western Europe"];




//Create app init!
app.init = () => {
    app.eventHandler();
    app.getCountries();
};



//Document Ready
$(function () {
    app.init();
});