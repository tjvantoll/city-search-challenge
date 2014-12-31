#import "EqatecAnalyticsPlugin.h"


@interface EqatecAnalyticsPlugin ()
-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller error:(NSError*)error;
-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller exception:(NSException*)exception;
-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller message:(NSString*)message;
@end


@implementation EqatecAnalyticsPlugin

@synthesize monitor;
@synthesize logErrorCallback;
@synthesize logMessageCallback;


-(void)sendResult:(CDVInvokedUrlCommand*)command status:(CDVCommandStatus)status
{
  CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:status];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)sendResultNone:(CDVInvokedUrlCommand*)command
{
  CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller message:(NSString*)message
{
  CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller error:(NSError*)error
{
  NSString *reason = [error localizedFailureReason];
  NSString *message = [caller stringByAppendingFormat:@" failed: %@", reason];
  [self sendResultError:command caller:caller message:message];
}

-(void)sendResultError:(CDVInvokedUrlCommand*)command caller:(NSString*)caller exception:(NSException*)exception
{
  NSString *reason = [exception reason];
  NSString *stack = [[exception callStackSymbols] componentsJoinedByString:@" "];
  NSString *message = [caller stringByAppendingFormat:@" failed: %@ at %@", reason, stack];
  [self sendResultError:command caller:caller message:message];
}


-(BOOL)verifyMonitorIsCreated:(CDVInvokedUrlCommand*)command caller:(NSString*)caller
{
  if (monitor != nil)
    return TRUE;
  NSString *message = [caller stringByAppendingFormat:@" ignored; monitor has not been created yet"];
  [self sendResultError:command caller:caller message:message];
  return FALSE;
}


-(void) didLogMessage: (NSString*)message
{
  [self sendLoggerResult:logMessageCallback message:message];
}

-(void) didLogError:(NSError *)error
{
  [self sendLoggerResult:logErrorCallback message:[error localizedDescription]];
}


-(void)sendLoggerResult:(CDVInvokedUrlCommand*)command message:(NSString*)message
{
  if (command != nil)
  {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [pluginResult setKeepCallbackAsBool:TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

-(void)sendLoggerNoResult:(CDVInvokedUrlCommand*)command
{
  if (command != nil)
  {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}



-(void)FactoryCreateMonitor:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Factory.CreateMonitor";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      if (monitor != nil && monitor.status.isStarted)
        [monitor stop];
      NSString* productId = [command argumentAtIndex:0];
      NSString* version = [command argumentAtIndex:1];
      if ([version length] == 0)
        version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
      monitor = [EQATECAnalyticsMonitor monitorWithProductId:productId version:version];
      [self sendResult:command status:CDVCommandStatus_OK];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

-(void)FactoryCreateMonitorWithSettings:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Factory.CreateMonitorWithSettings";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      NSDictionary *settings = [command argumentAtIndex:0];
      NSString* productId = [settings objectForKey:@"ProductId"];
      NSString* version = [settings objectForKey:@"Version"];
      if ([version length] == 0)
        version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
      EQATECAnalyticsMonitorSettings *s = [EQATECAnalyticsMonitorSettings settingsWithProductId:productId version:version];
      NSDictionary *coord = [settings objectForKey:@"LocationCoordinates"];
      if (coord != nil)
      {
        CLLocationCoordinate2D loc;
        loc.latitude = [[coord objectForKey:@"Latitude"] doubleValue];
        loc.longitude = [[coord objectForKey:@"Longitude"] doubleValue];
        s.location = loc;
      }
      s.dailyNetworkUtilizationInKB = [[settings objectForKey:@"DailyNetworkUtilizationInKB"] intValue];
      if ([settings objectForKey:@"LoggingInterface"] != nil)
      {
        // Observe logging ourselves and relay to user-provider logger upon receiving logs
        s.loggingDelegate = self;
      }
      s.maxStorageSizeInKB = [[settings objectForKey:@"MaxStorageSizeInKB"] intValue];
      s.serverUri = [settings objectForKey:@"ServerUri"];
      s.storageSaveInterval = [[settings objectForKey:@"StorageSaveInterval"] intValue];
      s.synchronizesAutomatically = [[settings objectForKey:@"SynchronizeAutomatically"] boolValue];
      s.isTestMode = [[settings objectForKey:@"TestMode"] boolValue];
      s.usesSSL = [[settings objectForKey:@"UseSsl"] boolValue];
      // A custom StorageInterface is not supported by the plug-in
      NSDictionary *proxy = [settings objectForKey:@"ProxyConfig"];
      if (proxy != nil)
      {
        s.proxyConfig.userName = [proxy objectForKey:@"UserName"];
        s.proxyConfig.password = [proxy objectForKey:@"Password"];
        s.proxyConfig.host = [proxy objectForKey:@"Host"];
        s.proxyConfig.port = [[proxy objectForKey:@"Port"] unsignedIntValue];
      }
      if (monitor != nil && monitor.status.isStarted)
        [monitor stop];      
      monitor = [EQATECAnalyticsMonitor monitorWithSettings:s];
      [self sendResult:command status:CDVCommandStatus_OK];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

-(void)FactoryIsMonitorCreated:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Factory.IsMonitorCreated";
  @try
  {
    NSString *isCreated = (monitor ? @"true" : @"false");
    NSMutableDictionary *message = [NSMutableDictionary dictionary];
    [message setObject:isCreated forKey:@"IsCreated"];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:message];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}


-(void)LoggingSetLogErrorCallback:(CDVInvokedUrlCommand*)command
{
  logErrorCallback = command;
  [self sendLoggerNoResult:logErrorCallback];
}

-(void)LoggingSetLogMessageCallback:(CDVInvokedUrlCommand*)command
{
  logMessageCallback = command;
  [self sendLoggerNoResult:logMessageCallback];
}



-(void)MonitorStart:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.Start";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      if (![self verifyMonitorIsCreated:command caller:caller])
        return;
      [monitor start];
      [self sendResult:command status:CDVCommandStatus_OK];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

-(void)MonitorStop:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.Stop";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      if (![self verifyMonitorIsCreated:command caller:caller])
        return;
      [monitor stop];
      [self sendResult:command status:CDVCommandStatus_OK];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

-(void)MonitorStopWithTimeout:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.StopWithTimeout";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      if (![self verifyMonitorIsCreated:command caller:caller])
        return;
      int timeout = [[command argumentAtIndex:0] intValue];
      [monitor stopWithTimeout:timeout];
      [self sendResult:command status:CDVCommandStatus_OK];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

-(void)MonitorTrackExceptionMessage:(CDVInvokedUrlCommand*)command
{
  NSString *caller = @"Monitor.TrackExceptionMessage";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *extype = [command argumentAtIndex:0];
    NSString *reason = [command argumentAtIndex:1];
    NSString *stacktrace = [command argumentAtIndex:2];
    NSString *message = [command argumentAtIndex:3];
    [monitor trackExceptionRawMessage:extype reason:reason stacktrace:stacktrace message:message];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorTrackFeature:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.TrackFeature";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *featureName = [command argumentAtIndex:0];
    [monitor trackFeature:featureName];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorTrackFeatureStart:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.TrackFeatureStart";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *featureName = [command argumentAtIndex:0];
    [monitor trackFeatureStart:featureName];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorTrackFeatureStop:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.TrackFeatureStop";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *featureName = [command argumentAtIndex:0];
    [monitor trackFeatureStop:featureName];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorTrackFeatureCancel:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.TrackFeatureCancel";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *featureName = [command argumentAtIndex:0];
    [monitor trackFeatureCancel:featureName];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorTrackFeatureValue:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.TrackFeatureValue";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *featureName = [command argumentAtIndex:0];
    int trackedValue = [[command argumentAtIndex:1] intValue];
    [monitor trackFeatureValue:featureName value:trackedValue];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorForceSync:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.ForceSync";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    [monitor forceSync];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorSetInstallationInfo:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.SetInstallationInfo";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *installationId = [command argumentAtIndex:0];
    [monitor setInstallationInfo:installationId];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorSetInstallationInfoAndProperties:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.SetInstallationInfoAndProperties";
  @try
  {
    if (![self verifyMonitorIsCreated:command caller:caller])
      return;
    NSString *installationId = [command argumentAtIndex:0];
    NSDictionary *properties = [command argumentAtIndex:1];
    [monitor setInstallationInfo:installationId properties:properties];
    [self sendResult:command status:CDVCommandStatus_OK];
  }
  @catch (NSException *exception)
  {
    [self sendResultError:command caller:caller exception:exception];
  }
}

-(void)MonitorGetStatus:(CDVInvokedUrlCommand*)command
{
  static NSString *caller = @"Monitor.GetStatus";
  [self.commandDelegate runInBackground:^
  {
    @try
    {
      if (![self verifyMonitorIsCreated:command caller:caller])
        return;
      EQATECAnalyticsMonitorStatus *status = monitor.status;
      EQATECAnalyticsMonitorCapabilities *cap = status.capabilities;
      NSMutableDictionary *thecap = [NSMutableDictionary dictionary];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxAllowedBandwidthUsagePerDayInKB] forKey:@"MaxAllowedBandwidthUsagePerDayInKB"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxInstallationIDSize] forKey:@"MaxInstallationIDSize"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxKeySizeOfInstallationPropertyKey] forKey:@"MaxKeySizeOfInstallationPropertyKey"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxLengthOfFeatureName] forKey:@"MaxLengthOfFeatureName"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxLengthOfExceptionContextMessage] forKey:@"MaxLengthOfExceptionContextMessage"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxNumberOfInstallationProperties] forKey:@"MaxNumberOfInstallationProperties"];
      [thecap setObject:[NSString stringWithFormat:@"%d", cap.maxStorageSizeInKB] forKey:@"MaxStorageSizeInKB"];
      NSMutableDictionary *thestatus = [NSMutableDictionary dictionary];
      [thestatus setObject:thecap forKey:@"Capabilities"];
      NSString *connectivity;
      switch (status.connectivityStatus)
      {
        case EQATECConnectivityStatusUnknown: connectivity = @"Unknown"; break;
        case EQATECConnectivityStatusConnected: connectivity = @"Connected"; break;
        case EQATECConnectivityStatusDisconnected: connectivity = @"Disconnected"; break;
      }
      [thestatus setObject:connectivity forKey:@"Connectivity"];
      [thestatus setObject:status.cookieId forKey:@"CookieId"];
      [thestatus setObject:(status.isStarted ? @"true" : @"false") forKey:@"IsStarted"];
      [thestatus setObject:[NSString stringWithFormat:@"%d", (int)status.runTime] forKey:@"RunTime"];
      CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:thestatus];
      [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
    @catch (NSException *exception)
    {
      [self sendResultError:command caller:caller exception:exception];
    }
  }];
}

// Release doesn't work for now!!!
//-(void)MonitorRelease:(CDVInvokedUrlCommand*)command
//{
//  static NSString *caller = @"Monitor.Release";
//  @try
//  {
//    if (![self verifyMonitorIsCreated:command caller:caller])
//      return;
//    if (monitor.status.isStarted)
//      [monitor stop];
//    // todo: release? ARC?
//    monitor = nil;
//    [self sendResult:command status:CDVCommandStatus_OK];
//  }
//  @catch (NSException *exception)
//  {
//    [self sendResultError:command caller:caller exception:exception];
//  }
//}




@end