MapFragment = require './mapfragment'

class MapLoader
    constructor: (@resolver) ->
        @_cache = {}

    load: (pan, zoom, callback) ->
        [url, zoomLevel] = @resolver pan, zoom
        @_cache[url] ?= new MapFragment(url)
        @_cache[url].load (err, svg) -> callback(err, url, zoomLevel, svg)

module.exports = MapLoader
