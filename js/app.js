(function() {
	"use strict";

	var cities = [],
		currentCity;

	// Data from http://download.geonames.org/export/dump/
	// CC 3.0 License
	function loadCities() {
		return $.get( "cities.txt" ).then(function( data ) {
			var rawCitiesData = data.split( "\n" );

			for ( var i = 0; i < rawCitiesData.length; i++ ) {
				var rawCityData = rawCitiesData[ i ].split( "\t" ),
					city = {
						//"geonameid":         rawCityData[ 0 ],
						"name":                rawCityData[ 1 ],
						"asciiname":           rawCityData[ 2 ],
						//"alternatenames":    rawCityData[ 3 ],
						"latitude":            rawCityData[ 4 ],
						"longitude":           rawCityData[ 5 ],
						//"feature_class":     rawCityData[ 6 ],
						//"feature_code":      rawCityData[ 7 ],
						"country_code":        rawCityData[ 8 ],
						//"cc2":               rawCityData[ 9 ],
						//"admin1_code":       rawCityData[ 10 ],
						//"admin2_code":       rawCityData[ 11 ],
						//"admin3_code":       rawCityData[ 12 ],
						//"admin4_code":       rawCityData[ 13 ],
						"population":          rawCityData[ 14 ],
						//"elevation":         rawCityData[ 15 ],
						//"dem":               rawCityData[ 16 ],
						//"timezone":          rawCityData[ 17 ],
						//"modification_date": rawCityData[ 18 ]
					}

				// Only use cities that have at least 100,000 people
				if ( city.population > 100000 ) {
					cities.push( city );
				}
			}
		});
	}

	function buildMap() {
		var map = new google.maps.Map( document.getElementById( "map" ), {
			center: new google.maps.LatLng( 0, 0 ),
			zoom: 2,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			zoomControl: true,
			styles: [
				// Turn off labels
				{
					featureType: "all",
					elementType: "labels",
					stylers: [
						{ visibility: "off" }
					]
				},
				// Turn off roads
				{
					featureType: "road",
					stylers: [
						{ visibility: "off" }
					]
				}
			]
		});
		google.maps.event.addListener( map, "click", handleUserSelection );
	}

	function handleUserSelection( event ) {
		var selected = new LatLon( event.latLng.k, event.latLng.D ),
			correct = new LatLon( currentCity.latitude, currentCity.longitude );

		navigator.notification.alert( "You are " + selected.distanceTo( correct ) + " km off" );
		setNewCity();
	}

	function setNewCity() {
		currentCity = cities[ Math.ceil( Math.random() * cities.length ) ];
		$( "#search" ).html( currentCity.name );
	}

	function init() {
		buildMap();
		loadCities().then(function() {
			setNewCity();
			navigator.splashscreen.hide();
		});
	}

	document.addEventListener( "deviceready", init );
}());