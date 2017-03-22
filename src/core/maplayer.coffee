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
{type, asyncEach} = require '../utils'

PANZOOM_EVENTS = [
    'beforeApplyZoom', 'afterApplyZoom',
    'beforeApplyPan', 'afterApplyPan'
]

class EventContext
    constructor: (@type, @cb, @layer) ->
    handle: (e) =>
        return if @type is 'click' and @layer.panzoom().isDragging()
        path = $(e.target)
        @cb path.data(), path, e

class MapLayer
    constructor: (layer_id, path_id, map, filter, paper)->
        @id = layer_id
        @path_id = path_id
        @paper = paper ? map.paper
        @view = map.viewBC
        @map = map
        @filter = filter
        @paths = []
        @g = null


    addFragment: (svg_paths) ->
        svg_paths = svg_paths.map (i, p) ->
            $(p).clone()
                .attr(fill: 'none', stroke: '#000')
                .get(0)
        fragment = Snap.fragment(svg_paths...)
        @g ?= @paper.g()
        @g.append fragment
        @paths.push svg_paths...
        undefined

    getPathsData: -> $.map @paths, (p) -> $(p).data()

    # setView: (view) ->
    #     ###
    #     # after resizing of the map, each layer gets a new view
    #     ###
    #     for path in @paths
    #         path.setView(view)
    #     this

    # XXX not fixed
    setView: ->

    remove: ->
        ###
        removes every path
        ###
        @cancelStyle?()
        @cancelTooltips?()
        return unless @paths
        @g.remove()
        @paths = []
        undefined

    style: (props, value, duration, delay, done) ->
        if type(props) == "string"
            key = props
            props = {}
            props[key] = value
        else if type(props) == "object"
            done = delay
            delay = duration
            duration = value

        duration ?= 0

        fn = (path) ->
            attrs = {}
            data = $(path).data()
            for prop, val of props
                attrs[prop] = resolve(val, data)
            dur = resolve(duration, data)
            dly = resolve(delay, data)
            dly ?= 0

            if dur > 0
                anim = Snap.animation(attrs, dur * 1000)
                $(path).animate(anim.delay(dly * 1000))
            else
                if delay is 0
                    setTimeout () ->
                        $(path).attr(attrs)
                    , 0
                else
                    $(path).attr(attrs)

        @cancelStyle = asyncEach @paths, 500, fn, done

    bindEvents: (opts) ->
        events = [
            'click', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mouseover', 'mouseout'
        ].concat PANZOOM_EVENTS

        for e in events when typeof opts[e] is 'function'
            @on e, opts[e]

    on: (event, callback) ->
        if event in PANZOOM_EVENTS
            @panzoom()?.on event, callback
        else
            ctx = new EventContext(event, callback, this)
            $(path).on event, ctx.handle for path in @paths
            this

    panzoom: -> @paper.panzoom()

    tooltips: (content, delay, done) ->
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
            $(path).qtip(cfg)

        fn = (path) ->
            data = $(path).data()
            tt = resolve content, data
            setTooltip path, tt

        @cancelTooltips = asyncEach @paths, fn, done

        this

    sort: (sortBy) ->
        @paths.sort (a,b) ->
            av = sortBy(a.data())
            bv = sortBy(b.data())
            switch
                when av is bv then 0
                when av > bv then 1
                else -1
        lp = false
        for path in @paths
            if lp
                $(path).insertAfter lp
            lp = path
        this

resolve = (prop, data) ->
    if type(prop) == 'function'
        return prop data
    return prop

module.exports = MapLayer
