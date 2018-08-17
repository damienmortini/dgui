[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# dnod

Node based GUI acting as a bridge to share data between any app using Web Sockets.

Goals:

* Data driven, data should always be valid JSON easily sharable between any kind of app
* Any slice of data can be used on its own
* Copy paste nodes should be trivial (NUKE style)
* Highly extendable with HTML and DOM Elements (Custom nodes should be able to be created in HTML only, JS just for more advanced tasks), using attributes and mimicking DOM syntax as much as possible.
* As light as possible, using native DOM inputs and simple theming system via CSS override



## Initialization

* Install dependencies with `npm install`

## Launch

* Launch the project with `npm start`, by default it will launch the development version, remove `?dev` from the URL to load the build version

## Build

* Simple build with `npm run build`

* Concatenated build with `npm run release`

## Query string parameters

* `dev` to launch the development version from `src` folder
