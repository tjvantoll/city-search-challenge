// Script used to generate the city data needed for the game.
// The raw data is from http://download.geonames.org/export/dump/,
// which uses the CC 3.0 license.
var inputFilename = "cities.txt",
	outputFilename = "app/js/external/cities.js",
	countries = require( "./countries" ),
	fs = require( "fs" );

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
				"country_code":        cityParts[ 8 ],
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

		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		city.formattedName = city.name + ", " +
			countries[ city.country_code ];

		// Only use cities that have at least 200,000 people
		if ( city.population > 200000 ) {
			fs.appendFileSync( outputFilename, JSON.stringify( city ) + ",\n" );
		}
	});

	fs.appendFileSync( outputFilename, "];" );
});
