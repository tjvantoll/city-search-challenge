(function() {
	"use strict";

	// Create a reference to the global cities data from cities.js.
	var cities = window.cities,

		// An object containing information on the city the user is looking for
		currentCity,

		// A string containing the current difficulty of the game (Easy, Medium, of Hard)
		currentDifficulty = "Easy",

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

		$( "#results-city-name" ).text( currentCity.formattedName );
		$( "#results-km-off" ).text( addCommas( kmDifference ) );
		$( "#results-mi-off" ).text( addCommas( miDifference ) );
		$( "#results-grade" ).text( determineGrade( difference ) );
		$( "#results-next" ).one( "click", function() {
			setNewCity();
			setGameState( "search" );
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
			.removeClass( "welcome search results difficulty" )
			.addClass( state );
	}

	function pickNextCity() {
		var city,
			selectionMade = false;
		while ( !selectionMade ) {
			city = cities[ Math.ceil( Math.random() * cities.length ) ];
			if ( currentDifficulty == "Easy" && city.population < 3000000 ) {
				continue;
			}
			if ( currentDifficulty == "Medium" && city.population < 1000000 ) {
				continue;
			}
			selectionMade = true;
		}
		return city;
	};

	function displayCityName() {
		return currentDifficulty == "Easy" ? currentCity.formattedName : currentCity.name;
	};

	function setNewCity() {
		// Remove the previous answer's marker
		if ( correctMarker ) {
			correctMarker.setMap( null );
			selectedMarker.setMap( null );
			path.setMap( null );
		}
		map.setOptions({
			zoom: 2,
			styles: [ labelsOff, roadsOff ]
		});
		map.panTo( new google.maps.LatLng( 0, 0 ) );
		currentCity = pickNextCity();
		$( "#search-city" ).html( displayCityName() );
		$( "div.results a" ).attr( "href", "http://en.wikipedia.org/w/index.php?search=" + currentCity.name );
	};

	function changeDifficulty() {
		var difficultyDisplay = $( "#search-difficulty" ),
			previousDifficulty = difficultyDisplay.text();

		currentDifficulty = $( "#difficulty-selection .active" ).text().trim();

		if ( previousDifficulty != currentDifficulty ) {
			difficultyDisplay.text( currentDifficulty );
			setNewCity();
		}
	};

	function attachEvents() {
		$( "div.welcome button" ).on( "click", function() {
			setGameState( "search" );
		});
		$( "div.search a" ).on( "click", function( event ) {
			event.preventDefault();
			setGameState( "difficulty" );
		});
		$( "#difficulty-selection li" ).on( "click", function() {
			$( this ).siblings().removeClass( "active" );
			$( this ).addClass( "active" );
		});
		$( "div.difficulty button" ).on( "click", function() {
			changeDifficulty();
			setGameState( "search" );
		});
	};

	function init() {
		// Account the for iOS status bar
		if ( device.platform === "iOS" ) {
			$( "body" ).addClass( "iOS" );
		}

		buildMap();
		setNewCity();
		attachEvents();
		navigator.splashscreen.hide();
	};

	document.addEventListener( "deviceready", init );
}());