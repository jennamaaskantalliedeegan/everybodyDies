//Namespacing our app
const app = {};

//Variables - do this later

//Function for event listeners (form submit and button to return to form page)

//Assign form values to varibale

//make Ajax request using variables

app.getResult = () => {
    $.ajax({
        url: `http://api.population.io:80/1.0/life-expectancy/remaining/female/Canada/2019-02-20/28y7m5d/`,
        method: "GET",
        data: "json"
    }).then((data) => {
        console.log(data.remaining_life_expectancy);
    });
};

//extract remaining life expectancy from returned data

//convert data into years / months / days / hours / minutes / seconds

//display data on page

// reset form





//Create app init!
app.init = () => {
    app.getResult();
};



//Document Ready
$(function(){
    app.init();
});