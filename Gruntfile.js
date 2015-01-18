module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		jshint: {
			options: {
				jshintrc: true
			},
			all: [ "*.js", "app/js/*.js" ]
		},
		jscs: {
			src: [ "*.js", "app/js/*.js" ],
			options: {
				config: ".jscsrc"
			}
		},
		csslint: {
			src: [ "app/css/*" ],
			options: {
				csslintrc: ".csslintrc"
			}
		},
		htmllint: {
			all: [ "app/*.html" ]
		}
	});

	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-jscs" );
	grunt.loadNpmTasks( "grunt-contrib-csslint" );
	grunt.loadNpmTasks( "grunt-html" );

	grunt.registerTask( "default",
		[ "jshint", "jscs", "csslint", "htmllint" ]);
};
