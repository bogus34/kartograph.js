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

BBox = require './bbox'

class Proj
    @parameters = []
    @title = "Projection"

    @fromXML: (xml) ->
        ###
        reconstructs a projection from xml description
        ###
        id = xml.getAttribute('id')
        opts = {}

        for i in [0..xml.attributes.length-1]
            attr = xml.attributes[i]
            opts[attr.name] = attr.value if attr.name isnt "id"

        throw new Error('unknown projection ' + id) if not proj[id]?

        prj = new proj[id](opts)
        prj.name = id
        prj

    constructor: (opts) ->
        @lon0 = opts.lon0 ? 0
        @lat0 = opts.lat0 ? 0
        @PI = Math.PI
        @HALFPI = @PI * .5
        @QUARTERPI = @PI * .25
        @RAD = @PI / 180
        @DEG = 180 / @PI
        @lam0 = @rad(@lon0)
        @phi0 = @rad(@lat0)
        @minLat = -90
        @maxLat = 90

    rad: (a) -> a * @RAD
    deg: (a) -> a * @DEG

    plot: (polygon, truncate=true) ->
        points = []
        ignore = true
        for [lon,lat] in polygon
            vis = @_visible lon,lat
            if vis
                ignore = false
            [x,y] = @project lon,lat
            if not vis and truncate
                points.push @_truncate x,y
            else
                points.push [x,y]
        if ignore then null else [points]

    sea: ->
        p = @project.bind @
        o = []
        l0 = @lon0
        @lon0 = 0
        o.push(p(lon, @maxLat)) for lon in [-180..180]
        o.push(p(180,lat)) for lat in [@maxLat..@minLat]
        o.push(p(lon, @minLat)) for lon in [180..-180]
        o.push(p(-180,lat)) for lat in [@minLat..@maxLat]
        @lon0 = l0
        o

    world_bbox: ->
        p = @project.bind @
        sea = @sea()
        bbox = new BBox()
        for s in sea
            bbox.update(s[0],s[1])
        bbox

    toString: -> "[Proj: #{@name}]"

# ---------------------------------
# Family of Cylindrical Projecitons
# ---------------------------------

class Cylindrical extends Proj
    ###
    Base class for cylindrical projections
    ###
    @parameters = ['lon0', 'flip']
    @title = "Cylindrical Projection"

    constructor: (opts = {}) ->
        @flip = Number(opts.flip ? 0)
        if @flip == 1
            opts.lon0 = -opts.lon0 ? 0

        super opts

    _visible: (lon, lat) -> true

    clon: (lon) ->
        lon -= @lon0
        if lon < -180
            lon += 360
        else if lon > 180
            lon -= 360
        lon

    ll: (lon, lat) ->
        if @flip == 1
            [-lon,-lat]
        else
            [lon, lat]

class Equirectangular extends Cylindrical
    ###
    Equirectangular Projection aka Lonlat aka Plate Carree
    ###
    @title = "Equirectangular Projection"
    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lon = @clon(lon)
        [(lon) * Math.cos(@phi0) * 1000, lat*-1*1000]

class CEA extends Cylindrical
    @parameters = ['lon0', 'lat1', 'flip']
    @title = "Cylindrical Equal Area"

    constructor: (opts) ->
        super opts
        @lat1 = opts.lat1 ? 0
        @phi1 = @rad(@lat1)

    ###
    Cylindrical Equal Area Projection
    ###
    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lam = @rad(@clon(lon))
        phi = @rad(lat*-1)
        x = (lam) * Math.cos(@phi1)
        y = Math.sin(phi) / Math.cos(@phi1)
        [x*1000,y*1000]

class GallPeters extends CEA
    ###
    Gall-Peters Projection
    ###
    @title = "Gall-Peters Projection"
    @parameters = ['lon0', 'flip']
    constructor: (opts) ->
        opts.lat1 = 45
        super opts

class HoboDyer extends CEA
    ###
    Hobo-Dyer Projection
    ###
    @title = "Hobo-Dyer Projection"
    @parameters = ['lon0', 'flip']
    constructor: (opts) ->
        opts.lat1 = 37.7
        super opts

