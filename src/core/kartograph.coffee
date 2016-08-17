###
    kartograph - a svg mapping library
    Copyright (C) 2011,2012  Gregor Aisch

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library. If not, see <http://www.gnu.org/licenses/>.
###

$ = require 'jquery'
Raphael = require '../vendor/raphael'

{warn, type} = require '../utils'
View = require './view'
Proj = require './proj'
MapLayer = require './maplayer'
BBox = require './bbox'
{LonLat} = require './lonlat'
parsecss = require './parsecss'

class Kartograph
    __mapCache = {}

    constructor: (container, width, height) ->
        @container = cnt = $(container)
        width ?= cnt.width()
        height ?= cnt.height()
        if height == 0
            height = 'auto'
        @size =
            h: height
            w: width
        @markers = []
        @pathById = {}
        @container.addClass 'kartograph'

    createSVGLayer: (id) ->
        @_layerCnt ?= 0
        lid = @_layerCnt++
        vp = @viewport
        cnt = @container
        paper = Raphael cnt[0], vp.width, vp.height
        panZoom = paper.panzoom initialZoom: @opts.zoom
        panZoom.enable()
        svg = $ paper.canvas
        svg.css
            position: 'absolute'
            top: '0px'
            left: '0px'
            'z-index': lid+5

        if cnt.css('position') == 'static'
            cnt.css
                position: 'relative'
                height: vp.height+'px'

        svg.addClass id
        paper

    createHTMLLayer: (id) ->
        vp = @viewport
        cnt = @container
        @_layerCnt ?= 0
        lid = @_layerCnt++
        div = $ "<div class='layer #{id}' />"
        div.css
            position: 'absolute'
            top: '0px'
            left: '0px'
            width: vp.width+'px'
            height: vp.height+'px'
            'z-index': lid+5
        cnt.append div
        div

    load: (mapurl, callback, opts) ->
        # load svg map
        def = $.Deferred()
        @clear()
        @opts = opts ? {}
        @opts.zoom ?= 1
        @mapLoadCallback = callback
        @_loadMapDeferred = def
        @_lastMapUrl = mapurl # store last map url for map cache

        if @cacheMaps and __mapCache[mapurl]?
            # use map from cache
            @_mapLoaded __mapCache[mapurl]
        else
            # load map from url
            $.ajax
                url: mapurl
                dataType: "text"
                success: @_mapLoaded
                context: this
                error: (a, b, c) -> warn a, b, c
        return def.promise()

    loadMap: () -> @load.apply @, arguments

    setMap: (svg, opts) ->
        @opts = opts ? {}
        @opts.zoom ?= 1
        @_lastMapUrl = 'string'
        @_mapLoaded svg

    _mapLoaded: (xml) ->
        if @cacheMaps
            # cache map svg (as string)
            __mapCache ?= {}
            __mapCache[@_lastMapUrl] = xml

        try
            xml = $(xml) # if $.browser.msie
        catch err
            warn 'something went horribly wrong while parsing svg'
            @_loadMapDeferred.reject('could not parse svg')
            return

        @svgSrc = xml
        $view = $('view', xml) # use first view

        if not @paper?
            w = @size.w
            h = @size.h
            if h == 'auto'
                ratio = $view.attr('w') / $view.attr('h')
                h = w / ratio
            @viewport = new BBox 0, 0, w, h

        vp = @viewport
        @viewAB = AB = View.fromXML $view[0]
        padding = @opts.padding ? 0
        halign = @opts.halign ? 'center'
        valign = @opts.valign ? 'center'
        @viewBC = new View AB.asBBox(),vp.width,vp.height, padding, halign, valign

        # Using PanZoom instead
        # zoom = @opts.zoom ? 1
        # @viewBC = new View @viewAB.asBBox(), vp.width*zoom, vp.height*zoom, padding,halign,valign

        @proj = kartograph.Proj.fromXML $('proj', $view)[0]
        if @mapLoadCallback?
            @mapLoadCallback this
        if @_loadMapDeferred?
            @_loadMapDeferred.resolve this

    addLayer: (id, opts={}) ->
        ###
        add new layer
        ###
        @layerIds ?= []
        @layers ?= {}

        @paper = @createSVGLayer() if not @paper?

        src_id = id
        if type(opts) == 'object'
            layer_id = opts.name
            path_id = opts.key
            titles = opts.title
        else
            opts = {}

        layer_paper = if opts.add_svg_layer
            @createSVGLayer()
        else
            @paper

        layer_id ?= src_id
        svgLayer = $('#'+src_id, @svgSrc)

        if svgLayer.length == 0
            # warn 'didn\'t find any paths for layer "'+src_id+'"'
            return

        layer = new MapLayer(layer_id, path_id, this, opts.filter, layer_paper)

        $paths = $('*', svgLayer[0])

        rows = $paths.length
        chunkSize = opts.chunks ? rows
        iter = 0

        nextPaths = () ->
            base = (chunkSize) * iter
            for i in [0...chunkSize]
                if base + i < rows
                    layer.addPath $paths.get(base+i), titles
            if opts.styles?
                for prop, val of opts.styles
                    layer.style prop, val
            iter++
            if iter * chunkSize < rows
                setTimeout nextPaths, 0
            else
                moveOn()

        moveOn = () =>
            if layer.paths.length > 0
                @layers[layer_id] = layer
                @layerIds.push layer_id

            # add event handlers
            checkEvents = ['click', 'mouseenter', 'mouseleave', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout']
            for evt in checkEvents
                layer.on evt, opts[evt] if type(opts[evt]) is 'function'

            for evt of opts.on
                layer.on evt, opts.on[evt] if type(opts.on[evt]) is 'function'

            if opts.tooltips?
                layer.tooltips opts.tooltips
            if opts.done?
                opts.done()

        if opts.chunks?
            setTimeout nextPaths, 0
        else
            nextPaths()
        this

    getLayer: (layer_id) ->
        ### returns a map layer ###
        if not @layers[layer_id]?
            warn 'could not find layer ' + layer_id
            return null
        @layers[layer_id]

    getLayerPath: (layer_id, path_id) ->
        layer = @getLayer layer_id
        if layer?
            if type(path_id) == 'object'
                return layer.getPaths(path_id)[0]
            else
                return layer.getPath path_id

    onLayerEvent: (event, callback, layerId) ->
        # DEPRECATED!
        @getLayer(layerId).on event, callback
        this

    addMarker: (marker) ->
        @markers.push(marker)
        xy = @viewBC.project @viewAB.project @proj.project marker.lonlat.lon, marker.lonlat.lat
        marker.render(xy[0],xy[1],@container, @paper)

    clearMarkers: () ->
        for marker in @markers
            marker.clear()
        @markers = []

    fadeIn: (opts = {}) ->
        layer_id = opts.layer ? @layerIds[@layerIds.length-1]
        duration = opts.duration ? 500

        for id, paths of @layers[layer_id].pathsById
            for path in paths
                if type(duration) == "function"
                    dur = duration(path.data)
                else
                    dur = duration
                path.svgPath.attr 'opacity',0
                path.svgPath.animate {opacity:1}, dur

    ###
        end of public API
    ###

    loadCoastline: ->
        $.ajax
            url: 'coastline.json'
            success: @renderCoastline
            context: this

    resize: (w, h) ->
        ###
        forces redraw of every layer
        ###
        cnt = @container
        w ?= cnt.width()
        h ?= cnt.height()
        @viewport = vp = new BBox 0,0,w,h
        @paper.setSize vp.width, vp.height if @paper?
        # update size for other svg layers as well
        for id, layer of @layers
            if layer.paper? and layer.paper isnt @paper
                layer.paper.setSize vp.width, vp.height
        padding = @opts.padding ? 0
        halign = @opts.halign ? 'center'
        valign = @opts.valign ? 'center'
        zoom = @opts.zoom
        @viewBC = new View @viewAB.asBBox(),vp.width*zoom,vp.height*zoom, padding,halign,valign
        for id,layer of @layers
            layer.setView(@viewBC)

        if @symbolGroups?
            for sg in @symbolGroups
                sg.onResize()

    lonlat2xy: (lonlat) ->
        lonlat = new LonLat(lonlat[0], lonlat[1]) if lonlat.length == 2
        lonlat = new LonLat(lonlat[0], lonlat[1], lonlat[2]) if lonlat.length == 3
        a = @proj.project(lonlat.lon, lonlat.lat, lonlat.alt)
        @viewBC.project(@viewAB.project(a))

    addSymbolGroup: (symbolgroup) ->
        @symbolGroups ?= []
        @symbolGroups.push(symbolgroup)

    removeSymbols: (index) ->
        if index?
            @symbolGroups[index].remove()
        else
            for sg in @symbolGroups
                sg.remove()

    clear: ->
        if @layers?
            for id of @layers
                @layers[id].remove()
            @layers = {}
            @layerIds = []

        if @symbolGroups?
            for sg in @symbolGroups
                sg.remove()
            @symbolGroups = []

        if @paper?
            $(@paper.canvas).remove()
            @paper = undefined

    loadCSS: (url, callback) ->
        ###
        loads a stylesheet
        ###
        if not Raphael.svg
            $.ajax
                url: url
                dataType: 'text'
                success: (resp) =>
                    @styles = parsecss resp
                    callback()
                error: (a,b,c) ->
                    warn 'error while loading '+url, a,b,c

        else
            $('body').append '<link rel="stylesheet" href="'+url+'" />'
            callback()

    applyCSS: (el, className) ->
        ###
        applies pre-loaded css styles to
        raphael elements
        ###
        if not @styles?
            return el

        @_pathTypes ?= ["path", "circle", "rectangle", "ellipse"]
        @_regardStyles ?= ["fill", "stroke", "fill-opacity", "stroke-width", "stroke-opacity"]
        for sel of @styles
            p = sel
            for selectors in p.split ','
                p = selectors.split ' ' # ignore hierarchy
                p = p[p.length-1]
                p = p.split ':' # check pseudo classes
                if p.length > 1
                    continue
                p = p[0].split '.' # check classes
                classes = p.slice(1)
                if classes.length > 0 and classes.indexOf(className) < 0
                    continue
                p = p[0]
                if @_pathTypes.indexOf(p) >= 0 and p != el.type
                    continue
                # if we made it until here, the styles can be applied
                props = @styles[sel]
                for k in @_regardStyles
                    if props[k]?
                        el.attr k,props[k]
        el

    style: (layer, prop, value, duration, delay) ->
        layer = @getLayer(layer)
        if layer?
            layer.style prop, value, duration, delay

module.exports = Kartograph
