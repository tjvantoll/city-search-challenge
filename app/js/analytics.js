(function() {
	var version,
		productId = "aee3e6911acc4709bf01756445fce70d";

	window.analytics = {
		start: function() {
			var factory = window.plugins.EqatecAnalytics.Factory,
				monitor = window.plugins.EqatecAnalytics.Monitor,
				settings = factory.CreateSettings( productId, version );

			settings.LoggingInterface = factory.CreateTraceLogger();
			factory.CreateMonitorWithSettings( settings,
				function() {
					console.log( "Monitor created" );
					monitor.Start(function() {
						console.log( "Monitor started" );
					});
				},
				function( msg ) {
					console.log( "Error creating monitor: " + msg );
				});
		},
		stop: function() {
			var monitor = window.plugins.EqatecAnalytics.Monitor;
			monitor.Stop();
		},
		monitor: function() {
			return window.plugins.EqatecAnalytics.Monitor;
		}
	};

	if ( navigator.simulator ) {
		return;
	}

	document.addEventListener( "deviceready", function() {
		window.cordova.getAppVersion(function( appVersion ) {
			version = appVersion;
			window.analytics.start();
		});
	});
	document.addEventListener( "pause", function() {
		window.analytics.stop();
	});
	document.addEventListener( "resume", function() {
		window.analytics.start();
	});
	window.onerror = function( message, url, lineNumber, columnNumber, error ) {
		window.analytics.monitor().TrackExceptionMessage( error, message );
	};
}());
