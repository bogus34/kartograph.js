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
{type} = require '../utils'

class Symbol
    ### base class for all symbols ###
    constructor: (opts) ->
        @location = opts.location
        @data = opts.data
        @map = opts.map
        @layers = opts.layers
        @key = opts.key
        @x = opts.x
        @y = opts.y

    init: -> this

    overlaps: (symbol) -> false

    update: (opts) -> this

    nodes: () -> []

    clear: () -> this

    _tooltipForNode: (node, tt) ->
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

        if type(tt) == "string"
            cfg.content.text = tt
        else if type(tt) == "array"
            # cfg.content.title = tt[0]
            # cfg.content.text = tt[1]
            cfg.content.text = tt.pop()
            cfg.content.title = tt.pop()

        $(node).qtip(cfg)

    tooltip: (tt) ->
        @_tooltipForNode(node, tt) for node in @nodes()
        this

module.exports = Symbol
