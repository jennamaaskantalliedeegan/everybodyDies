//Namespacing our app
const app = {};

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
    });
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
app.getResult = (gender, country, date, year, month) => {
    $.ajax({
        url: `http://api.population.io:80/1.0/life-expectancy/remaining/${gender}/${country}/${date}/${year}y${month}m/`,
        method: "GET",
        dataType: "json"
    }).then((data) => {
        console.log(data.remaining_life_expectancy);
    });
};

app.getCountries = () => {
    $.ajax({
        url: "http://api.population.io:80/1.0/countries/",
        method: "GET",
        dataType: "json"
    }).then((data) => {
        app.displayCountries(data.countries);
    });
}
//extract remaining life expectancy from returned data

//convert data into years / months / days / hours / minutes / seconds

//display data on page

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




app.badCountries = ["Canada", "Finland"];




//Create app init!
app.init = () => {
    app.eventHandler();
    app.getCountries();
};



//Document Ready
$(function(){
    app.init();
});