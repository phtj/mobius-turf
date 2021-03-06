/**
 * Turf INTERPOLATION functions.
 * http://turfjs.org/docs/
 */

/**
 *
 */

import * as turf from "@turf/turf";

/**
 * Takes a set of points and estimates their 'property' values on a grid using the [Inverse Distance Weighting (IDW) method](https://en.wikipedia.org/wiki/Inverse_distance_weighting).
 *
 * @param {FeatureCollection<Point>} points with known value
 * @param {number} cellSize the distance across each grid point
 * @param {Object} options Optional parameters
 * (gridType: defines the output format based on a Grid Type (options: 'square' | 'point' | 'hex' | 'triangle'),
 * zProperty: the property name in `points` from which z-values will be pulled, zValue fallbacks to 3rd coordinate if no property exists,
 * units: used in calculating cellSize, can be degrees, radians, miles, or kilometers,
 * weight: exponent regulating the distance-decay weighting)
 * @param {FeatureCollection<Polygon>} gridType defines the output format based on a Grid Type (options: 'square' | 'point' | 'hex' | 'triangle')
 * @param {string} property the property name in `points` from which z-values will be pulled, zValue fallbacks to 3rd coordinate if no property exists
 * @param {number} weight exponent regulating the distance-decay weighting
 * @returns {FeatureCollection<Point|Polygon>} grid of points or polygons with interpolated 'property'
 * @example
 * var points = geo.random.point(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point
 * for each points in points {
 *     point.properties.solRad = Math.random() * 50;
 * });
 * var options = {gridType: 'points', property: 'solRad', units: 'miles'};
 * var grid = geo.ipolate.interpolate(points, 100, options);
 */
export function interpolate(points: turf.FeatureCollection<turf.Point>,cellSize: number, gridType: turf.Grid, property: string, weight: number): turf.FeatureCollection<turf.Point|turf.Polygon> {
    return turf.interpolate(points,cellSize/1000,{gridType:gridType, property:property, weight:weight});
}

/**
 * Takes a grid FeatureCollection of Point features with z-values and an array of
 * value breaks and generates filled contour isobands.
 *
 * @param {FeatureCollection<Point>} pointGrid input points
 * @param {Array<number>} breaks where to draw contours
 * @param {Object} options options on output
 * (zProperty: the property name in `points` from which z-values will be pulled,
 * commonProperties: GeoJSON properties passed to ALL isobands,
 * breaksProperties: GeoJSON properties passed, in order, to the correspondent isoband (order defined by breaks))
 * @returns {FeatureCollection<MultiPolygon>} a FeatureCollection of MultiPolygon features representing isobands.
 */
export function isobands(pointGrid: turf.FeatureCollection<turf.Point>,breaks: number[],options: {zProperty: string, commonProperties: object, breaksProperties: object[]}): turf.FeatureCollection<turf.MultiPolygon> {
    return turf.isobands(pointGrid,breaks,options);
}

/**
 * Takes a grid FeatureCollection of Point features with z-values and an array of
 * value breaks and generates [isolines](http://en.wikipedia.org/wiki/Isoline).
 *
 * @param {FeatureCollection<Point>} pointGrid input points
 * @param {Array<number>} breaks values of `zProperty` where to draw isolines
 * @param {Object} options options on output
 * (zProperty: the property name in `points` from which z-values will be pulled,
 * commonProperties: GeoJSON properties passed to ALL isobands,
 * breaksProperties: GeoJSON properties passed, in order, to the correspondent isoband (order defined by breaks))
 * @returns {FeatureCollection<MultiLineString>} a FeatureCollection of MultiLineString features representing isolines.
 * @example
 * // create a grid of points with random z-values in their properties
 * var extent = [0, 30, 20, 50];
 * var cellWidth = 100;
 * var pointGrid = geo.grid.pointGrid(extent, cellWidth, {units: 'miles'});
 *
 * for (var i = 0; i < pointGrid.features.length; i++) {
 *     pointGrid.features[i].properties.temperature = Math.random() * 10;
 * }
 * var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 *
 * var lines = geo.ipolate.isolines(pointGrid, breaks, {zProperty: 'temperature'});
 */
export function isolines(pointGrid: turf.FeatureCollection<turf.Point>,breaks: number[],options: {zProperty: string, commonProperties: object, breaksProperties: object[]}): turf.FeatureCollection<turf.MultiLineString> {
    return turf.isolines(pointGrid,breaks,options);
}

/**
 * Takes a triangular plane as a Polygon
 * and a Point within that triangle and returns the z-value
 * at that point. The Polygon should have properties `a`, `b`, and `c`
 * that define the values at its three corners. Alternatively, the z-values
 * of each triangle point can be provided by their respective 3rd coordinate
 * if their values are not provided as properties.
 *
 * @param {Coord} point the Point for which a z-value will be calculated
 * @param {Feature<Polygon>} triangle a Polygon feature with three vertices
 * @returns {number} the z-value for `interpolatedPoint`
 * @example
 * var point = geo.create.point([-75.3221, 39.529]);
 * // "a", "b", and "c" values represent the values of the coordinates in order.
 * var triangle = geo.create.polygon([[
 *   [-75.1221, 39.57],
 *   [-75.58, 39.18],
 *   [-75.97, 39.86],
 *   [-75.1221, 39.57]
 * ]], {
 *   "a": 11,
 *   "b": 122,
 *   "c": 44
 * });
 *
 * var zValue = geo.ipolate.planepoint(point, triangle);
 * point.properties.zValue = zValue;
 */
export function planepoint(point: turf.Point,triangle: turf.Feature<turf.Polygon>): number {
    return turf.planepoint(point,triangle);
}

/**
 * Takes a set of points and creates a
 * [Triangulated Irregular Network](http://en.wikipedia.org/wiki/Triangulated_irregular_network),
 * or a TIN for short, returned as a collection of Polygons. These are often used
 * for developing elevation contour maps or stepped heat visualizations.
 *
 * If an optional z-value property is provided then it is added as properties called `a`, `b`,
 * and `c` representing its value at each of the points that represent the corners of the
 * triangle.
 *
 * @param {FeatureCollection<Point>} points input points
 * @param {String} [z] name of the property from which to pull z values
 * This is optional: if not given, then there will be no extra data added to the derived triangles.
 * @returns {FeatureCollection<Polygon>} TIN output
 * @example
 * // generate some random point data
 * var points = geo.random.point(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point between 0 and 9
 * for (var i = 0; i < points.features.length; i++) {
 *   points.features[i].properties.z = ~~(Math.random() * 9);
 * }
 * var tin = geo.ipolate.tin(points, 'z');
 */
export function tin(points: turf.FeatureCollection<turf.Point>,name: string): turf.FeatureCollection<turf.Polygon> {
    return turf.tin(points,name);
}