class Behrmann extends CEA
    ###
    Behrmann Projection
    ###
    @title = "Behrmann Projection"
    @parameters = ['lon0', 'flip']
    constructor: (opts) ->
        opts.lat1 = 30
        super opts

class Balthasart extends CEA
    ###
    Balthasart Projection
    ###
    @title = "Balthasart Projection"
    @parameters = ['lon0', 'flip']
    constructor: (opts) ->
        opts.lat1 = 50
        super opts

class Mercator extends Cylindrical
    ###
    # you're not really into maps..
    ###
    @title = "Mercator Projection"
    constructor: (opts) ->
        super opts
        @minLat = -85
        @maxLat = 85

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        math = Math
        lam = @rad(@clon(lon))
        phi = @rad(lat*-1)
        x = lam * 1000
        y = math.log((1+math.sin(phi)) / math.cos(phi)) * 1000
        [x,y]

# ----------------------------------------
# Family of Pseudo-Cylindrical Projecitons
# ----------------------------------------

class PseudoCylindrical extends Cylindrical
    ###
    Base class for pseudo cylindrical projections
    ###
    @title = "Pseudo-Cylindrical Projection"


class NaturalEarth extends PseudoCylindrical
    ###
    Natural Earth Projection
    see here http://www.shadedrelief.com/NE_proj/
    ###
    @title = "Natural Earth Projection"

    constructor: (opts) ->
        super opts
        @A0 = 0.8707
        @A1 = -0.131979
        @A2 = -0.013791
        @A3 = 0.003971
        @A4 = -0.001529
        @B0 = 1.007226
        @B1 = 0.015085
        @B2 = -0.044475
        @B3 = 0.028874
        @B4 = -0.005916
        @C0 = @B0
        @C1 = 3 * @B1
        @C2 = 7 * @B2
        @C3 = 9 * @B3
        @C4 = 11 * @B4
        @EPS = 1e-11
        @MAX_Y = 0.8707 * 0.52 * Math.PI

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lplam = @rad(@clon(lon))
        lpphi = @rad(lat*-1)
        phi2 = lpphi * lpphi
        phi4 = phi2 * phi2
        # console.log phi2,phi4,@A0,@A1,@A2,@A3,@A4
        x = lplam * (@A0 + phi2 * (@A1 + phi2 * (@A2 + phi4 * phi2 * (@A3 + phi2 * @A4)))) * 180 + 500
        y = lpphi * (@B0 + phi2 * (@B1 + phi4 * (@B2 + @B3 * phi2 + @B4 * phi4))) * 180 + 270
        [x,y]

