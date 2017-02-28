// 1. loading gif
// 2. weather image based on icon state
// clear-day, 
// clear-night, 
// rain, 
// snow, 
// sleet, 
// wind, 
// fog, 
// cloudy, 
// partly-cloudy-day,
// partly-cloudy-night

//*******************************************************************
//CONTROLLER: CHECKS IF HASH EXISTS. IF SO, ASSIGN/RUN VIEWS. IF NOT, RUN HANDLE COORDS.
//*******************************************************************
var baseURL = 'https://api.darksky.net/forecast/f693ad4fa47137321f70f403e91be488/'

function controller() {
    var hashStr = location.hash.substr(1) //read url after hash and assign it to var hashStr
    var hashParts = hashStr.split('/') //split to an array & assign to 3 variables (lat, long, viewtype)
    var latitude = hashParts[0]
    var longitude = hashParts[1]
    var viewType = hashParts[2]

    var promiseInput = baseURL+latitude+','+longitude+'?callback=?'
    var weatherPromise = $.getJSON(promiseInput)
  
    if (hashParts.length < 3) { //run handleCoords if less than 3 hash parts
        (handleCoords, handleError)
        navigator.geolocation.getCurrentPosition(handleCoords)
        return // leave the controller. the controller will run again when handleCoords causes another hashchange
    } 

    if (viewType === 'current') {
        weatherPromise.then(handleCurrent)
        showGif()
    } else if (viewType === 'daily') {
        weatherPromise.then(handleDaily)
        showGif()
    } else if (viewType === 'hourly') {
        weatherPromise.then(handleHourly)
        showGif()
    }
}

//*******************************************************************
//HANDLECOORDS: CREATES HASH PATH
//*******************************************************************
var navNode = document.querySelector('.navBar')

function handleCoords (coordsObj) { 
    var lat = coordsObj.coords.latitude
    var lng = coordsObj.coords.longitude
    
    navNode.addEventListener('click',function(event){
        window.location.hash = lat + '/' + lng + event.target.value
    })

    window.location.hash =  lat + '/' + lng + '/current'
}

function handleError(err) {//this function is only run if an error is detected
    console.log('Error!', err)
}

//*******************************************************************
//LOADER GIF FUNCTIONS
//*******************************************************************

function hideGif() {
    var loadingIcon = document.querySelector('#loader')
    loadingIcon.style.display = 'none'
}

function showGif() {
    var loadingIcon = document.querySelector('#loader')
    loadingIcon.style.display = 'block'
}

//*******************************************************************
//EVENT LISTENERS
//*******************************************************************
var googleAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address='
var searchNode = document.querySelector('.searchBar')

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



//*******************************************************************
//CURRENT WEATHER
//*******************************************************************

// function activateCurrentSkycon() {
//     var skycons = new Skycons({color:'white'})
//     skycons.add('current', Skycons.SNOW)
//     skycons.play()
// }


function handleCurrent(currentWeather) {
	var htmlString = ''
    var containerNode = document.querySelector('.weatherContainer')
    htmlString += '<div class="innerDiv currentWeather">'
    htmlString +=	'<h1>NOW</h1>'
    htmlString += 	'<h3>'+ currentWeather.currently.summary+ '</h3>'
    htmlString += 	'<h3>' + Math.floor(currentWeather.currently.temperature) + ' &#8457</h3>'
    htmlString += 	'<h4>Feels like ' + Math.floor(currentWeather.currently.apparentTemperature) + ' &#8457</h4>'
    htmlString += 	'<h4>'+ Math.floor(currentWeather.currently.precipProbability*100) + '% chance of rain</h5>'
    // htmlString +=   '<canvas id="current" width="128" height="128"></canvas>'
    htmlString += '</div>'
    containerNode.innerHTML= htmlString
    // activateCurrentSkycon()
    hideGif()
}

//*******************************************************************
//DAILY WEATHER
//*******************************************************************

function handleDaily(arrayOfObjects){
	var arrayToHTML = ''
	var dailyArray = arrayOfObjects.daily.data
	var containerNode = document.querySelector('.weatherContainer')
	for (var i = 0; i<7; i++){
		arrayToHTML += dailyHTML(dailyArray[i])
	}
	containerNode.innerHTML = arrayToHTML
    hideGif()
}

function dailyHTML(dailyWeather) {
    var htmlString = ''
    htmlString += '<div class="innerDiv">'
    htmlString += 	'<h3><u>' + dayConverter(dailyWeather.time)+ '</u></h3>'
    htmlString += 	'<h4>Temp: ' + Math.floor(dailyWeather.temperatureMax)+ ' / ' + Math.floor(dailyWeather.temperatureMin) +  '&#8457</h4>'
    htmlString += 	'<h4>'+ dailyWeather.summary+ '</h4>'
    htmlString += 	'<h4>Chance of rain: '+ Math.floor(dailyWeather.precipProbability * 100) + ' %</h4>'
    htmlString += '</div>'
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

//*******************************************************************
//HOURLY WEATHER
//*******************************************************************
function handleHourly(arrayOfObjects){
	var arrayToHTML = ''
	var hourlyArray = arrayOfObjects.hourly.data
	var containerNode = document.querySelector('.weatherContainer')
	for (var i = 0; i<7; i++){
		arrayToHTML += hourlyHTML(hourlyArray[i])
	}
	containerNode.innerHTML = arrayToHTML
    hideGif()
}

function hourlyHTML(hourlyWeather) {
	var htmlString = ''
	htmlString += '<div class="innerDiv">'
    htmlString += 	'<h3>' + hourConverter(hourlyWeather.time) + '</h3>'
    htmlString += 	'<h4>'+ hourlyWeather.summary+ '</h4>'
    htmlString += 	'<h4>Temperature: ' + Math.floor(hourlyWeather.temperature) + ' &#8457</h4>'
    htmlString += 	'<h4>Chance of rain: '+ Math.floor(hourlyWeather.precipProbability*100) + ' %</h4>'
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
//RUN CONTROLLER INITIALLLY & ON EACH HASH CHANGE
//*******************************************************************
controller()
window.addEventListener('hashchange', controller)