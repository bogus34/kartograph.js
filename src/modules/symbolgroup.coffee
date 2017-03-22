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
{warn, type, asyncEach} = require '../utils'

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
            if l.type is 'svg'
                layer = @map.createSVGLayer id
            else if l.type is 'html'
                layer = @map.createHTMLLayer id
            @layers[l.id] = layer

        # add symbols
        @symbols = []
        for i of @data
            d = @data[i]
            if type(@filter) is "function"
                @add d, i if @filter d, i
            else
                @add d, i

        @layout()
        @map.addSymbolGroup(this)


    ### adds a new symbol to this group ###
    add: (data, key) ->
        SymbolType = @type
        ll = @_evaluate @location, data, key
        ll = new LonLat ll[0],ll[1] if type(ll) is 'array'

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
            if type(ll) is 'string'  # use layer path centroid as coordinates
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

    render: (done) ->
        # sort
        if @sortBy
            sortDir = 'asc'
            if type(@sortBy) is "string"
                @sortBy = @sortBy.split ' ', 2
                sortBy = @sortBy[0]
                sortDir = @sortBy[1] ? 'asc'

            @symbols = @symbols.sort (a,b) =>
                if type(@sortBy) is "function"
                    va = @sortBy a.data, a
                    vb = @sortBy b.data, b
                else
                    va = a[sortBy]
                    vb = b[sortBy]
                return 0 if va is vb
                m = if sortDir is 'asc' then 1 else -1
                return if va > vb then 1*m else -1*m

        @cancelRender = asyncEach @symbols, 100, (s) =>
            s.render()
            for node in s.nodes()
                node.symbol = s
            @updateSymbol(s)

        , =>
             # tooltips
            if type(@tooltip) is "function"
                @_initTooltips()

            # events
            $.each ['click', 'mouseenter', 'mouseleave'], (i, evt) =>
                if type(this[evt]) is "function"
                    for s in @symbols
                        for node in s.nodes()
                            $(node)[evt] (e) =>
                                tgt = e.target
                                while not tgt.symbol
                                    tgt = $(tgt).parent().get(0)
                                e.stopPropagation()
                                this[evt] tgt.symbol.data, tgt.symbol, e

            done?()

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
            @cancelRender?()
            for id,layer of @layers when id isnt "mapcanvas"
                layer.remove()
        else
            @symbols = kept

    _evaluate: (prop, data, key) ->
        ### evaluates a property function or returns a static value ###
        if type(prop) is 'function'
            val = prop data, key
        else
            val = prop

    _initTooltips: =>
        for s in @symbols
            s.tooltip @tooltip(s.data, s.key)
        undefined

    onResize: ->
        @layout()
        for s in @symbols
            s.update()
        return

    updateSymbol: (s, opts, duration, easing) ->
        if not opts?
            opts = {}

        for p in @type.props
            if opts[p]?
                s[p] = @_evaluate opts[p], s.data
            else if this[p]?
                s[p] = @_evaluate this[p], s.data

        s.update(duration, easing)

    update: (opts, duration, easing) ->
        if not opts?
            opts = {}

        @updateSymbol(s, opts, duration, easing) for s in @symbols
        this


SymbolGroup._layerid = 0

Kartograph::addSymbols = (opts, done) ->
    opts.map = this
    new SymbolGroup(opts).render(done)

module.exports = SymbolGroup