class Robinson extends PseudoCylindrical
    ###
    Robinson Projection
    ###
    @title = "Robinson Projection"

    constructor: (opts) ->
        super opts
        @X = [1, -5.67239e-12, -7.15511e-05, 3.11028e-06,  0.9986, -0.000482241, -2.4897e-05, -1.33094e-06, 0.9954, -0.000831031, -4.4861e-05, -9.86588e-07, 0.99, -0.00135363, -5.96598e-05, 3.67749e-06, 0.9822, -0.00167442, -4.4975e-06, -5.72394e-06, 0.973, -0.00214869, -9.03565e-05, 1.88767e-08, 0.96, -0.00305084, -9.00732e-05, 1.64869e-06, 0.9427, -0.00382792, -6.53428e-05, -2.61493e-06, 0.9216, -0.00467747, -0.000104566, 4.8122e-06, 0.8962, -0.00536222, -3.23834e-05, -5.43445e-06, 0.8679, -0.00609364, -0.0001139, 3.32521e-06, 0.835, -0.00698325, -6.40219e-05, 9.34582e-07, 0.7986, -0.00755337, -5.00038e-05, 9.35532e-07, 0.7597, -0.00798325, -3.59716e-05, -2.27604e-06, 0.7186, -0.00851366, -7.0112e-05, -8.63072e-06, 0.6732, -0.00986209, -0.000199572, 1.91978e-05, 0.6213, -0.010418, 8.83948e-05, 6.24031e-06, 0.5722, -0.00906601, 0.000181999, 6.24033e-06, 0.5322,  0,  0,  0]
        @Y = [0, 0.0124, 3.72529e-10, 1.15484e-09, 0.062, 0.0124001, 1.76951e-08, -5.92321e-09, 0.124, 0.0123998, -7.09668e-08, 2.25753e-08, 0.186, 0.0124008, 2.66917e-07, -8.44523e-08, 0.248, 0.0123971, -9.99682e-07, 3.15569e-07, 0.31, 0.0124108, 3.73349e-06, -1.1779e-06, 0.372, 0.0123598, -1.3935e-05, 4.39588e-06, 0.434, 0.0125501, 5.20034e-05, -1.00051e-05, 0.4968, 0.0123198, -9.80735e-05, 9.22397e-06, 0.5571, 0.0120308, 4.02857e-05, -5.2901e-06, 0.6176, 0.0120369, -3.90662e-05, 7.36117e-07, 0.6769, 0.0117015, -2.80246e-05, -8.54283e-07, 0.7346, 0.0113572, -4.08389e-05, -5.18524e-07, 0.7903, 0.0109099, -4.86169e-05, -1.0718e-06, 0.8435, 0.0103433, -6.46934e-05, 5.36384e-09, 0.8936, 0.00969679, -6.46129e-05, -8.54894e-06, 0.9394, 0.00840949, -0.000192847, -4.21023e-06, 0.9761, 0.00616525, -0.000256001, -4.21021e-06, 1,  0,  0,  0]
        @NODES = 18
        @FXC = 0.8487
        @FYC = 1.3523
        @C1 = 11.45915590261646417544
        @RC1 = 0.08726646259971647884
        @ONEEPS = 1.000001
        @EPS = 1e-8

    _poly: (arr, offs, z) -> arr[offs]+z * (arr[offs+1]+z * (arr[offs+2]+z * (arr[offs+3])))

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lon = @clon(lon)

        lplam = @rad lon
        lpphi = @rad lat*-1
        phi = Math.abs lpphi
        i = Math.floor phi * @C1
        if i >= @NODES
            i = @NODES - 1
        phi = @deg phi - @RC1 * i
        i *= 4
        x = 1000 * @_poly(@X, i, phi) * @FXC * lplam
        y = 1000 * @_poly(@Y, i, phi) * @FYC
        y = -y if lpphi < 0.0

        [x ,y]

class EckertIV extends PseudoCylindrical
    ###
    Eckert IV Projection
    ###
    @title = "Eckert IV Projection"

    constructor: (opts) ->
        super opts
        @C_x = .42223820031577120149
        @C_y = 1.32650042817700232218
        @RC_y = .75386330736002178205
        @C_p = 3.57079632679489661922
        @RC_p = .28004957675577868795
        @EPS = 1e-7
        @NITER = 6

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lplam = @rad(@clon(lon))
        lpphi = @rad(lat*-1)

        p = @C_p * Math.sin(lpphi)
        V = lpphi * lpphi
        lpphi *= 0.895168 + V * ( 0.0218849 + V * 0.00826809 )

        i = @NITER
        while i>0
            c = Math.cos(lpphi)
            s = Math.sin(lpphi)
            V = (lpphi + s * (c + 2) - p) / (1 + c * (c + 2) - s * s)
            lpphi -= V
            if Math.abs(V) < @EPS
                break
            i -= 1

        if i == 0
            x = @C_x * lplam
            y = if lpphi < 0 then -@C_y else @C_y
        else
            x = @C_x * lplam * (1 + Math.cos(lpphi))
            y = @C_y * Math.sin(lpphi)

        [x,y]

class Sinusoidal extends PseudoCylindrical
    ###
    Sinusoidal Projection
    ###
    @title = "Sinusoidal Projection"

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lam = @rad(@clon(lon))
        phi = @rad(lat*-1)
        x = 1032 * lam * Math.cos(phi)
        y = 1032 * phi

        [x,y]

