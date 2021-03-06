(function() {
	"use strict";

	// Create a reference to the global dependencies
	var _ = window._,
		$ = window.jQuery,
		analytics = window.analytics,
		cities = window.cities,
		format = window.format,
		levels = window.levels,
		maps = window.maps,
		scoring = window.scoring,

		cityIndex = Math.floor( Math.random() * cities.length ) - 1,

		// An object containing information on the city the user is looking for
		currentCity,

		// The city number (1–5) the user is currently on
		cityNumber = 1,

		// An array of results of the user's selections
		cityResults = [],

		// Remember where the user was when they go offline
		previousGameState;

	function handleUserSelection( event, latitude, longitude ) {
		// Ignore selections if the results are already up
		if ( !$( "body" ).hasClass( "search" ) ) {
			return;
		}

		var difference = maps.distanceBetween(
			currentCity.latitude, currentCity.longitude, latitude, longitude ),
			kmDifference = Math.floor( difference ),
			miDifference = Math.floor( difference * 0.6214 );

		$( ".city-results-city-name" ).text( currentCity.formattedName );
		$( ".city-results-km-off" ).text( format.addCommas( kmDifference ) );
		$( ".city-results-mi-off" ).text( format.addCommas( miDifference ) );
		$( ".city-results-grade" ).text( scoring.determineGrade( difference ) );

		cityNumber++;
		cityResults.push({ difference: kmDifference, city: currentCity });

		maps.addMarkers( currentCity, latitude, longitude )
			.then(function() {
				setGameState( "city-results" );
			});
	}

	function setGameState( state ) {
		$( "body" )
			.removeClass( "welcome level search city-results level-results congrats offline" )
			.addClass( state );
	}

	function getGameState() {
		var state;
		$( "body" ).attr( "class" ).split( " " ).forEach(function( className ) {
			if ( className !== "iOS" ) {
				state = className;
			}
		});
		return state;
	}

	function useCity( city ) {
		// Always allow the largest city in a country to be used
		if ( city.largestInCountry &&
			city.population > ( levels.getPopulationRequirement() * 0.3 ) ) {
			return true;
		}
		// Apply different logic for India and China because of their populations
		if ( city.countryCode  === "IN" || city.countryCode === "CN" ) {
			return city.population > ( levels.getPopulationRequirement() * 3 );
		}
		return city.population > levels.getPopulationRequirement();
	}

	function pickNextCity() {
		var city,
			selectionMade = false;
		while ( !selectionMade ) {
			cityIndex++;
			if ( cityIndex === cities.length ) {
				cityIndex = 0;
			}

			city = cities[ cityIndex ];
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
		$( ".level-city-count" ).text( levels.getCitiesPerLevel() );
		$( ".level-km" ).text( format.addCommas( levels.getKmRequirement() ) );
		$( ".level-country-names" )
			.text( levels.showCountryNames() ? "On" : "Off" )
			.removeClass( "pass fail" )
			.addClass( levels.showCountryNames() ? "pass" : "fail" );
		$( ".level-country-borders" )
			.text( levels.showCountryBorders() ? "On" : "Off" )
			.removeClass( "pass fail" )
			.addClass( levels.showCountryBorders() ? "pass" : "fail" );
	}

	function showLevelResultsScreen() {
		var success,
			totalDistance = 0,
			html = "";

		maps.clear();
		cityResults.forEach(function( result ) {
			html += "<li><span>" + result.city.name + ":</span> " +
				format.addCommas( result.difference ) + " km </li>";
			totalDistance += result.difference;
		});

		success = totalDistance < levels.getKmRequirement();
		$( ".level-results-level" ).text( levels.getCurrent() );
		$( ".level-results-next" ).text( success ? "Next Level" : "Try Again" );
		$( ".level-results-list" ).html( html );
		$( ".level-results-judgment" )
			.text( success ? "SUCCESS!" : "FAIL" )
			.removeClass( "pass fail" )
			.addClass( success ? "pass" : "fail" );
		$( ".level-results-total" )
			.text( format.addCommas( totalDistance ) )
			.removeClass( "pass fail" )
			.addClass( success ? "pass" : "fail" );
		$( ".level-results-max" ).text( format.addCommas( levels.getKmRequirement() ) );
		$( ".level-results-start-over" ).toggle( ( levels.getCurrent() > 1 ) || success );

		// Reset the game state
		cityNumber = 1;
		while ( cityResults.length ) {
			cityResults.pop();
		}

		if ( success ) {
			analytics.track( "LevelClear." + levels.getCurrent() );
			levels.levelUp();
		}
	}

	function restartGame() {
		levels.reset();
		setNewCity();
		showLevelScreen();
		setGameState( "level" );
	}

	function handleOffline() {
		previousGameState = getGameState();
		setGameState( "offline" );
	}

	function handleOnline() {
		if ( !window.google ) {
			$.getScript( $( "#google-script" ).attr( "src" ) ).then(function() {
				maps.build();
				setGameState( previousGameState );
			});
		} else {
			setGameState( previousGameState );
		}
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
		$( ".level-results-next" ).on( "touchend", function() {
			if ( levels.getCurrent() > levels.getNumberOfLevels() ) {
				setGameState( "congrats" );
			} else {
				setNewCity();
				showLevelScreen();
				setGameState( "level" );
			}
		});
		$( ".level-results-start-over" ).on( "touchend", function() {
			navigator.notification.confirm( "The game will be reset to level 1.",
				function( index ) {
					if ( index === 1 ) {
						restartGame();
					}
				}
			);
		});
		$( ".congrats-button" ).on( "touchend", restartGame );

		$( document ).on( "offline", handleOffline );
		$( document ).on( "online", handleOnline );
	}

	function init() {
		// Account the for iOS status bar
		if ( window.device.platform === "iOS" ) {
			$( "body" ).addClass( "iOS" );
		}

		// Randomize the order
		cities = _.shuffle( cities );

		// If the user is online
		if ( window.google ) {
			maps.build();
			setNewCity();
		} else {
			handleOffline();
		}

		attachEvents();
		navigator.splashscreen.hide();
	}

	document.addEventListener( "deviceready", init );
}());
