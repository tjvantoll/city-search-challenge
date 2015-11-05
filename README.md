# City Search Challenge

This repository contains the source code for the City Search Challenge app: a cross-platform Cordova app built with [Telerik AppBuilder](http://www.telerik.com/appbuilder) and the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/).

<a href="https://platform.telerik.com/#appbuilder/clone/https%3A%2F%2Fgithub.com%2Ftjvantoll%2Fcity-search-challenge.git" target="_blank"><img src="http://docs.telerik.com/platform/appbuilder/sample-apps/images/try-in-appbuilder.png" alt="Try in AppBuilder" title="Try in AppBuilder" /></a>

## Description

> How well do you know the location of cities around the world? Test your knowledge in this simple app that has you locate major cities from San Francisco to Tokyo, and everywhere in between. See how close you can get and challenge your friends!

## Download

### iOS

<a href="https://itunes.apple.com/us/app/city-search-geography-challenge/id954908040?mt=8">
	<img src="assets/App-Store-Icons/ios-app-store.png" style="height: 59px;">
</a>

### Android

<a href="https://play.google.com/store/apps/details?id=com.tjvantoll.citysearchchallenge">
	<img src="assets/App-Store-Icons/google-play.png" style="height: 59px;">
</a>

## Development

City Search Challenge uses [Grunt](http://gruntjs.com/) as a task runner, therefore you need to have the Grunt CLI installed (`npm install grunt-cli`) in order to run this project. Specifically you'll need to run the following commands:


```
$ npm install
```

installs the project's Node dependencies, and

```
$ grunt sass
```

converts the project's SASS files into CSS. From there you can run the project in the AppBuilder simulator with the following two commands:

```
$ cd app
$ appbuilder simulate
```

There are a few other grunt commands you might find handy.

```
$ grunt lint
```

runs [JSHint](http://jshint.com/), [CSSLint](http://csslint.net/), [JSCS](https://www.npmjs.com/package/jscs), and [HTML lint](https://github.com/jzaefferer/grunt-html) against the project.

```
$ grunt watch
```

sets up a watcher that converts .scss files into .css files as they're saved.

```
$ grunt android
```

performs a production Android build, complete with the compression of HTML, CSS, JavaScript, and image assets. And finally,

```
$ grunt ios
```

performs the same tasks but for iOS.
