using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using EQATEC.Analytics.Monitor;
using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.Cordova.JSON;

namespace Cordova.Extension.Commands
{
  public class EqatecAnalytics : BaseCommand, ILogAnalyticsMonitor
  {
    private IAnalyticsMonitor _monitor;
    private string _logMessageCallbackId = null;
    private string _logErrorCallbackId = null;
      

    private void SendResult(string callbackId, PluginResult.Status status)
    {
      var pluginResult = new PluginResult(status);
      DispatchCommandResult(pluginResult, callbackId);
    }

    private void SendResult(string callbackId, PluginResult pluginResult)
    {
      DispatchCommandResult(pluginResult, callbackId);
    }

    private void SendResultError(string callbackId, string message)
    {
      var pluginResult = new PluginResult(PluginResult.Status.ERROR, message);
      DispatchCommandResult(pluginResult, callbackId);
    }

    private void SendResultError(string callbackId, string caller, Exception ex)
    {
      var message = string.Format("{0} failed: {1} at {2}", caller, ex.Message, ex.StackTrace);
      SendResultError(callbackId, message);
    }


    public void LogMessage(string message)
    {
      SendLoggerResult(_logMessageCallbackId, message);
    }

    public void LogError(string errorMessage)
    {
      SendLoggerResult(_logErrorCallbackId, errorMessage);
    }

    private void SendLoggerResult(string callbackId, string message)
    {
      if (callbackId != null)
      {
        var pluginResult = new PluginResult(PluginResult.Status.OK, message);
        pluginResult.KeepCallback = true;
        SendResult(callbackId, pluginResult);
      }
    }

    private void SendLoggerNoResult(string callbackId)
    {
      if (callbackId != null)
      {
        var pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
        pluginResult.KeepCallback = true;
        SendResult(callbackId, pluginResult);
      }
    }


    private string[] ParseOptions(string options)
    {
      var args = JsonHelper.Deserialize<string[]>(options);
      return args;
    }


    public void FactoryCreateMonitor(string options)
    {
      const string caller = "Factory.CreateMonitor";
      var callbackId = CurrentCommandCallbackId;
      Task.Run(() =>
      {
        try
        {
          var args = ParseOptions(options);
          var productId = args[0];
          var version = args[1];
          if (!ValidateMonitorCreateParameters(callbackId, caller, productId, version))
            return;
          if (_monitor != null && _monitor.Status.IsStarted)
            _monitor.Stop();
          if (string.IsNullOrWhiteSpace(version))
            _monitor = AnalyticsMonitorFactory.CreateMonitor(productId);
          else
          {
            var settings = AnalyticsMonitorFactory.CreateSettings(productId);
            settings.Version = new Version(version);
            _monitor = AnalyticsMonitorFactory.CreateMonitor(settings);
          }
          SendResult(callbackId, PluginResult.Status.OK);
        }
        catch (Exception ex)
        {
          SendResultError(callbackId, caller, ex);
        }
      });
    }


    #region JsonObjSettings, JsonObjLocationCoordinates, and JsonObjProxyConfiguration
    [DataContract]
    private class JsonObjSettings
    {
      [DataMember()]
      public string ProductId { get; set; }
      [DataMember()]
      public string Version { get; set; }
      [DataMember()]
      public JsonObjLocationCoordinates LocationCoordinates { get; set; }
      [DataMember()]
      public int DailyNetworkUtilizationInKB { get; set; }
      [DataMember()]
      public object LoggingInterface { get; set; } // todo
      [DataMember()]
      public int MaxStorageSizeInKB { get; set; }
      [DataMember()]
      public string ServerUri { get; set; }
      [DataMember()]
      public int StorageSaveInterval { get; set; }
      [DataMember()]
      public bool SynchronizeAutomatically { get; set; }
      [DataMember()]
      public bool TestMode { get; set; }
      [DataMember()]
      public bool UseSsl { get; set; }
      [DataMember()]
      public JsonObjProxyConfiguration ProxyConfig { get; set; }
    }

