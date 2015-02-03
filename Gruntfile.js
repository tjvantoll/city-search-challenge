module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),

		// Watch for changes in the scss directory and invoke the
		// sass task as necessary
		watch: {
			sass: {
				files: [ "app/scss/**/*.scss" ],
				tasks: [ "sass" ]
			}
		},

		// Copy the source files into the dist directory
		copy: {
			all: {
				files: [
					{
						src: [ "app/**/*" ],
						dest: "dist/",
						dot: true
					}
				]
			}
		},

		// Build AppBuilder release builds for iOS & Android
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

		// Run JSHint using the .jshintrc file for config
		jshint: {
			options: {
				jshintrc: true
			},
			all: [ "*.js", "app/js/*.js" ]
		},

		// Run JSCS using the .jscsrc file for config
		jscs: {
			all: [ "*.js", "app/js/*.js" ],
			options: {
				config: ".jscsrc"
			}
		},

		// Run CSSLint using the .csslintrc file for config
		csslint: {
			all: [ "app/css/**/*.css" ],
			options: {
				csslintrc: ".csslintrc"
			}
		},

		// Run HTMLLint
		htmllint: {
			all: [ "app/**/*.html" ]
		},

		// Compile all .scss files into .css files
		sass: {
			all: {
				files: [
					{
						expand: true,
						cwd: "app/scss/",
						src: "*.scss",
						dest: "app/css/",
						ext: ".css"
					}
				]
			}
		},

		//  Run Uglify on all JavaScript files in the dist directory
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

		// Minify all CSS files in the dist directory
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

		// Minify all HTML files in the dist directory
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			all: {
				files: [
					{
						expand: true,
						src: "dist/**/*.html"
					}
				]
			}
		},

		// Compress all images in the dist directory
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
