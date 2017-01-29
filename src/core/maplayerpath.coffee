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

geom = require './geom'
{type} = require '../utils'

class MapLayerPath
    map_layer_path_uid = 0

    constructor: (svg_path, layer_id, layer, titles) ->
        paper = layer.paper
        map = layer.map
        view = map.viewBC
        @path = path = geom.Path.fromSVG(svg_path)
        @vpath = view.projectPath(path)
        @svgPath = @vpath.toSVG(paper)
        @svgPath.data 'path', this

        if not map.styles?
            @svgPath.node.setAttribute('class', layer_id)

        # XXX
        # else
        #     map.applyCSS @svgPath,layer_id

        uid = 'path_' + map_layer_path_uid++
        @svgPath.node.setAttribute('id', uid)
        map.pathById[uid] = this
        data = {}
        for i in [0..svg_path.attributes.length-1]
            attr = svg_path.attributes[i]
            if attr.name.substr(0,5) == "data-"
                v = attr.value
                vn = Number(v)
                if v.trim() isnt "" and vn is v and not isNaN(vn)
                    v = vn
                data[attr.name.substr(5)] = v
        @data = data
        if type(titles) == 'string'
            title = titles
        else if type(titles) == 'function'
            title = titles(data)

        @svgPath.attr 'title', title if title?


    setView: (view) ->
        path = view.projectPath(@path)
        @vpath = path
        if @path.type == "path"
            path_str = path.svgString()
            @svgPath.attr({ path: path_str })
        else if @path.type == "circle"
            @svgPath.attr({ cx: path.x, cy: path.y, r: path.r })

    remove: -> @svgPath.remove()

module.exports = MapLayerPath