    [DataContract]
    private class JsonObjLocationCoordinates
    {
      [DataMember()]
      public double Latitude { get; set; }
      [DataMember()]
      public double Longitude { get; set; }
    }

    [DataContract]
    private class JsonObjProxyConfiguration
    {
      [DataMember()]
      public string UserName { get; set; }
      [DataMember()]
      public string Password { get; set; }
      [DataMember()]
      public string Host { get; set; }
      [DataMember()]
      public uint Port { get; set; }
    }
    #endregion

    public void FactoryCreateMonitorWithSettings(string options)
    {
      const string caller = "Factory.CreateMonitorWithSettings";
      var callbackId = CurrentCommandCallbackId;
      Task.Run(() =>
      {
        try
        {
          var args = ParseOptions(options);
          var settings = JsonHelper.Deserialize<JsonObjSettings>(args[0]);
          string productId = settings.ProductId;
          string version = settings.Version;
          if (!ValidateMonitorCreateParameters(callbackId, caller, productId, version))
            return;
          var s = AnalyticsMonitorFactory.CreateSettings(productId);
          if (!string.IsNullOrWhiteSpace(version))
            s.Version = Version.Parse(version);
          if (settings.LocationCoordinates != null)
          {
            var coord = settings.LocationCoordinates;
            s.Location.Latitude = coord.Latitude;
            s.Location.Longitude = coord.Longitude;
          }
          s.DailyNetworkUtilizationInKB = settings.DailyNetworkUtilizationInKB;
          if (settings.LoggingInterface != null)
          {
            // Observe logging ourselves and relay to user-provider logger upon receiving logs
            s.LoggingInterface = this;
          }
          s.MaxStorageSizeInKB = settings.MaxStorageSizeInKB;
          if (settings.ServerUri != null)
          {
            s.ServerUri = new Uri(settings.ServerUri);
          }
          s.StorageSaveInterval = TimeSpan.FromSeconds(settings.StorageSaveInterval);
          s.SynchronizeAutomatically = settings.SynchronizeAutomatically;
          s.TestMode = settings.TestMode;
          s.UseSSL = settings.UseSsl;
          if (settings.ProxyConfig != null)
          {
            // HttpWebRequest's proxy not yet supported on Windows Phone. See eg
            // http://stackoverflow.com/questions/6976087/httpwebrequest-proxy-in-windows-phone-7
            LogMessage("ProxyConfig is not supported on Windows Phone");
          }
          if (_monitor != null && _monitor.Status.IsStarted)
            _monitor.Stop();
          _monitor = AnalyticsMonitorFactory.CreateMonitor(s);
          SendResult(callbackId, PluginResult.Status.OK);
        }
        catch (Exception ex)
        {
          SendResultError(callbackId, caller, ex);
        }
      });
    }

    #region JsonObjIsMonitorCreated
    [DataContract]
    private class JsonObjIsMonitorCreated
    {
      [DataMember()]
      public string IsCreated { get; set; }
    }
    #endregion

    public void FactoryIsMonitorCreated(string options)
    {
      var result = new JsonObjIsMonitorCreated 
      {
        // NOTE: add as string so the javascript-result have same types on all platforms!
        IsCreated = (_monitor != null).ToString()
      };
      var pluginResult = new PluginResult(PluginResult.Status.OK, result);
      SendResult(CurrentCommandCallbackId, pluginResult);
    }


    public void LoggingSetLogErrorCallback(string options)
    {
      _logErrorCallbackId = CurrentCommandCallbackId;
      SendLoggerNoResult(_logErrorCallbackId);
    }

    public void LoggingSetLogMessageCallback(string options)
    {
      _logMessageCallbackId = CurrentCommandCallbackId;
      SendLoggerNoResult(_logMessageCallbackId);
    }