class Mollweide extends PseudoCylindrical
    ###
    Mollweide Projection
    ###
    @title = "Mollweide Projection"

    constructor: (opts, p=1.5707963267948966, cx=null, cy=null, cp=null) ->
        super opts
        @MAX_ITER = 10
        @TOLERANCE = 1e-7

        if p?
            p2 = p + p
            sp = Math.sin(p)
            r = Math.sqrt(Math.PI*2.0 * sp / (p2 + Math.sin(p2)))
            @cx = 2 * r / Math.PI
            @cy = r / sp
            @cp = p2 + Math.sin(p2)
        else if cx? and cy? and cz?
            @cx = cx
            @cy = cy
            @cp = cp
        else
            warn('kartograph.proj.Mollweide: either p or cx,cy,cp must be defined')

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        math = Math
        abs = math.abs
        lam = @rad(@clon(lon))
        phi = @rad(lat)

        k = @cp * math.sin(phi)
        i = @MAX_ITER
        while i != 0
            v = (phi + math.sin(phi) - k) / (1 + math.cos(phi))
            phi -= v
            if abs(v) < @TOLERANCE
                break
            i -= 1

        if i == 0
            phi = if phi>=0 then @HALFPI else -@HALFPI
        else
            phi *= 0.5

        x = 1000 * @cx * lam * math.cos(phi)
        y = 1000 * @cy * math.sin(phi)
        [x,y*-1]

class WagnerIV extends Mollweide
    ###
    Wagner IV Projection
    ###
    @title = "Wagner IV Projection"

    constructor: (opts) ->
        # p=math.pi/3
        super opts, 1.0471975511965976

class WagnerV extends Mollweide
    ###
    Wagner V Projection
    ###
    @title = "Wagner V Projection"

    constructor: (opts) ->
        # p=math.pi/3
        super opts,null,0.90977,1.65014,3.00896

class Loximuthal extends PseudoCylindrical
    # XXX wtf?
    minLat = -89
    maxLat = 89

    @parameters = ['lon0', 'lat0', 'flip']
    @title = "Loximuthal Projection (equidistant)"

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        math = Math
        lam = @rad(@clon(lon))
        phi = @rad(lat)

        if phi == @phi0
            x = lam * math.cos(@phi0)
        else
            x = lam * (phi - @phi0) / (math.log(math.tan(@QUARTERPI + phi*0.5)) - math.log(math.tan(@QUARTERPI + @phi0*0.5)))
        x *= 1000
        y = 1000 * (phi - @phi0)
        [x,y*-1]

class CantersModifiedSinusoidalI extends PseudoCylindrical
    ###
    Canters, F. (2002) Small-scale Map projection Design. p. 218-219.
    Modified Sinusoidal, equal-area.

    implementation borrowed from
    http://cartography.oregonstate.edu/temp/AdaptiveProjection/src/projections/Canters1.js
    ###

    @title = "Canters Modified Sinusoidal I"
    @parameters = ['lon0']

    C1 = 1.1966
    C3 = -0.1290
    C3x3 = 3 * C3
    C5 = -0.0076
    C5x5 = 5 * C5

    project: (lon, lat) ->
        me = @
        [lon, lat] = me.ll(lon,lat)

        lon = me.rad(me.clon(lon))
        lat = me.rad(lat)

        y2 = lat * lat
        y4 = y2 * y2
        x = 1000 * lon * Math.cos(lat) / (C1 + C3x3 * y2 + C5x5 * y4)
        y = 1000 * lat * (C1 + C3 * y2 + C5 * y4)
        [x,y*-1]

