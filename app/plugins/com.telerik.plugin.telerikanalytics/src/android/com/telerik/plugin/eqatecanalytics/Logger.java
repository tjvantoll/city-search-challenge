package com.telerik.plugin.eqatecanalytics;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import eqatec.analytics.monitor.ILogAnalyticsMonitor;

public class Logger implements ILogAnalyticsMonitor
{
  private CallbackContext m_LogError;
  private CallbackContext m_LogMessage;
  
  public void setLogErrorCallback(CallbackContext callbackContext)
  {
    m_LogError = callbackContext;
    SendNoResult(m_LogError);
  }

  public void setLogMessageCallback(CallbackContext callbackContext)
  {
    m_LogMessage = callbackContext;
    SendNoResult(m_LogMessage);
  }
  
  @Override
  public void logError(String errorMessage)
  {
    SendResult(m_LogError, errorMessage);
  }

  @Override
  public void logMessage(String message)
  {
    SendResult(m_LogMessage, message);
  }
  
  private void SendResult(CallbackContext context, String message)
  {
    if (context != null)
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, message);
      pr.setKeepCallback(true);
      context.sendPluginResult(pr);
    }
  }

  private void SendNoResult(CallbackContext context)
  {
    if (context != null)
    {
      PluginResult pr = new PluginResult(PluginResult.Status.NO_RESULT);
      pr.setKeepCallback(true);
      context.sendPluginResult(pr);
    }
  }  

}