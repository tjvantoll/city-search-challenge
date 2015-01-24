/* global $, google */
(function() {
	"use strict";

	var levels = window.levels,

		// Google Maps map object
		map,

		// Google Maps markers and paths being displayed on the screen
		correctMarker, selectedMarker, path,

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
		roadsOff = {
			featureType: "road",
			stylers: [
				{ visibility: "off" }
			]
		};

	// Intercept clicks on the Google links during the capture phase and
	// open them in an in-app browser.
	function handleLinks() {
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

	function pickMapStyles() {
		return levels.showCountryBorders() ?
			[ labelsOff, roadsOff ] : [ labelsOff, roadsOff, countryBordersOff ];
	}

	window.maps = {
		build: function() {
			map = new google.maps.Map( document.getElementById( "map" ), {
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true,
				zoomControl: true
			});
			google.maps.event.addListener( map, "click", function( event ) {
				$.publish( "maps.selection", [ event.latLng.k, event.latLng.D ] );
			});
			handleLinks();
		},
		clear: function() {
			// Remove the previous answer's marker
			if ( correctMarker ) {
				correctMarker.setMap( null );
				selectedMarker.setMap( null );
				path.setMap( null );
			}
		},
		reset: function() {
			this.clear();
			map.setOptions({
				zoom: 2,
				styles: pickMapStyles()
			});
			map.panTo( new google.maps.LatLng( 0, 0 ) );
		},
		addMarkers: function( currentCity, selectedLatitude, selectedLongitude ) {
			var promise = $.Deferred(),
				correctPosition = new google.maps.LatLng(
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
				promise.resolve();
			}, 500 );

			return promise;
		}
	};
}());
