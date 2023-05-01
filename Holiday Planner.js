// Select DOM elements
const countrySelect = document.getElementById("countrySelect");
const holidaySelect = document.getElementById("holidaySelect");
const areaSelect = document.getElementById("areaSelect");
const holidayComponent = document.getElementById('holidayComponent');
const areaComponent = document.getElementById('areaComponent');
const weatherInformation = document.getElementById('weatherInformation');
const accommodationInformation = document.getElementById("accommodationInformation");

// Populate countrySelect element function
async function populateCountries() {
    try {
        const response = await fetch(`https://calendarific.com/api/v2/countries?api_key=e848a45fa01407c3254cbae6a328435c8bdced96`);
        const data = await response.json();
        const countries = data.response.countries;
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country["iso-3166"];
            option.text = country.country_name;
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}
// Populate holidaySelect element function
async function populateHolidays(countryCode) {
    try {
        const response = await fetch(`https://holidays-by-api-ninjas.p.rapidapi.com/v1/holidays?country=${countryCode}&year=2023`,
            {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'd21a81036dmshc990f106706d7b5p1beeecjsnba84a550c7d5',
                'X-RapidAPI-Host': 'holidays-by-api-ninjas.p.rapidapi.com'
            }
        });
        const data = await response.json();
        holidaySelect.innerHTML = '<option value="">-- Select a holiday --</option>';
        data.forEach(holiday => {
            const option = document.createElement('option');
            option.value = holiday.date.replace(/-/g, "");
            option.text = holiday.name;
            holidaySelect.appendChild(option);
        });
        holidayComponent.style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}
// Populate areaSelect element function
async function populateAreas(countryCode) {
    try {
        const response = await fetch(`https://booking-com.p.rapidapi.com/v1/static/cities?country=${countryCode}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'd21a81036dmshc990f106706d7b5p1beeecjsnba84a550c7d5',
                    'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
                }
            });
        const data = await response.json();
        areaSelect.innerHTML = '<option value="">-- Select your area --</option>';
        const areas = data.result;
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = `${area.latitude}|${area.longitude}`;
            option.text = area.name;
            areaSelect.appendChild(option);
        });
        areaComponent.style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}
// Populate accommodation information function
async function populateAccommodations(currentDay, nextDay, accommodationLatitude, accommodationLongitude) {
    try {
        const response = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/search-by-coordinates?checkin_date=${currentDay}&adults_number=2&checkout_date=${nextDay}&locale=en-gb&order_by=popularity&filter_by_currency=AED&latitude=${accommodationLatitude}&longitude=${accommodationLongitude}&room_number=1&units=metric`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'd21a81036dmshc990f106706d7b5p1beeecjsnba84a550c7d5',
                    'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
                }
            });
        const data = await response.json();
        accommodationInformation.innerHTML = "";
        const accommodations = data.result;
        accommodations.forEach(accommodation =>{
            accommodationInformation.innerHTML +="Name: "+accommodation["hotel_name"] +"<br>" +
                                                 "Price: " + accommodation["price_breakdown"]["all_inclusive_price"] + "$" +"<br>";
        });
    } catch (error) {
        console.error(error);
    }
}
// Populate weather information function
async function populateWeather(date, latitude, longitude) {
    try {
        const response = await fetch(`https://weather338.p.rapidapi.com/weather/forecast?date=${date}&latitude=${latitude}&longitude=${longitude}&units=m`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'd21a81036dmshc990f106706d7b5p1beeecjsnba84a550c7d5',
                    'X-RapidAPI-Host': 'weather338.p.rapidapi.com'
                }
            });
        const data = await response.json();
        weatherInformation.innerHTML ="Weather: "+data["v3-wx-observations-current"].cloudCoverPhrase;
        const p = document.createElement("p");
        p.innerHTML= "Temperature: " + data["v3-wx-observations-current"].temperature;
        weatherInformation.appendChild(p);
    } catch (error) {
        console.error(error);
    }
}
// Define AdapterInterface class for handling interface incompatibility issues
class AdapterComponent{
    // Method return Country Code
    getCountryCode(){
        const countryCode = countrySelect.value.toLowerCase();
        if (!countryCode) {
            return;
        }
        return countryCode;
    }
    // Method to return date, latitude, and longitude
    getLocationData() {
        const optionValues = areaSelect.value.split('|');
        return {
            date: holidaySelect.value,
            latitude: optionValues[0],
            longitude: optionValues[1]
        };
    }
    getAccommodationData() {
        const date = this.getLocationData().date;// Format like 20230421
        const latitude = this.getLocationData().latitude;
        const longitude = this.getLocationData().longitude;
        const dateObj = new Date(`${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`); // Format 2023-04-21
        const currentDay = dateObj.toISOString().substring(0, 10);
        dateObj.setDate(dateObj.getDate() + 1);
        const nextDay = new Date(dateObj.getTime() + 86400000).toISOString().substring(0, 10);
        return { currentDay, nextDay, latitude, longitude };
    }
}

// Populate countries
populateCountries().then();
// Weather component parameters
const adapter = new AdapterComponent();
// Populate holidays and areas based on countryCode
countrySelect.addEventListener('change', () => {
    const countryCode = adapter.getCountryCode();
    populateHolidays(countryCode).then();
    populateAreas(countryCode).then();
});

// Populate weather content and accommodations after using AdapterComponent
areaSelect.addEventListener('change', () => {
    const date = adapter.getLocationData().date;
    const latitude = adapter.getLocationData().latitude;
    const longitude = adapter.getLocationData().longitude;

    // Accommodation component parameters
    const currentDay = adapter.getAccommodationData().currentDay;
    const nextDay = adapter.getAccommodationData().nextDay;
    const accommodationLatitude = adapter.getAccommodationData().latitude;
    const accommodationLongitude = adapter.getAccommodationData().longitude;
    if (!latitude || !longitude || !date || !currentDay || !nextDay || !accommodationLatitude || !accommodationLongitude) {
        return;
    }

    populateWeather(date, latitude, longitude).then();
    populateAccommodations(currentDay, nextDay, accommodationLatitude, accommodationLongitude).then();
});

