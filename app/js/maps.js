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
		stateBordersOff = {
			featureType: "administrative.province",
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
			[ labelsOff, roadsOff ] :
			[ labelsOff, roadsOff, stateBordersOff, countryBordersOff ];
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

			selectedMarker = new google.maps.Marker({
				icon: "img/red-marker.png"
			});
			selectedMarker.setMap( map );

			correctMarker = new google.maps.Marker({
				icon: "img/green-marker.png"
			});
			correctMarker.setMap( map );

			path = new google.maps.Polyline({
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			path.setMap( map );

			handleLinks();
		},
		clear: function() {
			// Remove the previous answer's marker
			if ( correctMarker ) {
				correctMarker.setVisible( false );
				selectedMarker.setVisible( false );
				path.setVisible( false );
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
		distanceBetween: function( lat1, lon1, lat2, long2 ) {
			var one = new google.maps.LatLng( lat1, lon1 ),
				two = new google.maps.LatLng( lat2, long2 );
			return google.maps.geometry.spherical.computeDistanceBetween( one, two ) / 1000;
		},
		addMarkers: function( currentCity, selectedLatitude, selectedLongitude ) {
			var offset,
				promise = $.Deferred(),
				correctPosition = new google.maps.LatLng(
					currentCity.latitude, currentCity.longitude ),
				selectedPosition = new google.maps.LatLng(
					selectedLatitude, selectedLongitude ),
				bounds = new google.maps.LatLngBounds();

			selectedMarker.setPosition( selectedPosition );
			selectedMarker.setVisible( true );

			setTimeout(function() {
				correctMarker.setPosition( correctPosition );
				correctMarker.setVisible( true );

				path.setPath([ correctPosition, selectedPosition ]);
				path.setVisible( true );

				bounds.extend( selectedMarker.getPosition() );
				bounds.extend( correctMarker.getPosition() );
				map.fitBounds( bounds );

				offset = 100 / Math.pow( 2, map.getZoom() - 1 );

				map.setOptions({
					styles: [],
					zoom: ( map.getZoom() - 1 ),
					center: new google.maps.LatLng(
						bounds.getCenter().k - offset,
						bounds.getCenter().D )
				});

				promise.resolve();
			}, 500 );

			return promise;
		}
	};
}());