class Hatano extends PseudoCylindrical
    @title = "Hatano Projection"

    NITER = 20
    EPS = 1e-7
    ONETOL = 1.000001
    CN = 2.67595
    CS = 2.43763
    RCN = 0.37369906014686373063
    RCS = 0.41023453108141924738
    FYCN = 1.75859
    FYCS = 1.93052
    RYCN = 0.56863737426006061674
    RYCS = 0.51799515156538134803
    FXC = 0.85
    RXC = 1.17647058823529411764

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lam = @rad(@clon(lon))
        phi = @rad(lat)
        c = Math.sin(phi) * (if phi < 0.0 then CS else CN)
        for i in [NITER..1] by -1
            th1 = (phi + Math.sin(phi) - c) / (1.0 + Math.cos(phi))
            phi -= th1
            if Math.abs(th1) < EPS
                break
        x = 1000 * FXC * lam * Math.cos(phi *= 0.5)
        y = 1000 * Math.sin(phi) * (if phi < 0.0 then FYCS else FYCN)
        return [x, y*-1]

class GoodeHomolosine extends PseudoCylindrical
    @title = "Goode Homolosine Projection"
    @parameters = ['lon0']

    constructor: (opts) ->
        super opts
        @lat1 = 41.737
        @p1 = new Mollweide()
        @p0 = new Sinusoidal()

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lon = @clon(lon)
        if Math.abs(lat) > @lat1
            return @p1.project(lon, lat)
        else
            return @p0.project(lon, lat)

class Nicolosi extends PseudoCylindrical
    @title = "Nicolosi Globular Projection"
    @parameters = ['lon0']

    EPS = 1e-10

    constructor: (opts) ->
        super opts
        @r = @HALFPI*100

    _visible: (lon, lat) ->
        lon = @clon(lon)
        lon > -90 and lon < 90

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lam = @rad(@clon(lon))
        phi = @rad(lat)
        if Math.abs(lam) < EPS
            x = 0
            y = phi
        else if Math.abs(phi) < EPS
            x = lam
            y = 0
        else if Math.abs(Math.abs(lam) - @HALFPI) < EPS
            x = lam * Math.cos(phi)
            y = @HALFPI * Math.sin(phi)
        else if Math.abs(Math.abs(phi) - @HALFPI) < EPS
            x = 0
            y = phi
        else
            tb = @HALFPI / lam - lam / @HALFPI
            c = phi / @HALFPI
            sp = Math.sin(phi)
            d = (1 - c * c) / (sp - c)
            r2 = tb / d
            r2 *= r2
            m = (tb * sp / d - 0.5 * tb)/(1.0 + r2)
            n = (sp / r2 + 0.5 * d)/(1.0 + 1.0/r2)
            x = Math.cos(phi)
            x = Math.sqrt(m * m + x * x / (1.0 + r2))
            x = @HALFPI * (m + if lam < 0 then -x else x)
            y = Math.sqrt(n * n - (sp * sp / r2 + d * sp - 1.0) / (1.0 + 1.0/r2))
            y = @HALFPI * (n + if phi < 0 then y else -y)
        return [x*100,y*-100]

    sea: ->
        out = []
        r = @r
        math = Math
        for phi in [0..360]
            out.push([math.cos(@rad(phi)) * r, math.sin(@rad(phi)) * r])
        out

    world_bbox: -> new BBox(-@r, -@r, @r*2, @r*2)

# -------------------------------
# Family of Azimuthal Projecitons
# -------------------------------

class Azimuthal extends Proj
    ###
    Base class for azimuthal projections
    ###
    @parameters = ['lon0', 'lat0']
    @title = "Azimuthal Projection"

    constructor: (opts, rad=1000) ->
        super opts
        @r = rad
        @elevation0 = @to_elevation(@lat0)
        @azimuth0 = @to_azimuth(@lon0)

    to_elevation: (lat) -> ((lat + 90) / 180) * @PI - @HALFPI

    to_azimuth: (lon) -> ((lon + 180) / 360) * @PI *2 - @PI

    _visible: (lon, lat) ->
        elevation = @to_elevation(lat)
        azimuth = @to_azimuth(lon)
        # work out if the point is visible
        cosc = Math.sin(elevation)*Math.sin(@elevation0)+Math.cos(@elevation0)*Math.cos(elevation)*Math.cos(azimuth-@azimuth0)
        cosc >= 0.0

    _truncate: (x, y) ->
        r = @r
        theta = Math.atan2(y-r,x-r)
        x1 = r + r * Math.cos(theta)
        y1 = r + r * Math.sin(theta)
        [x1,y1]

    sea: -> [@r + Math.cos(@rad(phi)) * @r, @r + Math.sin(@rad(phi)) * @r] for phi in [0..360]

    world_bbox: -> new BBox(0, 0, @r*2, @r*2)

