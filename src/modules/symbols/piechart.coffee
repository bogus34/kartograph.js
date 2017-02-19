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
Snap = require '../../vendor/snap'

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

    overlaps: (bubble) ->
        # check bbox
        [x1,y1,r1] = [@x, @y, @radius]
        [x2,y2,r2] = [bubble.x, bubble.y, bubble.radius]

        if x1 - r1 > x2 + r2 or
        x1 + r1 < x2 - r2 or
        y1 - r1 > y2 + r2 or
        y1 + r1 < y2 - r2
            return false

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
        @chart.attr
            style: @styles
            class: @class

        @chart.attr(title:  @titles[0]) if @titles?

        this

    clear: ->
        @chart?.remove()
        @chart = null

    nodes: () ->
        for el in @chart
            el.node


PieChart.props = ['radius','values','styles','class','titles', 'colors','border','borderWidth']
PieChart.layers = [] #{ id:'a', type: 'svg' }

drawPieChart = (cx, cy, r, values, labels, colors, stroke) ->
    if isNaN(cx) or isNaN(cy) or isNaN(r) then return []
    paper = this
    rad = Math.PI/180
    chart = Snap.set()

    angle = -270
    total = 0

    sector = (cx, cy, r, startAngle, endAngle, params) ->
        x1 = cx + r * Math.cos(-startAngle * rad)
        x2 = cx + r * Math.cos(-endAngle * rad)
        y1 = cy + r * Math.sin(-startAngle * rad)
        y2 = cy + r * Math.sin(-endAngle * rad)
        #["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "Z"]
        pathStr = [
            ['M'], [cx, cy]
            ['L'], [x1, y1]
            ['A'], [r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2]
            ['Z']
        ].map( (a) -> a.join(',') ).join('')
        paper.path(pathStr).attr(params)

    process = (j) ->
        value = values[j]
        angleplus = 360*value/total
        popangle = angle+(angleplus*0.5)
        color = colors[j]
        ms = 500
        delta = 30

        p = sector cx, cy, r, angle, angle + angleplus,
            fill: color
            stroke: stroke
            'stroke-width': 1

        p.mouseover () ->
            p.stop().animate { transform: "s1.1 1.1 " + cx + " " + cy }, ms, mina.elastic

        p.mouseout () ->
            p.stop().animate {transform: ""}, ms, mina.elastic


        angle += angleplus
        chart.push p

    total += v for v in values
    process i for i of values

    chart

drawChoroLegend = (x, y, w, textsize, color, real_min, real_max, decl_min, step, title) ->
    r = undefined
    i = undefined
    paper = this
    ch_sc_m = Math.floor((real_min - decl_min) / step)
    ch_sc_M = Math.ceil((real_max - decl_min) / step)
    lsteps = ch_sc_M - ch_sc_m
    cw = w / lsteps
    y += Math.floor(title.split('\n').length / 2) * textsize
    r = paper.text(x + w / 2, y, title).attr('font-size': textsize)
    jQuery(r.node).addClass 'legend'
    i = 0
    while i < lsteps
        r = paper.rect(x + i * cw, y + textsize + 2, cw, textsize).attr(
            stroke: 'none'
            fill: color(Math.ceil(decl_min + step * (i + ch_sc_m))))
        jQuery(r.node).addClass 'legend'
        i++
    r = paper.text(x, y + 2.5 * textsize + 4, real_min).attr('font-size': textsize)
    jQuery(r.node).addClass 'legend'
    i = 1
    while i < lsteps
        r = paper.text(x + i * cw, y + 2.5 * textsize + 4, decl_min + Math.round(step * (i + ch_sc_m))).attr('font-size': textsize)
        jQuery(r.node).addClass 'legend'
        i++
    r = paper.text(x + lsteps * cw, y + 2.5 * textsize + 4, real_max).attr('font-size': textsize)
    jQuery(r.node).addClass 'legend'

