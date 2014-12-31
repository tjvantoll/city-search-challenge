#import <Cordova/CDV.h>
#import "EQATECAnalyticsMonitor.h"

@interface EqatecAnalyticsPlugin : CDVPlugin<EQATECLogAnalyticsMonitor>

@property(nonatomic, retain, strong) EQATECAnalyticsMonitor *monitor;
@property(nonatomic, retain, strong) CDVInvokedUrlCommand *logErrorCallback;
@property(nonatomic, retain, strong) CDVInvokedUrlCommand *logMessageCallback;

-(void)FactoryCreateMonitor:(CDVInvokedUrlCommand*)command;
-(void)FactoryCreateMonitorWithSettings:(CDVInvokedUrlCommand*)command;
-(void)FactoryIsMonitorCreated:(CDVInvokedUrlCommand*)command;
-(void)LoggingSetLogErrorCallback:(CDVInvokedUrlCommand*)command;
-(void)LoggingSetLogMessageCallback:(CDVInvokedUrlCommand*)command;
-(void)MonitorStart:(CDVInvokedUrlCommand*)command;
-(void)MonitorStop:(CDVInvokedUrlCommand*)command;
-(void)MonitorStopWithTimeout:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackExceptionMessage:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackFeature:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackFeatureStart:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackFeatureStop:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackFeatureCancel:(CDVInvokedUrlCommand*)command;
-(void)MonitorTrackFeatureValue:(CDVInvokedUrlCommand*)command;
-(void)MonitorForceSync:(CDVInvokedUrlCommand*)command;
-(void)MonitorSetInstallationInfo:(CDVInvokedUrlCommand*)command;
-(void)MonitorSetInstallationInfoAndProperties:(CDVInvokedUrlCommand*)command;
-(void)MonitorGetStatus:(CDVInvokedUrlCommand*)command;
//-(void)MonitorRelease:(CDVInvokedUrlCommand*)command;

@end