(function() {
	"use strict";

	// The current state of the game
	var currentLevel = 1,
		CITIES_PER_LEVEL = 3,
		NUMBER_OF_LEVELS = 5,

		// Raw data on the levels themselves
		data = {
			1: {
				population: 4000000,
				km: 200000,
				aids: {
					countryNames: true,
					countryBorders: true
				}
			},
			2: {
				population: 3000000,
				km: 100000,
				aids: {
					countryNames: true,
					countryBorders: true
				}
			},
			3: {
				population: 2000000,
				km: 50000,
				aids: {
					countryNames: false,
					countryBorders: true
				}
			},
			4: {
				population: 1000000,
				km: 50000,
				aids: {
					countryNames: false,
					countryBorders: true
				}
			},
			5: {
				population: 500000,
				km: 50000,
				aids: {
					countryNames: false,
					countryBorders: false
				}
			}
		};

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
