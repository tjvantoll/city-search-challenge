// Add this code to a new file, analytics.js
// REMEMBER TO INSERT THE CORRECT PRODUCT KEY BELOW !!
(function(g) {
  var productId = "aee3e6911acc4709bf01756445fce70d";
  var version = "1.0"; // Your app version here

  // Make analytics available via the window.analytics variable
  // Start analytics by calling window.analytics.Start()
  var analytics = g.analytics = g.analytics || {};
  analytics.Start = function()
  {
    // Abort in the simulator
    if ( !window.plugins || !window.plugins.EqatecAnalytics ) {
      return;
    }

    // Handy shortcuts to the analytics api
    var factory = window.plugins.EqatecAnalytics.Factory;
    var monitor = window.plugins.EqatecAnalytics.Monitor;
    // Create the monitor instance using the unique product key for My Test App
    var settings = factory.CreateSettings(productId, version);
    settings.LoggingInterface = factory.CreateTraceLogger();
    factory.CreateMonitorWithSettings(settings,
      function() {
        console.log("Monitor created");
        // Start the monitor inside the success-callback
        monitor.Start(function() {
          console.log("Monitor started");
        });
      },
      function(msg) {
        console.log("Error creating monitor: " + msg);
      });
  }
  analytics.Stop = function()
  {
    var monitor = window.plugins.EqatecAnalytics.Monitor;
    monitor.Stop();
  }
  analytics.Monitor = function()
  {
    return window.plugins.EqatecAnalytics.Monitor;
  }

  document.addEventListener( "deviceready", function() {
    window.analytics.Start();
  });
  document.addEventListener( "pause", function() {
    window.analytics.Stop();
  });
  document.addEventListener( "resume", function() {
    window.analytics.Start();
  });
})(window);