###
    kartograph - a svg mapping library
    Copyright (C) 2011  Gregor Aisch

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


class BBox
    ###
    2D bounding box
    ###
    constructor: (left=0, top=0, width=null, height=null) ->
        if width == null
            @xmin = Number.MAX_VALUE
            @xmax = Number.MAX_VALUE*-1
        else
            @xmin = @left = left
            @xmax = @right = left + width
            @width = width
        if height == null
            @ymin = Number.MAX_VALUE
            @ymax = Number.MAX_VALUE*-1
        else
            @ymin = @top = top
            @ymax = @bottom = height + top
            @height = height
        return

    update: (x, y) ->
        if not y?
            y = x[1]
            x = x[0]
        @xmin = Math.min(@xmin, x)
        @ymin = Math.min(@ymin, y)
        @xmax = Math.max(@xmax, x)
        @ymax = Math.max(@ymax, y)

        @left = @xmin
        @top = @ymin
        @right = @xmax
        @bottom = @ymax
        @width = @xmax - @xmin
        @height = @ymax - @ymin
        this

    intersects: (bbox) ->
        bbox.left < @right and bbox.right > @left and bbox.top < @bottom and bbox.bottom > @top

    inside: (x,y) -> x >= @left and x <= @right and y >= @top and y <= @bottom

    join: (bbox) ->
        @update(bbox.left, bbox.top)
        @update(bbox.right, bbox.bottom)
        this

BBox.fromXML = (xml) ->
    x = Number(xml.getAttribute('x'))
    y = Number(xml.getAttribute('y'))
    w = Number(xml.getAttribute('w'))
    h = Number(xml.getAttribute('h'))
    new BBox x,y,w,h

kartograph.BBox = BBox
