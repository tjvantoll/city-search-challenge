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
		copy: {
			main: {
				files: [
					{
						src: [ "app/**/*" ],
						dest: "dist/",
						dot: true
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
					"app.apk": [ "dist/app" ]
				}
			},
			ios: {
				options: {
					platform: "ios",
					provision: "iOS Distribution"
				},
				files: {
					"app.ipa": [ "dist/app" ]
				}
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
						src: "dist/app/js/**/*.js"
					}
				]
			}
		},
		cssmin: {
			all: {
				files: [
					{
						expand: true,
						src: "dist/app/css/**/*.css"
					}
				]
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
						src: "dist/**/*.html"
					}
				]
			}
		},
		imagemin: {
			all: {
				files: [
					{
						expand: true,
						cwd: "dist/app/img/",
						src: [ "**/*.{png,gif,jpg}" ],
						dest: "dist/app/img/"
					}
				]
			}
		}
	});

	// Utility
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-appbuilder" );

	// Linting
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-jscs" );
	grunt.loadNpmTasks( "grunt-contrib-csslint" );
	grunt.loadNpmTasks( "grunt-html" );

	// Optimization
	grunt.loadNpmTasks( "grunt-sass" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-cssmin" );
	grunt.loadNpmTasks( "grunt-contrib-htmlmin" );
	grunt.loadNpmTasks( "grunt-contrib-imagemin" );

	grunt.registerTask( "default", [ "lint" ]);

	grunt.registerTask( "lint", [ "jshint", "jscs", "csslint", "htmllint" ]);
	grunt.registerTask( "optimize", [ "sass", "uglify", "cssmin", "htmlmin", "imagemin" ]);
	grunt.registerTask( "build", [ "lint", "copy", "optimize" ]);
	grunt.registerTask( "build:android", [ "build", "appbuilder:android" ] );
	grunt.registerTask( "build:ios", [ "build", "appbuilder:ios" ] );
};
