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

Symbol = require '../symbol'

class PieChart extends Symbol
    ###
    usage:
    new SymbolMap({
        map: map,
        radius: 10
        data: [25,75],
        colors: ['red', 'blue'],
        titles: ['red pie', 'blue pie']
    })
    ###

    constructor: (opts) ->
        super opts
        @radius = opts.radius ? 4
        @styles = opts.styles ? ''
        @colors = opts.colors ? ['#3cc','#c3c','#33c','#cc3']
        @titles = opts.titles ? ['','','','','']
        @values = opts.values ? []
        @border = opts.border ? false
        @borderWidth = opts.borderWidth ? 2
        @class = opts.class ? 'piechart'
        Raphael.fn.pieChart ?= drawPieChart

    overlaps: (bubble) ->
        # check bbox
        [x1,y1,r1] = [@x, @y, @radius]
        [x2,y2,r2] = [bubble.x, bubble.y, bubble.radius]
        return false if x1 - r1 > x2 + r2 or x1 + r1 < x2 - r2 or y1 - r1 > y2 + r2 or y1 + r1 < y2 - r2
        dx = x1-x2
        dy = y1-y2
        if dx*dx+dy*dy > (r1+r2)*(r1+r2)
            return false
        true

    render: (layers) ->
        #@path = @layers.mapcanvas.circle @x,@y,@radius
        if @border?
            bg = @layers.mapcanvas.circle(@x,@y,@radius+@borderWidth).attr
                stroke: 'none'
                fill: @border

        @chart = @layers.mapcanvas.pieChart @x, @y, @radius, @values, @titles, @colors, "none"
        @chart.push bg
        this

    update: (opts) ->
        return
        @path.attr
            x: @x
            y: @y
            r: @radius
        path = @path
        path.node.setAttribute 'style', @styles[0]
        path.node.setAttribute 'class', @class
        if @title?
            path.attr 'title',@titles[0]
        this

    clear: ->
        p.remove() for p in @chart
        undefined

    nodes: () ->
        for el in @chart
            el.node


PieChart.props = ['radius','values','styles','class','titles', 'colors','border','borderWidth']
PieChart.layers = [] #{ id:'a', type: 'svg' }

###
pie chart extension for RaphaelJS
###
drawPieChart = (cx, cy, r, values, labels, colors, stroke) ->
    if isNaN(cx) or isNaN(cy) or isNaN(r) then return []
    paper = @
    rad = Math.PI/180
    chart = paper.set()
    sector = (cx,cy,r,startAngle,endAngle,params) ->
        x1 = cx + r * Math.cos(-startAngle * rad)
        x2 = cx + r * Math.cos(-endAngle * rad)
        y1 = cy + r * Math.sin(-startAngle * rad)
        y2 = cy + r * Math.sin(-endAngle * rad)
        paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params)
    angle = -270
    total = 0
    process = (j) ->
        value = values[j]
        angleplus = 360*value/total
        popangle = angle+(angleplus*0.5)
        color = colors[j]
        ms = 500
        delta = 30
        p = sector cx, cy, r, angle, angle+angleplus,
            fill: color
            stroke: stroke
            'stroke-width': 1
        p.mouseover () ->
            p.stop().animate { transform: "s1.1 1.1 " + cx + " " + cy }, ms, "elastic"
            return
        p.mouseout () ->
            p.stop().animate {transform: ""}, ms, "elastic"
            return
        angle += angleplus
        chart.push p
        return
    for v in values
        total += v
    for i of values
        process i
    chart

module.exports = PieChart