class Orthographic extends Azimuthal
    ###
    Orthographic Azimuthal Projection

    implementation taken from http://www.mccarroll.net/snippets/svgworld/
    ###
    @title = "Orthographic Projection"

    project: (lon, lat) ->
        elevation = @to_elevation(lat)
        azimuth = @to_azimuth(lon)
        xo = @r*Math.cos(elevation)*Math.sin(azimuth-@azimuth0)
        yo = -@r*(Math.cos(@elevation0)*Math.sin(elevation)-Math.sin(@elevation0)*Math.cos(elevation)*Math.cos(azimuth-@azimuth0))
        x = @r + xo
        y = @r + yo
        [x,y]

class LAEA extends Azimuthal
    ###
    Lambert Azimuthal Equal-Area Projection

    implementation taken from
    Snyder, Map projections - A working manual
    ###
    @title = "Lambert Azimuthal Equal-Area Projection"

    constructor: (opts) ->
        super opts
        @scale = Math.sqrt(2)*0.5

    project: (lon, lat) ->
        phi = @rad(lat)
        lam = @rad(lon)
        math = Math
        sin = math.sin
        cos = math.cos

        if false and math.abs(lon - @lon0) == 180
            xo = @r*2
            yo = 0
        else
            k = math.pow(2 / (1 + sin(@phi0) * sin(phi) + cos(@phi0)*cos(phi)*cos(lam - @lam0)), .5)
            k *= @scale#.70738033

            xo = @r * k * cos(phi) * sin(lam - @lam0)
            yo = -@r * k * ( cos(@phi0)*sin(phi) - sin(@phi0)*cos(phi)*cos(lam - @lam0) )

        x = @r + xo
        y = @r + yo
        [x,y]

class LAEA_Alaska extends LAEA
    constructor: () ->
        opts =
            lon0: -150
            lat0: 90
        super opts
        @scale = Math.sqrt(2)*0.5*0.33

class LAEA_Hawaii extends LAEA
    constructor: (opts) ->
        opts =
            lon0: -157
            lat0: 20
        super opts

class LAEA_USA extends LAEA
    constructor: (opts) ->
        opts.lon0 = -100
        opts.lat0 = 45
        super opts
        @laea_alaska = new LAEA_Alaska()
        @laea_hawaii = new LAEA_Hawaii()

    project: (lon, lat) ->
        alaska = lat > 44 and (lon < -127 or lon > 170)
        hawaii = lon < -127 and lat < 44

        if alaska
            if lon > 170
                lon -= 380
            [x,y] = @laea_alaska.project lon, lat
        else if hawaii
            [x,y] = @laea_hawaii.project lon, lat
        else
            [x,y] = super lon, lat

        if alaska
            x += -180
            y += 100
        if hawaii
            y += 220
            x += -80
        [x,y]

class Stereographic extends Azimuthal
    ###
    Stereographic projection

    implementation taken from
    Snyder, Map projections - A working manual
    ###
    @title = "Stereographic Projection"

    project: (lon, lat) ->
        phi = @rad(lat)
        lam = @rad(lon)
        sin = Math.sin
        cos = Math.cos

        k0 = 0.5
        k = 2*k0 / (1 + sin(@phi0) * sin(phi) + cos(@phi0)*cos(phi)*cos(lam - @lam0))

        xo = @r * k * cos(phi) * sin(lam - @lam0)
        yo = -@r * k * ( cos(@phi0)*sin(phi) - sin(@phi0)*cos(phi)*cos(lam - @lam0) )

        x = @r + xo
        y = @r + yo
        [x,y]

