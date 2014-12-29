/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness                                                   (c) Chris Veness 2014  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict'

var test = require('tape');

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLon                                                                                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('inverse', function(assert) {
    var LatLon = require('./latlon.js');

    var cambg = LatLon(52.205, 0.119), paris = LatLon(48.857, 2.351);
    assert.equal(cambg.distanceTo(paris).toPrecision(4), '404.3', 'distance');
    assert.equal(cambg.bearingTo(paris).toFixed(1), '156.2', 'initial bearing');
    assert.equal(cambg.finalBearingTo(paris).toFixed(1), '157.9', 'final bearing');
    assert.equal(cambg.midpointTo(paris).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.end();
});

test('direct', function(assert) {
    var LatLon = require('./latlon.js');

    var bradwell = LatLon(51.4778, -0.0015), brng = 300.7, dist = 7.794;
    assert.equal(bradwell.destinationPoint(brng, dist).toString('d'), '51.5135°N, 000.0983°W', 'dest’n');
    assert.end();
});

test('intersection', function(assert) {
    var LatLon = require('./latlon.js');

    var stn = LatLon(51.8853, 0.2545);
    var cdg = LatLon(49.0034, 2.5735);
    assert.equal(LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'dest’n');
    assert.end();
});

test('rhumb', function(assert) {
    var LatLon = require('./latlon.js');

    var dov = LatLon(51.127, 1.338), cal = LatLon(50.964, 1.853);
    assert.equal(dov.rhumbDistanceTo(cal).toPrecision(4), '40.31', 'distance');
    assert.equal(dov.rhumbBearingTo(cal).toFixed(1), '116.7', 'bearing');
    assert.equal(dov.rhumbDestinationPoint(116.7, 40.31).toString('d'), '50.9641°N, 001.8531°E', 'dest’n');
    assert.equal(dov.rhumbMidpointTo(cal).toString('d'), '51.0455°N, 001.5957°E', 'midpoint');
    assert.end();
});

test('compass-point', function(assert) {
    var Geo = require('./geo.js');

    assert.equal(Geo.compassPoint(1), 'N',        '1 -> N');
    assert.equal(Geo.compassPoint(0), 'N',        '0 -> N');
    assert.equal(Geo.compassPoint(-1), 'N',       '-1 -> N');
    assert.equal(Geo.compassPoint(359), 'N',      '359 -> N');
    assert.equal(Geo.compassPoint(24), 'NNE',     '24 -> NNE');
    assert.equal(Geo.compassPoint(24, 1), 'N',    '24:1 -> N');
    assert.equal(Geo.compassPoint(24, 2), 'NE',   '24:2 -> NE');
    assert.equal(Geo.compassPoint(24, 3), 'NNE',  '24:3 -> NNE');
    assert.equal(Geo.compassPoint(226), 'SW',     '226 -> SW');
    assert.equal(Geo.compassPoint(226, 1), 'W',   '226:1 -> W');
    assert.equal(Geo.compassPoint(226, 2), 'SW',  '226:2 -> SW');
    assert.equal(Geo.compassPoint(226, 3), 'SW',  '226:3 -> SW');
    assert.equal(Geo.compassPoint(237), 'WSW',    '237 -> WSW');
    assert.equal(Geo.compassPoint(237, 1), 'W',   '237:1 -> W');
    assert.equal(Geo.compassPoint(237, 2), 'SW',  '237:2 -> SW');
    assert.equal(Geo.compassPoint(237, 3), 'WSW', '237:3 -> WSW');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonE / Vincenty                                                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('ellipsoid', function(assert) {
    var LatLonE = require('./latlon-ellipsoid.js');
    // merge vincenty methods into LatLonE
    var V = require('./latlon-vincenty.js');
    for (var prop in V) LatLonE[prop] = V[prop];

    var greenwichWGS84 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
    assert.equal(greenwichWGS84.convertDatum(LatLonE.datum.OSGB36).toString('d'), '51.4773°N, 000.0000°E', 'convert WGS84 -> OSGB36');

    var le = new LatLonE(50.06632, -5.71475), jog = new LatLonE(58.64402, -3.07009);
    assert.equal(le.distanceTo(jog).toFixed(3), '969954.166', 'vincenty inverse distance');
    assert.equal(le.initialBearingTo(jog).toFixed(4), '9.1419', 'vincenty inverse initial bearing');
    assert.equal(le.finalBearingTo(jog).toFixed(4), '11.2972', 'vincenty inverse final bearing');

    var flindersPeak = LatLonE(-37.95103, 144.42487);
    var buninyong = LatLonE(-37.6528, 143.9265);
    assert.equal(flindersPeak.destinationPoint(306.86816, 54972.271).toString('d'), '37.6528°S, 143.9265°E', 'vincenty direct destination');
    assert.equal(flindersPeak.finalBearingOn(306.86816, 54972.271).toFixed(4), '307.1736', 'vincenty direct final brng');
    assert.equal(LatLonE(0, 0).distanceTo(LatLonE(0.5, 179.5)), 19936288.579, 'vincenty antipodal distance');

    assert.true(isNaN(LatLonE(0, 0).distanceTo(LatLonE(0.5, 179.7))), 'vincenty antipodal convergence failure');

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* OsGridRef                                                                                      */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('os-gridref', function(assert) {
    var LatLonE = require('./latlon-ellipsoid.js');
    var OsGridRef = require('./osgridref.js');

    var osgb = LatLonE(52.65757, 1.71791, LatLonE.datum.OSGB36);
    assert.equal(OsGridRef.latLonToOsGrid(osgb).toString(), 'TG 51409 13177', 'll -> grid (txt)');
    assert.equal(OsGridRef.osGridToLatLon(OsGridRef(651409, 313177)).toString(), '52°39′27″N, 001°43′04″E', 'grid (num) -> ll');
    assert.deepEqual(OsGridRef.parse('TG 51409 13177'), OsGridRef(651409, 313177), 'parse grid (txt) -> grid (num)');

    var djg = OsGridRef.osGridToLatLon(OsGridRef(544359, 180653));
    assert.equal(djg.toString('d',6), '51.505867°N, 000.080296°E', 'DJG NGR->OSGB36');
    assert.equal(djg.convertDatum(LatLonE.datum.WGS84).toString('d',6), '51.506381°N, 000.078666°E', 'DJG NGR->WGS84');
    assert.equal(OsGridRef.latLonToOsGrid(djg).toString(), 'TQ 44359 80653', 'DJG round-trip');

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonV                                                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('latlon-vectors', function(assert) {
    var LatLonV = require('./latlon-vectors.js');
    var Vector3d = require('./vector3d.js');

    assert.equal(LatLonV(45, 45).toVector().toString(), '[0.500,0.500,0.707]', 'll to v');
    assert.equal(Vector3d(0.500, 0.500, 0.707107).toLatLon().toString('d'), '45.0000°N, 045.0000°E', 'v to ll');
    assert.equal(LatLonV(53.3206, -1.7297).greatCircle(96.0).toString(), '[-0.794,0.129,0.594]', 'great circle');
    assert.equal(LatLonV(52.205, 0.119).distanceTo(LatLonV(48.857, 2.351)).toPrecision(4), '404.3', 'distance');
    assert.equal(LatLonV(52.205, 0.119).bearingTo(LatLonV(48.857, 2.351)).toFixed(1), '156.2', 'bearing');
    assert.equal(LatLonV(48.857, 2.351).bearingTo(LatLonV(52.205, 0.119)).toFixed(1), '337.9', 'bearing (reverse)');
    assert.equal(LatLonV(52.205, 0.119).midpointTo(LatLonV(48.857, 2.351)).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.equal(LatLonV(51.4778, -0.0015).destinationPoint(300.7, 7.794).toString('d'), '51.5135°N, 000.0983°W', 'destination');
    var stn = LatLonV(51.8853, 0.2545);
    var cdg = LatLonV(49.0034, 2.5735);
    assert.equal(LatLonV.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'intersection');
    var here = new LatLonV(53.1611, -0.7972);
    var start = new LatLonV(53.3206, -1.7297);
    assert.equal(LatLonV(10,0).crossTrackDistanceTo(LatLonV(0,0), 90).toPrecision(4), '-1112', 'cross-track b');
    assert.equal(LatLonV(10,1).crossTrackDistanceTo(LatLonV(0,0), LatLonV(0,2)).toPrecision(4), '-1112', 'cross-track p');
    assert.equal(LatLonV(10,0).crossTrackDistanceTo(LatLonV(0,0), 270).toPrecision(4), '1112', 'cross-track -');
    var bounds = [ new LatLonV(45,1), new LatLonV(45,2), new LatLonV(46,2), new LatLonV(46,1) ];
    assert.true(LatLonV(45.1, 1.1).enclosedBy(bounds), 'enclosed in');
    assert.false(LatLonV(46.1, 1.1).enclosedBy(bounds), 'enclosed out');
    assert.true(LatLonV(52.205, 0.119).equals(LatLonV(52.205, 0.119)), 'equals');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geo                                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('geo', function(assert) {
    var LatLon = require('./latlon.js');
    var Geo = require('./geo.js');

    assert.equal(LatLon(51.521470, -0.138833).toString('d', 6), '51.521470°N, 000.138833°W', 'toString d');
    assert.equal(LatLon(51.521470, -0.138833).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'toString dms');
    assert.equal(LatLon(Geo.parseDMS('51.521470°N'), Geo.parseDMS('000.138833°W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse d');
    assert.equal(LatLon(Geo.parseDMS('51°31′17.29″N'), Geo.parseDMS('000°08′19.80″W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse dms');
    assert.equal(Geo.parseDMS('0.0°'), 0, 'parse 0°');
    assert.equal(Geo.toDMS(0, 'd'), '000.0000°', 'output 000.0000°');
    assert.equal(Geo.parseDMS('0°'), 0, 'parse 0°');
    assert.equal(Geo.toDMS(0, 'd',0), '000°', 'output 000°');
    assert.equal(Geo.parseDMS('000°00′00″'), 0, 'parse 000°00′00″');
    assert.equal(Geo.toDMS(0), '000°00′00″', 'output 000°00′00″');
    assert.equal(Geo.parseDMS('000°00′00.0″'), 0, 'parse 000°00′00.0″');
    assert.equal(Geo.toDMS(0,'dms',2), '000°00′00.00″', 'output 000°00′00.00″');

    // assorted variations on DMS including whitespace, different d/m/s symbols (ordinal, ascii/typo quotes)
    var variations = [
        '45.76260',
        '45.76260 ',
        '45.76260°',
        '45°45.756′',
        '45° 45.756′',
        '45 45.756',
        '45°45′45.36″',
        '45º45\'45.36"',
        '45°45’45.36”',
        '45 45 45.36 ',
        '45° 45′ 45.36″',
        '45º 45\' 45.36"',
        '45° 45’ 45.36”'
    ];
    for (var v in variations) assert.equal(Geo.parseDMS(variations[v]),      45.76260, 'parse dms variations '+variations[v]);
    for (var v in variations) assert.equal(Geo.parseDMS('-'+variations[v]), -45.76260, 'parse dms variations '+'-'+variations[v]);
    for (var v in variations) assert.equal(Geo.parseDMS(variations[v]+'N'),  45.76260, 'parse dms variations '+variations[v]+'N');
    for (var v in variations) assert.equal(Geo.parseDMS(variations[v]+'S'), -45.76260, 'parse dms variations '+variations[v]+'S');
    for (var v in variations) assert.equal(Geo.parseDMS(variations[v]+'E'),  45.76260, 'parse dms variations '+variations[v]+'E');
    for (var v in variations) assert.equal(Geo.parseDMS(variations[v]+'W'), -45.76260, 'parse dms variations '+variations[v]+'W');
    assert.equal(Geo.parseDMS(' 45°45′45.36″ '), 45.76260, 'parse dms variations '+' ws before+after ');
    // output formats
    assert.equal(Geo.toDMS(45.76260),           '045°45′45″',    'output dms ');
    assert.equal(Geo.toDMS(45.76260, 'd'),      '045.7626°',     'output dms '+'d');
    assert.equal(Geo.toDMS(45.76260, 'dm'),     '045°45.76′',    'output dms '+'dm');
    assert.equal(Geo.toDMS(45.76260, 'dms'),    '045°45′45″',    'output dms '+'dms');
    assert.equal(Geo.toDMS(45.76260, 'd', 6),   '045.762600°',   'output dms '+'dm,6');
    assert.equal(Geo.toDMS(45.76260, 'dm', 4),  '045°45.7560′',  'output dms '+'dm,4');
    assert.equal(Geo.toDMS(45.76260, 'dms', 2), '045°45′45.36″', 'output dms '+'dms,2');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Utm                                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('utm', function(assert) {
    var LatLonE = require('./latlon-ellipsoid.js');
    var Utm = require('./utm.js');
    var Mgrs = require('./mgrs.js');

    // http://www.rcn.montana.edu/resources/converter.aspx

    // latitude/longitude -> UTM
    assert.equal(LatLonE( 0,  0).toUtm().toString(6), '31 N 166021.443081 0.000000', 'LL->UTM 0,0');
    assert.equal(LatLonE( 1,  1).toUtm().toString(6), '31 N 277438.263521 110597.972524', 'LL->UTM 1,1');
    assert.equal(LatLonE(-1, -1).toUtm().toString(6), '30 S 722561.736479 9889402.027476', 'LL->UTM -1,-1');
    assert.equal(LatLonE( 48.8583,   2.2945).toUtm().toString(3), '31 N 448251.898 5411943.794', 'LL->UTM eiffel tower');
    assert.equal(LatLonE(-33.857 , 151.215 ).toUtm().toString(3), '56 S 334873.199 6252266.092', 'LL->UTM sidney o/h');
    assert.equal(LatLonE( 38.8977, -77.0365).toUtm().toString(3), '18 N 323394.296 4307395.634', 'LL->UTM white house');
    assert.equal(LatLonE(-22.9519, -43.2106).toUtm().toString(3), '23 S 683466.254 7460687.433', 'LL->UTM rio christ');
    assert.equal(LatLonE( 60.39135,  5.3249).toUtm().toString(3), '32 N 297508.410 6700645.296', 'LL->UTM bergen');
    assert.equal(LatLonE( 60.39135,  5.3249).toUtm().convergence, -3.196281440, 'LL->UTM bergen convergence');
    assert.equal(LatLonE( 60.39135,  5.3249).toUtm().scale,     1.000102473211, 'LL->UTM bergen scale');

    // UTM -> latitude/longitude
    assert.equal(Utm.parse('31 N 166021.443081 0.000000').toLatLon().toString(), LatLonE(0, 0).toString(), 'UTM->LL 0,0');
    assert.equal(Utm.parse('31 N 277438.263521 110597.972524').toLatLon().toString(), LatLonE( 1,  1).toString(), 'UTM->LL 1,1');
    assert.equal(Utm.parse('30 S 722561.736479 9889402.027476').toLatLon().toString(), LatLonE(-1, -1).toString(), 'UTM->LL -1,-1');
    assert.equal(Utm.parse('31 N 448251.898 5411943.794').toLatLon().toString(), LatLonE( 48.8583,   2.2945).toString(), 'UTM->LL eiffel tower');
    assert.equal(Utm.parse('56 S 334873.199 6252266.092').toLatLon().toString(), LatLonE(-33.857 , 151.215 ).toString(), 'UTM->LL sidney o/h');
    assert.equal(Utm.parse('18 N 323394.296 4307395.634').toLatLon().toString(), LatLonE( 38.8977, -77.0365).toString(), 'UTM->LL white house');
    assert.equal(Utm.parse('23 S 683466.254 7460687.433').toLatLon().toString(), LatLonE(-22.9519, -43.2106).toString(), 'UTM->LL rio christ');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLon().toString(), LatLonE( 60.39135,  5.3249).toString(), 'UTM->LL bergen');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLon().convergence, -3.196281443, 'UTM->LL bergen convergence');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLon().scale,     1.000102473212, 'UTM->LL bergen scale');

    // UTM -> MGRS
    assert.equal(Utm.parse('31 N 166021.443081 0.000000').toMgrs().toString(), '31N AA 66021 00000', 'UTM->MGRS 0,0');
    assert.equal(Utm.parse('31 N 277438.263521 110597.972524').toMgrs().toString(), '31N BB 77438 10597', 'UTM->MGRS 1,1');
    assert.equal(Utm.parse('30 S 722561.736479 9889402.027476').toMgrs().toString(), '30M YD 22561 89402', 'UTM->MGRS -1,-1');
    assert.equal(Utm.parse('31 N 448251.898 5411943.794').toMgrs().toString(), '31U DQ 48251 11943', 'UTM->MGRS eiffel tower');
    assert.equal(Utm.parse('56 S 334873.199 6252266.092').toMgrs().toString(), '56H LH 34873 52266', 'UTM->MGRS sidney o/h');
    assert.equal(Utm.parse('18 N 323394.296 4307395.634').toMgrs().toString(), '18S UJ 23394 07395', 'UTM->MGRS white house');
    assert.equal(Utm.parse('23 S 683466.254 7460687.433').toMgrs().toString(), '23K PQ 83466 60687', 'UTM->MGRS rio christ');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toMgrs().toString(), '32V KN 97508 00645', 'UTM->MGRS bergen');

    // MGRS -> UTM
    assert.equal(Mgrs.parse('31N AA 66021 00000').toUtm().toString(), '31 N 166021 0', 'MGRS->UTM 0,0');
    assert.equal(Mgrs.parse('31N BB 77438 10597').toUtm().toString(), '31 N 277438 110597', 'MGRS->UTM 1,1');
    assert.equal(Mgrs.parse('30M YD 22561 89402').toUtm().toString(), '30 S 722561 9889402', 'MGRS->UTM -1,-1');
    assert.equal(Mgrs.parse('31U DQ 48251 11943').toUtm().toString(), '31 N 448251 5411943', 'MGRS->UTM eiffel tower');
    assert.equal(Mgrs.parse('56H LH 34873 52266').toUtm().toString(), '56 S 334873 6252266', 'MGRS->UTM sidney o/h');
    assert.equal(Mgrs.parse('18S UJ 23394 07395').toUtm().toString(), '18 N 323394 4307395', 'MGRS->UTM white house');
    assert.equal(Mgrs.parse('23K PQ 83466 60687').toUtm().toString(), '23 S 683466 7460687', 'MGRS->UTM rio christ');
    assert.equal(Mgrs.parse('32V KN 97508 00645').toUtm().toString(), '32 N 297508 6700645', 'MGRS->UTM bergen');

    /* http://www.ibm.com/developerworks/library/j-coordconvert/
     ( 0.0000    0.0000  )     "31 N 166021 0"
     ( 0.1300   -0.2324  )     "30 N 808084 14385"
     (-45.6456   23.3545 )     "34 G 683473 4942631"
     (-12.7650  -33.8765 )     "25 L 404859 8588690"
     (-80.5434  -170.6540)     "02 C 506346 1057742"
     ( 90.0000   177.0000)     "60 Z 500000 9997964"
     (-90.0000  -177.0000)     "01 A 500000 2035"
     ( 90.0000    3.0000 )     "31 Z 500000 9997964"
     ( 23.4578  -135.4545)     "08 Q 453580 2594272"
     ( 77.3450   156.9876)     "57 X 450793 8586116"
     (-89.3454  -48.9306 )     "22 A 502639 75072"
     */

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
