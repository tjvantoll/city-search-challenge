// Script used to generate the city data needed for the game.
// The raw data is from http://download.geonames.org/export/dump/,
// which uses the CC 3.0 license.
var inputFilename = "cities.txt",
	outputFilename = "app/js/external/cities.js",
	countries = require( "./countries" ),
	_ = require( "lodash" ),
	fs = require( "fs" ),
	citiesByCountry = {},
	finalCityList = [];

fs.writeFileSync( outputFilename, "window.cities = [\n" );
fs.readFile( inputFilename, function( error, data ) {
	data.toString().split( "\n" ).forEach(function( line ) {
		var cityParts = line.toString().split( "\t" ),
			city = {
				//"geonameid":         cityParts[ 0 ],
				"name":                cityParts[ 1 ],
				//"asciiname":         cityParts[ 2 ],
				//"alternatenames":    cityParts[ 3 ],
				"latitude":            cityParts[ 4 ],
				"longitude":           cityParts[ 5 ],
				//"feature_class":     cityParts[ 6 ],
				//"feature_code":      cityParts[ 7 ],
				"countryCode":         cityParts[ 8 ],
				//"cc2":               cityParts[ 9 ],
				//"admin1_code":       cityParts[ 10 ],
				//"admin2_code":       cityParts[ 11 ],
				//"admin3_code":       cityParts[ 12 ],
				//"admin4_code":       cityParts[ 13 ],
				"population":          cityParts[ 14 ]
				//"elevation":         cityParts[ 15 ],
				//"dem":               cityParts[ 16 ],
				//"timezone":          cityParts[ 17 ],
				//"modification_date": cityParts[ 18 ]
			};

		city.formattedName = city.name + ", " +
			countries[ city.countryCode ];

		if ( !citiesByCountry[ city.countryCode ] ) {
			citiesByCountry[ city.countryCode ] = [];
		}
		citiesByCountry[ city.countryCode ].push( city );
	});

	Object.keys( citiesByCountry ).forEach(function( code ) {
		var city,
			list = citiesByCountry[ code ],
			sortedList = _.sortBy( list, function( o ) {
				return -o.population;
			}),
			i = 0;

		for ( ; i <= 5; i++ ) {
			city = sortedList[ i ];
			if ( city && city.population > 300000 ) {
				finalCityList.push( city );
			}
		}

		city = sortedList[ 0 ];
		if ( city ) {
			// Flag the largest city in each country
			city.largestInCountry = true;

			// Let in a few more cities that are the largest in their countries
			if ( city.population < 300000 && city.population > 50000 ) {
				finalCityList.push ( city );
			}
		}
	});

	_.shuffle( finalCityList ).forEach(function( city ) {
		fs.appendFileSync( outputFilename, JSON.stringify( city ) + ",\n" );
	});

	fs.appendFileSync( outputFilename, "];" );
});
