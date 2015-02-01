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

		// Replace any instances of "%BundleVersion%" with the correct BundleVersion
		// from the .abproject.
		replace: {
			version: {
				src: [ "app/js/**/*.js" ],
				dest: [ "dist/app/js/" ],
				replacements: [
					{
						from: "%BundleVersion%",
						to: function() {
							var config = grunt.file.readJSON( "app/.abproject" );
							return config.BundleVersion;
						}
					}
				]
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
			src: [ "*.js", "app/js/*.js" ],
			options: {
				config: ".jscsrc"
			}
		},

		// Run CSSLint using the .csslintrc file for config
		csslint: {
			src: [ "app/css/*" ],
			options: {
				csslintrc: ".csslintrc"
			}
		},

		// Run HTMLLint
		htmllint: {
			all: [ "app/*.html" ]
		},

		// Compile all .scss files into .css files
		sass: {
			dist: {
				files: {
					"app/css/app.css": "app/scss/app.scss"
				}
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
			dist: {
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
	grunt.loadNpmTasks( "grunt-text-replace" );

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
	grunt.registerTask( "build", [ "lint", "copy", "replace", "optimize" ]);
	grunt.registerTask( "build:android", [ "build", "appbuilder:android" ] );
	grunt.registerTask( "build:ios", [ "build", "appbuilder:ios" ] );
};
