/* global $, google */
(function() {
	"use strict";

	// Create a reference to the global cities and levels data
	var cities = window.cities,
		levels = window.levels,

		// An object containing information on the city the user is looking for
		currentCity,

		// The city number (1–5) the user is currently on
		cityNumber = 1,
		cityResults = [],

		// A reference to the Google map object
		map,

		labelsOff = {
			featureType: "all",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		},
		countryBordersOff = {
			featureType: "administrative.country",
			elementType: "geometry.stroke",
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
		if ( !$( "body" ).hasClass( "search" ) ) {
			return;
		}

		var selected = new window.LatLon( event.latLng.k, event.latLng.D ),
			correct = new window.LatLon( currentCity.latitude, currentCity.longitude ),
			difference = selected.distanceTo( correct ),
			kmDifference = Math.floor( difference ),
			miDifference = Math.floor( difference * 0.6214 );

		$( ".city-results-city-name" ).text( currentCity.formattedName );
		$( ".city-results-km-off" ).text( addCommas( kmDifference ) );
		$( ".city-results-mi-off" ).text( addCommas( miDifference ) );
		$( ".city-results-grade" ).text( determineGrade( difference ) );

		cityNumber++;
		cityResults.push({ difference: kmDifference, city: currentCity.formattedName });

		handleMarkers( selected.lat, selected.lon );
	}

	function handleMarkers( selectedLatitude, selectedLongitude ) {
		var correctPosition = new google.maps.LatLng(
				currentCity.latitude, currentCity.longitude ),
			selectedPosition = new google.maps.LatLng(
				selectedLatitude, selectedLongitude ),
			panPosition = new google.maps.LatLng(
				currentCity.latitude - 30, currentCity.longitude );

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
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			path.setMap( map );

			map.panTo( panPosition );
			setGameState( "city-results" );
		}, 500 );
	}

	function setGameState( state ) {
		$( "body" )
			.removeClass( "welcome level search city-results level-results" )
			.addClass( state );
	}

	function useCity( city ) {
		// Apply different logic for India and China because of their populations
		if ( city.countryCode  === "IN" || city.countryCode === "CN" ) {
			return city.population > ( levels.getPopulationRequirement() * 2 );
		}
		return city.population > levels.getPopulationRequirement();
	}

	function pickMapStyles() {
		return levels.showCountryBorders() ?
			[ labelsOff ] : [ labelsOff, countryBordersOff ];
	}

	function pickNextCity() {
		var city,
			selectionMade = false;
		while ( !selectionMade ) {
			city = cities[ Math.floor( Math.random() * cities.length ) ];
			if ( !useCity( city ) ) {
				continue;
			}
			selectionMade = true;
		}
		return city;
	}

	function clearMap() {
		// Remove the previous answer's marker
		if ( correctMarker ) {
			correctMarker.setMap( null );
			selectedMarker.setMap( null );
			path.setMap( null );
		}
	}

	function setNewCity() {
		clearMap();
		map.setOptions({
			zoom: 2,
			styles: pickMapStyles()
		});
		map.panTo( new google.maps.LatLng( 0, 0 ) );
		currentCity = pickNextCity();
		$( ".search-city-number" ).text( cityNumber );
		$( ".search-cities-per-level" ).text( levels.getCitiesPerLevel() );
		$( ".search-city" ).html(
			levels.showCountryNames() ? currentCity.formattedName : currentCity.name
		);
		$( "div.city-results a" ).attr( "href",
			"http://en.wikipedia.org/w/index.php?search=" + currentCity.name );
	}

	function showLevelScreen() {
		$( ".level-number" ).text( levels.getCurrent() );
		$( ".level-km" ).text( addCommas( levels.getKmRequirement() ) );
		$( ".level-max" ).text( levels.getMax() );
		$( ".level-population" ).text( addCommas( levels.getPopulationRequirement() ) );
		$( ".level-country-names" ).text( levels.showCountryNames() ? "On" : "Off" );
		$( ".level-country-borders" ).text( levels.showCountryBorders() ? "On" : "Off" );
	}

	function showLevelResultsScreen() {
		clearMap();
	}

	function attachEvents() {
		$( "div.welcome button" ).on( "touchend", function() {
			showLevelScreen();
			setGameState( "level" );
		});
		$( "div.level button" ).on( "touchend", function() {
			setGameState( "search" );
		});
		$( "div.search a" ).on( "touchend", function( event ) {
			event.preventDefault();
			setGameState( "difficulty" );
		});
		$( "div.city-results a" ).on( "click", function( event ) {
			event.preventDefault();
			window.open( $( this ).attr( "href" ), "_blank" );
		});
		$( ".city-results-next" ).on( "touchend", function() {
			if ( cityNumber > levels.getCitiesPerLevel() ) {
				showLevelResultsScreen();
				setGameState( "level-results" );
			} else {
				setNewCity();
				setGameState( "search" );
			}
		});

		// Intercept clicks on the Google links during the capture phase and
		// open them in an in-app browser.
		document.querySelector( "#map" ).addEventListener( "click", function( event ) {
			var elements = $( event.target ).parents().andSelf(),
				googleLinks = elements.filter( "a[href*=google]" );
			if ( googleLinks.length > 0 ) {
				event.stopPropagation();
				event.preventDefault();
				window.open( googleLinks.attr( "href" ), "_blank" );
			}
		}, true );
	}

	function init() {
		// Account the for iOS status bar
		if ( window.device.platform === "iOS" ) {
			$( "body" ).addClass( "iOS" );
		}

		buildMap();
		setNewCity();
		attachEvents();
		navigator.splashscreen.hide();
	}

	document.addEventListener( "deviceready", init );
}());
