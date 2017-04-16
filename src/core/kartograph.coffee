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
Snap = require '../vendor/snap'
series = require 'async/series'

{warn, type} = require '../utils'
View = require './view'
Proj = require './proj'
MapLayer = require './maplayer'
BBox = require './bbox'
{LonLat} = require './lonlat'
parsecss = require './parsecss'
MapLoader = require './maploader'

class Kartograph
    constructor: (container, width, height) ->
        @container = $(container)
        @size =
            h: height or @container.height() or 'auto'
            w: width or @container.width()
        @markers = []
        @loader = null

        @container.addClass 'kartograph'

    load: (resolver, callback, opts = {}) ->
        @clear()
        if @paper?
            $(@paper.node).remove()
            @paper = undefined

        @loader = new MapLoader resolver
        pan = opts.pan or [0, 0]
        zoom = opts.zoom or 1
        @urlsByZoomLevel = {}
        @currentUrls = []
        @currentZoomLevel = null
        @paperByZoomLevel = {}
        @layersByZoomLevel = {}

        @reload pan, zoom, opts, callback

    reload: (pan, zoom, opts, callback) ->
        @loader.load pan, zoom, (err, url, zoomLevel, svg) =>
            if err
                warn err
                return

            if @currentZoomLevel isnt zoomLevel
                @clear()
                @currentZoomLevel = zoomLevel
                @currentUrls = []

            if url not in @currentUrls
                @currentUrls.push url
                @fragmentLoaded(svg, opts, callback)

    fragmentLoaded: (svg, opts, callback) ->
        @svgSrc = svg
        $view = $('view', svg) # use first view

        if not @viewport?
            w = @size.w
            h = @size.h
            if h == 'auto'
                ratio = $view.attr('w') / $view.attr('h')
                h = w / ratio
            @viewport = new BBox 0, 0, w, h

        unless @paper
            @paper = @createSVGLayer(null, opts)

            @refresh = =>
                panzoom = @paper.panzoom()
                @reload panzoom.getCurrentPosition(), panzoom.getCurrentZoom(), opts, callback

            @paper.panzoom?().on 'afterApplyZoom', @refresh
            @paper.panzoom?().on 'afterApplyPan', @refresh


        vp = @viewport
        @viewAB = AB = View.fromXML $view[0]
        padding = opts.padding ? 0
        halign = opts.halign ? 'center'
        valign = opts.valign ? 'center'
        @viewBC = new View AB.asBBox(),vp.width,vp.height, padding, halign, valign

        @proj = kartograph.Proj.fromXML $('proj', $view)[0]

        callback? this

    addLayer: (id, opts = {}, done) ->
        ###
        add new layer
        ###
        @layerIds ?= []
        @layers ?= {}

        src_id = id
        if type(opts) is 'object'
            layer_id = opts.name
            path_id = opts.key
            titles = opts.title
        else
            opts = {}

        layer_id ?= src_id
        svgLayer = $('#'+src_id, @svgSrc)

        if svgLayer.length == 0
            warn "didn't find any paths for layer \"#{src_id}\""
            return done?()

        $paths = $('*', svgLayer[0])

        return done?() unless $paths.length

        layer = if layer_id of @layers
            @layers[layer_id]
        else
            @layerIds.push layer_id
            @layers[layer_id] = new MapLayer(layer_id, path_id, this, opts.filter, @paper)

        layer.addFragment $paths
        layer.bindEvents opts

        series [
            (next) ->
                if opts.styles
                    layer.style opts.styles, null, null, next
                else
                    next()

            (next) ->
                if opts.tooltips
                    layer.tooltips opts.tooltips, null, next
                else
                    next()
        ], done

    createSVGLayer: (id, opts = {}) ->
        @_layerCnt ?= 0
        lid = @_layerCnt++

        paper = Snap @viewport.width, @viewport.height
        $(paper.node).appendTo @container
        panZoom = paper.panzoom @panZoomOptions(opts)
        panZoom.enable()

        svg = $ paper.node
        svg.css
            position: 'absolute'
            top: '0px'
            left: '0px'
            'z-index': lid+5

        if @container.css('position') == 'static'
            @container.css
                position: 'relative'
                height: @viewport.height+'px'

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

    addMarker: (marker) ->
        @markers.push(marker)
        xy = @viewBC.project @viewAB.project @proj.project marker.lonlat.lon, marker.lonlat.lat
        marker.render(xy[0],xy[1],@container, @paper)

    clearMarkers: () ->
        for marker in @markers
            marker.clear()
        @markers = []

    zoom: (steps) ->
        return unless @paper and @paper.panzoom?
        @paper.panzoom().zoomIn(steps)

    # fadeIn: (opts = {}) ->
    #     layer_id = opts.layer ? @layerIds[@layerIds.length-1]
    #     duration = opts.duration ? 500

    #     for id, paths of @layers[layer_id].pathsById
    #         for path in paths
    #             if type(duration) == "function"
    #                 dur = duration(path.data)
    #             else
    #                 dur = duration
    #             path.svgPath.attr 'opacity',0
    #             path.svgPath.animate {opacity:1}, dur


    ##
    # end of public API
    ##

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
        @forEachLayer (layer) =>
            if layer.paper? and layer.paper isnt @paper
                layer.paper.setSize vp.width, vp.height

        padding = @opts.padding ? 0
        halign = @opts.halign ? 'center'
        valign = @opts.valign ? 'center'
        zoom = @opts.zoom
        @viewBC = new View @viewAB.asBBox(),vp.width*zoom,vp.height*zoom, padding,halign,valign

        @forEachLayer (layer) => layer.setView(@viewBC)

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
        if @nextPathTimeout
            clearTimeout @nextPathTimeout
            @nextPathTimeout = null

        @forEachLayer (layer) -> layer.remove()
        @layers = {}
        @layerIds = []

        if @symbolGroups?
            for sg in @symbolGroups
                sg.remove()
            @symbolGroups = []

        @svgSrc = null

    #
    # XXX Not used and not fixed
    #
    # loadCSS: (url, callback) ->
    #     ###
    #     loads a stylesheet
    #     ###
    #     if not Raphael.svg
    #         $.ajax
    #             url: url
    #             dataType: 'text'
    #             success: (resp) =>
    #                 @styles = parsecss resp
    #                 callback()
    #             error: (a,b,c) ->
    #                 warn 'error while loading '+url, a,b,c

    #     else
    #         $('body').append '<link rel="stylesheet" href="'+url+'" />'
    #         callback()

    #
    # XXX Not fixed
    #
    # applyCSS: (el, className) ->
    #     ###
    #     applies pre-loaded css styles to
    #     raphael elements
    #     ###
    #     if not @styles?
    #         return el

    #     @_pathTypes ?= ["path", "circle", "rectangle", "ellipse"]
    #     @_regardStyles ?= ["fill", "stroke", "fill-opacity", "stroke-width", "stroke-opacity"]
    #     for sel of @styles
    #         p = sel
    #         for selectors in p.split ','
    #             p = selectors.split ' ' # ignore hierarchy
    #             p = p[p.length-1]
    #             p = p.split ':' # check pseudo classes
    #             if p.length > 1
    #                 continue
    #             p = p[0].split '.' # check classes
    #             classes = p.slice(1)
    #             if classes.length > 0 and classes.indexOf(className) < 0
    #                 continue
    #             p = p[0]
    #             if @_pathTypes.indexOf(p) >= 0 and p != el.type
    #                 continue
    #             # if we made it until here, the styles can be applied
    #             props = @styles[sel]
    #             for k in @_regardStyles
    #                 if props[k]?
    #                     el.attr k,props[k]
    #     el

    style: (layer, prop, value, duration, delay) ->
        layer = @getLayer(layer)
        if layer?
            layer.style prop, value, duration, delay

    panZoomOptions: (opts) ->
        defaultOpts = {
            minZoom: 0
            maxZoom: 18
            zoomStep: 0.05
            initialZoom: @currentZoomLevel or 0
            initialPosition: { x: 0, y: 0 }
        }

        defaultOpts[k] = opts[k] for k of defaultOpts when k of opts

        defaultOpts

    forEachLayer: (fn) ->
        return unless @layers
        fn(layer) for id, layer of @layers
        undefined

module.exports = Kartograph
