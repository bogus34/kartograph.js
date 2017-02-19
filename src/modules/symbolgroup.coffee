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
Kartograph = require '../core/kartograph'
{LonLat} = require '../core/lonlat'
{warn, type} = require '../utils'

class SymbolGroup
    ### symbol groups

    Usage:
    new $K.SymbolGroup(options);
    map.addSymbols(options)
    ###

    constructor: (opts) ->
        required = ['data', 'location', 'type', 'map']
        optional = [
            'filter', 'tooltip', 'click', 'delay', 'sortBy', 'clustering',
            'aggregate', 'clusteringOpts', 'mouseenter', 'mouseleave'
        ]

        for p in required
            if opts[p]?
                this[p] = opts[p]
            else
                throw new Error("SymbolGroup: missing argument '#{p}'")

        this[p] = opts[p] for p in optional when opts[p]?

        SymbolType = @type

        if not SymbolType?
            warn 'could not resolve symbol type', @type
            return

        # init symbol properties
        for p in SymbolType.props
            if opts[p]?
                this[p] = opts[p]

        # init layer
        @layers =
            mapcanvas: @map.paper

        for l in SymbolType.layers
            nid = SymbolGroup._layerid++
            id = 'sl_'+nid
            if l.type == 'svg'
                layer = @map.createSVGLayer id
            else if l.type == 'html'
                layer = @map.createHTMLLayer id
            @layers[l.id] = layer

        # add symbols
        @symbols = []
        for i of @data
            d = @data[i]
            if type(@filter) == "function"
                @add d, i if @filter d, i
            else
                @add d, i

        @layout()
        @render()
        @map.addSymbolGroup(this)


    ### adds a new symbol to this group ###
    add: (data, key) ->
        SymbolType = @type
        ll = @_evaluate @location, data, key
        ll = new LonLat ll[0],ll[1] if type(ll) == 'array'

        sprops =
            layers: @layers
            location: ll
            data: data
            key: key ? @symbols.length
            map: @map

        for p in SymbolType.props when this[p]?
            sprops[p] = @_evaluate this[p], data, key

        symbol = new SymbolType sprops
        @symbols.push symbol
        symbol

    layout: ->
        for s in @symbols
            ll = s.location
            if type(ll) == 'string'  # use layer path centroid as coordinates
                [layer_id, path_id] = ll.split('.')
                # XXX нет никакого getLayerPath
                path = @map.getLayerPath(layer_id, path_id)
                if path?
                    # XXX и я не использую пути
                    xy = @map.viewBC.project path.path.centroid()
                else
                    warn 'could not find layer path '+layer_id+'.'+path_id
                    continue
            else
                xy = @map.lonlat2xy ll
            s.x = xy[0]
            s.y = xy[1]

        this

    render: () ->
        # sort
        if @sortBy
            sortDir = 'asc'
            if type(@sortBy) == "string"
                @sortBy = @sortBy.split ' ', 2
                sortBy = @sortBy[0]
                sortDir = @sortBy[1] ? 'asc'

            @symbols = @symbols.sort (a,b) =>
                if type(@sortBy) == "function"
                    va = @sortBy a.data, a
                    vb = @sortBy b.data, b
                else
                    va = a[sortBy]
                    vb = b[sortBy]
                return 0 if va == vb
                m = if sortDir == 'asc' then 1 else -1
                return if va > vb then 1*m else -1*m

        # render
        for s in @symbols
            s.render()
            for node in s.nodes()
                node.symbol = s

        # tooltips
        if type(@tooltip) == "function"
            @_initTooltips()

        # events
        $.each ['click', 'mouseenter', 'mouseleave'], (i, evt) =>
            if type(this[evt]) == "function"
                for s in @symbols
                    for node in s.nodes()
                        $(node)[evt] (e) =>
                            tgt = e.target
                            while not tgt.symbol
                                tgt = $(tgt).parent().get(0)
                            e.stopPropagation()
                            this[evt] tgt.symbol.data, tgt.symbol, e
        this

    tooltips: (cb) ->
        @tooltips = cb
        @_initTooltips()
        this

    remove: (filter) ->
        kept = []
        for s in @symbols
            if filter? and not filter(s.data)
                kept.push s
                continue
            try
                s.clear()
            catch error
                warn 'error: symbolgroup.remove'

        if not filter?
            for id,layer of @layers when id isnt "mapcanvas"
                layer.remove()
        else
            @symbols = kept

    _evaluate: (prop, data, key) ->
        ### evaluates a property function or returns a static value ###
        if type(prop) == 'function'
            val = prop data, key
        else
            val = prop

    _initTooltips: =>
        tooltips = @tooltip
        for s in @symbols
            cfg =
                position:
                    target: 'mouse'
                    viewport: $(window)
                    adjust:
                        x:7
                        y:7
                show:
                    delay: 20
                content: {}
                events:
                    show: (evt, api) ->
                        # make sure that two tooltips are never shown
                        # together at the same time
                        $('.qtip').filter () ->
                            this != api.elements.tooltip.get(0)
                        .hide()

            tt = tooltips s.data, s.key
            if type(tt) == "string"
                cfg.content.text = tt
            else if type(tt) == "array"
                cfg.content.title = tt[0]
                cfg.content.text = tt[1]

            for node in s.nodes()
                $(node).qtip(cfg)
        return


    onResize: ->
        @layout()
        for s in @symbols
            s.update()
        return

    update: (opts, duration, easing) ->
        if not opts?
            opts = {}

        for s in @symbols
            for p in @type.props
                if opts[p]?
                    s[p] = @_evaluate opts[p], s.data
                else if this[p]?
                    s[p] = @_evaluate this[p], s.data

            s.update(duration, easing)
        this


SymbolGroup._layerid = 0

Kartograph::addSymbols = (opts) ->
    opts.map = this
    new SymbolGroup(opts)

module.exports = SymbolGroup