class Satellite extends Azimuthal
    ###
    General perspective projection, aka Satellite projection

    implementation taken from
    Snyder, Map projections - A working manual

    up .. angle the camera is turned away from north (clockwise)
    tilt .. angle the camera is tilted
    ###
    @parameters = ['lon0', 'lat0', 'tilt', 'dist', 'up']
    @title = "Satellite Projection"

    constructor: (opts) ->
        super { lon0: 0, lat0: 0 }
        @dist = opts.dist ? 3
        @up = @rad(opts.up ? 0)
        @tilt = @rad(opts.tilt ? 0)

        @scale = 1
        xmin = Number.MAX_VALUE
        xmax = Number.MAX_VALUE*-1
        for lat in [0..179]
            for lon in [0..360]
                xy = @project(lon-180,lat-90)
                xmin = Math.min(xy[0], xmin)
                xmax = Math.max(xy[0], xmax)
        @scale = (@r*2)/(xmax-xmin)
        super opts
        return

    project: (lon, lat, alt = 0) ->
        phi = @rad(lat)
        lam = @rad(lon)
        sin = Math.sin
        cos = Math.cos
        ra = @r * (alt+6371)/3671

        cos_c = sin(@phi0) * sin(phi) + cos(@phi0) * cos(phi) * cos(lam - @lam0)
        k = (@dist - 1) / (@dist - cos_c)
        k = (@dist - 1) / (@dist - cos_c)

        k *= @scale

        xo = ra * k * cos(phi) * sin(lam - @lam0)
        yo = -ra * k * ( cos(@phi0)*sin(phi) - sin(@phi0)*cos(phi)*cos(lam - @lam0) )

        # tilt
        cos_up = cos(@up)
        sin_up = sin(@up)
        cos_tilt = cos(@tilt)
        sin_tilt = sin(@tilt)

        H = ra * (@dist - 1)
        A = ((yo * cos_up + xo * sin_up) * sin(@tilt)/H) + cos_tilt
        xt = (xo * cos_up - yo * sin_up) * cos(@tilt) /A
        yt = (yo * cos_up + xo * sin_up) / A

        x = @r + xt
        y = @r + yt

        [x,y]

    _visible: (lon, lat) ->
        elevation = @to_elevation(lat)
        azimuth = @to_azimuth(lon)
        # work out if the point is visible
        cosc = Math.sin(elevation)*Math.sin(@elevation0)+Math.cos(@elevation0)*Math.cos(elevation)*Math.cos(azimuth-@azimuth0)
        cosc >= (1.0/@dist)

    sea: -> [@r + Math.cos(@rad(phi)) * @r, @r + Math.sin(@rad(phi)) * @r] for phi in [0..360]

class EquidistantAzimuthal extends Azimuthal
    ###
    Equidistant projection

    implementation taken from
    Snyder, Map projections - A working manual
    ###
    @title = "Equidistant Azimuthal Projection"

    project: (lon, lat) ->
        phi = @rad(lat)
        lam = @rad(lon)
        sin = Math.sin
        cos = Math.cos

        cos_c = sin(@phi0) * sin(phi) + cos(@phi0) * cos(phi) * cos(lam - @lam0)
        c = Math.acos(cos_c)
        k = 0.325 * c/sin(c)

        xo = @r * k * cos(phi) * sin(lam - @lam0)
        yo = -@r * k * ( cos(@phi0)*sin(phi) - sin(@phi0)*cos(phi)*cos(lam - @lam0) )

        x = @r + xo
        y = @r + yo
        [x,y]

    _visible: (lon, lat) ->
        true