    public void MonitorStart(string options)
    {
      var callbackId = CurrentCommandCallbackId; // store locally because of Task.Run
      Task.Run(() =>
      {
        PerformMonitorAction(options, callbackId, "Monitor.Start", args =>
        {
          _monitor.Start();
        });
      });
    }

    public void MonitorStop(string options)
    {
      var callbackId = CurrentCommandCallbackId; // store locally because of Task.Run
      Task.Run(() =>
      {
        PerformMonitorAction(options, callbackId, "Monitor.Stop", args =>
        {
          _monitor.Stop();
        });
      });
    }

    public void MonitorStopWithTimeout(string options)
    {
      var callbackId = CurrentCommandCallbackId; // store locally because of Task.Run
      Task.Run(() =>
      {
        PerformMonitorAction(options, callbackId, "Monitor.StopWithTimeout", args =>
        {
          var timeout = TimeSpan.Parse(args[0]);
          _monitor.Stop(timeout);
        });
      });
    }

    public void MonitorTrackExceptionMessage(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackExceptionMessage", args =>
      {
        var extype = args[0];
        var reason = args[1];
        var stacktrace = args[2];
        var message = args[3];
        _monitor.TrackException(extype, reason, stacktrace, message);
      });
    }

    public void MonitorTrackFeature(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackFeature", args =>
      {
        var featureName = args[0];
        _monitor.TrackFeature(featureName);
      });
    }

    public void MonitorTrackFeatureStart(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackFeatureStart", args =>
      {
        var featureName = args[0];
        _monitor.TrackFeatureStart(featureName);
      });
    }

    public void MonitorTrackFeatureStop(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackFeatureStop", args =>
      {
        var featureName = args[0];
        _monitor.TrackFeatureStop(featureName);
      });
    }

    public void MonitorTrackFeatureCancel(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackFeatureCancel", args =>
      {
        var featureName = args[0];
        _monitor.TrackFeatureCancel(featureName);
      });
    }

    public void MonitorTrackFeatureValue(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.TrackFeatureValue", args =>
      {
        var featureName = args[0];
        var trackedValue = int.Parse(args[1]);
        _monitor.TrackFeatureValue(featureName, trackedValue);
      });
    }

    public void MonitorForceSync(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.ForceSync", args =>
      {
        _monitor.ForceSync();
      });
    }

    public void MonitorSetInstallationInfo(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.SetInstallationInfo", args =>
      {
        var installationId = args[0];
        _monitor.SetInstallationInfo(installationId);
      });
    }

    public void MonitorSetInstallationInfoAndProperties(string options)
    {
      PerformMonitorAction(options, CurrentCommandCallbackId, "Monitor.SetInstallationInfoAndProperties", args =>
      {
        var installationId = args[0];
        var properties = args[1];
        Dictionary<string, string> props = JsonHelper.Deserialize<Dictionary<string, string>>(properties);
        _monitor.SetInstallationInfo(installationId, props);
      });
    }

    #region JsonObjSettings, JsonObjCapabilities
    [DataContract]
    private class JsonObjStatus
    {
      [DataMember()]
      public JsonObjCapabilities Capabilities { get; set; }
      [DataMember()]
      public string Connectivity { get; set; }
      [DataMember()]
      public string CookieId { get; set; }
      [DataMember()]
      public string IsStarted { get; set; }
      [DataMember()]
      public string RunTime { get; set; }
    }

    [DataContract]
    private class JsonObjCapabilities
    {
      [DataMember()]
      public string MaxAllowedBandwidthUsagePerDayInKB { get; set; }
      [DataMember()]
      public string MaxInstallationIDSize { get; set; }
      [DataMember()]
      public string MaxKeySizeOfInstallationPropertyKey { get; set; }
      [DataMember()]
      public string MaxLengthOfFeatureName { get; set; }
      [DataMember()]
      public string MaxLengthOfExceptionContextMessage { get; set; }
      [DataMember()]
      public string MaxNumberOfInstallationProperties { get; set; }
      [DataMember()]
      public string MaxStorageSizeInKB { get; set; }
    }
    #endregion

    public void MonitorGetStatus(string options)
    {
      var ok = (_monitor != null);
      if (!ok)
        LogMessage(string.Format("Monitor.GetStatus ignored; monitor has not been created yet"));

      var status = ok ? _monitor.Status : null;
      var cap = ok ? status.Capabilities : null;
      var thecap = new JsonObjCapabilities();
      // NOTE: add all as strings so the javascript-result have same types on all platforms!
      thecap.MaxAllowedBandwidthUsagePerDayInKB = (ok ? cap.MaxAllowedBandwidthUsagePerDayInKB : 0).ToString();
      thecap.MaxInstallationIDSize = (ok ? cap.MaxInstallationIDSize : 0).ToString();
      thecap.MaxKeySizeOfInstallationPropertyKey = (ok ? cap.MaxKeySizeOfInstallationPropertyKey : 0).ToString();
      thecap.MaxLengthOfFeatureName = (ok ? cap.MaxLengthOfFeatureName : 0).ToString();
      thecap.MaxLengthOfExceptionContextMessage = (ok ? cap.MaxLengthOfExceptionContextMessage : 0).ToString();
      thecap.MaxNumberOfInstallationProperties = (ok ? cap.MaxNumberOfInstallationProperties : 0).ToString();
      thecap.MaxStorageSizeInKB = (ok ? cap.MaxStorageSizeInKB : 0).ToString();
      var thestatus = new JsonObjStatus();
      thestatus.Capabilities = thecap;
      thestatus.Connectivity = (ok ? status.Connectivity : ConnectivityStatus.Unknown).ToString();
      thestatus.CookieId = ok ? status.CookieId : string.Empty;
      thestatus.IsStarted = (ok ? status.IsStarted : false).ToString();
      thestatus.RunTime = (ok ? (int)status.RunTime.TotalSeconds : 0).ToString();
      var pluginResult = new PluginResult(PluginResult.Status.OK, thestatus);
      SendResult(CurrentCommandCallbackId, pluginResult);
    }


    private bool ValidateMonitorCreateParameters(string callbackId, string caller, string productId, string version)
    {
      if (productId == null)
      {
        SendResultError(callbackId, caller + " failed; productId is null");
        return false;
      }

      if (version == null)
      {
        SendResultError(callbackId, caller + " failed; version is null");
        return false;
      }
      try
      {
        // If specified it must be a valid version
        if (!string.IsNullOrWhiteSpace(version))
          Version.Parse(version);
      }
      catch (Exception ex)
      {
        SendResultError(callbackId, caller + " failed; invalid version format: " + ex.Message);
        return false;
      }

      // All is well
      return true;
    }

    
    private delegate void MonitorAction(string[] args);
    private delegate PluginResult MonitorActionWithResult(string[] args);

    private void PerformMonitorAction(string options, string callbackId, string caller, MonitorAction action)
    {
      PerformMonitorAction(options, callbackId, caller, args =>
      {
        action(args);
        return null;
      });
    }

    private void PerformMonitorAction(string options, string callbackId, string caller, MonitorActionWithResult action)
    {
      try
      {
        PluginResult result = null;
        if (_monitor == null)
        {
          LogMessage(string.Format("{0} ignored; monitor has not been created yet", caller));
        }
        else
        {
          var args = ParseOptions(options);
          result = action(args);
        }
        if (result != null)
          SendResult(callbackId, result);
        else
          SendResult(callbackId, PluginResult.Status.OK);
      }
      catch (Exception ex)
      {
        LogError(string.Format("{0} failed: {1}", caller, ex.Message));
        SendResult(callbackId, PluginResult.Status.JSON_EXCEPTION);
      }
    }


  }
}
