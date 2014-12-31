package com.telerik.plugin.eqatecanalytics;

import java.net.URI;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.pm.PackageManager;
import eqatec.analytics.monitor.AnalyticsMonitorCapabilities;
import eqatec.analytics.monitor.AnalyticsMonitorStatus;
import eqatec.analytics.monitor.IAnalyticsMonitorSettings;
import eqatec.analytics.monitor.AnalyticsMonitorFactory;
import eqatec.analytics.monitor.IAnalyticsMonitor;


public class EqatecAnalyticsPlugin extends CordovaPlugin
{  
  private IAnalyticsMonitor m_monitor = null;
  private Logger m_logger = new Logger();

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException
  {
    if (action.equals("FactoryCreateMonitor")) {
      String productId = args.getString(0);
      String version = args.getString(1);
      if (version.length() == 0)
        version = GetVersion();
      if (!ValidateMonitorCreateParameters(callbackContext, "CreateMonitor", productId, version))
        return true;
      try
      {
        Activity context = cordova.getActivity();
        if (m_monitor != null && m_monitor.getStatus().getIsStarted())
          m_monitor.stop();
        m_monitor = AnalyticsMonitorFactory.createMonitor(context.getBaseContext(), productId, new eqatec.analytics.monitor.Version(version));        
        callbackContext.success("CreateMonitor completed");
      }
      catch (Exception e)
      {
        callbackContext.error("CreateMonitor failed: " + e.getMessage());
      }
      return true;
    }
  
    if (action.equals("FactoryCreateMonitorWithSettings")) {
      JSONObject settings = args.getJSONObject(0);
      if (settings == null)
      {
        callbackContext.error("CreateMonitorWithSettings failed; settings is null");
        return true;
      }
      try
      {
        String productId = settings.getString("ProductId");
        String version = settings.getString("Version");
        if (version.length() == 0)
          version = GetVersion();
        if (!ValidateMonitorCreateParameters(callbackContext, "CreateMonitorWithSettings", productId, version))
          return true;
        IAnalyticsMonitorSettings s = AnalyticsMonitorFactory.createSettings(productId, new eqatec.analytics.monitor.Version(version));
        JSONObject coord = settings.getJSONObject("LocationCoordinates");
        if (coord != null)
        {
          s.getLocationCoordinates().setLatitude(coord.getDouble("Latitude"));
          s.getLocationCoordinates().setLongitude(coord.getDouble("Longitude"));
        }
        s.setDailyNetworkUtilizationInKB(settings.getInt("DailyNetworkUtilizationInKB"));
        s.setLoggingInterface(m_logger);
        s.setMaxStorageSizeInKB(settings.getInt("MaxStorageSizeInKB"));
        s.setServerUri(new URI(settings.getString("ServerUri")));
        s.setStorageSaveInterval(settings.getInt("StorageSaveInterval") * 1000); // Java expects millisec, settings are in sec - oh dear
        s.setSynchronizeAutomatically(settings.getBoolean("SynchronizeAutomatically"));
        s.setTestMode(settings.getBoolean("TestMode"));
        s.setUseSsl(settings.getBoolean("UseSsl"));
        Activity context = cordova.getActivity();
        if (m_monitor != null && m_monitor.getStatus().getIsStarted())
          m_monitor.stop();
        m_monitor = AnalyticsMonitorFactory.createMonitor(context.getBaseContext(), s);
        callbackContext.success("CreateMonitorWithSettings completed");
      }
      catch (Exception e)
      {
        callbackContext.error("CreateMonitorWithSettings failed: " + e.getMessage());
      }
      return true;
    }
    
    if (action.equals("FactoryIsMonitorCreated")) {
      JSONObject result = new JSONObject();
      try
      {
        // NOTE: add as string so the javascript-result have same types on all platforms!
        result.put("IsCreated", Boolean.toString(m_monitor != null));
      }
      catch (JSONException e)
      {}
      callbackContext.success(result);
      return true;
    }
      
      
    if (action.equals("LoggingSetLogErrorCallback")) {
      m_logger.setLogErrorCallback(callbackContext);
      return true;
    }
      
    if (action.equals("LoggingSetLogMessageCallback")) {
      m_logger.setLogMessageCallback(callbackContext);
      return true;
    }

      
    if (action.equals("MonitorStart")) {
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.Start") {
        public void action() {
          m_monitor.start();
        }});
      return true;
    }

    if (action.equals("MonitorStop")) {
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.Stop") {
        public void action() {
          m_monitor.stop();
        }});
      return true;
    }
    
    if (action.equals("MonitorStopWithTimeout")) {
      final int waitForCompletionInSeconds = args.getInt(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.StopWithTimeout") {
        public void action() {
          m_monitor.stop(waitForCompletionInSeconds);
        }});
      return true;
    }

    if (action.equals("MonitorTrackExceptionMessage")) {
      final String typename = args.getString(0);
      final String reason = args.getString(1);
      final String stacktrace = args.getString(2);
      final String message = args.getString(3);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackExceptionMessage") {
        public void action() {
          m_monitor.trackExceptionRawMessage(typename, reason, stacktrace, message);
        }});
      return true;
    }
      
    if (action.equals("MonitorTrackFeature")) {
      final String featureName = args.getString(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackFeature") {
        public void action() {
          m_monitor.trackFeature(featureName);
        }});
      return true;
    }
            
    if (action.equals("MonitorTrackFeatureStart")) {
      final String featureName = args.getString(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackFeatureStart") {
        public void action() {
          m_monitor.trackFeatureStart(featureName);
        }});
      return true;
    }
          
    if (action.equals("MonitorTrackFeatureStop")) {
      final String featureName = args.getString(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackFeatureStop") {
        public void action() {
          m_monitor.trackFeatureStop(featureName);
        }});
      return true;
    }
          
    if (action.equals("MonitorTrackFeatureCancel")) {
      final String featureName = args.getString(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackFeatureCancel") {
        public void action() {
          m_monitor.trackFeatureCancel(featureName);
        }});
      return true;
    }
          
    if (action.equals("MonitorTrackFeatureValue")) {
      final String featureName = args.getString(0);
      final long trackedValue = args.getLong(1);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.TrackFeatureValue") {
        public void action() {
          m_monitor.trackFeatureValue(featureName, trackedValue);
        }});
      return true;
    }
          
    if (action.equals("MonitorForceSync")) {
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.ForceSync") {
        public void action() {
          m_monitor.forceSync();
        }});
      return true;
    }
            
    if (action.equals("MonitorSetInstallationInfo")) {
      final String installationId = args.getString(0);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.SetInstallationInfo") {
        public void action() {
          m_monitor.setInstallationInfo(installationId);
        }});
      return true;
    }
            
    if (action.equals("MonitorSetInstallationInfoAndProperties")) {
      final String installationId = args.getString(0);
      final JSONObject properties = args.getJSONObject(1);
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.SetInstallationInfoAndProperties") {
        public void action() {
          Map<String,String> propertiesMap = new HashMap<String,String>();
          Iterator<?> keys = properties.keys();
          while (keys.hasNext())
          {
            String key = (String)keys.next();
            try
            {
              Object o = properties.get(key);
              String value = (o == null ? "<null>" : o.toString());
              propertiesMap.put(key, value);
            }
            catch (JSONException e) {}
          }
          m_monitor.setInstallationInfo(installationId, propertiesMap);
        }});
      return true;
    }
            
    if (action.equals("MonitorGetStatus")) {
      PerformMonitorAction(new MonitorAction(callbackContext, "Monitor.GetStatus") {
        private JSONObject statusObj;
        public void action() throws JSONException {
          AnalyticsMonitorStatus status = m_monitor.getStatus();
          AnalyticsMonitorCapabilities cap = status.getCapabilities();
          JSONObject c = new JSONObject();
          // NOTE: add all as strings so the javascript-result have same types on all platforms!
          c.put("MaxAllowedBandwidthUsagePerDayInKB", Integer.toString(cap.getMaxAllowedBandwidthUsagePerDayInKB()));
          c.put("MaxInstallationIDSize", Integer.toString(cap.getMaxInstallationIDSize()));
          c.put("MaxKeySizeOfInstallationPropertyKey", Integer.toString(cap.getMaxKeySizeOfInstallationPropertyKey()));
          c.put("MaxLengthOfFeatureName", Integer.toString(cap.getMaxLengthOfExceptionContextMessage()));
          c.put("MaxLengthOfExceptionContextMessage", Integer.toString(cap.getMaxLengthOfExceptionContextMessage()));
          c.put("MaxNumberOfInstallationProperties", Integer.toString(cap.getMaxNumberOfInstallationProperties()));
          c.put("MaxStorageSizeInKB", Integer.toString(cap.getMaxStorageSizeInKB()));
          statusObj = new JSONObject();
          statusObj.put("Capabilities", c);
          statusObj.put("Connectivity", status.getConnectivity().toString());
          statusObj.put("CookieId", status.getCookieID());
          statusObj.put("IsStarted", Boolean.toString(status.getIsStarted()));
          statusObj.put("RunTime", Integer.toString(status.getRunTime()));
        }
        public JSONObject message() { return statusObj; }  
        });
      return true;
    }
      
