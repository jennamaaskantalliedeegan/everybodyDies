//Namespacing our app
const app = {};

app.timeValues = {
    year: 0,
    month: 0,
    hour: 0,
    minute: 0,
    second:0
}
//Variables - do this later

//Function for event listeners (form submit and button to return to form page)
app.eventHandler = () => {
    $("form").on("submit", function(e) {
        e.preventDefault();
        let gender = $("#gender").val();
        if(gender === "nonBinary" || gender === "unspecified") {
            gender = app.randomGender();
        }
        //Assign form values to varibale
        const country = $("#country").val();
        const date = $("#date").val();
        const year = $("#years").val();
        const month = $("#months").val();
        console.log(gender, country, date, year, month);
        app.getResult(gender, country, date, year, month);
        $("section.result").show();
        app.position = $("section.result").offset().top;
        $("HTML, BODY").animate({scrollTop: app.position}, 3000);
    });

    $("button").on("click", function(){
        $("HTML, BODY").animate({ scrollTop: 0 }, 3000);
        setTimeout(() => {
            $("section.result").hide();
        }, 3000);
    })
}

// function to randomly generate gender
app.randomGender = () => {
    number = Math.floor(Math.random()*2 + 1);
    if( number === 1){
        return "female";
    } else {
        return "male";
    }
}


//make Ajax request using variables
//extract remaining life expectancy from returned data
app.getResult = (gender, country, date, year, month) => {
    $.ajax({
        url: `http://api.population.io:80/1.0/life-expectancy/remaining/${gender}/${country}/${date}/${year}y${month}m/`,
        method: "GET",
        dataType: "json"
    }).then((data) => {
        if (data.remaining_life_expectancy === undefined) {
            alert("Sorry we don't have the data for that area of origin, please try again with another one.");
        } else {
            app.getCountDownValues(data.remaining_life_expectancy);
        }
    }, () => {
        alert("Sorry we don't have the data for that area of origin, please try again with another one.");
    });
};

//convert data into years / months / days / hours / minutes / seconds
app.getCountDownValues = (lifeExpectancy) => {
    app.timeValues.year = app.determineNumber(lifeExpectancy, 1);
    let decimal = lifeExpectancy - app.timeValues.year;
    app.timeValues.month = app.determineNumber(decimal, 12);
    decimal = (decimal * 12) - app.timeValues.month;
    app.timeValues.day = app.determineNumber(decimal, 30);
    decimal = (decimal * 30) - app.timeValues.day;
    app.timeValues.hour = app.determineNumber(decimal, 24)
    decimal = (decimal * 24) - app.timeValues.hour;
    app.timeValues.minute = app.determineNumber(decimal, 60);
    decimal = (decimal * 60) - app.timeValues.minute;
    app.timeValues.second = app.determineNumber(decimal, 60);
    app.displayNumbers();
}

//display countdown on page
app.displayNumbers = () => {
    for(let unit in app.timeValues){
        $(`.${unit}`).text(app.timeValues[unit]);
    }
}


app.determineNumber = (number, constant) => { 
    wholeNumber = Math.floor(number * constant);
    return wholeNumber;
}


app.getCountries = () => {
    $.ajax({
        url: "http://api.population.io:80/1.0/countries/",
        method: "GET",
        dataType: "json"
    }).then((data) => {
        // app.displayCountries(data.countries);
        console.log(data.countries);
        app.unfiltered = data.countries;

        console.log(app.unfiltered);

        app.filtered = app.unfiltered.filter(function (element) {
            return app.badCountries.indexOf(element) === -1;
        })
        console.log(app.filtered);
        app.displayCountries(app.filtered);
    });
}



// reset form

// app.filterCountries = (countries) => {
//     const filteredList = countries.filter((country) => {
//         if (country !== app.badCountries) {
//             return country;
//         }
//     });
//     app.displayCountries(filteredList);
// }

app.displayCountries = (data) => {
    data.forEach((country) => {
        if(country !== "Less developed regions"){
            $(`select[name="country"]`).append(`<option value="${country}">${country}</option>`)

        }
    });
};




app.badCountries = ["AFRICA", "ASIA", "Australia/New Zealand", "Eastern Africa", "Eastern Asia", "Eastern Europe", "EUROPE", "LATIN AMERICA AND THE CARIBBEAN", "Least developed countries", "Less developed regions", "Less developed regions, excluding China", "Less developed regions, excluding least developed countries", "Middle Africa", "More developed regions", "Northern Africa", "NORTHERN AMERICA", "Northern Europe", "OCEANIA", "Other non-specified areas", "South America", "South-Central Asia", "South-Eastern Asia", "Southern Africa", "Southern Asia", "Southern Europe", "Sub-Saharan Africa", "Western Africa", "Western Asia", "Western Europe"];




//Create app init!
app.init = () => {
    app.eventHandler();
    app.getCountries();
};



//Document Ready
$(function(){
    app.init();
});