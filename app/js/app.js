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

		// Google Maps markers and paths being displayed on the screen
		correctMarker, selectedMarker, path;

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

				city.formattedName = city.name + ", "
					+ window.countryList[ city.country_code ];

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

	function determineGrade( distance ) {
		switch ( true ) {
			case distance < 100:
				return "A+";
			case distance < 250:
				return "A";
			case distance < 500:
				return "A-";
			case distance < 1000:
				return "B+";
			case distance < 2000:
				return "B";
			case distance < 3000:
				return "B-";
			case distance < 4500:
				return "C+";
			case distance < 6000:
				return "C";
			case distance < 7500:
				return "C-";
			case distance < 10000:
				return "D+";
			case distance < 15000:
				return "D";
			case distance < 20000:
				return "D-";
			default:
				return "E";
		}
	}

	function handleUserSelection( event ) {
		// Ignore selections if the results are already up
		if ( $( "body" ).hasClass( "results" ) ) {
			return;
		}

		var selected = new LatLon( event.latLng.k, event.latLng.D ),
			correct = new LatLon( currentCity.latitude, currentCity.longitude ),
			difference = selected.distanceTo( correct ),
			kmDifference = Math.floor( difference ),
			miDifference = Math.floor( difference * 0.6214 );

		$( "#dialog-city-name" ).text( currentCity.formattedName );
		$( "#dialog-km-off" ).text( addCommas( kmDifference ) );
		$( "#dialog-mi-off" ).text( addCommas( miDifference ) );
		$( "#dialog-grade" ).text( determineGrade( difference ) );
		$( "#dialog-next" ).one( "click", function() {
			setNewCity();
			setGameState( "looking" );
		});
		$( "#dialog a" ).one( "click", function() {
			window.open( "http://en.wikipedia.org/w/index.php?search=" + currentCity.name, "_blank" );
		});

		handleMarkers( selected.lat, selected.lon );
	}

	function handleMarkers( selectedLatitude, selectedLongitude ) {
		var correctPosition = new google.maps.LatLng( currentCity.latitude, currentCity.longitude ),
			selectedPosition = new google.maps.LatLng( selectedLatitude, selectedLongitude ),
			panPosition = new google.maps.LatLng( currentCity.latitude - 30, currentCity.longitude );

		selectedMarker = new google.maps.Marker({
			position: selectedPosition,
			title: "Your selection",
			icon: "img/red-marker.png"
		});
		selectedMarker.setMap( map );

		// Empty the custom styles to show the map labels when the
		// answer is revealed
		map.setOptions({ styles: [], zoom: 2 });

		setTimeout(function() {
			correctMarker = new google.maps.Marker({
				position: correctPosition,
				title: currentCity.name,
				icon: "img/green-marker.png"
			});
			correctMarker.setMap( map );

			path = new google.maps.Polyline({
				path: [ correctPosition, selectedPosition ],
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			path.setMap( map );

			map.panTo( panPosition );
			setGameState( "results" );
		}, 500 );
	}

	function setGameState( state ) {
		$( "body" )
			.removeClass( "welcome looking results" )
			.addClass( state );
	}

	function setNewCity() {
		// Remove the previous answer's marker
		if ( correctMarker ) {
			correctMarker.setMap( null );
			selectedMarker.setMap( null );
			path.setMap( null );
		}
		map.setOptions({
			center: new google.maps.LatLng( 0, 0 ),
			zoom: 2,
			styles: [ labelsOff, roadsOff ]
		});
		currentCity = cities[ Math.ceil( Math.random() * cities.length ) ];
		$( "#search" ).html( currentCity.name );
	}

	function init() {
		// Account the for iOS status bar
		if ( device.platform === "iOS" ) {
			$( "body" ).addClass( "iOS" );
		}

		buildMap();
		loadCities().then(function() {
			setNewCity();
			$( "#welcome button" ).on( "click", function() {
				setGameState( "looking" );
			});
			navigator.splashscreen.hide();
		});
	}

	document.addEventListener( "deviceready", init );
}());