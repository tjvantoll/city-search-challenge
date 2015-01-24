/* global $ */
(function() {
	"use strict";

	// Create a reference to the global dependencies
	var cities = window.cities,
		levels = window.levels,
		maps = window.maps,

		// An object containing information on the city the user is looking for
		currentCity,

		// The city number (1–5) the user is currently on
		cityNumber = 1,

		// An array of results of the user's selections
		cityResults = [];

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

	function handleUserSelection( event, latitude, longitude ) {
		// Ignore selections if the results are already up
		if ( !$( "body" ).hasClass( "search" ) ) {
			return;
		}

		var selected = new window.LatLon( latitude, longitude ),
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

		maps.addMarkers( currentCity, selected.lat, selected.lon )
			.then(function() {
				setGameState( "city-results" );
			});
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

	function setNewCity() {
		maps.reset();
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
		maps.clear();
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
		$.subscribe( "maps.selection", handleUserSelection );
	}

	function init() {
		// Account the for iOS status bar
		if ( window.device.platform === "iOS" ) {
			$( "body" ).addClass( "iOS" );
		}

		maps.build();
		setNewCity();
		attachEvents();
		navigator.splashscreen.hide();
	}

	document.addEventListener( "deviceready", init );
}());