drawPiechartLegend = (cx, cy, R, sdiag_label, sdiag_color, textsize) ->
    i = undefined
    r = undefined
    paper = this
    vals = [ 0.5 ]
    str_color = [ '#fff' ]
    nsteps = sdiag_label.length
    angstep = 90 / nsteps
    rad = Math.PI / 180
    vstep = if nsteps > 1 then Math.max(2 * R, textsize * nsteps * 1.5) / (nsteps - 1) else 0
    angle = angstep - 90
    vc = cy - (vstep * (nsteps - 1) / 2)
    label_num = sdiag_label.length - 1
    while angle < 90
        r = paper.path([
            'M'
            cx + R * Math.cos(angle * rad)
            cy + R * Math.sin(angle * rad)
            'L'
            if Math.abs(angle) > 1 then cx + (vc - cy) / Math.tan(angle * rad) else cx + R * Math.cos(angle * rad)
            vc
            'L'
            cx + 1.5 * R
            vc
        ])
        jQuery(r.node).addClass 'legend'
        r = paper.text(cx + 1.5 * R + 2, vc, sdiag_label[label_num]).attr(
            'font-size': textsize
            'text-anchor': 'start')
        jQuery(r.node).addClass 'legend'
        vc += vstep
        angle += 2 * angstep
        label_num--
    sl = sdiag_label.slice(0)
    sc = sdiag_color.slice(0)
    sl.unshift ''
    sc.unshift 'none'
    i = 0
    while i < nsteps
        vals.push 0.5 / nsteps
        str_color.push '#fff'
        i++
    r = paper.pieChart(cx, cy, R, vals, sl, sc, str_color)
    i = 0
    while i < nsteps + 1
        jQuery(r.items[i].node).addClass 'legend'
        i++

drawCircleSizeLegend = (cx, cy, R, maxv, minv, scale, textsize, props) ->
    paper = this
    r = undefined
    i = undefined
    vstep = 1.5 * textsize
    ngrad = Math.round(2 * R / vstep)
    minR = Math.round(Math.sqrt(minv) * scale)
    r = paper.path([
        'M'
        cx
        cy + R
        'A'
        R
        R
        0
        0
        1
        cx
        cy + R - (2 * R)
    ]).attr(props)
    jQuery(r.node).addClass 'legend'
    r = paper.text(cx + 2, cy + R - (2 * R), maxv.toLocaleString()).attr(
        'font-size': textsize
        'text-anchor': 'start')
    jQuery(r.node).addClass 'legend'
    i = ngrad - 1
    while i > 0
        radlabel = Math.round((i * R / (ngrad * scale)) ** 2)
        value_step = 10 ** Math.round(Math.log10(radlabel - Math.round(((i - 1) * R / (ngrad * scale)) ** 2)))
        radlabel = Math.round(radlabel / value_step) * value_step
        radius = Math.sqrt(radlabel) * scale
        if radlabel > 0 and 2 * (R - radius) > vstep
            r = paper.path([
                'M'
                cx
                cy + R
                'A'
                radius
                radius
                0
                0
                1
                cx
                cy + R - (2 * radius)
            ]).attr(props)
            jQuery(r.node).addClass 'legend'
            r = paper.text(cx + 2, cy + R - (2 * radius), radlabel.toLocaleString()).attr(
                'font-size': textsize
                'text-anchor': 'start')
            jQuery(r.node).addClass 'legend'
        i--
    if minR != R
        r = paper.path([
            'M'
            cx
            cy + R
            'A'
            minR
            minR
            0
            0
            1
            cx
            cy + R - (2 * minR)
        ]).attr(props)
        jQuery(r.node).addClass 'legend'
        r = paper.text(cx + 2, cy + R - (2 * minR), minv.toLocaleString()).attr(
            'font-size': textsize
            'text-anchor': 'start')
        jQuery(r.node).addClass 'legend'

pieChartPlugin = (Snap, Element, Paper) ->
    Paper::pieChart ?= drawPieChart
    Paper::choroLegend ?= drawChoroLegend
    Paper::pieChartLegend ?= drawPiechartLegend
    Paper::circleSizeLegend ?= drawCircleSizeLegend

Snap.plugin pieChartPlugin

module.exports = PieChart
