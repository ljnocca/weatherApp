var baseURL = 'https://api.darksky.net/forecast/f693ad4fa47137321f70f403e91be488/'
var navNode = document.querySelector('.navBar')
navigator.geolocation.getCurrentPosition(handleCoords)

//**************************HANDLECOORDS: CREATES HASH PATH**************************
function handleCoords (coordsObj) { 
    var lat = coordsObj.coords.latitude
    var lng = coordsObj.coords.longitude
    var hashString = lat + '/' + lng + '/current'
    window.location.hash = hashString

    navNode.addEventListener('click',function(event){
    	window.location.hash = lat + '/' + lng + event.target.value
    })
}

function handleError(err) {//this function is only run if an error is detected
    console.log('Error!', err)
}


//**************************CUURENT WEATHER**************************
function handleCurrent(currentWeather) {
    var containerNode = document.querySelector('.weatherContainer')
    containerNode.innerHTML += '<h1>Current temperature: ' + currentWeather.currently.temperature+ ' &#8457</h1>'
    containerNode.innerHTML += '<h4>Feels like : ' + currentWeather.currently.apparentTemperature+ ' &#8457</h4>'
    containerNode.innerHTML += '<h2>'+ currentWeather.currently.summary+ '</h2>'
    containerNode.innerHTML += '<h5>Chance of rain: '+ currentWeather.currently.precipProbability * 100 + ' %</h5>'
}

//**************************DAILY WEATHER**************************
function dayConverter (unixTime){
  	var date = new Date(unixTime*1000);
	var day = date.getDay();
    if (day === 1){
        return 'Monday'
    }if (day === 2){
        return 'Tuesday'
    }if (day === 3){
        return 'Wednesday'
    }if (day === 4){
        return 'Thursday'
    }if (day === 5){
        return 'Friday'
    }if (day === 6){
        return 'Saturday'
    }if (day === 0){
        return 'Sunday'
    }
}

function dailyHTML(dailyWeather) {
    var htmlString = ''
    htmlString += '<h1>Day: ' + dayConverter(dailyWeather.time)+ '</h1>'
    htmlString += '<h1>Max temperature: ' + dailyWeather.temperatureMax+ ' &#8457</h1>'
    htmlString += '<h1>Min temperature: ' + dailyWeather.temperatureMin + ' &#8457</h1>'
    htmlString += '<h2>Chance of rain: '+ dailyWeather.precipProbability * 100 + ' %</h2>'
    return htmlString
}

function handleDaily(arrayOfObjects){
	var arrayToHTML = ''
	var dailyArray = arrayOfObjects.daily.data
	var containerNode = document.querySelector('.weatherContainer')
	for (var i = 0; i<dailyArray.length; i++){
		arrayToHTML += dailyHTML(dailyArray[i])
	}
	containerNode.innerHTML = arrayToHTML
}

//**************************HOURLY WEATHER**************************
function handleHourly(hourlyWeather) {
    var containerNode = document.querySelector('.weatherContainer')
    containerNode.innerHTML = '<p>gonna show you the hourly weather</p>'
}

//**************************CONTROLLER**************************
function controller() {
    var hashStr = location.hash.substr(1)
    var hashParts = hashStr.split('/')

    var latitude = hashParts[0]
    var longitude = hashParts[1]
    var viewType = hashParts[2]

    var promiseInput = baseURL+latitude+','+longitude+'?callback=?'
    var weatherPromise = $.getJSON(promiseInput)

    if (hashParts.length < 3) {
        // if there is not enough information currently in the hash,
        // then get the user's current location, and write 
        // a new hash accordingly
        (handleCoords, handleError)
        return // leave the controller. the controller will run again when
        // handleCoords causes another hashchange
    }

    if (viewType === 'current') {
        weatherPromise.then(handleCurrent)
    } else if (viewType === 'daily') {
        weatherPromise.then(handleDaily)
    } else if (viewType === 'hourly') {
        weatherPromise.then(handleHourly)
    }
}

window.addEventListener('hashchange', controller)

controller()


