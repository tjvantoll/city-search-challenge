(function() {
	"use strict";

	// The current state of the game
	var currentLevel = 1,

		// Raw data on the levels themselves
		data = {
			1: {
				population: 4000000,
				km: 20000,
				aids: {
					countryNames: true,
					countryBorders: true
				}
			},
			2: {
				population: 3000000,
				km: 10000,
				aids: {
					countryNames: true,
					countryBorders: true
				}
			},
			3: {
				population: 2000000,
				km: 5000,
				aids: {
					countryNames: false,
					countryBorders: true
				}
			},
			4: {
				population: 1000000,
				km: 2000,
				aids: {
					countryNames: false,
					countryBorders: true
				}
			},
			5: {
				population: 500000,
				km: 1000,
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
		levelUp: function() {
			currentLevel++;
		},
		getMax: function() {
			return 5;
		},
		getKmRequirement: function() {
			return data[ currentLevel ].km;
		},
		getPopulationRequirement: function() {
			return data[ currentLevel ].population;
		},
		showCountryNames: function() {
			return data[ currentLevel ].aids.countryNames;
		},
		showCountryBorders: function() {
			return data[ currentLevel ].aids.countryBorders;
		}
	};
}());