class Aitoff extends PseudoCylindrical
    ###
    Aitoff projection

    implementation taken from
    Snyder, Map projections - A working manual
    ###
    @title = "Aitoff Projection"
    @parameters = ['lon0']

    COSPHI1 = 0.636619772367581343

    constructor: (opts) ->
        opts.lat0 = 0
        super opts
        @lam0 = 0

    project: (lon, lat) ->
        [lon, lat] = @ll(lon,lat)
        lon = @clon(lon)
        lam = @rad(lon)
        phi = @rad(lat)
        c = 0.5 * lam
        d = Math.acos(Math.cos(phi) * Math.cos(c))
        if d != 0
            y = 1.0 / Math.sin(d)
            x = 2.0 * d * Math.cos(phi) * Math.sin(c) * y
            y *= d * Math.sin(phi)
        else
            x = y = 0
        if @winkel
            x = (x + lam * COSPHI1) * 0.5
            y = (y + phi) * 0.5
        [x*1000, y*-1000]

    _visible: (lon, lat) ->
        true

class Winkel3 extends Aitoff
    @title = "Winkel Tripel Projection"

    constructor: (opts) ->
        super opts
        @winkel = true

# -------------------------------
# Family of Conic Projecitons
# -------------------------------

class Conic extends Proj
    @title = "Conic Projection"
    @parameters = ['lon0', 'lat0', 'lat1', 'lat2']

    constructor: (opts) ->
        super opts
        @lat1 = opts.lat1 ? 30
        @phi1 = @rad(@lat1)
        @lat2 = opts.lat2 ? 50
        @phi2 = @rad(@lat2)

    _visible: (lon, lat) -> lat > @minLat and lat < @maxLat
    _truncate: (x,y) -> [x,y]

    clon: (lon) ->
        lon -= @lon0
        if lon < -180
            lon += 360
        else if lon > 180
            lon -= 360
        lon

class LCC extends Conic
    ###
    Lambert Conformal Conic Projection (spherical)
    ###
    @title = "Lambert Conformal Conic Projection"
    constructor: (opts) ->
        super opts
        {sin,cos,abs,log,tan,pow} = Math
        @n = n = sinphi = sin(@phi1)
        cosphi = cos(@phi1)
        secant = abs(@phi1 - @phi2) >= 1e-10

        n = log(cosphi / cos(@phi2)) / log(tan(@QUARTERPI + 0.5 * @phi2) / tan(@QUARTERPI + 0.5 * @phi1)) if secant

        @c = c = cosphi * pow(tan(@QUARTERPI + .5 * @phi1), n) / n
        if abs(abs(@phi0) - @HALFPI) < 1e-10
            @rho0 = 0.0
        else
            @rho0 = c * pow(tan(@QUARTERPI + .5 * @phi0), -n)

        @minLat = -60
        @maxLat = 85

    project: (lon, lat) ->
        phi = @rad(lat)
        lam = @rad(@clon(lon))
        {sin,cos,abs,log,tan,pow} = Math

        n = @n
        if abs(abs(phi) - @HALFPI) < 1e-10
            rho = 0.0
        else
            rho = @c * pow(tan(@QUARTERPI + 0.5 * phi), -n)
        lam_ = (lam) * n
        x = 1000 * rho * sin(lam_)
        y = 1000 * (@rho0 - rho * cos(lam_))

        [x,y*-1]

class PseudoConic extends Conic

proj =
    lonlat: Equirectangular
    cea: CEA
    gallpeters: GallPeters
    hobodyer: HoboDyer
    behrmann: Behrmann
    balthasart: Balthasart
    mercator: Mercator
    naturalearth: NaturalEarth
    robinson: Robinson
    eckert4: EckertIV
    sinusoidal: Sinusoidal
    mollweide: Mollweide
    wagner4: WagnerIV
    wagner5: WagnerV
    loximuthal: Loximuthal
    canters1: CantersModifiedSinusoidalI
    hatano: Hatano
    goodehomolosine: GoodeHomolosine
    nicolosi: Nicolosi
    ortho: Orthographic
    laea: LAEA
    'laea-usa': LAEA_USA
    stereo: Stereographic
    satellite: Satellite
    equi: EquidistantAzimuthal
    aitoff: Aitoff
    winkel3: Winkel3
    lcc: LCC


module.exports = {
    Proj
    proj
}
