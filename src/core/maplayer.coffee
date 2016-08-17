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
{type} = require '../utils'
MapLayerPath = require './maplayerpath'

PANZOOM_EVENTS = [
    'beforeApplyZoom', 'afterApplyZoom',
    'beforeApplyPan', 'afterApplyPan'
]

class EventContext
    constructor: (@type, @cb, @layer) ->
    handle: (e) =>
        path = @layer.map.pathById[e.target.getAttribute('id')]
        @cb path.data, path.svgPath, e

class MapLayer
    constructor: (layer_id, path_id, map, filter, paper)->
        @id = layer_id
        @path_id = path_id
        @paper = paper ? map.paper
        @view = map.viewBC
        @map = map
        @filter = filter

    addPath: (svg_path, titles) ->
        @paths ?= []
        layerPath = new MapLayerPath(svg_path, @id, this, titles)
        if type(@filter) == 'function'
            if @filter(layerPath.data) == false
                layerPath.remove()
                return

        @paths.push(layerPath)

        if @path_id?
            @pathsById ?= {}
            @pathsById[layerPath.data[@path_id]] ?= []
            @pathsById[layerPath.data[@path_id]].push(layerPath)

    hasPath: (id) -> @pathsById? and @pathsById[id]?
    getPathsData: () -> path.data for path in @paths
    getPath: (id) -> @pathsById[id][0] if @hasPath id

    getPaths: (query) ->
        return [] unless type(query) == 'object'
        matches = []
        for path in @paths
            match = true
            for key of query
                match = match && path.data[key] == query[key]
                break unless match
            matches.push path if match
        matches

    setView: (view) ->
        ###
        # after resizing of the map, each layer gets a new view
        ###
        for path in @paths
            path.setView(view)
        this

    remove: ->
        ###
        removes every path
        ###
        path.remove() for path in @paths
        undefined

    style: (props, value, duration, delay) ->
        if type(props) == "string"
            key = props
            props = {}
            props[key] = value
        else if type(props) == "object"
            delay = duration
            duration = value

        duration ?= 0
        $.each @paths, (i, path) ->
            attrs = {}
            for prop, val of props
                attrs[prop] = resolve(val, path.data)
            dur = resolve(duration, path.data)
            dly = resolve(delay, path.data)
            dly ?= 0

            if dur > 0
                anim = Raphael.animation(attrs, dur * 1000)
                path.svgPath.animate(anim.delay(dly * 1000))
            else
                if delay is 0
                    setTimeout () ->
                        path.svgPath.attr(attrs)
                    , 0
                else
                    path.svgPath.attr(attrs)
        this

    on: (event, callback) ->
        if event in PANZOOM_EVENTS
            @panzoom()?.on event, callback
        else
            ctx = new EventContext(event, callback, this)
            $(path.svgPath.node).bind event, ctx.handle for path in @paths
            this

    panzoom: -> @paper.panzoom()

    tooltips: (content, delay) ->
        setTooltip = (path, tt) ->
            cfg =
                position:
                    target: 'mouse',
                    viewport: $(window),
                    adjust: { x:7, y:7}
                show:
                    delay: delay ? 20
                events:
                    show: (evt, api) ->
                        # make sure that two tooltips are never shown
                        # together at the same time
                        $('.qtip')
                        .filter -> api.elements.tooltip.get(0) isnt this
                        .hide()
                content: {}
            if tt?
                if typeof(tt) == "string"
                    cfg.content.text = tt
                else if $.isArray tt
                    cfg.content.title = tt[0]
                    cfg.content.text = tt[1]
            else
                cfg.content.text = 'n/a'
            $(path.svgPath.node).qtip(cfg)

        for path in @paths
            tt = resolve content, path.data
            setTooltip path, tt
        this

    sort: (sortBy) ->
        @paths.sort (a,b) ->
            av = sortBy(a.data)
            bv = sortBy(b.data)
            switch
                when av is bv then 0
                when av > bv then 1
                else -1
        lp = false
        for path in @paths
            if lp
                path.svgPath.insertAfter lp.svgPath
            lp = path
        this

resolve = (prop, data) ->
    if type(prop) == 'function'
        return prop data
    return prop

module.exports = MapLayer
