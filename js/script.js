var baseURL = 'https://api.darksky.net/forecast/f693ad4fa47137321f70f403e91be488/'
var googleAPI = 'http://maps.googleapis.com/maps/api/geocode/json?address='

var navNode = document.querySelector('.navBar')
navigator.geolocation.getCurrentPosition(handleCoords)
var searchNode = document.querySelector('.searchBar')


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
        (handleCoords, handleError)
        return // leave the controller. the controller will run again when handleCoords causes another hashchange
    }

    if (viewType === 'current') {
        weatherPromise.then(handleCurrent)
    } else if (viewType === 'daily') {
        weatherPromise.then(handleDaily)
    } else if (viewType === 'hourly') {
        weatherPromise.then(handleHourly)
    }
}

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


searchNode.addEventListener('keydown',function (event){
	if (event.keyCode === 13){
		var city = event.target.value
		
		var firstLetter = city.substring(0,1).toUpperCase()
		var capitalizedCity = firstLetter + city.substring(1,city.length)
		var pageName = document.querySelector('#pageName')
		pageName.innerHTML = '<h1>'+ capitalizedCity + " weather</h1>"
		
		var googlePromise = $.getJSON(googleAPI+city)
		googlePromise.then(handleCity)
		event.target.value = ''
	}
})
		
function handleCity (apiResponse){
	var lat = apiResponse.results[0].geometry.location.lat
	var lng = apiResponse.results[0].geometry.location.lng
	window.location.hash = lat + '/' + lng + '/current'

	navNode.addEventListener('click',function(event){
    	window.location.hash = lat + '/' + lng + event.target.value
    })
}



function handleError(err) {//this function is only run if an error is detected
    console.log('Error!', err)
}

//*******************************************************************
//								VIEWS
//*******************************************************************

//**************************CURRENT WEATHER**************************
function handleCurrent(currentWeather) {
	var htmlString = ''
    var containerNode = document.querySelector('.weatherContainer')
    htmlString += '<div class="innerDiv">'
    htmlString +=	'<h1>NOW</h1>'
    htmlString += 	'<h2>'+ currentWeather.currently.summary+ '</h2>'
    var currentTemp = currentWeather.currently.temperature.toString()
    htmlString += 	'<h2>' + currentTemp.substring(0,2) + ' &#8457</h2>'
    htmlString += 	'<h4>Feels like ' + currentWeather.currently.apparentTemperature+ ' &#8457</h4>'
    htmlString += 	'<h4>'+ currentWeather.currently.precipProbability * 100 + '% chance of rain</h5>'
    htmlString += '</div>'
    containerNode.innerHTML= htmlString
}

//**************************DAILY WEATHER**************************

function handleDaily(arrayOfObjects){
	var arrayToHTML = ''
	var dailyArray = arrayOfObjects.daily.data
	var containerNode = document.querySelector('.weatherContainer')
	for (var i = 0; i<7; i++){
		arrayToHTML += dailyHTML(dailyArray[i])
	}
	containerNode.innerHTML = arrayToHTML
}

function dailyHTML(dailyWeather) {
    var htmlString = ''
    htmlString += '<div class="innerDiv">'
    htmlString += 	'<h3><u>' + dayConverter(dailyWeather.time)+ '</u></h3>'
    htmlString += 	'<h4>Temp: ' + dailyWeather.temperatureMax+ ' / ' + dailyWeather.temperatureMin +  '&#8457</h4>'
    htmlString += 	'<h4>'+ dailyWeather.summary+ '</h4>'
    htmlString += 	'<h4>Chance of rain: '+ dailyWeather.precipProbability * 100 + ' %</h4>'
    htmlString += '</div>'
    var divNode = document.querySelector('.innerDiv')
    divNode.style.display = 'inline-block'
    divNode.style.width = '32%'
    return htmlString
}

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

//**************************HOURLY WEATHER**************************

function handleHourly(arrayOfObjects){
	var arrayToHTML = ''
	var hourlyArray = arrayOfObjects.hourly.data
	var containerNode = document.querySelector('.weatherContainer')
	for (var i = 0; i<7; i++){
		arrayToHTML += hourlyHTML(hourlyArray[i])
	}
	containerNode.innerHTML = arrayToHTML
}

function hourlyHTML(hourlyWeather) {
	var htmlString = ''
	htmlString += '<div class="innerDiv">'
    htmlString += 	'<h3>' + hourConverter(hourlyWeather.time) + '</h3>'
    htmlString += 	'<h4>'+ hourlyWeather.summary+ '</h4>'
    htmlString += 	'<h4>Temperature: ' + hourlyWeather.temperature + ' &#8457</h4>'
    htmlString += 	'<h4>Chance of rain: '+ hourlyWeather.precipProbability * 100 + ' %</h4>'
    htmlString += '</div>'
    return htmlString
}

function hourConverter(timestamp) {
  var d = new Date(timestamp * 1000),
		hh = d.getHours(),
		h = hh,
		min = ('0' + d.getMinutes()).slice(-2),
		ampm = 'AM',
		time;
			
	if (hh > 12) {
		h = hh - 12;
		ampm = 'PM';
	} else if (hh === 12) {
		h = 12;
		ampm = 'PM';
	} else if (hh == 0) {
		h = 12;
	}
	time = h + ':' + min + ' ' + ampm;	
	return time;
}

//*******************************************************************
//				RUN CONTROLLER INITIALLLY & ON HASH CHAHGE
//*******************************************************************
window.addEventListener('hashchange', controller)
controller()