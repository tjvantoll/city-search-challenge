(function() {
	"use strict";

	// The current state of the game
	var currentLevel = 1,

		// Raw data on the levels themselves
		data = {
			1:  { population: 2500000, km: 10000 },
			2:  { population: 2000000, km: 9000 },
			3:  { population: 1500000, km: 8000 },
			4:  { population: 1000000, km: 7000 },
			5:  { population: 750000,  km: 6000 },

			// Country borders go away
			6:  { population: 1000000, km: 8000 },
			7:  { population: 850000,  km: 7000 },
			8:  { population: 600000,  km: 6000 },
			9:  { population: 450000,  km: 5000 },
			10: { population: 300000,  km: 4000 },

			// Country names go away
			11: { population: 1500000, km: 8500 },
			12: { population: 1250000, km: 7000 },
			13: { population: 1000000, km: 6000 },
			14: { population: 750000,  km: 5000 },
			15: { population: 500000,  km: 4000 }
		},

		// Constants
		CITIES_PER_LEVEL = 5,
		NUMBER_OF_LEVELS = data.length;

	Object.keys( data ).forEach(function( key ) {
		data[ key ].aids = {
			countryBorders: ( key <= 5 ),
			countryNames: ( key <= 10 )
		};
	});

	window.levels = {
		getCurrent: function() {
			return currentLevel;
		},
		getCitiesPerLevel: function() {
			return CITIES_PER_LEVEL;
		},
		levelUp: function() {
			currentLevel++;
		},
		getNumberOfLevels: function() {
			return NUMBER_OF_LEVELS;
		},
		getKmRequirement: function() {
			return data[ currentLevel ].km;
		},
		getPopulationRequirement: function() {
			return data[ currentLevel ].population;
		},
		reset: function() {
			currentLevel = 1;
		},
		showCountryNames: function() {
			return data[ currentLevel ].aids.countryNames;
		},
		showCountryBorders: function() {
			return data[ currentLevel ].aids.countryBorders;
		}
	};
}());
