module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		watch: {
			sass: {
				files: [ "app/scss/**/*.scss" ],
				tasks: [ "sass" ]
			}
		},
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
		},
		sass: {
			dist: {
				files: {
					"app/css/app.css": "app/scss/app.scss"
				}
			}
		},
		uglify: {
			all: {
				files: [
					{
						expand: true,
						src: "app/js/**/*.js"
					}
				]
			}
		},
		cssmin: {
			all: {
				files: [
					{
						expand: true,
						src: "app/css/**/*.css"
					}
				]
			}
		},
		smushit: {
			all: {
				src: [ "app/img/**/*.png" ]
			}
		},
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			dist: {
				files: [
					{
						expand: true,
						src: "app/**/*.html"
					}
				]
			}
		},
		appbuilder: {
			options: {
				debug: false
			},
			android: {
				options: {
					platform: "android"
				},
				files: {
					"app.apk": [ "app" ]
				}
			},
			ios: {
				options: {
					platform: "ios",
					provision: "iOS Distribution"
				},
				files: {
					"app.ipa": [ "app" ]
				}
			}
		}
	});

	grunt.loadNpmTasks( "grunt-contrib-watch" );

	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-jscs" );
	grunt.loadNpmTasks( "grunt-contrib-csslint" );
	grunt.loadNpmTasks( "grunt-html" );
	grunt.loadNpmTasks( "grunt-sass" );

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-cssmin" );
	grunt.loadNpmTasks( "grunt-smushit" );
	grunt.loadNpmTasks( "grunt-contrib-htmlmin" );

	grunt.loadNpmTasks( "grunt-contrib-appbuilder" );

	grunt.registerTask( "default", [ "lint" ]);

	grunt.registerTask( "lint", [ "jshint", "jscs", "csslint", "htmllint" ]);
	grunt.registerTask( "compress", [ "sass", "uglify", "cssmin", "htmlmin", "smushit" ]);

	grunt.registerTask( "android", [ "lint", "compress", "appbuilder:android" ] );
	grunt.registerTask( "ios", [ "lint", "compress", "appbuilder:ios" ] );
};
