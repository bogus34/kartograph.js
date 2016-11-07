MapFragment = require './mapfragment'

class MapLoader
    constructor: (@resolver) ->
        @_cache = {}

    load: (pan, zoom, callback) ->
        url = @resolver pan, zoom
        @_cache[url] ?= new MapFragment(url)
        @_cache[url].load (err, svg) -> callback(err, url, svg)

module.exports = MapLoader
