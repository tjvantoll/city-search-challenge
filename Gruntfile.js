module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		jshint: {
			options: {
				jshintrc: true
			},
			all: [ "*.js, app/js/*.js" ]
		},
		jscs: {
			src: [ "*.js", "app/js/*.js" ],
			options: {
				config: ".jscsrc"
			}
		}
	});

	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-jscs" );

	grunt.registerTask( "default", [ "jshint", "jscs" ]);
};
