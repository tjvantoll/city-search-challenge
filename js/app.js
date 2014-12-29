(function() {
	"use strict";

	// An array of city data for potential matches
	var cities = [],

		// An object containing information on the city the user is looking for
		currentCity,

		// A reference to the Google map object
		map,

		labelsOff = {
			featureType: "all",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		},
		roadsOff = {
			featureType: "road",
			stylers: [
				{ visibility: "off" }
			]
		},

		// A reference to the Google map marker object for the marker currently
		// being displayed on the screen
		currentMarker;

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
		map = new google.maps.Map( document.getElementById( "map" ), {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			zoomControl: true
		});
		google.maps.event.addListener( map, "click", handleUserSelection );
	}

	function addCommas( num ) {
		return num.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );
	}

	function handleUserSelection( event ) {
		var selected = new LatLon( event.latLng.k, event.latLng.D ),
			correct = new LatLon( currentCity.latitude, currentCity.longitude ),
			difference = selected.distanceTo( correct ),
			kmDifference = Math.floor( difference ),
			miDifference = Math.floor( difference * 0.6214 );

		$( ".dialog-city-name" ).text( currentCity.name );
		$( "#dialog-km-off" ).text( addCommas( kmDifference ) );
		$( "#dialog-mi-off" ).text( addCommas( miDifference ) );
		$( "#dialog-next" ).one( "click", setNewCity );
		$( "#dialog a" ).one( "click", function() {
			window.open( "http://en.wikipedia.org/w/index.php?search=" + currentCity.name, "_blank" );
		});

		addMarker();
		setGameState( "results" );
	}

	function addMarker() {
		var myLatlng = new google.maps.LatLng( currentCity.latitude, currentCity.longitude );
		currentMarker = new google.maps.Marker({
			position: myLatlng,
			title: currentCity.name
		});
		map.setOptions({
			center: myLatlng,
			zoom: 3,
			styles: []
		});
		currentMarker.setMap( map );
	}

	function setGameState( state ) {
		$( "body" )
			.removeClass( "looking results" )
			.addClass( state );
	}

	function setNewCity() {
		// Remove the previous answer's marker
		if ( currentMarker ) {
			currentMarker.setMap( null );
		}
		map.setOptions({
			center: new google.maps.LatLng( 0, 0 ),
			zoom: 2,
			styles: [ labelsOff, roadsOff ]
		});
		currentCity = cities[ Math.ceil( Math.random() * cities.length ) ];
		$( "#search" ).html( currentCity.name );
		setGameState( "looking" );
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