// Release doesn't work for now
//      if (action.equals("MonitorRelease")) {
//      if (m_monitor != null)
//      {
//        if (m_monitor.getStatus().getIsStarted())
//          m_monitor.stop();
//        // m_monitor.close(); todo: cleanup java monitor so it can be closed without throwing exception
//        m_monitor = null;
//      }
//      callbackContext.success("Monitor.Release completed");
//        return true;
//      }
      
      
    return false;
  }

  
  
  private boolean ValidateMonitorCreateParameters(CallbackContext callbackContext, String caller, String productId, String version)
  {
    if (productId == null)
    {
      callbackContext.error(caller + " failed; productId is null");
      return false;
    }
    
    if (version == null)
    {
      callbackContext.error(caller + " failed; version is null");
      return false;
    }
    try
    {
      new eqatec.analytics.monitor.Version(version);
    }
    catch (Exception e)
    {
      callbackContext.error(caller + " failed; invalid version format: " + e.getMessage());
      return false;
    }
    
    // All is well
    return true;
  }


  private String GetVersion()
  {
    try {
      Activity context = cordova.getActivity();
      PackageManager packageManager = context.getPackageManager();
      String packageName = context.getPackageName();
      return packageManager.getPackageInfo(packageName, 0).versionName;
    } catch (Exception e) {
      m_logger.logError("Failed to retrieve app version: " + e.getMessage());
      return "0.0";
    }
  }
  
  
  abstract class MonitorAction
  {
    public CallbackContext CallbackContext;
    public String CallerName;
    public MonitorAction(CallbackContext callbackContext, String callerName)
    {
      CallbackContext = callbackContext;
      CallerName = callerName;
    }
    public abstract void action() throws JSONException;
    public JSONObject message() { return null; }
  }
  
  private void PerformMonitorAction(MonitorAction ma)
  {
    try
    {
      JSONObject message = null;
      if (m_monitor == null)
      {
        m_logger.logMessage(ma.CallerName + " ignored; monitor has not been created yet");
      }
      else
      {
        ma.action();
        message = ma.message();
      }
      if (message != null)
        ma.CallbackContext.success(message);
      else
        ma.CallbackContext.success(ma.CallerName + " completed");
    }
    catch (Exception e)
    {
      m_logger.logError(ma.CallerName + " failed: " + e.getMessage());
    }
  }


}
