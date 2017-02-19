var kartograph =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./src/index.coffee ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var BBox, Kartograph, PieChart, Proj, Symbol, SymbolGroup, kartograph, proj, ref;
	
	Kartograph = __webpack_require__(/*! ./core/kartograph */ 1);
	
	ref = __webpack_require__(/*! ./core/proj */ 18), Proj = ref.Proj, proj = ref.proj;
	
	BBox = __webpack_require__(/*! ./core/bbox */ 17);
	
	SymbolGroup = __webpack_require__(/*! ./modules/symbolgroup */ 24);
	
	Symbol = __webpack_require__(/*! ./modules/symbol */ 25);
	
	PieChart = __webpack_require__(/*! ./modules/symbols/piechart */ 26);
	
	kartograph = function() {
	  return (function(func, args, ctor) {
	    ctor.prototype = func.prototype;
	    var child = new ctor, result = func.apply(child, args);
	    return Object(result) === result ? result : child;
	  })(Kartograph, arguments, function(){});
	};
	
	module.exports = {
	  version: "0.9.0",
	  __verbose: false,
	  Kartograph: Kartograph,
	  kartograph: kartograph,
	  map: kartograph,
	  Proj: Proj,
	  proj: proj,
	  BBox: BBox,
	  SymbolGroup: SymbolGroup,
	  Symbol: Symbol,
	  PieChart: PieChart
	};


/***/ },
/* 1 */
/*!************************************!*\
  !*** ./src/core/kartograph.coffee ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var $, BBox, Kartograph, LonLat, MapLayer, MapLoader, Proj, Snap, View, parsecss, ref, type, warn,
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	$ = __webpack_require__(/*! jquery */ 2);
	
	Snap = __webpack_require__(/*! ../vendor/snap */ 3);
	
	ref = __webpack_require__(/*! ../utils */ 12), warn = ref.warn, type = ref.type;
	
	View = __webpack_require__(/*! ./view */ 13);
	
	Proj = __webpack_require__(/*! ./proj */ 18);
	
	MapLayer = __webpack_require__(/*! ./maplayer */ 19);
	
	BBox = __webpack_require__(/*! ./bbox */ 17);
	
	LonLat = __webpack_require__(/*! ./lonlat */ 20).LonLat;
	
	parsecss = __webpack_require__(/*! ./parsecss */ 21);
	
	MapLoader = __webpack_require__(/*! ./maploader */ 22);
	
	Kartograph = (function() {
	  function Kartograph(container, width, height) {
	    this.container = $(container);
	    this.size = {
	      h: height || this.container.height() || 'auto',
	      w: width || this.container.width()
	    };
	    this.markers = [];
	    this.loader = null;
	    this.container.addClass('kartograph');
	  }
	
	  Kartograph.prototype.load = function(resolver, callback, opts) {
	    var pan, zoom;
	    if (opts == null) {
	      opts = {};
	    }
	    this.clear();
	    if (this.paper != null) {
	      $(this.paper.node).remove();
	      this.paper = void 0;
	    }
	    this.loader = new MapLoader(resolver);
	    pan = opts.pan || [0, 0];
	    zoom = opts.zoom || 1;
	    this.urlsByZoomLevel = {};
	    this.currentUrls = [];
	    this.currentZoomLevel = null;
	    this.paperByZoomLevel = {};
	    this.layersByZoomLevel = {};
	    return this.reload(pan, zoom, opts, callback);
	  };
	
	  Kartograph.prototype.reload = function(pan, zoom, opts, callback) {
	    return this.loader.load(pan, zoom, (function(_this) {
	      return function(err, url, zoomLevel, svg) {
	        if (err) {
	          warn(err);
	          return;
	        }
	        if (_this.currentZoomLevel !== zoomLevel) {
	          _this.clear();
	          _this.currentZoomLevel = zoomLevel;
	          _this.currentUrls = [];
	        }
	        if (indexOf.call(_this.currentUrls, url) < 0) {
	          _this.currentUrls.push(url);
	          return _this.fragmentLoaded(svg, opts, callback);
	        }
	      };
	    })(this));
	  };
	
	  Kartograph.prototype.fragmentLoaded = function(svg, opts, callback) {
	    var $view, AB, base, base1, h, halign, padding, ratio, ref1, ref2, ref3, valign, vp, w;
	    this.svgSrc = svg;
	    $view = $('view', svg);
	    if (this.viewport == null) {
	      w = this.size.w;
	      h = this.size.h;
	      if (h === 'auto') {
	        ratio = $view.attr('w') / $view.attr('h');
	        h = w / ratio;
	      }
	      this.viewport = new BBox(0, 0, w, h);
	    }
	    if (!this.paper) {
	      this.paper = this.createSVGLayer(null, opts);
	      if (typeof (base = this.paper).panzoom === "function") {
	        base.panzoom().on('afterApplyZoom', (function(_this) {
	          return function(val, _, panzoom) {
	            return _this.reload(panzoom.getCurrentPosition(), panzoom.getCurrentZoom(), opts, callback);
	          };
	        })(this));
	      }
	      if (typeof (base1 = this.paper).panzoom === "function") {
	        base1.panzoom().on('afterApplyPan', (function(_this) {
	          return function(dx, dy, panzoom) {
	            return _this.reload(panzoom.getCurrentPosition(), panzoom.getCurrentZoom(), opts, callback);
	          };
	        })(this));
	      }
	    }
	    vp = this.viewport;
	    this.viewAB = AB = View.fromXML($view[0]);
	    padding = (ref1 = opts.padding) != null ? ref1 : 0;
	    halign = (ref2 = opts.halign) != null ? ref2 : 'center';
	    valign = (ref3 = opts.valign) != null ? ref3 : 'center';
	    this.viewBC = new View(AB.asBBox(), vp.width, vp.height, padding, halign, valign);
	    this.proj = kartograph.Proj.fromXML($('proj', $view)[0]);
	    return typeof callback === "function" ? callback(this) : void 0;
	  };
	
	  Kartograph.prototype.addLayer = function(id, opts) {
	    var $paths, layer, layer_id, path_id, src_id, svgLayer, titles;
	    if (opts == null) {
	      opts = {};
	    }
	
	    /*
	    add new layer
	     */
	    if (this.layerIds == null) {
	      this.layerIds = [];
	    }
	    if (this.layers == null) {
	      this.layers = {};
	    }
	    src_id = id;
	    if (type(opts) === 'object') {
	      layer_id = opts.name;
	      path_id = opts.key;
	      titles = opts.title;
	    } else {
	      opts = {};
	    }
	    if (layer_id == null) {
	      layer_id = src_id;
	    }
	    svgLayer = $('#' + src_id, this.svgSrc);
	    if (svgLayer.length === 0) {
	      warn("didn't find any paths for layer \"" + src_id + "\"");
	      return;
	    }
	    $paths = $('*', svgLayer[0]);
	    if (!$paths.length) {
	      return this;
	    }
	    layer = layer_id in this.layers ? this.layers[layer_id] : (this.layerIds.push(layer_id), this.layers[layer_id] = new MapLayer(layer_id, path_id, this, opts.filter, this.paper));
	    layer.addFragment($paths);
	    if (opts.styles) {
	      layer.style(opts.styles);
	    }
	    if (opts.tooltips) {
	      return layer.tooltips(opts.tooltips);
	    }
	  };
	
	  Kartograph.prototype.createSVGLayer = function(id, opts) {
	    var lid, panZoom, paper, svg;
	    if (opts == null) {
	      opts = {};
	    }
	    if (this._layerCnt == null) {
	      this._layerCnt = 0;
	    }
	    lid = this._layerCnt++;
	    paper = Snap(this.viewport.width, this.viewport.height);
	    $(paper.node).appendTo(this.container);
	    panZoom = paper.panzoom(this.panZoomOptions(opts));
	    panZoom.enable();
	    svg = $(paper.node);
	    svg.css({
	      position: 'absolute',
	      top: '0px',
	      left: '0px',
	      'z-index': lid + 5
	    });
	    if (this.container.css('position') === 'static') {
	      this.container.css({
	        position: 'relative',
	        height: this.viewport.height + 'px'
	      });
	    }
	    svg.addClass(id);
	    return paper;
	  };
	
	  Kartograph.prototype.createHTMLLayer = function(id) {
	    var cnt, div, lid, vp;
	    vp = this.viewport;
	    cnt = this.container;
	    if (this._layerCnt == null) {
	      this._layerCnt = 0;
	    }
	    lid = this._layerCnt++;
	    div = $("<div class='layer " + id + "' />");
	    div.css({
	      position: 'absolute',
	      top: '0px',
	      left: '0px',
	      width: vp.width + 'px',
	      height: vp.height + 'px',
	      'z-index': lid + 5
	    });
	    cnt.append(div);
	    return div;
	  };
	
	  Kartograph.prototype.addMarker = function(marker) {
	    var xy;
	    this.markers.push(marker);
	    xy = this.viewBC.project(this.viewAB.project(this.proj.project(marker.lonlat.lon, marker.lonlat.lat)));
	    return marker.render(xy[0], xy[1], this.container, this.paper);
	  };
	
	  Kartograph.prototype.clearMarkers = function() {
	    var i, len, marker, ref1;
	    ref1 = this.markers;
	    for (i = 0, len = ref1.length; i < len; i++) {
	      marker = ref1[i];
	      marker.clear();
	    }
	    return this.markers = [];
	  };
	
	  Kartograph.prototype.zoom = function(steps) {
	    if (!(this.paper && (this.paper.panzoom != null))) {
	      return;
	    }
	    return this.paper.panzoom().zoomIn(steps);
	  };
	
	  Kartograph.prototype.loadCoastline = function() {
	    return $.ajax({
	      url: 'coastline.json',
	      success: this.renderCoastline,
	      context: this
	    });
	  };
	
	  Kartograph.prototype.resize = function(w, h) {
	
	    /*
	    forces redraw of every layer
	     */
	    var cnt, halign, i, len, padding, ref1, ref2, ref3, ref4, results, sg, valign, vp, zoom;
	    cnt = this.container;
	    if (w == null) {
	      w = cnt.width();
	    }
	    if (h == null) {
	      h = cnt.height();
	    }
	    this.viewport = vp = new BBox(0, 0, w, h);
	    if (this.paper != null) {
	      this.paper.setSize(vp.width, vp.height);
	    }
	    this.forEachLayer((function(_this) {
	      return function(layer) {
	        if ((layer.paper != null) && layer.paper !== _this.paper) {
	          return layer.paper.setSize(vp.width, vp.height);
	        }
	      };
	    })(this));
	    padding = (ref1 = this.opts.padding) != null ? ref1 : 0;
	    halign = (ref2 = this.opts.halign) != null ? ref2 : 'center';
	    valign = (ref3 = this.opts.valign) != null ? ref3 : 'center';
	    zoom = this.opts.zoom;
	    this.viewBC = new View(this.viewAB.asBBox(), vp.width * zoom, vp.height * zoom, padding, halign, valign);
	    this.forEachLayer((function(_this) {
	      return function(layer) {
	        return layer.setView(_this.viewBC);
	      };
	    })(this));
	    if (this.symbolGroups != null) {
	      ref4 = this.symbolGroups;
	      results = [];
	      for (i = 0, len = ref4.length; i < len; i++) {
	        sg = ref4[i];
	        results.push(sg.onResize());
	      }
	      return results;
	    }
	  };
	
	  Kartograph.prototype.lonlat2xy = function(lonlat) {
	    var a;
	    if (lonlat.length === 2) {
	      lonlat = new LonLat(lonlat[0], lonlat[1]);
	    }
	    if (lonlat.length === 3) {
	      lonlat = new LonLat(lonlat[0], lonlat[1], lonlat[2]);
	    }
	    a = this.proj.project(lonlat.lon, lonlat.lat, lonlat.alt);
	    return this.viewBC.project(this.viewAB.project(a));
	  };
	
	  Kartograph.prototype.addSymbolGroup = function(symbolgroup) {
	    if (this.symbolGroups == null) {
	      this.symbolGroups = [];
	    }
	    return this.symbolGroups.push(symbolgroup);
	  };
	
	  Kartograph.prototype.removeSymbols = function(index) {
	    var i, len, ref1, results, sg;
	    if (index != null) {
	      return this.symbolGroups[index].remove();
	    } else {
	      ref1 = this.symbolGroups;
	      results = [];
	      for (i = 0, len = ref1.length; i < len; i++) {
	        sg = ref1[i];
	        results.push(sg.remove());
	      }
	      return results;
	    }
	  };
	
	  Kartograph.prototype.clear = function() {
	    var i, len, ref1, sg;
	    if (this.nextPathTimeout) {
	      clearTimeout(this.nextPathTimeout);
	      this.nextPathTimeout = null;
	    }
	    this.forEachLayer(function(layer) {
	      return layer.remove();
	    });
	    this.layers = {};
	    this.layerIds = [];
	    if (this.symbolGroups != null) {
	      ref1 = this.symbolGroups;
	      for (i = 0, len = ref1.length; i < len; i++) {
	        sg = ref1[i];
	        sg.remove();
	      }
	      this.symbolGroups = [];
	    }
	    return this.svgSrc = null;
	  };
	
	  Kartograph.prototype.style = function(layer, prop, value, duration, delay) {
	    layer = this.getLayer(layer);
	    if (layer != null) {
	      return layer.style(prop, value, duration, delay);
	    }
	  };
	
	  Kartograph.prototype.panZoomOptions = function(opts) {
	    var defaultOpts, k;
	    defaultOpts = {
	      minZoom: 0,
	      maxZoom: 18,
	      zoomStep: 0.05,
	      initialZoom: this.currentZoomLevel || 0,
	      initialPosition: {
	        x: 0,
	        y: 0
	      }
	    };
	    for (k in defaultOpts) {
	      if (k in opts) {
	        defaultOpts[k] = opts[k];
	      }
	    }
	    return defaultOpts;
	  };
	
	  Kartograph.prototype.forEachLayer = function(fn) {
	    var id, layer, ref1;
	    if (!this.layers) {
	      return;
	    }
	    ref1 = this.layers;
	    for (id in ref1) {
	      layer = ref1[id];
	      fn(layer);
	    }
	    return void 0;
	  };
	
	  return Kartograph;
	
	})();
	
	module.exports = Kartograph;


/***/ },
/* 2 */
/*!**********************************!*\
  !*** ./src/vendor/jquery.coffee ***!
  \**********************************/
/***/ function(module, exports) {

	module.exports = window.jQuery;


/***/ },
/* 3 */
/*!********************************!*\
  !*** ./src/vendor/snap.coffee ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	var Snap;
	
	Snap = __webpack_require__(/*! snapsvg-cjs */ 4);
	
	Snap.plugin(__webpack_require__(/*! ./pan-zoom */ 6));
	
	module.exports = Snap;


/***/ },
/* 4 */
/*!********************************************!*\
  !*** ./~/snapsvg-cjs/dist/snap.svg-cjs.js ***!
  \********************************************/
/***/ function(module, exports, __webpack_require__) {

	window.eve = __webpack_require__(/*! eve */ 5)
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	var mina = (function (eve) {
	    var animations = {},
	    requestAnimFrame = window.requestAnimationFrame       ||
	                       window.webkitRequestAnimationFrame ||
	                       window.mozRequestAnimationFrame    ||
	                       window.oRequestAnimationFrame      ||
	                       window.msRequestAnimationFrame     ||
	                       function (callback) {
	                           setTimeout(callback, 16);
	                       },
	    isArray = Array.isArray || function (a) {
	        return a instanceof Array ||
	            Object.prototype.toString.call(a) == "[object Array]";
	    },
	    idgen = 0,
	    idprefix = "M" + (+new Date).toString(36),
	    ID = function () {
	        return idprefix + (idgen++).toString(36);
	    },
	    diff = function (a, b, A, B) {
	        if (isArray(a)) {
	            res = [];
	            for (var i = 0, ii = a.length; i < ii; i++) {
	                res[i] = diff(a[i], b, A[i], B);
	            }
	            return res;
	        }
	        var dif = (A - a) / (B - b);
	        return function (bb) {
	            return a + dif * (bb - b);
	        };
	    },
	    timer = Date.now || function () {
	        return +new Date;
	    },
	    sta = function (val) {
	        var a = this;
	        if (val == null) {
	            return a.s;
	        }
	        var ds = a.s - val;
	        a.b += a.dur * ds;
	        a.B += a.dur * ds;
	        a.s = val;
	    },
	    speed = function (val) {
	        var a = this;
	        if (val == null) {
	            return a.spd;
	        }
	        a.spd = val;
	    },
	    duration = function (val) {
	        var a = this;
	        if (val == null) {
	            return a.dur;
	        }
	        a.s = a.s * val / a.dur;
	        a.dur = val;
	    },
	    stopit = function () {
	        var a = this;
	        delete animations[a.id];
	        a.update();
	        eve("mina.stop." + a.id, a);
	    },
	    pause = function () {
	        var a = this;
	        if (a.pdif) {
	            return;
	        }
	        delete animations[a.id];
	        a.update();
	        a.pdif = a.get() - a.b;
	    },
	    resume = function () {
	        var a = this;
	        if (!a.pdif) {
	            return;
	        }
	        a.b = a.get() - a.pdif;
	        delete a.pdif;
	        animations[a.id] = a;
	    },
	    update = function () {
	        var a = this,
	            res;
	        if (isArray(a.start)) {
	            res = [];
	            for (var j = 0, jj = a.start.length; j < jj; j++) {
	                res[j] = +a.start[j] +
	                    (a.end[j] - a.start[j]) * a.easing(a.s);
	            }
	        } else {
	            res = +a.start + (a.end - a.start) * a.easing(a.s);
	        }
	        a.set(res);
	    },
	    frame = function () {
	        var len = 0;
	        for (var i in animations) if (animations.hasOwnProperty(i)) {
	            var a = animations[i],
	                b = a.get(),
	                res;
	            len++;
	            a.s = (b - a.b) / (a.dur / a.spd);
	            if (a.s >= 1) {
	                delete animations[i];
	                a.s = 1;
	                len--;
	                (function (a) {
	                    setTimeout(function () {
	                        eve("mina.finish." + a.id, a);
	                    });
	                }(a));
	            }
	            a.update();
	        }
	        len && requestAnimFrame(frame);
	    },
	    /*\
	     * mina
	     [ method ]
	     **
	     * Generic animation of numbers
	     **
	     - a (number) start _slave_ number
	     - A (number) end _slave_ number
	     - b (number) start _master_ number (start time in general case)
	     - B (number) end _master_ number (end time in gereal case)
	     - get (function) getter of _master_ number (see @mina.time)
	     - set (function) setter of _slave_ number
	     - easing (function) #optional easing function, default is @mina.linear
	     = (object) animation descriptor
	     o {
	     o         id (string) animation id,
	     o         start (number) start _slave_ number,
	     o         end (number) end _slave_ number,
	     o         b (number) start _master_ number,
	     o         s (number) animation status (0..1),
	     o         dur (number) animation duration,
	     o         spd (number) animation speed,
	     o         get (function) getter of _master_ number (see @mina.time),
	     o         set (function) setter of _slave_ number,
	     o         easing (function) easing function, default is @mina.linear,
	     o         status (function) status getter/setter,
	     o         speed (function) speed getter/setter,
	     o         duration (function) duration getter/setter,
	     o         stop (function) animation stopper
	     o         pause (function) pauses the animation
	     o         resume (function) resumes the animation
	     o         update (function) calles setter with the right value of the animation
	     o }
	    \*/
	    mina = function (a, A, b, B, get, set, easing) {
	        var anim = {
	            id: ID(),
	            start: a,
	            end: A,
	            b: b,
	            s: 0,
	            dur: B - b,
	            spd: 1,
	            get: get,
	            set: set,
	            easing: easing || mina.linear,
	            status: sta,
	            speed: speed,
	            duration: duration,
	            stop: stopit,
	            pause: pause,
	            resume: resume,
	            update: update
	        };
	        animations[anim.id] = anim;
	        var len = 0, i;
	        for (i in animations) if (animations.hasOwnProperty(i)) {
	            len++;
	            if (len == 2) {
	                break;
	            }
	        }
	        len == 1 && requestAnimFrame(frame);
	        return anim;
	    };
	    /*\
	     * mina.time
	     [ method ]
	     **
	     * Returns the current time. Equivalent to:
	     | function () {
	     |     return (new Date).getTime();
	     | }
	    \*/
	    mina.time = timer;
	    /*\
	     * mina.getById
	     [ method ]
	     **
	     * Returns an animation by its id
	     - id (string) animation's id
	     = (object) See @mina
	    \*/
	    mina.getById = function (id) {
	        return animations[id] || null;
	    };
	
	    /*\
	     * mina.linear
	     [ method ]
	     **
	     * Default linear easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.linear = function (n) {
	        return n;
	    };
	    /*\
	     * mina.easeout
	     [ method ]
	     **
	     * Easeout easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.easeout = function (n) {
	        return Math.pow(n, 1.7);
	    };
	    /*\
	     * mina.easein
	     [ method ]
	     **
	     * Easein easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.easein = function (n) {
	        return Math.pow(n, .48);
	    };
	    /*\
	     * mina.easeinout
	     [ method ]
	     **
	     * Easeinout easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.easeinout = function (n) {
	        if (n == 1) {
	            return 1;
	        }
	        if (n == 0) {
	            return 0;
	        }
	        var q = .48 - n / 1.04,
	            Q = Math.sqrt(.1734 + q * q),
	            x = Q - q,
	            X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
	            y = -Q - q,
	            Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),
	            t = X + Y + .5;
	        return (1 - t) * 3 * t * t + t * t * t;
	    };
	    /*\
	     * mina.backin
	     [ method ]
	     **
	     * Backin easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.backin = function (n) {
	        if (n == 1) {
	            return 1;
	        }
	        var s = 1.70158;
	        return n * n * ((s + 1) * n - s);
	    };
	    /*\
	     * mina.backout
	     [ method ]
	     **
	     * Backout easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.backout = function (n) {
	        if (n == 0) {
	            return 0;
	        }
	        n = n - 1;
	        var s = 1.70158;
	        return n * n * ((s + 1) * n + s) + 1;
	    };
	    /*\
	     * mina.elastic
	     [ method ]
	     **
	     * Elastic easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.elastic = function (n) {
	        if (n == !!n) {
	            return n;
	        }
	        return Math.pow(2, -10 * n) * Math.sin((n - .075) *
	            (2 * Math.PI) / .3) + 1;
	    };
	    /*\
	     * mina.bounce
	     [ method ]
	     **
	     * Bounce easing
	     - n (number) input 0..1
	     = (number) output 0..1
	    \*/
	    mina.bounce = function (n) {
	        var s = 7.5625,
	            p = 2.75,
	            l;
	        if (n < (1 / p)) {
	            l = s * n * n;
	        } else {
	            if (n < (2 / p)) {
	                n -= (1.5 / p);
	                l = s * n * n + .75;
	            } else {
	                if (n < (2.5 / p)) {
	                    n -= (2.25 / p);
	                    l = s * n * n + .9375;
	                } else {
	                    n -= (2.625 / p);
	                    l = s * n * n + .984375;
	                }
	            }
	        }
	        return l;
	    };
	    window.mina = mina;
	    return mina;
	})(typeof eve == "undefined" ? function () {} : eve);
	// Copyright (c) 2013 - 2015 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	
	var Snap = (function(root) {
	Snap.version = "0.4.0";
	/*\
	 * Snap
	 [ method ]
	 **
	 * Creates a drawing surface or wraps existing SVG element.
	 **
	 - width (number|string) width of surface
	 - height (number|string) height of surface
	 * or
	 - DOM (SVGElement) element to be wrapped into Snap structure
	 * or
	 - array (array) array of elements (will return set of elements)
	 * or
	 - query (string) CSS query selector
	 = (object) @Element
	\*/
	function Snap(w, h) {
	    if (w) {
	        if (w.nodeType) {
	            return wrap(w);
	        }
	        if (is(w, "array") && Snap.set) {
	            return Snap.set.apply(Snap, w);
	        }
	        if (w instanceof Element) {
	            return w;
	        }
	        if (h == null) {
	            w = glob.doc.querySelector(String(w));
	            return wrap(w);
	        }
	    }
	    w = w == null ? "100%" : w;
	    h = h == null ? "100%" : h;
	    return new Paper(w, h);
	}
	Snap.toString = function () {
	    return "Snap v" + this.version;
	};
	Snap._ = {};
	var glob = {
	    win: root.window,
	    doc: root.window.document
	};
	Snap._.glob = glob;
	var has = "hasOwnProperty",
	    Str = String,
	    toFloat = parseFloat,
	    toInt = parseInt,
	    math = Math,
	    mmax = math.max,
	    mmin = math.min,
	    abs = math.abs,
	    pow = math.pow,
	    PI = math.PI,
	    round = math.round,
	    E = "",
	    S = " ",
	    objectToString = Object.prototype.toString,
	    ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
	    colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
	    bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
	    reURLValue = /^url\(#?([^)]+)\)$/,
	    separator = Snap._.separator = /[,\s]+/,
	    whitespace = /[\s]/g,
	    commaSpaces = /[\s]*,[\s]*/,
	    hsrg = {hs: 1, rg: 1},
	    pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
	    tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
	    pathValues = /(-?\d*\.?\d*(?:e[\-+]?\\d+)?)[\s]*,?[\s]*/ig,
	    idgen = 0,
	    idprefix = "S" + (+new Date).toString(36),
	    ID = function (el) {
	        return (el && el.type ? el.type : E) + idprefix + (idgen++).toString(36);
	    },
	    xlink = "http://www.w3.org/1999/xlink",
	    xmlns = "http://www.w3.org/2000/svg",
	    hub = {},
	    URL = Snap.url = function (url) {
	        return "url('#" + url + "')";
	    };
	
	function $(el, attr) {
	    if (attr) {
	        if (el == "#text") {
	            el = glob.doc.createTextNode(attr.text || attr["#text"] || "");
	        }
	        if (el == "#comment") {
	            el = glob.doc.createComment(attr.text || attr["#text"] || "");
	        }
	        if (typeof el == "string") {
	            el = $(el);
	        }
	        if (typeof attr == "string") {
	            if (el.nodeType == 1) {
	                if (attr.substring(0, 6) == "xlink:") {
	                    return el.getAttributeNS(xlink, attr.substring(6));
	                }
	                if (attr.substring(0, 4) == "xml:") {
	                    return el.getAttributeNS(xmlns, attr.substring(4));
	                }
	                return el.getAttribute(attr);
	            } else if (attr == "text") {
	                return el.nodeValue;
	            } else {
	                return null;
	            }
	        }
	        if (el.nodeType == 1) {
	            for (var key in attr) if (attr[has](key)) {
	                var val = Str(attr[key]);
	                if (val) {
	                    if (key.substring(0, 6) == "xlink:") {
	                        el.setAttributeNS(xlink, key.substring(6), val);
	                    } else if (key.substring(0, 4) == "xml:") {
	                        el.setAttributeNS(xmlns, key.substring(4), val);
	                    } else {
	                        el.setAttribute(key, val);
	                    }
	                } else {
	                    el.removeAttribute(key);
	                }
	            }
	        } else if ("text" in attr) {
	            el.nodeValue = attr.text;
	        }
	    } else {
	        el = glob.doc.createElementNS(xmlns, el);
	    }
	    return el;
	}
	Snap._.$ = $;
	Snap._.id = ID;
	function getAttrs(el) {
	    var attrs = el.attributes,
	        name,
	        out = {};
	    for (var i = 0; i < attrs.length; i++) {
	        if (attrs[i].namespaceURI == xlink) {
	            name = "xlink:";
	        } else {
	            name = "";
	        }
	        name += attrs[i].name;
	        out[name] = attrs[i].textContent;
	    }
	    return out;
	}
	function is(o, type) {
	    type = Str.prototype.toLowerCase.call(type);
	    if (type == "finite") {
	        return isFinite(o);
	    }
	    if (type == "array" &&
	        (o instanceof Array || Array.isArray && Array.isArray(o))) {
	        return true;
	    }
	    return  (type == "null" && o === null) ||
	            (type == typeof o && o !== null) ||
	            (type == "object" && o === Object(o)) ||
	            objectToString.call(o).slice(8, -1).toLowerCase() == type;
	}
	/*\
	 * Snap.format
	 [ method ]
	 **
	 * Replaces construction of type `{<name>}` to the corresponding argument
	 **
	 - token (string) string to format
	 - json (object) object which properties are used as a replacement
	 = (string) formatted string
	 > Usage
	 | // this draws a rectangular shape equivalent to "M10,20h40v50h-40z"
	 | paper.path(Snap.format("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
	 |     x: 10,
	 |     y: 20,
	 |     dim: {
	 |         width: 40,
	 |         height: 50,
	 |         "negative width": -40
	 |     }
	 | }));
	\*/
	Snap.format = (function () {
	    var tokenRegex = /\{([^\}]+)\}/g,
	        objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
	        replacer = function (all, key, obj) {
	            var res = obj;
	            key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
	                name = name || quotedName;
	                if (res) {
	                    if (name in res) {
	                        res = res[name];
	                    }
	                    typeof res == "function" && isFunc && (res = res());
	                }
	            });
	            res = (res == null || res == obj ? all : res) + "";
	            return res;
	        };
	    return function (str, obj) {
	        return Str(str).replace(tokenRegex, function (all, key) {
	            return replacer(all, key, obj);
	        });
	    };
	})();
	function clone(obj) {
	    if (typeof obj == "function" || Object(obj) !== obj) {
	        return obj;
	    }
	    var res = new obj.constructor;
	    for (var key in obj) if (obj[has](key)) {
	        res[key] = clone(obj[key]);
	    }
	    return res;
	}
	Snap._.clone = clone;
	function repush(array, item) {
	    for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
	        return array.push(array.splice(i, 1)[0]);
	    }
	}
	function cacher(f, scope, postprocessor) {
	    function newf() {
	        var arg = Array.prototype.slice.call(arguments, 0),
	            args = arg.join("\u2400"),
	            cache = newf.cache = newf.cache || {},
	            count = newf.count = newf.count || [];
	        if (cache[has](args)) {
	            repush(count, args);
	            return postprocessor ? postprocessor(cache[args]) : cache[args];
	        }
	        count.length >= 1e3 && delete cache[count.shift()];
	        count.push(args);
	        cache[args] = f.apply(scope, arg);
	        return postprocessor ? postprocessor(cache[args]) : cache[args];
	    }
	    return newf;
	}
	Snap._.cacher = cacher;
	function angle(x1, y1, x2, y2, x3, y3) {
	    if (x3 == null) {
	        var x = x1 - x2,
	            y = y1 - y2;
	        if (!x && !y) {
	            return 0;
	        }
	        return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
	    } else {
	        return angle(x1, y1, x3, y3) - angle(x2, y2, x3, y3);
	    }
	}
	function rad(deg) {
	    return deg % 360 * PI / 180;
	}
	function deg(rad) {
	    return rad * 180 / PI % 360;
	}
	function x_y() {
	    return this.x + S + this.y;
	}
	function x_y_w_h() {
	    return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
	}
	
	/*\
	 * Snap.rad
	 [ method ]
	 **
	 * Transform angle to radians
	 - deg (number) angle in degrees
	 = (number) angle in radians
	\*/
	Snap.rad = rad;
	/*\
	 * Snap.deg
	 [ method ]
	 **
	 * Transform angle to degrees
	 - rad (number) angle in radians
	 = (number) angle in degrees
	\*/
	Snap.deg = deg;
	/*\
	 * Snap.sin
	 [ method ]
	 **
	 * Equivalent to `Math.sin()` only works with degrees, not radians.
	 - angle (number) angle in degrees
	 = (number) sin
	\*/
	Snap.sin = function (angle) {
	    return math.sin(Snap.rad(angle));
	};
	/*\
	 * Snap.tan
	 [ method ]
	 **
	 * Equivalent to `Math.tan()` only works with degrees, not radians.
	 - angle (number) angle in degrees
	 = (number) tan
	\*/
	Snap.tan = function (angle) {
	    return math.tan(Snap.rad(angle));
	};
	/*\
	 * Snap.cos
	 [ method ]
	 **
	 * Equivalent to `Math.cos()` only works with degrees, not radians.
	 - angle (number) angle in degrees
	 = (number) cos
	\*/
	Snap.cos = function (angle) {
	    return math.cos(Snap.rad(angle));
	};
	/*\
	 * Snap.asin
	 [ method ]
	 **
	 * Equivalent to `Math.asin()` only works with degrees, not radians.
	 - num (number) value
	 = (number) asin in degrees
	\*/
	Snap.asin = function (num) {
	    return Snap.deg(math.asin(num));
	};
	/*\
	 * Snap.acos
	 [ method ]
	 **
	 * Equivalent to `Math.acos()` only works with degrees, not radians.
	 - num (number) value
	 = (number) acos in degrees
	\*/
	Snap.acos = function (num) {
	    return Snap.deg(math.acos(num));
	};
	/*\
	 * Snap.atan
	 [ method ]
	 **
	 * Equivalent to `Math.atan()` only works with degrees, not radians.
	 - num (number) value
	 = (number) atan in degrees
	\*/
	Snap.atan = function (num) {
	    return Snap.deg(math.atan(num));
	};
	/*\
	 * Snap.atan2
	 [ method ]
	 **
	 * Equivalent to `Math.atan2()` only works with degrees, not radians.
	 - num (number) value
	 = (number) atan2 in degrees
	\*/
	Snap.atan2 = function (num) {
	    return Snap.deg(math.atan2(num));
	};
	/*\
	 * Snap.angle
	 [ method ]
	 **
	 * Returns an angle between two or three points
	 > Parameters
	 - x1 (number) x coord of first point
	 - y1 (number) y coord of first point
	 - x2 (number) x coord of second point
	 - y2 (number) y coord of second point
	 - x3 (number) #optional x coord of third point
	 - y3 (number) #optional y coord of third point
	 = (number) angle in degrees
	\*/
	Snap.angle = angle;
	/*\
	 * Snap.len
	 [ method ]
	 **
	 * Returns distance between two points
	 > Parameters
	 - x1 (number) x coord of first point
	 - y1 (number) y coord of first point
	 - x2 (number) x coord of second point
	 - y2 (number) y coord of second point
	 = (number) distance
	\*/
	Snap.len = function (x1, y1, x2, y2) {
	    return Math.sqrt(Snap.len2(x1, y1, x2, y2));
	};
	/*\
	 * Snap.len2
	 [ method ]
	 **
	 * Returns squared distance between two points
	 > Parameters
	 - x1 (number) x coord of first point
	 - y1 (number) y coord of first point
	 - x2 (number) x coord of second point
	 - y2 (number) y coord of second point
	 = (number) distance
	\*/
	Snap.len2 = function (x1, y1, x2, y2) {
	    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	};
	/*\
	 * Snap.closestPoint
	 [ method ]
	 **
	 * Returns closest point to a given one on a given path.
	 > Parameters
	 - path (Element) path element
	 - x (number) x coord of a point
	 - y (number) y coord of a point
	 = (object) in format
	 {
	    x (number) x coord of the point on the path
	    y (number) y coord of the point on the path
	    length (number) length of the path to the point
	    distance (number) distance from the given point to the path
	 }
	\*/
	// Copied from http://bl.ocks.org/mbostock/8027637
	Snap.closestPoint = function (path, x, y) {
	    function distance2(p) {
	        var dx = p.x - x,
	            dy = p.y - y;
	        return dx * dx + dy * dy;
	    }
	    var pathNode = path.node,
	        pathLength = pathNode.getTotalLength(),
	        precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
	        best,
	        bestLength,
	        bestDistance = Infinity;
	
	    // linear scan for coarse approximation
	    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
	        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
	            best = scan, bestLength = scanLength, bestDistance = scanDistance;
	        }
	    }
	
	    // binary search for precise estimate
	    precision *= .5;
	    while (precision > .5) {
	        var before,
	            after,
	            beforeLength,
	            afterLength,
	            beforeDistance,
	            afterDistance;
	        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
	            best = before, bestLength = beforeLength, bestDistance = beforeDistance;
	        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
	            best = after, bestLength = afterLength, bestDistance = afterDistance;
	        } else {
	            precision *= .5;
	        }
	    }
	
	    best = {
	        x: best.x,
	        y: best.y,
	        length: bestLength,
	        distance: Math.sqrt(bestDistance)
	    };
	    return best;
	}
	/*\
	 * Snap.is
	 [ method ]
	 **
	 * Handy replacement for the `typeof` operator
	 - o (…) any object or primitive
	 - type (string) name of the type, e.g., `string`, `function`, `number`, etc.
	 = (boolean) `true` if given value is of given type
	\*/
	Snap.is = is;
	/*\
	 * Snap.snapTo
	 [ method ]
	 **
	 * Snaps given value to given grid
	 - values (array|number) given array of values or step of the grid
	 - value (number) value to adjust
	 - tolerance (number) #optional maximum distance to the target value that would trigger the snap. Default is `10`.
	 = (number) adjusted value
	\*/
	Snap.snapTo = function (values, value, tolerance) {
	    tolerance = is(tolerance, "finite") ? tolerance : 10;
	    if (is(values, "array")) {
	        var i = values.length;
	        while (i--) if (abs(values[i] - value) <= tolerance) {
	            return values[i];
	        }
	    } else {
	        values = +values;
	        var rem = value % values;
	        if (rem < tolerance) {
	            return value - rem;
	        }
	        if (rem > values - tolerance) {
	            return value - rem + values;
	        }
	    }
	    return value;
	};
	// Colour
	/*\
	 * Snap.getRGB
	 [ method ]
	 **
	 * Parses color string as RGB object
	 - color (string) color string in one of the following formats:
	 # <ul>
	 #     <li>Color name (<code>red</code>, <code>green</code>, <code>cornflowerblue</code>, etc)</li>
	 #     <li>#••• — shortened HTML color: (<code>#000</code>, <code>#fc0</code>, etc.)</li>
	 #     <li>#•••••• — full length HTML color: (<code>#000000</code>, <code>#bd2300</code>)</li>
	 #     <li>rgb(•••, •••, •••) — red, green and blue channels values: (<code>rgb(200,&nbsp;100,&nbsp;0)</code>)</li>
	 #     <li>rgba(•••, •••, •••, •••) — also with opacity</li>
	 #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>)</li>
	 #     <li>rgba(•••%, •••%, •••%, •••%) — also with opacity</li>
	 #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>)</li>
	 #     <li>hsba(•••, •••, •••, •••) — also with opacity</li>
	 #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
	 #     <li>hsba(•••%, •••%, •••%, •••%) — also with opacity</li>
	 #     <li>hsl(•••, •••, •••) — hue, saturation and luminosity values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;0.5)</code>)</li>
	 #     <li>hsla(•••, •••, •••, •••) — also with opacity</li>
	 #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
	 #     <li>hsla(•••%, •••%, •••%, •••%) — also with opacity</li>
	 # </ul>
	 * Note that `%` can be used any time: `rgb(20%, 255, 50%)`.
	 = (object) RGB object in the following format:
	 o {
	 o     r (number) red,
	 o     g (number) green,
	 o     b (number) blue,
	 o     hex (string) color in HTML/CSS format: #••••••,
	 o     error (boolean) true if string can't be parsed
	 o }
	\*/
	Snap.getRGB = cacher(function (colour) {
	    if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
	        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString};
	    }
	    if (colour == "none") {
	        return {r: -1, g: -1, b: -1, hex: "none", toString: rgbtoString};
	    }
	    !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
	    if (!colour) {
	        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString};
	    }
	    var res,
	        red,
	        green,
	        blue,
	        opacity,
	        t,
	        values,
	        rgb = colour.match(colourRegExp);
	    if (rgb) {
	        if (rgb[2]) {
	            blue = toInt(rgb[2].substring(5), 16);
	            green = toInt(rgb[2].substring(3, 5), 16);
	            red = toInt(rgb[2].substring(1, 3), 16);
	        }
	        if (rgb[3]) {
	            blue = toInt((t = rgb[3].charAt(3)) + t, 16);
	            green = toInt((t = rgb[3].charAt(2)) + t, 16);
	            red = toInt((t = rgb[3].charAt(1)) + t, 16);
	        }
	        if (rgb[4]) {
	            values = rgb[4].split(commaSpaces);
	            red = toFloat(values[0]);
	            values[0].slice(-1) == "%" && (red *= 2.55);
	            green = toFloat(values[1]);
	            values[1].slice(-1) == "%" && (green *= 2.55);
	            blue = toFloat(values[2]);
	            values[2].slice(-1) == "%" && (blue *= 2.55);
	            rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
	            values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
	        }
	        if (rgb[5]) {
	            values = rgb[5].split(commaSpaces);
	            red = toFloat(values[0]);
	            values[0].slice(-1) == "%" && (red /= 100);
	            green = toFloat(values[1]);
	            values[1].slice(-1) == "%" && (green /= 100);
	            blue = toFloat(values[2]);
	            values[2].slice(-1) == "%" && (blue /= 100);
	            (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
	            rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
	            values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
	            return Snap.hsb2rgb(red, green, blue, opacity);
	        }
	        if (rgb[6]) {
	            values = rgb[6].split(commaSpaces);
	            red = toFloat(values[0]);
	            values[0].slice(-1) == "%" && (red /= 100);
	            green = toFloat(values[1]);
	            values[1].slice(-1) == "%" && (green /= 100);
	            blue = toFloat(values[2]);
	            values[2].slice(-1) == "%" && (blue /= 100);
	            (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
	            rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
	            values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
	            return Snap.hsl2rgb(red, green, blue, opacity);
	        }
	        red = mmin(math.round(red), 255);
	        green = mmin(math.round(green), 255);
	        blue = mmin(math.round(blue), 255);
	        opacity = mmin(mmax(opacity, 0), 1);
	        rgb = {r: red, g: green, b: blue, toString: rgbtoString};
	        rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
	        rgb.opacity = is(opacity, "finite") ? opacity : 1;
	        return rgb;
	    }
	    return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: rgbtoString};
	}, Snap);
	/*\
	 * Snap.hsb
	 [ method ]
	 **
	 * Converts HSB values to a hex representation of the color
	 - h (number) hue
	 - s (number) saturation
	 - b (number) value or brightness
	 = (string) hex representation of the color
	\*/
	Snap.hsb = cacher(function (h, s, b) {
	    return Snap.hsb2rgb(h, s, b).hex;
	});
	/*\
	 * Snap.hsl
	 [ method ]
	 **
	 * Converts HSL values to a hex representation of the color
	 - h (number) hue
	 - s (number) saturation
	 - l (number) luminosity
	 = (string) hex representation of the color
	\*/
	Snap.hsl = cacher(function (h, s, l) {
	    return Snap.hsl2rgb(h, s, l).hex;
	});
	/*\
	 * Snap.rgb
	 [ method ]
	 **
	 * Converts RGB values to a hex representation of the color
	 - r (number) red
	 - g (number) green
	 - b (number) blue
	 = (string) hex representation of the color
	\*/
	Snap.rgb = cacher(function (r, g, b, o) {
	    if (is(o, "finite")) {
	        var round = math.round;
	        return "rgba(" + [round(r), round(g), round(b), +o.toFixed(2)] + ")";
	    }
	    return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
	});
	var toHex = function (color) {
	    var i = glob.doc.getElementsByTagName("head")[0] || glob.doc.getElementsByTagName("svg")[0],
	        red = "rgb(255, 0, 0)";
	    toHex = cacher(function (color) {
	        if (color.toLowerCase() == "red") {
	            return red;
	        }
	        i.style.color = red;
	        i.style.color = color;
	        var out = glob.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
	        return out == red ? null : out;
	    });
	    return toHex(color);
	},
	hsbtoString = function () {
	    return "hsb(" + [this.h, this.s, this.b] + ")";
	},
	hsltoString = function () {
	    return "hsl(" + [this.h, this.s, this.l] + ")";
	},
	rgbtoString = function () {
	    return this.opacity == 1 || this.opacity == null ?
	            this.hex :
	            "rgba(" + [this.r, this.g, this.b, this.opacity] + ")";
	},
	prepareRGB = function (r, g, b) {
	    if (g == null && is(r, "object") && "r" in r && "g" in r && "b" in r) {
	        b = r.b;
	        g = r.g;
	        r = r.r;
	    }
	    if (g == null && is(r, string)) {
	        var clr = Snap.getRGB(r);
	        r = clr.r;
	        g = clr.g;
	        b = clr.b;
	    }
	    if (r > 1 || g > 1 || b > 1) {
	        r /= 255;
	        g /= 255;
	        b /= 255;
	    }
	
	    return [r, g, b];
	},
	packageRGB = function (r, g, b, o) {
	    r = math.round(r * 255);
	    g = math.round(g * 255);
	    b = math.round(b * 255);
	    var rgb = {
	        r: r,
	        g: g,
	        b: b,
	        opacity: is(o, "finite") ? o : 1,
	        hex: Snap.rgb(r, g, b),
	        toString: rgbtoString
	    };
	    is(o, "finite") && (rgb.opacity = o);
	    return rgb;
	};
	/*\
	 * Snap.color
	 [ method ]
	 **
	 * Parses the color string and returns an object featuring the color's component values
	 - clr (string) color string in one of the supported formats (see @Snap.getRGB)
	 = (object) Combined RGB/HSB object in the following format:
	 o {
	 o     r (number) red,
	 o     g (number) green,
	 o     b (number) blue,
	 o     hex (string) color in HTML/CSS format: #••••••,
	 o     error (boolean) `true` if string can't be parsed,
	 o     h (number) hue,
	 o     s (number) saturation,
	 o     v (number) value (brightness),
	 o     l (number) lightness
	 o }
	\*/
	Snap.color = function (clr) {
	    var rgb;
	    if (is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
	        rgb = Snap.hsb2rgb(clr);
	        clr.r = rgb.r;
	        clr.g = rgb.g;
	        clr.b = rgb.b;
	        clr.opacity = 1;
	        clr.hex = rgb.hex;
	    } else if (is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
	        rgb = Snap.hsl2rgb(clr);
	        clr.r = rgb.r;
	        clr.g = rgb.g;
	        clr.b = rgb.b;
	        clr.opacity = 1;
	        clr.hex = rgb.hex;
	    } else {
	        if (is(clr, "string")) {
	            clr = Snap.getRGB(clr);
	        }
	        if (is(clr, "object") && "r" in clr && "g" in clr && "b" in clr && !("error" in clr)) {
	            rgb = Snap.rgb2hsl(clr);
	            clr.h = rgb.h;
	            clr.s = rgb.s;
	            clr.l = rgb.l;
	            rgb = Snap.rgb2hsb(clr);
	            clr.v = rgb.b;
	        } else {
	            clr = {hex: "none"};
	            clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
	            clr.error = 1;
	        }
	    }
	    clr.toString = rgbtoString;
	    return clr;
	};
	/*\
	 * Snap.hsb2rgb
	 [ method ]
	 **
	 * Converts HSB values to an RGB object
	 - h (number) hue
	 - s (number) saturation
	 - v (number) value or brightness
	 = (object) RGB object in the following format:
	 o {
	 o     r (number) red,
	 o     g (number) green,
	 o     b (number) blue,
	 o     hex (string) color in HTML/CSS format: #••••••
	 o }
	\*/
	Snap.hsb2rgb = function (h, s, v, o) {
	    if (is(h, "object") && "h" in h && "s" in h && "b" in h) {
	        v = h.b;
	        s = h.s;
	        o = h.o;
	        h = h.h;
	    }
	    h *= 360;
	    var R, G, B, X, C;
	    h = (h % 360) / 60;
	    C = v * s;
	    X = C * (1 - abs(h % 2 - 1));
	    R = G = B = v - C;
	
	    h = ~~h;
	    R += [C, X, 0, 0, X, C][h];
	    G += [X, C, C, X, 0, 0][h];
	    B += [0, 0, X, C, C, X][h];
	    return packageRGB(R, G, B, o);
	};
	/*\
	 * Snap.hsl2rgb
	 [ method ]
	 **
	 * Converts HSL values to an RGB object
	 - h (number) hue
	 - s (number) saturation
	 - l (number) luminosity
	 = (object) RGB object in the following format:
	 o {
	 o     r (number) red,
	 o     g (number) green,
	 o     b (number) blue,
	 o     hex (string) color in HTML/CSS format: #••••••
	 o }
	\*/
	Snap.hsl2rgb = function (h, s, l, o) {
	    if (is(h, "object") && "h" in h && "s" in h && "l" in h) {
	        l = h.l;
	        s = h.s;
	        h = h.h;
	    }
	    if (h > 1 || s > 1 || l > 1) {
	        h /= 360;
	        s /= 100;
	        l /= 100;
	    }
	    h *= 360;
	    var R, G, B, X, C;
	    h = (h % 360) / 60;
	    C = 2 * s * (l < .5 ? l : 1 - l);
	    X = C * (1 - abs(h % 2 - 1));
	    R = G = B = l - C / 2;
	
	    h = ~~h;
	    R += [C, X, 0, 0, X, C][h];
	    G += [X, C, C, X, 0, 0][h];
	    B += [0, 0, X, C, C, X][h];
	    return packageRGB(R, G, B, o);
	};
	/*\
	 * Snap.rgb2hsb
	 [ method ]
	 **
	 * Converts RGB values to an HSB object
	 - r (number) red
	 - g (number) green
	 - b (number) blue
	 = (object) HSB object in the following format:
	 o {
	 o     h (number) hue,
	 o     s (number) saturation,
	 o     b (number) brightness
	 o }
	\*/
	Snap.rgb2hsb = function (r, g, b) {
	    b = prepareRGB(r, g, b);
	    r = b[0];
	    g = b[1];
	    b = b[2];
	
	    var H, S, V, C;
	    V = mmax(r, g, b);
	    C = V - mmin(r, g, b);
	    H = (C == 0 ? null :
	         V == r ? (g - b) / C :
	         V == g ? (b - r) / C + 2 :
	                  (r - g) / C + 4
	        );
	    H = ((H + 360) % 6) * 60 / 360;
	    S = C == 0 ? 0 : C / V;
	    return {h: H, s: S, b: V, toString: hsbtoString};
	};
	/*\
	 * Snap.rgb2hsl
	 [ method ]
	 **
	 * Converts RGB values to an HSL object
	 - r (number) red
	 - g (number) green
	 - b (number) blue
	 = (object) HSL object in the following format:
	 o {
	 o     h (number) hue,
	 o     s (number) saturation,
	 o     l (number) luminosity
	 o }
	\*/
	Snap.rgb2hsl = function (r, g, b) {
	    b = prepareRGB(r, g, b);
	    r = b[0];
	    g = b[1];
	    b = b[2];
	
	    var H, S, L, M, m, C;
	    M = mmax(r, g, b);
	    m = mmin(r, g, b);
	    C = M - m;
	    H = (C == 0 ? null :
	         M == r ? (g - b) / C :
	         M == g ? (b - r) / C + 2 :
	                  (r - g) / C + 4);
	    H = ((H + 360) % 6) * 60 / 360;
	    L = (M + m) / 2;
	    S = (C == 0 ? 0 :
	         L < .5 ? C / (2 * L) :
	                  C / (2 - 2 * L));
	    return {h: H, s: S, l: L, toString: hsltoString};
	};
	
	// Transformations
	/*\
	 * Snap.parsePathString
	 [ method ]
	 **
	 * Utility method
	 **
	 * Parses given path string into an array of arrays of path segments
	 - pathString (string|array) path string or array of segments (in the last case it is returned straight away)
	 = (array) array of segments
	\*/
	Snap.parsePathString = function (pathString) {
	    if (!pathString) {
	        return null;
	    }
	    var pth = Snap.path(pathString);
	    if (pth.arr) {
	        return Snap.path.clone(pth.arr);
	    }
	
	    var paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0},
	        data = [];
	    if (is(pathString, "array") && is(pathString[0], "array")) { // rough assumption
	        data = Snap.path.clone(pathString);
	    }
	    if (!data.length) {
	        Str(pathString).replace(pathCommand, function (a, b, c) {
	            var params = [],
	                name = b.toLowerCase();
	            c.replace(pathValues, function (a, b) {
	                b && params.push(+b);
	            });
	            if (name == "m" && params.length > 2) {
	                data.push([b].concat(params.splice(0, 2)));
	                name = "l";
	                b = b == "m" ? "l" : "L";
	            }
	            if (name == "o" && params.length == 1) {
	                data.push([b, params[0]]);
	            }
	            if (name == "r") {
	                data.push([b].concat(params));
	            } else while (params.length >= paramCounts[name]) {
	                data.push([b].concat(params.splice(0, paramCounts[name])));
	                if (!paramCounts[name]) {
	                    break;
	                }
	            }
	        });
	    }
	    data.toString = Snap.path.toString;
	    pth.arr = Snap.path.clone(data);
	    return data;
	};
	/*\
	 * Snap.parseTransformString
	 [ method ]
	 **
	 * Utility method
	 **
	 * Parses given transform string into an array of transformations
	 - TString (string|array) transform string or array of transformations (in the last case it is returned straight away)
	 = (array) array of transformations
	\*/
	var parseTransformString = Snap.parseTransformString = function (TString) {
	    if (!TString) {
	        return null;
	    }
	    var paramCounts = {r: 3, s: 4, t: 2, m: 6},
	        data = [];
	    if (is(TString, "array") && is(TString[0], "array")) { // rough assumption
	        data = Snap.path.clone(TString);
	    }
	    if (!data.length) {
	        Str(TString).replace(tCommand, function (a, b, c) {
	            var params = [],
	                name = b.toLowerCase();
	            c.replace(pathValues, function (a, b) {
	                b && params.push(+b);
	            });
	            data.push([b].concat(params));
	        });
	    }
	    data.toString = Snap.path.toString;
	    return data;
	};
	function svgTransform2string(tstr) {
	    var res = [];
	    tstr = tstr.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, function (all, name, params) {
	        params = params.split(/\s*,\s*|\s+/);
	        if (name == "rotate" && params.length == 1) {
	            params.push(0, 0);
	        }
	        if (name == "scale") {
	            if (params.length > 2) {
	                params = params.slice(0, 2);
	            } else if (params.length == 2) {
	                params.push(0, 0);
	            }
	            if (params.length == 1) {
	                params.push(params[0], 0, 0);
	            }
	        }
	        if (name == "skewX") {
	            res.push(["m", 1, 0, math.tan(rad(params[0])), 1, 0, 0]);
	        } else if (name == "skewY") {
	            res.push(["m", 1, math.tan(rad(params[0])), 0, 1, 0, 0]);
	        } else {
	            res.push([name.charAt(0)].concat(params));
	        }
	        return all;
	    });
	    return res;
	}
	Snap._.svgTransform2string = svgTransform2string;
	Snap._.rgTransform = /^[a-z][\s]*-?\.?\d/i;
	function transform2matrix(tstr, bbox) {
	    var tdata = parseTransformString(tstr),
	        m = new Snap.Matrix;
	    if (tdata) {
	        for (var i = 0, ii = tdata.length; i < ii; i++) {
	            var t = tdata[i],
	                tlen = t.length,
	                command = Str(t[0]).toLowerCase(),
	                absolute = t[0] != command,
	                inver = absolute ? m.invert() : 0,
	                x1,
	                y1,
	                x2,
	                y2,
	                bb;
	            if (command == "t" && tlen == 2){
	                m.translate(t[1], 0);
	            } else if (command == "t" && tlen == 3) {
	                if (absolute) {
	                    x1 = inver.x(0, 0);
	                    y1 = inver.y(0, 0);
	                    x2 = inver.x(t[1], t[2]);
	                    y2 = inver.y(t[1], t[2]);
	                    m.translate(x2 - x1, y2 - y1);
	                } else {
	                    m.translate(t[1], t[2]);
	                }
	            } else if (command == "r") {
	                if (tlen == 2) {
	                    bb = bb || bbox;
	                    m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
	                } else if (tlen == 4) {
	                    if (absolute) {
	                        x2 = inver.x(t[2], t[3]);
	                        y2 = inver.y(t[2], t[3]);
	                        m.rotate(t[1], x2, y2);
	                    } else {
	                        m.rotate(t[1], t[2], t[3]);
	                    }
	                }
	            } else if (command == "s") {
	                if (tlen == 2 || tlen == 3) {
	                    bb = bb || bbox;
	                    m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
	                } else if (tlen == 4) {
	                    if (absolute) {
	                        x2 = inver.x(t[2], t[3]);
	                        y2 = inver.y(t[2], t[3]);
	                        m.scale(t[1], t[1], x2, y2);
	                    } else {
	                        m.scale(t[1], t[1], t[2], t[3]);
	                    }
	                } else if (tlen == 5) {
	                    if (absolute) {
	                        x2 = inver.x(t[3], t[4]);
	                        y2 = inver.y(t[3], t[4]);
	                        m.scale(t[1], t[2], x2, y2);
	                    } else {
	                        m.scale(t[1], t[2], t[3], t[4]);
	                    }
	                }
	            } else if (command == "m" && tlen == 7) {
	                m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
	            }
	        }
	    }
	    return m;
	}
	Snap._.transform2matrix = transform2matrix;
	Snap._unit2px = unit2px;
	var contains = glob.doc.contains || glob.doc.compareDocumentPosition ?
	    function (a, b) {
	        var adown = a.nodeType == 9 ? a.documentElement : a,
	            bup = b && b.parentNode;
	            return a == bup || !!(bup && bup.nodeType == 1 && (
	                adown.contains ?
	                    adown.contains(bup) :
	                    a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
	            ));
	    } :
	    function (a, b) {
	        if (b) {
	            while (b) {
	                b = b.parentNode;
	                if (b == a) {
	                    return true;
	                }
	            }
	        }
	        return false;
	    };
	function getSomeDefs(el) {
	    var p = (el.node.ownerSVGElement && wrap(el.node.ownerSVGElement)) ||
	            (el.node.parentNode && wrap(el.node.parentNode)) ||
	            Snap.select("svg") ||
	            Snap(0, 0),
	        pdefs = p.select("defs"),
	        defs  = pdefs == null ? false : pdefs.node;
	    if (!defs) {
	        defs = make("defs", p.node).node;
	    }
	    return defs;
	}
	function getSomeSVG(el) {
	    return el.node.ownerSVGElement && wrap(el.node.ownerSVGElement) || Snap.select("svg");
	}
	Snap._.getSomeDefs = getSomeDefs;
	Snap._.getSomeSVG = getSomeSVG;
	function unit2px(el, name, value) {
	    var svg = getSomeSVG(el).node,
	        out = {},
	        mgr = svg.querySelector(".svg---mgr");
	    if (!mgr) {
	        mgr = $("rect");
	        $(mgr, {x: -9e9, y: -9e9, width: 10, height: 10, "class": "svg---mgr", fill: "none"});
	        svg.appendChild(mgr);
	    }
	    function getW(val) {
	        if (val == null) {
	            return E;
	        }
	        if (val == +val) {
	            return val;
	        }
	        $(mgr, {width: val});
	        try {
	            return mgr.getBBox().width;
	        } catch (e) {
	            return 0;
	        }
	    }
	    function getH(val) {
	        if (val == null) {
	            return E;
	        }
	        if (val == +val) {
	            return val;
	        }
	        $(mgr, {height: val});
	        try {
	            return mgr.getBBox().height;
	        } catch (e) {
	            return 0;
	        }
	    }
	    function set(nam, f) {
	        if (name == null) {
	            out[nam] = f(el.attr(nam) || 0);
	        } else if (nam == name) {
	            out = f(value == null ? el.attr(nam) || 0 : value);
	        }
	    }
	    switch (el.type) {
	        case "rect":
	            set("rx", getW);
	            set("ry", getH);
	        case "image":
	            set("width", getW);
	            set("height", getH);
	        case "text":
	            set("x", getW);
	            set("y", getH);
	        break;
	        case "circle":
	            set("cx", getW);
	            set("cy", getH);
	            set("r", getW);
	        break;
	        case "ellipse":
	            set("cx", getW);
	            set("cy", getH);
	            set("rx", getW);
	            set("ry", getH);
	        break;
	        case "line":
	            set("x1", getW);
	            set("x2", getW);
	            set("y1", getH);
	            set("y2", getH);
	        break;
	        case "marker":
	            set("refX", getW);
	            set("markerWidth", getW);
	            set("refY", getH);
	            set("markerHeight", getH);
	        break;
	        case "radialGradient":
	            set("fx", getW);
	            set("fy", getH);
	        break;
	        case "tspan":
	            set("dx", getW);
	            set("dy", getH);
	        break;
	        default:
	            set(name, getW);
	    }
	    svg.removeChild(mgr);
	    return out;
	}
	/*\
	 * Snap.select
	 [ method ]
	 **
	 * Wraps a DOM element specified by CSS selector as @Element
	 - query (string) CSS selector of the element
	 = (Element) the current element
	\*/
	Snap.select = function (query) {
	    query = Str(query).replace(/([^\\]):/g, "$1\\:");
	    return wrap(glob.doc.querySelector(query));
	};
	/*\
	 * Snap.selectAll
	 [ method ]
	 **
	 * Wraps DOM elements specified by CSS selector as set or array of @Element
	 - query (string) CSS selector of the element
	 = (Element) the current element
	\*/
	Snap.selectAll = function (query) {
	    var nodelist = glob.doc.querySelectorAll(query),
	        set = (Snap.set || Array)();
	    for (var i = 0; i < nodelist.length; i++) {
	        set.push(wrap(nodelist[i]));
	    }
	    return set;
	};
	
	function add2group(list) {
	    if (!is(list, "array")) {
	        list = Array.prototype.slice.call(arguments, 0);
	    }
	    var i = 0,
	        j = 0,
	        node = this.node;
	    while (this[i]) delete this[i++];
	    for (i = 0; i < list.length; i++) {
	        if (list[i].type == "set") {
	            list[i].forEach(function (el) {
	                node.appendChild(el.node);
	            });
	        } else {
	            node.appendChild(list[i].node);
	        }
	    }
	    var children = node.childNodes;
	    for (i = 0; i < children.length; i++) {
	        this[j++] = wrap(children[i]);
	    }
	    return this;
	}
	// Hub garbage collector every 10s
	setInterval(function () {
	    for (var key in hub) if (hub[has](key)) {
	        var el = hub[key],
	            node = el.node;
	        if (el.type != "svg" && !node.ownerSVGElement || el.type == "svg" && (!node.parentNode || "ownerSVGElement" in node.parentNode && !node.ownerSVGElement)) {
	            delete hub[key];
	        }
	    }
	}, 1e4);
	function Element(el) {
	    if (el.snap in hub) {
	        return hub[el.snap];
	    }
	    var svg;
	    try {
	        svg = el.ownerSVGElement;
	    } catch(e) {}
	    /*\
	     * Element.node
	     [ property (object) ]
	     **
	     * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
	     > Usage
	     | // draw a circle at coordinate 10,10 with radius of 10
	     | var c = paper.circle(10, 10, 10);
	     | c.node.onclick = function () {
	     |     c.attr("fill", "red");
	     | };
	    \*/
	    this.node = el;
	    if (svg) {
	        this.paper = new Paper(svg);
	    }
	    /*\
	     * Element.type
	     [ property (string) ]
	     **
	     * SVG tag name of the given element.
	    \*/
	    this.type = el.tagName || el.nodeName;
	    var id = this.id = ID(this);
	    this.anims = {};
	    this._ = {
	        transform: []
	    };
	    el.snap = id;
	    hub[id] = this;
	    if (this.type == "g") {
	        this.add = add2group;
	    }
	    if (this.type in {g: 1, mask: 1, pattern: 1, symbol: 1}) {
	        for (var method in Paper.prototype) if (Paper.prototype[has](method)) {
	            this[method] = Paper.prototype[method];
	        }
	    }
	}
	   /*\
	     * Element.attr
	     [ method ]
	     **
	     * Gets or sets given attributes of the element.
	     **
	     - params (object) contains key-value pairs of attributes you want to set
	     * or
	     - param (string) name of the attribute
	     = (Element) the current element
	     * or
	     = (string) value of attribute
	     > Usage
	     | el.attr({
	     |     fill: "#fc0",
	     |     stroke: "#000",
	     |     strokeWidth: 2, // CamelCase...
	     |     "fill-opacity": 0.5, // or dash-separated names
	     |     width: "*=2" // prefixed values
	     | });
	     | console.log(el.attr("fill")); // #fc0
	     * Prefixed values in format `"+=10"` supported. All four operations
	     * (`+`, `-`, `*` and `/`) could be used. Optionally you can use units for `+`
	     * and `-`: `"+=2em"`.
	    \*/
	    Element.prototype.attr = function (params, value) {
	        var el = this,
	            node = el.node;
	        if (!params) {
	            if (node.nodeType != 1) {
	                return {
	                    text: node.nodeValue
	                };
	            }
	            var attr = node.attributes,
	                out = {};
	            for (var i = 0, ii = attr.length; i < ii; i++) {
	                out[attr[i].nodeName] = attr[i].nodeValue;
	            }
	            return out;
	        }
	        if (is(params, "string")) {
	            if (arguments.length > 1) {
	                var json = {};
	                json[params] = value;
	                params = json;
	            } else {
	                return eve("snap.util.getattr." + params, el).firstDefined();
	            }
	        }
	        for (var att in params) {
	            if (params[has](att)) {
	                eve("snap.util.attr." + att, el, params[att]);
	            }
	        }
	        return el;
	    };
	/*\
	 * Snap.parse
	 [ method ]
	 **
	 * Parses SVG fragment and converts it into a @Fragment
	 **
	 - svg (string) SVG string
	 = (Fragment) the @Fragment
	\*/
	Snap.parse = function (svg) {
	    var f = glob.doc.createDocumentFragment(),
	        full = true,
	        div = glob.doc.createElement("div");
	    svg = Str(svg);
	    if (!svg.match(/^\s*<\s*svg(?:\s|>)/)) {
	        svg = "<svg>" + svg + "</svg>";
	        full = false;
	    }
	    div.innerHTML = svg;
	    svg = div.getElementsByTagName("svg")[0];
	    if (svg) {
	        if (full) {
	            f = svg;
	        } else {
	            while (svg.firstChild) {
	                f.appendChild(svg.firstChild);
	            }
	        }
	    }
	    return new Fragment(f);
	};
	function Fragment(frag) {
	    this.node = frag;
	}
	/*\
	 * Snap.fragment
	 [ method ]
	 **
	 * Creates a DOM fragment from a given list of elements or strings
	 **
	 - varargs (…) SVG string
	 = (Fragment) the @Fragment
	\*/
	Snap.fragment = function () {
	    var args = Array.prototype.slice.call(arguments, 0),
	        f = glob.doc.createDocumentFragment();
	    for (var i = 0, ii = args.length; i < ii; i++) {
	        var item = args[i];
	        if (item.node && item.node.nodeType) {
	            f.appendChild(item.node);
	        }
	        if (item.nodeType) {
	            f.appendChild(item);
	        }
	        if (typeof item == "string") {
	            f.appendChild(Snap.parse(item).node);
	        }
	    }
	    return new Fragment(f);
	};
	
	function make(name, parent) {
	    var res = $(name);
	    parent.appendChild(res);
	    var el = wrap(res);
	    return el;
	}
	function Paper(w, h) {
	    var res,
	        desc,
	        defs,
	        proto = Paper.prototype;
	    if (w && w.tagName == "svg") {
	        if (w.snap in hub) {
	            return hub[w.snap];
	        }
	        var doc = w.ownerDocument;
	        res = new Element(w);
	        desc = w.getElementsByTagName("desc")[0];
	        defs = w.getElementsByTagName("defs")[0];
	        if (!desc) {
	            desc = $("desc");
	            desc.appendChild(doc.createTextNode("Created with Snap"));
	            res.node.appendChild(desc);
	        }
	        if (!defs) {
	            defs = $("defs");
	            res.node.appendChild(defs);
	        }
	        res.defs = defs;
	        for (var key in proto) if (proto[has](key)) {
	            res[key] = proto[key];
	        }
	        res.paper = res.root = res;
	    } else {
	        res = make("svg", glob.doc.body);
	        $(res.node, {
	            height: h,
	            version: 1.1,
	            width: w,
	            xmlns: xmlns
	        });
	    }
	    return res;
	}
	function wrap(dom) {
	    if (!dom) {
	        return dom;
	    }
	    if (dom instanceof Element || dom instanceof Fragment) {
	        return dom;
	    }
	    if (dom.tagName && dom.tagName.toLowerCase() == "svg") {
	        return new Paper(dom);
	    }
	    if (dom.tagName && dom.tagName.toLowerCase() == "object" && dom.type == "image/svg+xml") {
	        return new Paper(dom.contentDocument.getElementsByTagName("svg")[0]);
	    }
	    return new Element(dom);
	}
	
	Snap._.make = make;
	Snap._.wrap = wrap;
	/*\
	 * Paper.el
	 [ method ]
	 **
	 * Creates an element on paper with a given name and no attributes
	 **
	 - name (string) tag name
	 - attr (object) attributes
	 = (Element) the current element
	 > Usage
	 | var c = paper.circle(10, 10, 10); // is the same as...
	 | var c = paper.el("circle").attr({
	 |     cx: 10,
	 |     cy: 10,
	 |     r: 10
	 | });
	 | // and the same as
	 | var c = paper.el("circle", {
	 |     cx: 10,
	 |     cy: 10,
	 |     r: 10
	 | });
	\*/
	Paper.prototype.el = function (name, attr) {
	    var el = make(name, this.node);
	    attr && el.attr(attr);
	    return el;
	};
	/*\
	 * Element.children
	 [ method ]
	 **
	 * Returns array of all the children of the element.
	 = (array) array of Elements
	\*/
	Element.prototype.children = function () {
	    var out = [],
	        ch = this.node.childNodes;
	    for (var i = 0, ii = ch.length; i < ii; i++) {
	        out[i] = Snap(ch[i]);
	    }
	    return out;
	};
	function jsonFiller(root, o) {
	    for (var i = 0, ii = root.length; i < ii; i++) {
	        var item = {
	                type: root[i].type,
	                attr: root[i].attr()
	            },
	            children = root[i].children();
	        o.push(item);
	        if (children.length) {
	            jsonFiller(children, item.childNodes = []);
	        }
	    }
	}
	/*\
	 * Element.toJSON
	 [ method ]
	 **
	 * Returns object representation of the given element and all its children.
	 = (object) in format
	 o {
	 o     type (string) this.type,
	 o     attr (object) attributes map,
	 o     childNodes (array) optional array of children in the same format
	 o }
	\*/
	Element.prototype.toJSON = function () {
	    var out = [];
	    jsonFiller([this], out);
	    return out[0];
	};
	// default
	eve.on("snap.util.getattr", function () {
	    var att = eve.nt();
	    att = att.substring(att.lastIndexOf(".") + 1);
	    var css = att.replace(/[A-Z]/g, function (letter) {
	        return "-" + letter.toLowerCase();
	    });
	    if (cssAttr[has](css)) {
	        return this.node.ownerDocument.defaultView.getComputedStyle(this.node, null).getPropertyValue(css);
	    } else {
	        return $(this.node, att);
	    }
	});
	var cssAttr = {
	    "alignment-baseline": 0,
	    "baseline-shift": 0,
	    "clip": 0,
	    "clip-path": 0,
	    "clip-rule": 0,
	    "color": 0,
	    "color-interpolation": 0,
	    "color-interpolation-filters": 0,
	    "color-profile": 0,
	    "color-rendering": 0,
	    "cursor": 0,
	    "direction": 0,
	    "display": 0,
	    "dominant-baseline": 0,
	    "enable-background": 0,
	    "fill": 0,
	    "fill-opacity": 0,
	    "fill-rule": 0,
	    "filter": 0,
	    "flood-color": 0,
	    "flood-opacity": 0,
	    "font": 0,
	    "font-family": 0,
	    "font-size": 0,
	    "font-size-adjust": 0,
	    "font-stretch": 0,
	    "font-style": 0,
	    "font-variant": 0,
	    "font-weight": 0,
	    "glyph-orientation-horizontal": 0,
	    "glyph-orientation-vertical": 0,
	    "image-rendering": 0,
	    "kerning": 0,
	    "letter-spacing": 0,
	    "lighting-color": 0,
	    "marker": 0,
	    "marker-end": 0,
	    "marker-mid": 0,
	    "marker-start": 0,
	    "mask": 0,
	    "opacity": 0,
	    "overflow": 0,
	    "pointer-events": 0,
	    "shape-rendering": 0,
	    "stop-color": 0,
	    "stop-opacity": 0,
	    "stroke": 0,
	    "stroke-dasharray": 0,
	    "stroke-dashoffset": 0,
	    "stroke-linecap": 0,
	    "stroke-linejoin": 0,
	    "stroke-miterlimit": 0,
	    "stroke-opacity": 0,
	    "stroke-width": 0,
	    "text-anchor": 0,
	    "text-decoration": 0,
	    "text-rendering": 0,
	    "unicode-bidi": 0,
	    "visibility": 0,
	    "word-spacing": 0,
	    "writing-mode": 0
	};
	
	eve.on("snap.util.attr", function (value) {
	    var att = eve.nt(),
	        attr = {};
	    att = att.substring(att.lastIndexOf(".") + 1);
	    attr[att] = value;
	    var style = att.replace(/-(\w)/gi, function (all, letter) {
	            return letter.toUpperCase();
	        }),
	        css = att.replace(/[A-Z]/g, function (letter) {
	            return "-" + letter.toLowerCase();
	        });
	    if (cssAttr[has](css)) {
	        this.node.style[style] = value == null ? E : value;
	    } else {
	        $(this.node, attr);
	    }
	});
	(function (proto) {}(Paper.prototype));
	
	// simple ajax
	/*\
	 * Snap.ajax
	 [ method ]
	 **
	 * Simple implementation of Ajax
	 **
	 - url (string) URL
	 - postData (object|string) data for post request
	 - callback (function) callback
	 - scope (object) #optional scope of callback
	 * or
	 - url (string) URL
	 - callback (function) callback
	 - scope (object) #optional scope of callback
	 = (XMLHttpRequest) the XMLHttpRequest object, just in case
	\*/
	Snap.ajax = function (url, postData, callback, scope){
	    var req = new XMLHttpRequest,
	        id = ID();
	    if (req) {
	        if (is(postData, "function")) {
	            scope = callback;
	            callback = postData;
	            postData = null;
	        } else if (is(postData, "object")) {
	            var pd = [];
	            for (var key in postData) if (postData.hasOwnProperty(key)) {
	                pd.push(encodeURIComponent(key) + "=" + encodeURIComponent(postData[key]));
	            }
	            postData = pd.join("&");
	        }
	        req.open((postData ? "POST" : "GET"), url, true);
	        if (postData) {
	            req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	        }
	        if (callback) {
	            eve.once("snap.ajax." + id + ".0", callback);
	            eve.once("snap.ajax." + id + ".200", callback);
	            eve.once("snap.ajax." + id + ".304", callback);
	        }
	        req.onreadystatechange = function() {
	            if (req.readyState != 4) return;
	            eve("snap.ajax." + id + "." + req.status, scope, req);
	        };
	        if (req.readyState == 4) {
	            return req;
	        }
	        req.send(postData);
	        return req;
	    }
	};
	/*\
	 * Snap.load
	 [ method ]
	 **
	 * Loads external SVG file as a @Fragment (see @Snap.ajax for more advanced AJAX)
	 **
	 - url (string) URL
	 - callback (function) callback
	 - scope (object) #optional scope of callback
	\*/
	Snap.load = function (url, callback, scope) {
	    Snap.ajax(url, function (req) {
	        var f = Snap.parse(req.responseText);
	        scope ? callback.call(scope, f) : callback(f);
	    });
	};
	var getOffset = function (elem) {
	    var box = elem.getBoundingClientRect(),
	        doc = elem.ownerDocument,
	        body = doc.body,
	        docElem = doc.documentElement,
	        clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
	        top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
	        left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
	    return {
	        y: top,
	        x: left
	    };
	};
	/*\
	 * Snap.getElementByPoint
	 [ method ]
	 **
	 * Returns you topmost element under given point.
	 **
	 = (object) Snap element object
	 - x (number) x coordinate from the top left corner of the window
	 - y (number) y coordinate from the top left corner of the window
	 > Usage
	 | Snap.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
	\*/
	Snap.getElementByPoint = function (x, y) {
	    var paper = this,
	        svg = paper.canvas,
	        target = glob.doc.elementFromPoint(x, y);
	    if (glob.win.opera && target.tagName == "svg") {
	        var so = getOffset(target),
	            sr = target.createSVGRect();
	        sr.x = x - so.x;
	        sr.y = y - so.y;
	        sr.width = sr.height = 1;
	        var hits = target.getIntersectionList(sr, null);
	        if (hits.length) {
	            target = hits[hits.length - 1];
	        }
	    }
	    if (!target) {
	        return null;
	    }
	    return wrap(target);
	};
	/*\
	 * Snap.plugin
	 [ method ]
	 **
	 * Let you write plugins. You pass in a function with five arguments, like this:
	 | Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
	 |     Snap.newmethod = function () {};
	 |     Element.prototype.newmethod = function () {};
	 |     Paper.prototype.newmethod = function () {};
	 | });
	 * Inside the function you have access to all main objects (and their
	 * prototypes). This allow you to extend anything you want.
	 **
	 - f (function) your plugin body
	\*/
	Snap.plugin = function (f) {
	    f(Snap, Element, Paper, glob, Fragment);
	};
	glob.win.Snap = Snap;
	return Snap;
	}(window || this));
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var elproto = Element.prototype,
	        is = Snap.is,
	        Str = String,
	        unit2px = Snap._unit2px,
	        $ = Snap._.$,
	        make = Snap._.make,
	        getSomeDefs = Snap._.getSomeDefs,
	        has = "hasOwnProperty",
	        wrap = Snap._.wrap;
	    /*\
	     * Element.getBBox
	     [ method ]
	     **
	     * Returns the bounding box descriptor for the given element
	     **
	     = (object) bounding box descriptor:
	     o {
	     o     cx: (number) x of the center,
	     o     cy: (number) x of the center,
	     o     h: (number) height,
	     o     height: (number) height,
	     o     path: (string) path command for the box,
	     o     r0: (number) radius of a circle that fully encloses the box,
	     o     r1: (number) radius of the smallest circle that can be enclosed,
	     o     r2: (number) radius of the largest circle that can be enclosed,
	     o     vb: (string) box as a viewbox command,
	     o     w: (number) width,
	     o     width: (number) width,
	     o     x2: (number) x of the right side,
	     o     x: (number) x of the left side,
	     o     y2: (number) y of the bottom edge,
	     o     y: (number) y of the top edge
	     o }
	    \*/
	    elproto.getBBox = function (isWithoutTransform) {
	        if (!Snap.Matrix || !Snap.path) {
	            return this.node.getBBox();
	        }
	        var el = this,
	            m = new Snap.Matrix;
	        if (el.removed) {
	            return Snap._.box();
	        }
	        while (el.type == "use") {
	            if (!isWithoutTransform) {
	                m = m.add(el.transform().localMatrix.translate(el.attr("x") || 0, el.attr("y") || 0));
	            }
	            if (el.original) {
	                el = el.original;
	            } else {
	                var href = el.attr("xlink:href");
	                el = el.original = el.node.ownerDocument.getElementById(href.substring(href.indexOf("#") + 1));
	            }
	        }
	        var _ = el._,
	            pathfinder = Snap.path.get[el.type] || Snap.path.get.deflt;
	        try {
	            if (isWithoutTransform) {
	                _.bboxwt = pathfinder ? Snap.path.getBBox(el.realPath = pathfinder(el)) : Snap._.box(el.node.getBBox());
	                return Snap._.box(_.bboxwt);
	            } else {
	                el.realPath = pathfinder(el);
	                el.matrix = el.transform().localMatrix;
	                _.bbox = Snap.path.getBBox(Snap.path.map(el.realPath, m.add(el.matrix)));
	                return Snap._.box(_.bbox);
	            }
	        } catch (e) {
	            // Firefox doesn’t give you bbox of hidden element
	            return Snap._.box();
	        }
	    };
	    var propString = function () {
	        return this.string;
	    };
	    function extractTransform(el, tstr) {
	        if (tstr == null) {
	            var doReturn = true;
	            if (el.type == "linearGradient" || el.type == "radialGradient") {
	                tstr = el.node.getAttribute("gradientTransform");
	            } else if (el.type == "pattern") {
	                tstr = el.node.getAttribute("patternTransform");
	            } else {
	                tstr = el.node.getAttribute("transform");
	            }
	            if (!tstr) {
	                return new Snap.Matrix;
	            }
	            tstr = Snap._.svgTransform2string(tstr);
	        } else {
	            if (!Snap._.rgTransform.test(tstr)) {
	                tstr = Snap._.svgTransform2string(tstr);
	            } else {
	                tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
	            }
	            if (is(tstr, "array")) {
	                tstr = Snap.path ? Snap.path.toString.call(tstr) : Str(tstr);
	            }
	            el._.transform = tstr;
	        }
	        var m = Snap._.transform2matrix(tstr, el.getBBox(1));
	        if (doReturn) {
	            return m;
	        } else {
	            el.matrix = m;
	        }
	    }
	    /*\
	     * Element.transform
	     [ method ]
	     **
	     * Gets or sets transformation of the element
	     **
	     - tstr (string) transform string in Snap or SVG format
	     = (Element) the current element
	     * or
	     = (object) transformation descriptor:
	     o {
	     o     string (string) transform string,
	     o     globalMatrix (Matrix) matrix of all transformations applied to element or its parents,
	     o     localMatrix (Matrix) matrix of transformations applied only to the element,
	     o     diffMatrix (Matrix) matrix of difference between global and local transformations,
	     o     global (string) global transformation as string,
	     o     local (string) local transformation as string,
	     o     toString (function) returns `string` property
	     o }
	    \*/
	    elproto.transform = function (tstr) {
	        var _ = this._;
	        if (tstr == null) {
	            var papa = this,
	                global = new Snap.Matrix(this.node.getCTM()),
	                local = extractTransform(this),
	                ms = [local],
	                m = new Snap.Matrix,
	                i,
	                localString = local.toTransformString(),
	                string = Str(local) == Str(this.matrix) ?
	                            Str(_.transform) : localString;
	            while (papa.type != "svg" && (papa = papa.parent())) {
	                ms.push(extractTransform(papa));
	            }
	            i = ms.length;
	            while (i--) {
	                m.add(ms[i]);
	            }
	            return {
	                string: string,
	                globalMatrix: global,
	                totalMatrix: m,
	                localMatrix: local,
	                diffMatrix: global.clone().add(local.invert()),
	                global: global.toTransformString(),
	                total: m.toTransformString(),
	                local: localString,
	                toString: propString
	            };
	        }
	        if (tstr instanceof Snap.Matrix) {
	            this.matrix = tstr;
	            this._.transform = tstr.toTransformString();
	        } else {
	            extractTransform(this, tstr);
	        }
	
	        if (this.node) {
	            if (this.type == "linearGradient" || this.type == "radialGradient") {
	                $(this.node, {gradientTransform: this.matrix});
	            } else if (this.type == "pattern") {
	                $(this.node, {patternTransform: this.matrix});
	            } else {
	                $(this.node, {transform: this.matrix});
	            }
	        }
	
	        return this;
	    };
	    /*\
	     * Element.parent
	     [ method ]
	     **
	     * Returns the element's parent
	     **
	     = (Element) the parent element
	    \*/
	    elproto.parent = function () {
	        return wrap(this.node.parentNode);
	    };
	    /*\
	     * Element.append
	     [ method ]
	     **
	     * Appends the given element to current one
	     **
	     - el (Element|Set) element to append
	     = (Element) the parent element
	    \*/
	    /*\
	     * Element.add
	     [ method ]
	     **
	     * See @Element.append
	    \*/
	    elproto.append = elproto.add = function (el) {
	        if (el) {
	            if (el.type == "set") {
	                var it = this;
	                el.forEach(function (el) {
	                    it.add(el);
	                });
	                return this;
	            }
	            el = wrap(el);
	            this.node.appendChild(el.node);
	            el.paper = this.paper;
	        }
	        return this;
	    };
	    /*\
	     * Element.appendTo
	     [ method ]
	     **
	     * Appends the current element to the given one
	     **
	     - el (Element) parent element to append to
	     = (Element) the child element
	    \*/
	    elproto.appendTo = function (el) {
	        if (el) {
	            el = wrap(el);
	            el.append(this);
	        }
	        return this;
	    };
	    /*\
	     * Element.prepend
	     [ method ]
	     **
	     * Prepends the given element to the current one
	     **
	     - el (Element) element to prepend
	     = (Element) the parent element
	    \*/
	    elproto.prepend = function (el) {
	        if (el) {
	            if (el.type == "set") {
	                var it = this,
	                    first;
	                el.forEach(function (el) {
	                    if (first) {
	                        first.after(el);
	                    } else {
	                        it.prepend(el);
	                    }
	                    first = el;
	                });
	                return this;
	            }
	            el = wrap(el);
	            var parent = el.parent();
	            this.node.insertBefore(el.node, this.node.firstChild);
	            this.add && this.add();
	            el.paper = this.paper;
	            this.parent() && this.parent().add();
	            parent && parent.add();
	        }
	        return this;
	    };
	    /*\
	     * Element.prependTo
	     [ method ]
	     **
	     * Prepends the current element to the given one
	     **
	     - el (Element) parent element to prepend to
	     = (Element) the child element
	    \*/
	    elproto.prependTo = function (el) {
	        el = wrap(el);
	        el.prepend(this);
	        return this;
	    };
	    /*\
	     * Element.before
	     [ method ]
	     **
	     * Inserts given element before the current one
	     **
	     - el (Element) element to insert
	     = (Element) the parent element
	    \*/
	    elproto.before = function (el) {
	        if (el.type == "set") {
	            var it = this;
	            el.forEach(function (el) {
	                var parent = el.parent();
	                it.node.parentNode.insertBefore(el.node, it.node);
	                parent && parent.add();
	            });
	            this.parent().add();
	            return this;
	        }
	        el = wrap(el);
	        var parent = el.parent();
	        this.node.parentNode.insertBefore(el.node, this.node);
	        this.parent() && this.parent().add();
	        parent && parent.add();
	        el.paper = this.paper;
	        return this;
	    };
	    /*\
	     * Element.after
	     [ method ]
	     **
	     * Inserts given element after the current one
	     **
	     - el (Element) element to insert
	     = (Element) the parent element
	    \*/
	    elproto.after = function (el) {
	        el = wrap(el);
	        var parent = el.parent();
	        if (this.node.nextSibling) {
	            this.node.parentNode.insertBefore(el.node, this.node.nextSibling);
	        } else {
	            this.node.parentNode.appendChild(el.node);
	        }
	        this.parent() && this.parent().add();
	        parent && parent.add();
	        el.paper = this.paper;
	        return this;
	    };
	    /*\
	     * Element.insertBefore
	     [ method ]
	     **
	     * Inserts the element after the given one
	     **
	     - el (Element) element next to whom insert to
	     = (Element) the parent element
	    \*/
	    elproto.insertBefore = function (el) {
	        el = wrap(el);
	        var parent = this.parent();
	        el.node.parentNode.insertBefore(this.node, el.node);
	        this.paper = el.paper;
	        parent && parent.add();
	        el.parent() && el.parent().add();
	        return this;
	    };
	    /*\
	     * Element.insertAfter
	     [ method ]
	     **
	     * Inserts the element after the given one
	     **
	     - el (Element) element next to whom insert to
	     = (Element) the parent element
	    \*/
	    elproto.insertAfter = function (el) {
	        el = wrap(el);
	        var parent = this.parent();
	        el.node.parentNode.insertBefore(this.node, el.node.nextSibling);
	        this.paper = el.paper;
	        parent && parent.add();
	        el.parent() && el.parent().add();
	        return this;
	    };
	    /*\
	     * Element.remove
	     [ method ]
	     **
	     * Removes element from the DOM
	     = (Element) the detached element
	    \*/
	    elproto.remove = function () {
	        var parent = this.parent();
	        this.node.parentNode && this.node.parentNode.removeChild(this.node);
	        delete this.paper;
	        this.removed = true;
	        parent && parent.add();
	        return this;
	    };
	    /*\
	     * Element.select
	     [ method ]
	     **
	     * Gathers the nested @Element matching the given set of CSS selectors
	     **
	     - query (string) CSS selector
	     = (Element) result of query selection
	    \*/
	    elproto.select = function (query) {
	        query = Str(query).replace(/([^\\]):/g, "$1\\:");
	        return wrap(this.node.querySelector(query));
	    };
	    /*\
	     * Element.selectAll
	     [ method ]
	     **
	     * Gathers nested @Element objects matching the given set of CSS selectors
	     **
	     - query (string) CSS selector
	     = (Set|array) result of query selection
	    \*/
	    elproto.selectAll = function (query) {
	        var nodelist = this.node.querySelectorAll(query),
	            set = (Snap.set || Array)();
	        for (var i = 0; i < nodelist.length; i++) {
	            set.push(wrap(nodelist[i]));
	        }
	        return set;
	    };
	    /*\
	     * Element.asPX
	     [ method ]
	     **
	     * Returns given attribute of the element as a `px` value (not %, em, etc.)
	     **
	     - attr (string) attribute name
	     - value (string) #optional attribute value
	     = (Element) result of query selection
	    \*/
	    elproto.asPX = function (attr, value) {
	        if (value == null) {
	            value = this.attr(attr);
	        }
	        return +unit2px(this, attr, value);
	    };
	    // SIERRA Element.use(): I suggest adding a note about how to access the original element the returned <use> instantiates. It's a part of SVG with which ordinary web developers may be least familiar.
	    /*\
	     * Element.use
	     [ method ]
	     **
	     * Creates a `<use>` element linked to the current element
	     **
	     = (Element) the `<use>` element
	    \*/
	    elproto.use = function () {
	        var use,
	            id = this.node.id;
	        if (!id) {
	            id = this.id;
	            $(this.node, {
	                id: id
	            });
	        }
	        if (this.type == "linearGradient" || this.type == "radialGradient" ||
	            this.type == "pattern") {
	            use = make(this.type, this.node.parentNode);
	        } else {
	            use = make("use", this.node.parentNode);
	        }
	        $(use.node, {
	            "xlink:href": "#" + id
	        });
	        use.original = this;
	        return use;
	    };
	    function fixids(el) {
	        var els = el.selectAll("*"),
	            it,
	            url = /^\s*url\(("|'|)(.*)\1\)\s*$/,
	            ids = [],
	            uses = {};
	        function urltest(it, name) {
	            var val = $(it.node, name);
	            val = val && val.match(url);
	            val = val && val[2];
	            if (val && val.charAt() == "#") {
	                val = val.substring(1);
	            } else {
	                return;
	            }
	            if (val) {
	                uses[val] = (uses[val] || []).concat(function (id) {
	                    var attr = {};
	                    attr[name] = URL(id);
	                    $(it.node, attr);
	                });
	            }
	        }
	        function linktest(it) {
	            var val = $(it.node, "xlink:href");
	            if (val && val.charAt() == "#") {
	                val = val.substring(1);
	            } else {
	                return;
	            }
	            if (val) {
	                uses[val] = (uses[val] || []).concat(function (id) {
	                    it.attr("xlink:href", "#" + id);
	                });
	            }
	        }
	        for (var i = 0, ii = els.length; i < ii; i++) {
	            it = els[i];
	            urltest(it, "fill");
	            urltest(it, "stroke");
	            urltest(it, "filter");
	            urltest(it, "mask");
	            urltest(it, "clip-path");
	            linktest(it);
	            var oldid = $(it.node, "id");
	            if (oldid) {
	                $(it.node, {id: it.id});
	                ids.push({
	                    old: oldid,
	                    id: it.id
	                });
	            }
	        }
	        for (i = 0, ii = ids.length; i < ii; i++) {
	            var fs = uses[ids[i].old];
	            if (fs) {
	                for (var j = 0, jj = fs.length; j < jj; j++) {
	                    fs[j](ids[i].id);
	                }
	            }
	        }
	    }
	    /*\
	     * Element.clone
	     [ method ]
	     **
	     * Creates a clone of the element and inserts it after the element
	     **
	     = (Element) the clone
	    \*/
	    elproto.clone = function () {
	        var clone = wrap(this.node.cloneNode(true));
	        if ($(clone.node, "id")) {
	            $(clone.node, {id: clone.id});
	        }
	        fixids(clone);
	        clone.insertAfter(this);
	        return clone;
	    };
	    /*\
	     * Element.toDefs
	     [ method ]
	     **
	     * Moves element to the shared `<defs>` area
	     **
	     = (Element) the element
	    \*/
	    elproto.toDefs = function () {
	        var defs = getSomeDefs(this);
	        defs.appendChild(this.node);
	        return this;
	    };
	    /*\
	     * Element.toPattern
	     [ method ]
	     **
	     * Creates a `<pattern>` element from the current element
	     **
	     * To create a pattern you have to specify the pattern rect:
	     - x (string|number)
	     - y (string|number)
	     - width (string|number)
	     - height (string|number)
	     = (Element) the `<pattern>` element
	     * You can use pattern later on as an argument for `fill` attribute:
	     | var p = paper.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
	     |         fill: "none",
	     |         stroke: "#bada55",
	     |         strokeWidth: 5
	     |     }).pattern(0, 0, 10, 10),
	     |     c = paper.circle(200, 200, 100);
	     | c.attr({
	     |     fill: p
	     | });
	    \*/
	    elproto.pattern = elproto.toPattern = function (x, y, width, height) {
	        var p = make("pattern", getSomeDefs(this));
	        if (x == null) {
	            x = this.getBBox();
	        }
	        if (is(x, "object") && "x" in x) {
	            y = x.y;
	            width = x.width;
	            height = x.height;
	            x = x.x;
	        }
	        $(p.node, {
	            x: x,
	            y: y,
	            width: width,
	            height: height,
	            patternUnits: "userSpaceOnUse",
	            id: p.id,
	            viewBox: [x, y, width, height].join(" ")
	        });
	        p.node.appendChild(this.node);
	        return p;
	    };
	// SIERRA Element.marker(): clarify what a reference point is. E.g., helps you offset the object from its edge such as when centering it over a path.
	// SIERRA Element.marker(): I suggest the method should accept default reference point values.  Perhaps centered with (refX = width/2) and (refY = height/2)? Also, couldn't it assume the element's current _width_ and _height_? And please specify what _x_ and _y_ mean: offsets? If so, from where?  Couldn't they also be assigned default values?
	    /*\
	     * Element.marker
	     [ method ]
	     **
	     * Creates a `<marker>` element from the current element
	     **
	     * To create a marker you have to specify the bounding rect and reference point:
	     - x (number)
	     - y (number)
	     - width (number)
	     - height (number)
	     - refX (number)
	     - refY (number)
	     = (Element) the `<marker>` element
	     * You can specify the marker later as an argument for `marker-start`, `marker-end`, `marker-mid`, and `marker` attributes. The `marker` attribute places the marker at every point along the path, and `marker-mid` places them at every point except the start and end.
	    \*/
	    // TODO add usage for markers
	    elproto.marker = function (x, y, width, height, refX, refY) {
	        var p = make("marker", getSomeDefs(this));
	        if (x == null) {
	            x = this.getBBox();
	        }
	        if (is(x, "object") && "x" in x) {
	            y = x.y;
	            width = x.width;
	            height = x.height;
	            refX = x.refX || x.cx;
	            refY = x.refY || x.cy;
	            x = x.x;
	        }
	        $(p.node, {
	            viewBox: [x, y, width, height].join(" "),
	            markerWidth: width,
	            markerHeight: height,
	            orient: "auto",
	            refX: refX || 0,
	            refY: refY || 0,
	            id: p.id
	        });
	        p.node.appendChild(this.node);
	        return p;
	    };
	    // animation
	    function slice(from, to, f) {
	        return function (arr) {
	            var res = arr.slice(from, to);
	            if (res.length == 1) {
	                res = res[0];
	            }
	            return f ? f(res) : res;
	        };
	    }
	    var Animation = function (attr, ms, easing, callback) {
	        if (typeof easing == "function" && !easing.length) {
	            callback = easing;
	            easing = mina.linear;
	        }
	        this.attr = attr;
	        this.dur = ms;
	        easing && (this.easing = easing);
	        callback && (this.callback = callback);
	    };
	    Snap._.Animation = Animation;
	    /*\
	     * Snap.animation
	     [ method ]
	     **
	     * Creates an animation object
	     **
	     - attr (object) attributes of final destination
	     - duration (number) duration of the animation, in milliseconds
	     - easing (function) #optional one of easing functions of @mina or custom one
	     - callback (function) #optional callback function that fires when animation ends
	     = (object) animation object
	    \*/
	    Snap.animation = function (attr, ms, easing, callback) {
	        return new Animation(attr, ms, easing, callback);
	    };
	    /*\
	     * Element.inAnim
	     [ method ]
	     **
	     * Returns a set of animations that may be able to manipulate the current element
	     **
	     = (object) in format:
	     o {
	     o     anim (object) animation object,
	     o     mina (object) @mina object,
	     o     curStatus (number) 0..1 — status of the animation: 0 — just started, 1 — just finished,
	     o     status (function) gets or sets the status of the animation,
	     o     stop (function) stops the animation
	     o }
	    \*/
	    elproto.inAnim = function () {
	        var el = this,
	            res = [];
	        for (var id in el.anims) if (el.anims[has](id)) {
	            (function (a) {
	                res.push({
	                    anim: new Animation(a._attrs, a.dur, a.easing, a._callback),
	                    mina: a,
	                    curStatus: a.status(),
	                    status: function (val) {
	                        return a.status(val);
	                    },
	                    stop: function () {
	                        a.stop();
	                    }
	                });
	            }(el.anims[id]));
	        }
	        return res;
	    };
	    /*\
	     * Snap.animate
	     [ method ]
	     **
	     * Runs generic animation of one number into another with a caring function
	     **
	     - from (number|array) number or array of numbers
	     - to (number|array) number or array of numbers
	     - setter (function) caring function that accepts one number argument
	     - duration (number) duration, in milliseconds
	     - easing (function) #optional easing function from @mina or custom
	     - callback (function) #optional callback function to execute when animation ends
	     = (object) animation object in @mina format
	     o {
	     o     id (string) animation id, consider it read-only,
	     o     duration (function) gets or sets the duration of the animation,
	     o     easing (function) easing,
	     o     speed (function) gets or sets the speed of the animation,
	     o     status (function) gets or sets the status of the animation,
	     o     stop (function) stops the animation
	     o }
	     | var rect = Snap().rect(0, 0, 10, 10);
	     | Snap.animate(0, 10, function (val) {
	     |     rect.attr({
	     |         x: val
	     |     });
	     | }, 1000);
	     | // in given context is equivalent to
	     | rect.animate({x: 10}, 1000);
	    \*/
	    Snap.animate = function (from, to, setter, ms, easing, callback) {
	        if (typeof easing == "function" && !easing.length) {
	            callback = easing;
	            easing = mina.linear;
	        }
	        var now = mina.time(),
	            anim = mina(from, to, now, now + ms, mina.time, setter, easing);
	        callback && eve.once("mina.finish." + anim.id, callback);
	        return anim;
	    };
	    /*\
	     * Element.stop
	     [ method ]
	     **
	     * Stops all the animations for the current element
	     **
	     = (Element) the current element
	    \*/
	    elproto.stop = function () {
	        var anims = this.inAnim();
	        for (var i = 0, ii = anims.length; i < ii; i++) {
	            anims[i].stop();
	        }
	        return this;
	    };
	    /*\
	     * Element.animate
	     [ method ]
	     **
	     * Animates the given attributes of the element
	     **
	     - attrs (object) key-value pairs of destination attributes
	     - duration (number) duration of the animation in milliseconds
	     - easing (function) #optional easing function from @mina or custom
	     - callback (function) #optional callback function that executes when the animation ends
	     = (Element) the current element
	    \*/
	    elproto.animate = function (attrs, ms, easing, callback) {
	        if (typeof easing == "function" && !easing.length) {
	            callback = easing;
	            easing = mina.linear;
	        }
	        if (attrs instanceof Animation) {
	            callback = attrs.callback;
	            easing = attrs.easing;
	            ms = easing.dur;
	            attrs = attrs.attr;
	        }
	        var fkeys = [], tkeys = [], keys = {}, from, to, f, eq,
	            el = this;
	        for (var key in attrs) if (attrs[has](key)) {
	            if (el.equal) {
	                eq = el.equal(key, Str(attrs[key]));
	                from = eq.from;
	                to = eq.to;
	                f = eq.f;
	            } else {
	                from = +el.attr(key);
	                to = +attrs[key];
	            }
	            var len = is(from, "array") ? from.length : 1;
	            keys[key] = slice(fkeys.length, fkeys.length + len, f);
	            fkeys = fkeys.concat(from);
	            tkeys = tkeys.concat(to);
	        }
	        var now = mina.time(),
	            anim = mina(fkeys, tkeys, now, now + ms, mina.time, function (val) {
	                var attr = {};
	                for (var key in keys) if (keys[has](key)) {
	                    attr[key] = keys[key](val);
	                }
	                el.attr(attr);
	            }, easing);
	        el.anims[anim.id] = anim;
	        anim._attrs = attrs;
	        anim._callback = callback;
	        eve("snap.animcreated." + el.id, anim);
	        eve.once("mina.finish." + anim.id, function () {
	            delete el.anims[anim.id];
	            callback && callback.call(el);
	        });
	        eve.once("mina.stop." + anim.id, function () {
	            delete el.anims[anim.id];
	        });
	        return el;
	    };
	    var eldata = {};
	    /*\
	     * Element.data
	     [ method ]
	     **
	     * Adds or retrieves given value associated with given key. (Don’t confuse
	     * with `data-` attributes)
	     *
	     * See also @Element.removeData
	     - key (string) key to store data
	     - value (any) #optional value to store
	     = (object) @Element
	     * or, if value is not specified:
	     = (any) value
	     > Usage
	     | for (var i = 0, i < 5, i++) {
	     |     paper.circle(10 + 15 * i, 10, 10)
	     |          .attr({fill: "#000"})
	     |          .data("i", i)
	     |          .click(function () {
	     |             alert(this.data("i"));
	     |          });
	     | }
	    \*/
	    elproto.data = function (key, value) {
	        var data = eldata[this.id] = eldata[this.id] || {};
	        if (arguments.length == 0){
	            eve("snap.data.get." + this.id, this, data, null);
	            return data;
	        }
	        if (arguments.length == 1) {
	            if (Snap.is(key, "object")) {
	                for (var i in key) if (key[has](i)) {
	                    this.data(i, key[i]);
	                }
	                return this;
	            }
	            eve("snap.data.get." + this.id, this, data[key], key);
	            return data[key];
	        }
	        data[key] = value;
	        eve("snap.data.set." + this.id, this, value, key);
	        return this;
	    };
	    /*\
	     * Element.removeData
	     [ method ]
	     **
	     * Removes value associated with an element by given key.
	     * If key is not provided, removes all the data of the element.
	     - key (string) #optional key
	     = (object) @Element
	    \*/
	    elproto.removeData = function (key) {
	        if (key == null) {
	            eldata[this.id] = {};
	        } else {
	            eldata[this.id] && delete eldata[this.id][key];
	        }
	        return this;
	    };
	    /*\
	     * Element.outerSVG
	     [ method ]
	     **
	     * Returns SVG code for the element, equivalent to HTML's `outerHTML`.
	     *
	     * See also @Element.innerSVG
	     = (string) SVG code for the element
	    \*/
	    /*\
	     * Element.toString
	     [ method ]
	     **
	     * See @Element.outerSVG
	    \*/
	    elproto.outerSVG = elproto.toString = toString(1);
	    /*\
	     * Element.innerSVG
	     [ method ]
	     **
	     * Returns SVG code for the element's contents, equivalent to HTML's `innerHTML`
	     = (string) SVG code for the element
	    \*/
	    elproto.innerSVG = toString();
	    function toString(type) {
	        return function () {
	            var res = type ? "<" + this.type : "",
	                attr = this.node.attributes,
	                chld = this.node.childNodes;
	            if (type) {
	                for (var i = 0, ii = attr.length; i < ii; i++) {
	                    res += " " + attr[i].name + '="' +
	                            attr[i].value.replace(/"/g, '\\"') + '"';
	                }
	            }
	            if (chld.length) {
	                type && (res += ">");
	                for (i = 0, ii = chld.length; i < ii; i++) {
	                    if (chld[i].nodeType == 3) {
	                        res += chld[i].nodeValue;
	                    } else if (chld[i].nodeType == 1) {
	                        res += wrap(chld[i]).toString();
	                    }
	                }
	                type && (res += "</" + this.type + ">");
	            } else {
	                type && (res += "/>");
	            }
	            return res;
	        };
	    }
	    elproto.toDataURL = function () {
	        if (window && window.btoa) {
	            var bb = this.getBBox(),
	                svg = Snap.format('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="{x} {y} {width} {height}">{contents}</svg>', {
	                x: +bb.x.toFixed(3),
	                y: +bb.y.toFixed(3),
	                width: +bb.width.toFixed(3),
	                height: +bb.height.toFixed(3),
	                contents: this.outerSVG()
	            });
	            return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
	        }
	    };
	    /*\
	     * Fragment.select
	     [ method ]
	     **
	     * See @Element.select
	    \*/
	    Fragment.prototype.select = elproto.select;
	    /*\
	     * Fragment.selectAll
	     [ method ]
	     **
	     * See @Element.selectAll
	    \*/
	    Fragment.prototype.selectAll = elproto.selectAll;
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var objectToString = Object.prototype.toString,
	        Str = String,
	        math = Math,
	        E = "";
	    function Matrix(a, b, c, d, e, f) {
	        if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
	            this.a = a.a;
	            this.b = a.b;
	            this.c = a.c;
	            this.d = a.d;
	            this.e = a.e;
	            this.f = a.f;
	            return;
	        }
	        if (a != null) {
	            this.a = +a;
	            this.b = +b;
	            this.c = +c;
	            this.d = +d;
	            this.e = +e;
	            this.f = +f;
	        } else {
	            this.a = 1;
	            this.b = 0;
	            this.c = 0;
	            this.d = 1;
	            this.e = 0;
	            this.f = 0;
	        }
	    }
	    (function (matrixproto) {
	        /*\
	         * Matrix.add
	         [ method ]
	         **
	         * Adds the given matrix to existing one
	         - a (number)
	         - b (number)
	         - c (number)
	         - d (number)
	         - e (number)
	         - f (number)
	         * or
	         - matrix (object) @Matrix
	        \*/
	        matrixproto.add = function (a, b, c, d, e, f) {
	            var out = [[], [], []],
	                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
	                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
	                x, y, z, res;
	
	            if (a && a instanceof Matrix) {
	                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
	            }
	
	            for (x = 0; x < 3; x++) {
	                for (y = 0; y < 3; y++) {
	                    res = 0;
	                    for (z = 0; z < 3; z++) {
	                        res += m[x][z] * matrix[z][y];
	                    }
	                    out[x][y] = res;
	                }
	            }
	            this.a = out[0][0];
	            this.b = out[1][0];
	            this.c = out[0][1];
	            this.d = out[1][1];
	            this.e = out[0][2];
	            this.f = out[1][2];
	            return this;
	        };
	        /*\
	         * Matrix.invert
	         [ method ]
	         **
	         * Returns an inverted version of the matrix
	         = (object) @Matrix
	        \*/
	        matrixproto.invert = function () {
	            var me = this,
	                x = me.a * me.d - me.b * me.c;
	            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
	        };
	        /*\
	         * Matrix.clone
	         [ method ]
	         **
	         * Returns a copy of the matrix
	         = (object) @Matrix
	        \*/
	        matrixproto.clone = function () {
	            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
	        };
	        /*\
	         * Matrix.translate
	         [ method ]
	         **
	         * Translate the matrix
	         - x (number) horizontal offset distance
	         - y (number) vertical offset distance
	        \*/
	        matrixproto.translate = function (x, y) {
	            return this.add(1, 0, 0, 1, x, y);
	        };
	        /*\
	         * Matrix.scale
	         [ method ]
	         **
	         * Scales the matrix
	         - x (number) amount to be scaled, with `1` resulting in no change
	         - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
	         - cx (number) #optional horizontal origin point from which to scale
	         - cy (number) #optional vertical origin point from which to scale
	         * Default cx, cy is the middle point of the element.
	        \*/
	        matrixproto.scale = function (x, y, cx, cy) {
	            y == null && (y = x);
	            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
	            this.add(x, 0, 0, y, 0, 0);
	            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
	            return this;
	        };
	        /*\
	         * Matrix.rotate
	         [ method ]
	         **
	         * Rotates the matrix
	         - a (number) angle of rotation, in degrees
	         - x (number) horizontal origin point from which to rotate
	         - y (number) vertical origin point from which to rotate
	        \*/
	        matrixproto.rotate = function (a, x, y) {
	            a = Snap.rad(a);
	            x = x || 0;
	            y = y || 0;
	            var cos = +math.cos(a).toFixed(9),
	                sin = +math.sin(a).toFixed(9);
	            this.add(cos, sin, -sin, cos, x, y);
	            return this.add(1, 0, 0, 1, -x, -y);
	        };
	        /*\
	         * Matrix.x
	         [ method ]
	         **
	         * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
	         - x (number)
	         - y (number)
	         = (number) x
	        \*/
	        matrixproto.x = function (x, y) {
	            return x * this.a + y * this.c + this.e;
	        };
	        /*\
	         * Matrix.y
	         [ method ]
	         **
	         * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
	         - x (number)
	         - y (number)
	         = (number) y
	        \*/
	        matrixproto.y = function (x, y) {
	            return x * this.b + y * this.d + this.f;
	        };
	        matrixproto.get = function (i) {
	            return +this[Str.fromCharCode(97 + i)].toFixed(4);
	        };
	        matrixproto.toString = function () {
	            return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")";
	        };
	        matrixproto.offset = function () {
	            return [this.e.toFixed(4), this.f.toFixed(4)];
	        };
	        function norm(a) {
	            return a[0] * a[0] + a[1] * a[1];
	        }
	        function normalize(a) {
	            var mag = math.sqrt(norm(a));
	            a[0] && (a[0] /= mag);
	            a[1] && (a[1] /= mag);
	        }
	        /*\
	         * Matrix.determinant
	         [ method ]
	         **
	         * Finds determinant of the given matrix.
	         = (number) determinant
	        \*/
	        matrixproto.determinant = function () {
	            return this.a * this.d - this.b * this.c;
	        };
	        /*\
	         * Matrix.split
	         [ method ]
	         **
	         * Splits matrix into primitive transformations
	         = (object) in format:
	         o dx (number) translation by x
	         o dy (number) translation by y
	         o scalex (number) scale by x
	         o scaley (number) scale by y
	         o shear (number) shear
	         o rotate (number) rotation in deg
	         o isSimple (boolean) could it be represented via simple transformations
	        \*/
	        matrixproto.split = function () {
	            var out = {};
	            // translation
	            out.dx = this.e;
	            out.dy = this.f;
	
	            // scale and shear
	            var row = [[this.a, this.c], [this.b, this.d]];
	            out.scalex = math.sqrt(norm(row[0]));
	            normalize(row[0]);
	
	            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
	            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];
	
	            out.scaley = math.sqrt(norm(row[1]));
	            normalize(row[1]);
	            out.shear /= out.scaley;
	
	            if (this.determinant() < 0) {
	                out.scalex = -out.scalex;
	            }
	
	            // rotation
	            var sin = -row[0][1],
	                cos = row[1][1];
	            if (cos < 0) {
	                out.rotate = Snap.deg(math.acos(cos));
	                if (sin < 0) {
	                    out.rotate = 360 - out.rotate;
	                }
	            } else {
	                out.rotate = Snap.deg(math.asin(sin));
	            }
	
	            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
	            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
	            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
	            return out;
	        };
	        /*\
	         * Matrix.toTransformString
	         [ method ]
	         **
	         * Returns transform string that represents given matrix
	         = (string) transform string
	        \*/
	        matrixproto.toTransformString = function (shorter) {
	            var s = shorter || this.split();
	            if (!+s.shear.toFixed(9)) {
	                s.scalex = +s.scalex.toFixed(4);
	                s.scaley = +s.scaley.toFixed(4);
	                s.rotate = +s.rotate.toFixed(4);
	                return  (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
	                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
	                        (s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E);
	            } else {
	                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
	            }
	        };
	    })(Matrix.prototype);
	    /*\
	     * Snap.Matrix
	     [ method ]
	     **
	     * Matrix constructor, extend on your own risk.
	     * To create matrices use @Snap.matrix.
	    \*/
	    Snap.Matrix = Matrix;
	    /*\
	     * Snap.matrix
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns a matrix based on the given parameters
	     - a (number)
	     - b (number)
	     - c (number)
	     - d (number)
	     - e (number)
	     - f (number)
	     * or
	     - svgMatrix (SVGMatrix)
	     = (object) @Matrix
	    \*/
	    Snap.matrix = function (a, b, c, d, e, f) {
	        return new Matrix(a, b, c, d, e, f);
	    };
	});
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var has = "hasOwnProperty",
	        make = Snap._.make,
	        wrap = Snap._.wrap,
	        is = Snap.is,
	        getSomeDefs = Snap._.getSomeDefs,
	        reURLValue = /^url\(#?([^)]+)\)$/,
	        $ = Snap._.$,
	        URL = Snap.url,
	        Str = String,
	        separator = Snap._.separator,
	        E = "";
	    // Attributes event handlers
	    eve.on("snap.util.attr.mask", function (value) {
	        if (value instanceof Element || value instanceof Fragment) {
	            eve.stop();
	            if (value instanceof Fragment && value.node.childNodes.length == 1) {
	                value = value.node.firstChild;
	                getSomeDefs(this).appendChild(value);
	                value = wrap(value);
	            }
	            if (value.type == "mask") {
	                var mask = value;
	            } else {
	                mask = make("mask", getSomeDefs(this));
	                mask.node.appendChild(value.node);
	            }
	            !mask.node.id && $(mask.node, {
	                id: mask.id
	            });
	            $(this.node, {
	                mask: URL(mask.id)
	            });
	        }
	    });
	    (function (clipIt) {
	        eve.on("snap.util.attr.clip", clipIt);
	        eve.on("snap.util.attr.clip-path", clipIt);
	        eve.on("snap.util.attr.clipPath", clipIt);
	    }(function (value) {
	        if (value instanceof Element || value instanceof Fragment) {
	            eve.stop();
	            if (value.type == "clipPath") {
	                var clip = value;
	            } else {
	                clip = make("clipPath", getSomeDefs(this));
	                clip.node.appendChild(value.node);
	                !clip.node.id && $(clip.node, {
	                    id: clip.id
	                });
	            }
	            $(this.node, {
	                "clip-path": URL(clip.node.id || clip.id)
	            });
	        }
	    }));
	    function fillStroke(name) {
	        return function (value) {
	            eve.stop();
	            if (value instanceof Fragment && value.node.childNodes.length == 1 &&
	                (value.node.firstChild.tagName == "radialGradient" ||
	                value.node.firstChild.tagName == "linearGradient" ||
	                value.node.firstChild.tagName == "pattern")) {
	                value = value.node.firstChild;
	                getSomeDefs(this).appendChild(value);
	                value = wrap(value);
	            }
	            if (value instanceof Element) {
	                if (value.type == "radialGradient" || value.type == "linearGradient"
	                   || value.type == "pattern") {
	                    if (!value.node.id) {
	                        $(value.node, {
	                            id: value.id
	                        });
	                    }
	                    var fill = URL(value.node.id);
	                } else {
	                    fill = value.attr(name);
	                }
	            } else {
	                fill = Snap.color(value);
	                if (fill.error) {
	                    var grad = Snap(getSomeDefs(this).ownerSVGElement).gradient(value);
	                    if (grad) {
	                        if (!grad.node.id) {
	                            $(grad.node, {
	                                id: grad.id
	                            });
	                        }
	                        fill = URL(grad.node.id);
	                    } else {
	                        fill = value;
	                    }
	                } else {
	                    fill = Str(fill);
	                }
	            }
	            var attrs = {};
	            attrs[name] = fill;
	            $(this.node, attrs);
	            this.node.style[name] = E;
	        };
	    }
	    eve.on("snap.util.attr.fill", fillStroke("fill"));
	    eve.on("snap.util.attr.stroke", fillStroke("stroke"));
	    var gradrg = /^([lr])(?:\(([^)]*)\))?(.*)$/i;
	    eve.on("snap.util.grad.parse", function parseGrad(string) {
	        string = Str(string);
	        var tokens = string.match(gradrg);
	        if (!tokens) {
	            return null;
	        }
	        var type = tokens[1],
	            params = tokens[2],
	            stops = tokens[3];
	        params = params.split(/\s*,\s*/).map(function (el) {
	            return +el == el ? +el : el;
	        });
	        if (params.length == 1 && params[0] == 0) {
	            params = [];
	        }
	        stops = stops.split("-");
	        stops = stops.map(function (el) {
	            el = el.split(":");
	            var out = {
	                color: el[0]
	            };
	            if (el[1]) {
	                out.offset = parseFloat(el[1]);
	            }
	            return out;
	        });
	        return {
	            type: type,
	            params: params,
	            stops: stops
	        };
	    });
	
	    eve.on("snap.util.attr.d", function (value) {
	        eve.stop();
	        if (is(value, "array") && is(value[0], "array")) {
	            value = Snap.path.toString.call(value);
	        }
	        value = Str(value);
	        if (value.match(/[ruo]/i)) {
	            value = Snap.path.toAbsolute(value);
	        }
	        $(this.node, {d: value});
	    })(-1);
	    eve.on("snap.util.attr.#text", function (value) {
	        eve.stop();
	        value = Str(value);
	        var txt = glob.doc.createTextNode(value);
	        while (this.node.firstChild) {
	            this.node.removeChild(this.node.firstChild);
	        }
	        this.node.appendChild(txt);
	    })(-1);
	    eve.on("snap.util.attr.path", function (value) {
	        eve.stop();
	        this.attr({d: value});
	    })(-1);
	    eve.on("snap.util.attr.class", function (value) {
	        eve.stop();
	        this.node.className.baseVal = value;
	    })(-1);
	    eve.on("snap.util.attr.viewBox", function (value) {
	        var vb;
	        if (is(value, "object") && "x" in value) {
	            vb = [value.x, value.y, value.width, value.height].join(" ");
	        } else if (is(value, "array")) {
	            vb = value.join(" ");
	        } else {
	            vb = value;
	        }
	        $(this.node, {
	            viewBox: vb
	        });
	        eve.stop();
	    })(-1);
	    eve.on("snap.util.attr.transform", function (value) {
	        this.transform(value);
	        eve.stop();
	    })(-1);
	    eve.on("snap.util.attr.r", function (value) {
	        if (this.type == "rect") {
	            eve.stop();
	            $(this.node, {
	                rx: value,
	                ry: value
	            });
	        }
	    })(-1);
	    eve.on("snap.util.attr.textpath", function (value) {
	        eve.stop();
	        if (this.type == "text") {
	            var id, tp, node;
	            if (!value && this.textPath) {
	                tp = this.textPath;
	                while (tp.node.firstChild) {
	                    this.node.appendChild(tp.node.firstChild);
	                }
	                tp.remove();
	                delete this.textPath;
	                return;
	            }
	            if (is(value, "string")) {
	                var defs = getSomeDefs(this),
	                    path = wrap(defs.parentNode).path(value);
	                defs.appendChild(path.node);
	                id = path.id;
	                path.attr({id: id});
	            } else {
	                value = wrap(value);
	                if (value instanceof Element) {
	                    id = value.attr("id");
	                    if (!id) {
	                        id = value.id;
	                        value.attr({id: id});
	                    }
	                }
	            }
	            if (id) {
	                tp = this.textPath;
	                node = this.node;
	                if (tp) {
	                    tp.attr({"xlink:href": "#" + id});
	                } else {
	                    tp = $("textPath", {
	                        "xlink:href": "#" + id
	                    });
	                    while (node.firstChild) {
	                        tp.appendChild(node.firstChild);
	                    }
	                    node.appendChild(tp);
	                    this.textPath = wrap(tp);
	                }
	            }
	        }
	    })(-1);
	    eve.on("snap.util.attr.text", function (value) {
	        if (this.type == "text") {
	            var i = 0,
	                node = this.node,
	                tuner = function (chunk) {
	                    var out = $("tspan");
	                    if (is(chunk, "array")) {
	                        for (var i = 0; i < chunk.length; i++) {
	                            out.appendChild(tuner(chunk[i]));
	                        }
	                    } else {
	                        out.appendChild(glob.doc.createTextNode(chunk));
	                    }
	                    out.normalize && out.normalize();
	                    return out;
	                };
	            while (node.firstChild) {
	                node.removeChild(node.firstChild);
	            }
	            var tuned = tuner(value);
	            while (tuned.firstChild) {
	                node.appendChild(tuned.firstChild);
	            }
	        }
	        eve.stop();
	    })(-1);
	    function setFontSize(value) {
	        eve.stop();
	        if (value == +value) {
	            value += "px";
	        }
	        this.node.style.fontSize = value;
	    }
	    eve.on("snap.util.attr.fontSize", setFontSize)(-1);
	    eve.on("snap.util.attr.font-size", setFontSize)(-1);
	
	
	    eve.on("snap.util.getattr.transform", function () {
	        eve.stop();
	        return this.transform();
	    })(-1);
	    eve.on("snap.util.getattr.textpath", function () {
	        eve.stop();
	        return this.textPath;
	    })(-1);
	    // Markers
	    (function () {
	        function getter(end) {
	            return function () {
	                eve.stop();
	                var style = glob.doc.defaultView.getComputedStyle(this.node, null).getPropertyValue("marker-" + end);
	                if (style == "none") {
	                    return style;
	                } else {
	                    return Snap(glob.doc.getElementById(style.match(reURLValue)[1]));
	                }
	            };
	        }
	        function setter(end) {
	            return function (value) {
	                eve.stop();
	                var name = "marker" + end.charAt(0).toUpperCase() + end.substring(1);
	                if (value == "" || !value) {
	                    this.node.style[name] = "none";
	                    return;
	                }
	                if (value.type == "marker") {
	                    var id = value.node.id;
	                    if (!id) {
	                        $(value.node, {id: value.id});
	                    }
	                    this.node.style[name] = URL(id);
	                    return;
	                }
	            };
	        }
	        eve.on("snap.util.getattr.marker-end", getter("end"))(-1);
	        eve.on("snap.util.getattr.markerEnd", getter("end"))(-1);
	        eve.on("snap.util.getattr.marker-start", getter("start"))(-1);
	        eve.on("snap.util.getattr.markerStart", getter("start"))(-1);
	        eve.on("snap.util.getattr.marker-mid", getter("mid"))(-1);
	        eve.on("snap.util.getattr.markerMid", getter("mid"))(-1);
	        eve.on("snap.util.attr.marker-end", setter("end"))(-1);
	        eve.on("snap.util.attr.markerEnd", setter("end"))(-1);
	        eve.on("snap.util.attr.marker-start", setter("start"))(-1);
	        eve.on("snap.util.attr.markerStart", setter("start"))(-1);
	        eve.on("snap.util.attr.marker-mid", setter("mid"))(-1);
	        eve.on("snap.util.attr.markerMid", setter("mid"))(-1);
	    }());
	    eve.on("snap.util.getattr.r", function () {
	        if (this.type == "rect" && $(this.node, "rx") == $(this.node, "ry")) {
	            eve.stop();
	            return $(this.node, "rx");
	        }
	    })(-1);
	    function textExtract(node) {
	        var out = [];
	        var children = node.childNodes;
	        for (var i = 0, ii = children.length; i < ii; i++) {
	            var chi = children[i];
	            if (chi.nodeType == 3) {
	                out.push(chi.nodeValue);
	            }
	            if (chi.tagName == "tspan") {
	                if (chi.childNodes.length == 1 && chi.firstChild.nodeType == 3) {
	                    out.push(chi.firstChild.nodeValue);
	                } else {
	                    out.push(textExtract(chi));
	                }
	            }
	        }
	        return out;
	    }
	    eve.on("snap.util.getattr.text", function () {
	        if (this.type == "text" || this.type == "tspan") {
	            eve.stop();
	            var out = textExtract(this.node);
	            return out.length == 1 ? out[0] : out;
	        }
	    })(-1);
	    eve.on("snap.util.getattr.#text", function () {
	        return this.node.textContent;
	    })(-1);
	    eve.on("snap.util.getattr.viewBox", function () {
	        eve.stop();
	        var vb = $(this.node, "viewBox");
	        if (vb) {
	            vb = vb.split(separator);
	            return Snap._.box(+vb[0], +vb[1], +vb[2], +vb[3]);
	        } else {
	            return;
	        }
	    })(-1);
	    eve.on("snap.util.getattr.points", function () {
	        var p = $(this.node, "points");
	        eve.stop();
	        if (p) {
	            return p.split(separator);
	        } else {
	            return;
	        }
	    })(-1);
	    eve.on("snap.util.getattr.path", function () {
	        var p = $(this.node, "d");
	        eve.stop();
	        return p;
	    })(-1);
	    eve.on("snap.util.getattr.class", function () {
	        return this.node.className.baseVal;
	    })(-1);
	    function getFontSize() {
	        eve.stop();
	        return this.node.style.fontSize;
	    }
	    eve.on("snap.util.getattr.fontSize", getFontSize)(-1);
	    eve.on("snap.util.getattr.font-size", getFontSize)(-1);
	});
	
	// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var rgNotSpace = /\S+/g,
	        rgBadSpace = /[\t\r\n\f]/g,
	        rgTrim = /(^\s+|\s+$)/g,
	        Str = String,
	        elproto = Element.prototype;
	    /*\
	     * Element.addClass
	     [ method ]
	     **
	     * Adds given class name or list of class names to the element.
	     - value (string) class name or space separated list of class names
	     **
	     = (Element) original element.
	    \*/
	    elproto.addClass = function (value) {
	        var classes = Str(value || "").match(rgNotSpace) || [],
	            elem = this.node,
	            className = elem.className.baseVal,
	            curClasses = className.match(rgNotSpace) || [],
	            j,
	            pos,
	            clazz,
	            finalValue;
	
	        if (classes.length) {
	            j = 0;
	            while ((clazz = classes[j++])) {
	                pos = curClasses.indexOf(clazz);
	                if (!~pos) {
	                    curClasses.push(clazz);
	                }
	            }
	
	            finalValue = curClasses.join(" ");
	            if (className != finalValue) {
	                elem.className.baseVal = finalValue;
	            }
	        }
	        return this;
	    };
	    /*\
	     * Element.removeClass
	     [ method ]
	     **
	     * Removes given class name or list of class names from the element.
	     - value (string) class name or space separated list of class names
	     **
	     = (Element) original element.
	    \*/
	    elproto.removeClass = function (value) {
	        var classes = Str(value || "").match(rgNotSpace) || [],
	            elem = this.node,
	            className = elem.className.baseVal,
	            curClasses = className.match(rgNotSpace) || [],
	            j,
	            pos,
	            clazz,
	            finalValue;
	        if (curClasses.length) {
	            j = 0;
	            while ((clazz = classes[j++])) {
	                pos = curClasses.indexOf(clazz);
	                if (~pos) {
	                    curClasses.splice(pos, 1);
	                }
	            }
	
	            finalValue = curClasses.join(" ");
	            if (className != finalValue) {
	                elem.className.baseVal = finalValue;
	            }
	        }
	        return this;
	    };
	    /*\
	     * Element.hasClass
	     [ method ]
	     **
	     * Checks if the element has a given class name in the list of class names applied to it.
	     - value (string) class name
	     **
	     = (boolean) `true` if the element has given class
	    \*/
	    elproto.hasClass = function (value) {
	        var elem = this.node,
	            className = elem.className.baseVal,
	            curClasses = className.match(rgNotSpace) || [];
	        return !!~curClasses.indexOf(value);
	    };
	    /*\
	     * Element.toggleClass
	     [ method ]
	     **
	     * Add or remove one or more classes from the element, depending on either
	     * the class’s presence or the value of the `flag` argument.
	     - value (string) class name or space separated list of class names
	     - flag (boolean) value to determine whether the class should be added or removed
	     **
	     = (Element) original element.
	    \*/
	    elproto.toggleClass = function (value, flag) {
	        if (flag != null) {
	            if (flag) {
	                return this.addClass(value);
	            } else {
	                return this.removeClass(value);
	            }
	        }
	        var classes = (value || "").match(rgNotSpace) || [],
	            elem = this.node,
	            className = elem.className.baseVal,
	            curClasses = className.match(rgNotSpace) || [],
	            j,
	            pos,
	            clazz,
	            finalValue;
	        j = 0;
	        while ((clazz = classes[j++])) {
	            pos = curClasses.indexOf(clazz);
	            if (~pos) {
	                curClasses.splice(pos, 1);
	            } else {
	                curClasses.push(clazz);
	            }
	        }
	
	        finalValue = curClasses.join(" ");
	        if (className != finalValue) {
	            elem.className.baseVal = finalValue;
	        }
	        return this;
	    };
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var operators = {
	            "+": function (x, y) {
	                    return x + y;
	                },
	            "-": function (x, y) {
	                    return x - y;
	                },
	            "/": function (x, y) {
	                    return x / y;
	                },
	            "*": function (x, y) {
	                    return x * y;
	                }
	        },
	        Str = String,
	        reUnit = /[a-z]+$/i,
	        reAddon = /^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;
	    function getNumber(val) {
	        return val;
	    }
	    function getUnit(unit) {
	        return function (val) {
	            return +val.toFixed(3) + unit;
	        };
	    }
	    eve.on("snap.util.attr", function (val) {
	        var plus = Str(val).match(reAddon);
	        if (plus) {
	            var evnt = eve.nt(),
	                name = evnt.substring(evnt.lastIndexOf(".") + 1),
	                a = this.attr(name),
	                atr = {};
	            eve.stop();
	            var unit = plus[3] || "",
	                aUnit = a.match(reUnit),
	                op = operators[plus[1]];
	            if (aUnit && aUnit == unit) {
	                val = op(parseFloat(a), +plus[2]);
	            } else {
	                a = this.asPX(name);
	                val = op(this.asPX(name), this.asPX(name, plus[2] + unit));
	            }
	            if (isNaN(a) || isNaN(val)) {
	                return;
	            }
	            atr[name] = val;
	            this.attr(atr);
	        }
	    })(-10);
	    eve.on("snap.util.equal", function (name, b) {
	        var A, B, a = Str(this.attr(name) || ""),
	            el = this,
	            bplus = Str(b).match(reAddon);
	        if (bplus) {
	            eve.stop();
	            var unit = bplus[3] || "",
	                aUnit = a.match(reUnit),
	                op = operators[bplus[1]];
	            if (aUnit && aUnit == unit) {
	                return {
	                    from: parseFloat(a),
	                    to: op(parseFloat(a), +bplus[2]),
	                    f: getUnit(aUnit)
	                };
	            } else {
	                a = this.asPX(name);
	                return {
	                    from: a,
	                    to: op(a, this.asPX(name, bplus[2] + unit)),
	                    f: getNumber
	                };
	            }
	        }
	    })(-10);
	});
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var proto = Paper.prototype,
	        is = Snap.is;
	    /*\
	     * Paper.rect
	     [ method ]
	     *
	     * Draws a rectangle
	     **
	     - x (number) x coordinate of the top left corner
	     - y (number) y coordinate of the top left corner
	     - width (number) width
	     - height (number) height
	     - rx (number) #optional horizontal radius for rounded corners, default is 0
	     - ry (number) #optional vertical radius for rounded corners, default is rx or 0
	     = (object) the `rect` element
	     **
	     > Usage
	     | // regular rectangle
	     | var c = paper.rect(10, 10, 50, 50);
	     | // rectangle with rounded corners
	     | var c = paper.rect(40, 40, 50, 50, 10);
	    \*/
	    proto.rect = function (x, y, w, h, rx, ry) {
	        var attr;
	        if (ry == null) {
	            ry = rx;
	        }
	        if (is(x, "object") && x == "[object Object]") {
	            attr = x;
	        } else if (x != null) {
	            attr = {
	                x: x,
	                y: y,
	                width: w,
	                height: h
	            };
	            if (rx != null) {
	                attr.rx = rx;
	                attr.ry = ry;
	            }
	        }
	        return this.el("rect", attr);
	    };
	    /*\
	     * Paper.circle
	     [ method ]
	     **
	     * Draws a circle
	     **
	     - x (number) x coordinate of the centre
	     - y (number) y coordinate of the centre
	     - r (number) radius
	     = (object) the `circle` element
	     **
	     > Usage
	     | var c = paper.circle(50, 50, 40);
	    \*/
	    proto.circle = function (cx, cy, r) {
	        var attr;
	        if (is(cx, "object") && cx == "[object Object]") {
	            attr = cx;
	        } else if (cx != null) {
	            attr = {
	                cx: cx,
	                cy: cy,
	                r: r
	            };
	        }
	        return this.el("circle", attr);
	    };
	
	    var preload = (function () {
	        function onerror() {
	            this.parentNode.removeChild(this);
	        }
	        return function (src, f) {
	            var img = glob.doc.createElement("img"),
	                body = glob.doc.body;
	            img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
	            img.onload = function () {
	                f.call(img);
	                img.onload = img.onerror = null;
	                body.removeChild(img);
	            };
	            img.onerror = onerror;
	            body.appendChild(img);
	            img.src = src;
	        };
	    }());
	
	    /*\
	     * Paper.image
	     [ method ]
	     **
	     * Places an image on the surface
	     **
	     - src (string) URI of the source image
	     - x (number) x offset position
	     - y (number) y offset position
	     - width (number) width of the image
	     - height (number) height of the image
	     = (object) the `image` element
	     * or
	     = (object) Snap element object with type `image`
	     **
	     > Usage
	     | var c = paper.image("apple.png", 10, 10, 80, 80);
	    \*/
	    proto.image = function (src, x, y, width, height) {
	        var el = this.el("image");
	        if (is(src, "object") && "src" in src) {
	            el.attr(src);
	        } else if (src != null) {
	            var set = {
	                "xlink:href": src,
	                preserveAspectRatio: "none"
	            };
	            if (x != null && y != null) {
	                set.x = x;
	                set.y = y;
	            }
	            if (width != null && height != null) {
	                set.width = width;
	                set.height = height;
	            } else {
	                preload(src, function () {
	                    Snap._.$(el.node, {
	                        width: this.offsetWidth,
	                        height: this.offsetHeight
	                    });
	                });
	            }
	            Snap._.$(el.node, set);
	        }
	        return el;
	    };
	    /*\
	     * Paper.ellipse
	     [ method ]
	     **
	     * Draws an ellipse
	     **
	     - x (number) x coordinate of the centre
	     - y (number) y coordinate of the centre
	     - rx (number) horizontal radius
	     - ry (number) vertical radius
	     = (object) the `ellipse` element
	     **
	     > Usage
	     | var c = paper.ellipse(50, 50, 40, 20);
	    \*/
	    proto.ellipse = function (cx, cy, rx, ry) {
	        var attr;
	        if (is(cx, "object") && cx == "[object Object]") {
	            attr = cx;
	        } else if (cx != null) {
	            attr ={
	                cx: cx,
	                cy: cy,
	                rx: rx,
	                ry: ry
	            };
	        }
	        return this.el("ellipse", attr);
	    };
	    // SIERRA Paper.path(): Unclear from the link what a Catmull-Rom curveto is, and why it would make life any easier.
	    /*\
	     * Paper.path
	     [ method ]
	     **
	     * Creates a `<path>` element using the given string as the path's definition
	     - pathString (string) #optional path string in SVG format
	     * Path string consists of one-letter commands, followed by comma seprarated arguments in numerical form. Example:
	     | "M10,20L30,40"
	     * This example features two commands: `M`, with arguments `(10, 20)` and `L` with arguments `(30, 40)`. Uppercase letter commands express coordinates in absolute terms, while lowercase commands express them in relative terms from the most recently declared coordinates.
	     *
	     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a> or <a href="https://developer.mozilla.org/en/SVG/Tutorial/Paths">article about path strings at MDN</a>.</p>
	     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
	     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
	     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
	     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
	     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
	     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
	     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
	     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
	     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
	     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
	     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
	     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
	     * * _Catmull-Rom curveto_ is a not standard SVG command and added to make life easier.
	     * Note: there is a special case when a path consists of only three commands: `M10,10R…z`. In this case the path connects back to its starting point.
	     > Usage
	     | var c = paper.path("M10 10L90 90");
	     | // draw a diagonal line:
	     | // move to 10,10, line to 90,90
	    \*/
	    proto.path = function (d) {
	        var attr;
	        if (is(d, "object") && !is(d, "array")) {
	            attr = d;
	        } else if (d) {
	            attr = {d: d};
	        }
	        return this.el("path", attr);
	    };
	    /*\
	     * Paper.g
	     [ method ]
	     **
	     * Creates a group element
	     **
	     - varargs (…) #optional elements to nest within the group
	     = (object) the `g` element
	     **
	     > Usage
	     | var c1 = paper.circle(),
	     |     c2 = paper.rect(),
	     |     g = paper.g(c2, c1); // note that the order of elements is different
	     * or
	     | var c1 = paper.circle(),
	     |     c2 = paper.rect(),
	     |     g = paper.g();
	     | g.add(c2, c1);
	    \*/
	    /*\
	     * Paper.group
	     [ method ]
	     **
	     * See @Paper.g
	    \*/
	    proto.group = proto.g = function (first) {
	        var attr,
	            el = this.el("g");
	        if (arguments.length == 1 && first && !first.type) {
	            el.attr(first);
	        } else if (arguments.length) {
	            el.add(Array.prototype.slice.call(arguments, 0));
	        }
	        return el;
	    };
	    /*\
	     * Paper.svg
	     [ method ]
	     **
	     * Creates a nested SVG element.
	     - x (number) @optional X of the element
	     - y (number) @optional Y of the element
	     - width (number) @optional width of the element
	     - height (number) @optional height of the element
	     - vbx (number) @optional viewbox X
	     - vby (number) @optional viewbox Y
	     - vbw (number) @optional viewbox width
	     - vbh (number) @optional viewbox height
	     **
	     = (object) the `svg` element
	     **
	    \*/
	    proto.svg = function (x, y, width, height, vbx, vby, vbw, vbh) {
	        var attrs = {};
	        if (is(x, "object") && y == null) {
	            attrs = x;
	        } else {
	            if (x != null) {
	                attrs.x = x;
	            }
	            if (y != null) {
	                attrs.y = y;
	            }
	            if (width != null) {
	                attrs.width = width;
	            }
	            if (height != null) {
	                attrs.height = height;
	            }
	            if (vbx != null && vby != null && vbw != null && vbh != null) {
	                attrs.viewBox = [vbx, vby, vbw, vbh];
	            }
	        }
	        return this.el("svg", attrs);
	    };
	    /*\
	     * Paper.mask
	     [ method ]
	     **
	     * Equivalent in behaviour to @Paper.g, except it’s a mask.
	     **
	     = (object) the `mask` element
	     **
	    \*/
	    proto.mask = function (first) {
	        var attr,
	            el = this.el("mask");
	        if (arguments.length == 1 && first && !first.type) {
	            el.attr(first);
	        } else if (arguments.length) {
	            el.add(Array.prototype.slice.call(arguments, 0));
	        }
	        return el;
	    };
	    /*\
	     * Paper.ptrn
	     [ method ]
	     **
	     * Equivalent in behaviour to @Paper.g, except it’s a pattern.
	     - x (number) @optional X of the element
	     - y (number) @optional Y of the element
	     - width (number) @optional width of the element
	     - height (number) @optional height of the element
	     - vbx (number) @optional viewbox X
	     - vby (number) @optional viewbox Y
	     - vbw (number) @optional viewbox width
	     - vbh (number) @optional viewbox height
	     **
	     = (object) the `pattern` element
	     **
	    \*/
	    proto.ptrn = function (x, y, width, height, vx, vy, vw, vh) {
	        if (is(x, "object")) {
	            var attr = x;
	        } else {
	            attr = {patternUnits: "userSpaceOnUse"};
	            if (x) {
	                attr.x = x;
	            }
	            if (y) {
	                attr.y = y;
	            }
	            if (width != null) {
	                attr.width = width;
	            }
	            if (height != null) {
	                attr.height = height;
	            }
	            if (vx != null && vy != null && vw != null && vh != null) {
	                attr.viewBox = [vx, vy, vw, vh];
	            } else {
	                attr.viewBox = [x || 0, y || 0, width || 0, height || 0];
	            }
	        }
	        return this.el("pattern", attr);
	    };
	    /*\
	     * Paper.use
	     [ method ]
	     **
	     * Creates a <use> element.
	     - id (string) @optional id of element to link
	     * or
	     - id (Element) @optional element to link
	     **
	     = (object) the `use` element
	     **
	    \*/
	    proto.use = function (id) {
	        if (id != null) {
	            if (id instanceof Element) {
	                if (!id.attr("id")) {
	                    id.attr({id: Snap._.id(id)});
	                }
	                id = id.attr("id");
	            }
	            if (String(id).charAt() == "#") {
	                id = id.substring(1);
	            }
	            return this.el("use", {"xlink:href": "#" + id});
	        } else {
	            return Element.prototype.use.call(this);
	        }
	    };
	    /*\
	     * Paper.symbol
	     [ method ]
	     **
	     * Creates a <symbol> element.
	     - vbx (number) @optional viewbox X
	     - vby (number) @optional viewbox Y
	     - vbw (number) @optional viewbox width
	     - vbh (number) @optional viewbox height
	     = (object) the `symbol` element
	     **
	    \*/
	    proto.symbol = function (vx, vy, vw, vh) {
	        var attr = {};
	        if (vx != null && vy != null && vw != null && vh != null) {
	            attr.viewBox = [vx, vy, vw, vh];
	        }
	
	        return this.el("symbol", attr);
	    };
	    /*\
	     * Paper.text
	     [ method ]
	     **
	     * Draws a text string
	     **
	     - x (number) x coordinate position
	     - y (number) y coordinate position
	     - text (string|array) The text string to draw or array of strings to nest within separate `<tspan>` elements
	     = (object) the `text` element
	     **
	     > Usage
	     | var t1 = paper.text(50, 50, "Snap");
	     | var t2 = paper.text(50, 50, ["S","n","a","p"]);
	     | // Text path usage
	     | t1.attr({textpath: "M10,10L100,100"});
	     | // or
	     | var pth = paper.path("M10,10L100,100");
	     | t1.attr({textpath: pth});
	    \*/
	    proto.text = function (x, y, text) {
	        var attr = {};
	        if (is(x, "object")) {
	            attr = x;
	        } else if (x != null) {
	            attr = {
	                x: x,
	                y: y,
	                text: text || ""
	            };
	        }
	        return this.el("text", attr);
	    };
	    /*\
	     * Paper.line
	     [ method ]
	     **
	     * Draws a line
	     **
	     - x1 (number) x coordinate position of the start
	     - y1 (number) y coordinate position of the start
	     - x2 (number) x coordinate position of the end
	     - y2 (number) y coordinate position of the end
	     = (object) the `line` element
	     **
	     > Usage
	     | var t1 = paper.line(50, 50, 100, 100);
	    \*/
	    proto.line = function (x1, y1, x2, y2) {
	        var attr = {};
	        if (is(x1, "object")) {
	            attr = x1;
	        } else if (x1 != null) {
	            attr = {
	                x1: x1,
	                x2: x2,
	                y1: y1,
	                y2: y2
	            };
	        }
	        return this.el("line", attr);
	    };
	    /*\
	     * Paper.polyline
	     [ method ]
	     **
	     * Draws a polyline
	     **
	     - points (array) array of points
	     * or
	     - varargs (…) points
	     = (object) the `polyline` element
	     **
	     > Usage
	     | var p1 = paper.polyline([10, 10, 100, 100]);
	     | var p2 = paper.polyline(10, 10, 100, 100);
	    \*/
	    proto.polyline = function (points) {
	        if (arguments.length > 1) {
	            points = Array.prototype.slice.call(arguments, 0);
	        }
	        var attr = {};
	        if (is(points, "object") && !is(points, "array")) {
	            attr = points;
	        } else if (points != null) {
	            attr = {points: points};
	        }
	        return this.el("polyline", attr);
	    };
	    /*\
	     * Paper.polygon
	     [ method ]
	     **
	     * Draws a polygon. See @Paper.polyline
	    \*/
	    proto.polygon = function (points) {
	        if (arguments.length > 1) {
	            points = Array.prototype.slice.call(arguments, 0);
	        }
	        var attr = {};
	        if (is(points, "object") && !is(points, "array")) {
	            attr = points;
	        } else if (points != null) {
	            attr = {points: points};
	        }
	        return this.el("polygon", attr);
	    };
	    // gradients
	    (function () {
	        var $ = Snap._.$;
	        // gradients' helpers
	        function Gstops() {
	            return this.selectAll("stop");
	        }
	        function GaddStop(color, offset) {
	            var stop = $("stop"),
	                attr = {
	                    offset: +offset + "%"
	                };
	            color = Snap.color(color);
	            attr["stop-color"] = color.hex;
	            if (color.opacity < 1) {
	                attr["stop-opacity"] = color.opacity;
	            }
	            $(stop, attr);
	            this.node.appendChild(stop);
	            return this;
	        }
	        function GgetBBox() {
	            if (this.type == "linearGradient") {
	                var x1 = $(this.node, "x1") || 0,
	                    x2 = $(this.node, "x2") || 1,
	                    y1 = $(this.node, "y1") || 0,
	                    y2 = $(this.node, "y2") || 0;
	                return Snap._.box(x1, y1, math.abs(x2 - x1), math.abs(y2 - y1));
	            } else {
	                var cx = this.node.cx || .5,
	                    cy = this.node.cy || .5,
	                    r = this.node.r || 0;
	                return Snap._.box(cx - r, cy - r, r * 2, r * 2);
	            }
	        }
	        function gradient(defs, str) {
	            var grad = eve("snap.util.grad.parse", null, str).firstDefined(),
	                el;
	            if (!grad) {
	                return null;
	            }
	            grad.params.unshift(defs);
	            if (grad.type.toLowerCase() == "l") {
	                el = gradientLinear.apply(0, grad.params);
	            } else {
	                el = gradientRadial.apply(0, grad.params);
	            }
	            if (grad.type != grad.type.toLowerCase()) {
	                $(el.node, {
	                    gradientUnits: "userSpaceOnUse"
	                });
	            }
	            var stops = grad.stops,
	                len = stops.length,
	                start = 0,
	                j = 0;
	            function seed(i, end) {
	                var step = (end - start) / (i - j);
	                for (var k = j; k < i; k++) {
	                    stops[k].offset = +(+start + step * (k - j)).toFixed(2);
	                }
	                j = i;
	                start = end;
	            }
	            len--;
	            for (var i = 0; i < len; i++) if ("offset" in stops[i]) {
	                seed(i, stops[i].offset);
	            }
	            stops[len].offset = stops[len].offset || 100;
	            seed(len, stops[len].offset);
	            for (i = 0; i <= len; i++) {
	                var stop = stops[i];
	                el.addStop(stop.color, stop.offset);
	            }
	            return el;
	        }
	        function gradientLinear(defs, x1, y1, x2, y2) {
	            var el = Snap._.make("linearGradient", defs);
	            el.stops = Gstops;
	            el.addStop = GaddStop;
	            el.getBBox = GgetBBox;
	            if (x1 != null) {
	                $(el.node, {
	                    x1: x1,
	                    y1: y1,
	                    x2: x2,
	                    y2: y2
	                });
	            }
	            return el;
	        }
	        function gradientRadial(defs, cx, cy, r, fx, fy) {
	            var el = Snap._.make("radialGradient", defs);
	            el.stops = Gstops;
	            el.addStop = GaddStop;
	            el.getBBox = GgetBBox;
	            if (cx != null) {
	                $(el.node, {
	                    cx: cx,
	                    cy: cy,
	                    r: r
	                });
	            }
	            if (fx != null && fy != null) {
	                $(el.node, {
	                    fx: fx,
	                    fy: fy
	                });
	            }
	            return el;
	        }
	        /*\
	         * Paper.gradient
	         [ method ]
	         **
	         * Creates a gradient element
	         **
	         - gradient (string) gradient descriptor
	         > Gradient Descriptor
	         * The gradient descriptor is an expression formatted as
	         * follows: `<type>(<coords>)<colors>`.  The `<type>` can be
	         * either linear or radial.  The uppercase `L` or `R` letters
	         * indicate absolute coordinates offset from the SVG surface.
	         * Lowercase `l` or `r` letters indicate coordinates
	         * calculated relative to the element to which the gradient is
	         * applied.  Coordinates specify a linear gradient vector as
	         * `x1`, `y1`, `x2`, `y2`, or a radial gradient as `cx`, `cy`,
	         * `r` and optional `fx`, `fy` specifying a focal point away
	         * from the center of the circle. Specify `<colors>` as a list
	         * of dash-separated CSS color values.  Each color may be
	         * followed by a custom offset value, separated with a colon
	         * character.
	         > Examples
	         * Linear gradient, relative from top-left corner to bottom-right
	         * corner, from black through red to white:
	         | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
	         * Linear gradient, absolute from (0, 0) to (100, 100), from black
	         * through red at 25% to white:
	         | var g = paper.gradient("L(0, 0, 100, 100)#000-#f00:25-#fff");
	         * Radial gradient, relative from the center of the element with radius
	         * half the width, from black to white:
	         | var g = paper.gradient("r(0.5, 0.5, 0.5)#000-#fff");
	         * To apply the gradient:
	         | paper.circle(50, 50, 40).attr({
	         |     fill: g
	         | });
	         = (object) the `gradient` element
	        \*/
	        proto.gradient = function (str) {
	            return gradient(this.defs, str);
	        };
	        proto.gradientLinear = function (x1, y1, x2, y2) {
	            return gradientLinear(this.defs, x1, y1, x2, y2);
	        };
	        proto.gradientRadial = function (cx, cy, r, fx, fy) {
	            return gradientRadial(this.defs, cx, cy, r, fx, fy);
	        };
	        /*\
	         * Paper.toString
	         [ method ]
	         **
	         * Returns SVG code for the @Paper
	         = (string) SVG code for the @Paper
	        \*/
	        proto.toString = function () {
	            var doc = this.node.ownerDocument,
	                f = doc.createDocumentFragment(),
	                d = doc.createElement("div"),
	                svg = this.node.cloneNode(true),
	                res;
	            f.appendChild(d);
	            d.appendChild(svg);
	            Snap._.$(svg, {xmlns: "http://www.w3.org/2000/svg"});
	            res = d.innerHTML;
	            f.removeChild(f.firstChild);
	            return res;
	        };
	        /*\
	         * Paper.toDataURL
	         [ method ]
	         **
	         * Returns SVG code for the @Paper as Data URI string.
	         = (string) Data URI string
	        \*/
	        proto.toDataURL = function () {
	            if (window && window.btoa) {
	                return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(this)));
	            }
	        };
	        /*\
	         * Paper.clear
	         [ method ]
	         **
	         * Removes all child nodes of the paper, except <defs>.
	        \*/
	        proto.clear = function () {
	            var node = this.node.firstChild,
	                next;
	            while (node) {
	                next = node.nextSibling;
	                if (node.tagName != "defs") {
	                    node.parentNode.removeChild(node);
	                } else {
	                    proto.clear.call({node: node});
	                }
	                node = next;
	            }
	        };
	    }());
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob) {
	    var elproto = Element.prototype,
	        is = Snap.is,
	        clone = Snap._.clone,
	        has = "hasOwnProperty",
	        p2s = /,?([a-z]),?/gi,
	        toFloat = parseFloat,
	        math = Math,
	        PI = math.PI,
	        mmin = math.min,
	        mmax = math.max,
	        pow = math.pow,
	        abs = math.abs;
	    function paths(ps) {
	        var p = paths.ps = paths.ps || {};
	        if (p[ps]) {
	            p[ps].sleep = 100;
	        } else {
	            p[ps] = {
	                sleep: 100
	            };
	        }
	        setTimeout(function () {
	            for (var key in p) if (p[has](key) && key != ps) {
	                p[key].sleep--;
	                !p[key].sleep && delete p[key];
	            }
	        });
	        return p[ps];
	    }
	    function box(x, y, width, height) {
	        if (x == null) {
	            x = y = width = height = 0;
	        }
	        if (y == null) {
	            y = x.y;
	            width = x.width;
	            height = x.height;
	            x = x.x;
	        }
	        return {
	            x: x,
	            y: y,
	            width: width,
	            w: width,
	            height: height,
	            h: height,
	            x2: x + width,
	            y2: y + height,
	            cx: x + width / 2,
	            cy: y + height / 2,
	            r1: math.min(width, height) / 2,
	            r2: math.max(width, height) / 2,
	            r0: math.sqrt(width * width + height * height) / 2,
	            path: rectPath(x, y, width, height),
	            vb: [x, y, width, height].join(" ")
	        };
	    }
	    function toString() {
	        return this.join(",").replace(p2s, "$1");
	    }
	    function pathClone(pathArray) {
	        var res = clone(pathArray);
	        res.toString = toString;
	        return res;
	    }
	    function getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
	        if (length == null) {
	            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
	        } else {
	            return findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y,
	                getTotLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
	        }
	    }
	    function getLengthFactory(istotal, subpath) {
	        function O(val) {
	            return +(+val).toFixed(3);
	        }
	        return Snap._.cacher(function (path, length, onlystart) {
	            if (path instanceof Element) {
	                path = path.attr("d");
	            }
	            path = path2curve(path);
	            var x, y, p, l, sp = "", subpaths = {}, point,
	                len = 0;
	            for (var i = 0, ii = path.length; i < ii; i++) {
	                p = path[i];
	                if (p[0] == "M") {
	                    x = +p[1];
	                    y = +p[2];
	                } else {
	                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
	                    if (len + l > length) {
	                        if (subpath && !subpaths.start) {
	                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
	                            sp += [
	                                "C" + O(point.start.x),
	                                O(point.start.y),
	                                O(point.m.x),
	                                O(point.m.y),
	                                O(point.x),
	                                O(point.y)
	                            ];
	                            if (onlystart) {return sp;}
	                            subpaths.start = sp;
	                            sp = [
	                                "M" + O(point.x),
	                                O(point.y) + "C" + O(point.n.x),
	                                O(point.n.y),
	                                O(point.end.x),
	                                O(point.end.y),
	                                O(p[5]),
	                                O(p[6])
	                            ].join();
	                            len += l;
	                            x = +p[5];
	                            y = +p[6];
	                            continue;
	                        }
	                        if (!istotal && !subpath) {
	                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
	                            return point;
	                        }
	                    }
	                    len += l;
	                    x = +p[5];
	                    y = +p[6];
	                }
	                sp += p.shift() + p;
	            }
	            subpaths.end = sp;
	            point = istotal ? len : subpath ? subpaths : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
	            return point;
	        }, null, Snap._.clone);
	    }
	    var getTotalLength = getLengthFactory(1),
	        getPointAtLength = getLengthFactory(),
	        getSubpathsAtLength = getLengthFactory(0, 1);
	    function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
	        var t1 = 1 - t,
	            t13 = pow(t1, 3),
	            t12 = pow(t1, 2),
	            t2 = t * t,
	            t3 = t2 * t,
	            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
	            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
	            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
	            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
	            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
	            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
	            ax = t1 * p1x + t * c1x,
	            ay = t1 * p1y + t * c1y,
	            cx = t1 * c2x + t * p2x,
	            cy = t1 * c2y + t * p2y,
	            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
	        // (mx > nx || my < ny) && (alpha += 180);
	        return {
	            x: x,
	            y: y,
	            m: {x: mx, y: my},
	            n: {x: nx, y: ny},
	            start: {x: ax, y: ay},
	            end: {x: cx, y: cy},
	            alpha: alpha
	        };
	    }
	    function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
	        if (!Snap.is(p1x, "array")) {
	            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
	        }
	        var bbox = curveDim.apply(null, p1x);
	        return box(
	            bbox.min.x,
	            bbox.min.y,
	            bbox.max.x - bbox.min.x,
	            bbox.max.y - bbox.min.y
	        );
	    }
	    function isPointInsideBBox(bbox, x, y) {
	        return  x >= bbox.x &&
	                x <= bbox.x + bbox.width &&
	                y >= bbox.y &&
	                y <= bbox.y + bbox.height;
	    }
	    function isBBoxIntersect(bbox1, bbox2) {
	        bbox1 = box(bbox1);
	        bbox2 = box(bbox2);
	        return isPointInsideBBox(bbox2, bbox1.x, bbox1.y)
	            || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y)
	            || isPointInsideBBox(bbox2, bbox1.x, bbox1.y2)
	            || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2)
	            || isPointInsideBBox(bbox1, bbox2.x, bbox2.y)
	            || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y)
	            || isPointInsideBBox(bbox1, bbox2.x, bbox2.y2)
	            || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2)
	            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x
	                || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
	            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y
	                || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
	    }
	    function base3(t, p1, p2, p3, p4) {
	        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
	            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
	        return t * t2 - 3 * p1 + 3 * p2;
	    }
	    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
	        if (z == null) {
	            z = 1;
	        }
	        z = z > 1 ? 1 : z < 0 ? 0 : z;
	        var z2 = z / 2,
	            n = 12,
	            Tvalues = [-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816],
	            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
	            sum = 0;
	        for (var i = 0; i < n; i++) {
	            var ct = z2 * Tvalues[i] + z2,
	                xbase = base3(ct, x1, x2, x3, x4),
	                ybase = base3(ct, y1, y2, y3, y4),
	                comb = xbase * xbase + ybase * ybase;
	            sum += Cvalues[i] * math.sqrt(comb);
	        }
	        return z2 * sum;
	    }
	    function getTotLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
	        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
	            return;
	        }
	        var t = 1,
	            step = t / 2,
	            t2 = t - step,
	            l,
	            e = .01;
	        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
	        while (abs(l - ll) > e) {
	            step /= 2;
	            t2 += (l < ll ? 1 : -1) * step;
	            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
	        }
	        return t2;
	    }
	    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
	        if (
	            mmax(x1, x2) < mmin(x3, x4) ||
	            mmin(x1, x2) > mmax(x3, x4) ||
	            mmax(y1, y2) < mmin(y3, y4) ||
	            mmin(y1, y2) > mmax(y3, y4)
	        ) {
	            return;
	        }
	        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
	            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
	            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	
	        if (!denominator) {
	            return;
	        }
	        var px = nx / denominator,
	            py = ny / denominator,
	            px2 = +px.toFixed(2),
	            py2 = +py.toFixed(2);
	        if (
	            px2 < +mmin(x1, x2).toFixed(2) ||
	            px2 > +mmax(x1, x2).toFixed(2) ||
	            px2 < +mmin(x3, x4).toFixed(2) ||
	            px2 > +mmax(x3, x4).toFixed(2) ||
	            py2 < +mmin(y1, y2).toFixed(2) ||
	            py2 > +mmax(y1, y2).toFixed(2) ||
	            py2 < +mmin(y3, y4).toFixed(2) ||
	            py2 > +mmax(y3, y4).toFixed(2)
	        ) {
	            return;
	        }
	        return {x: px, y: py};
	    }
	    function inter(bez1, bez2) {
	        return interHelper(bez1, bez2);
	    }
	    function interCount(bez1, bez2) {
	        return interHelper(bez1, bez2, 1);
	    }
	    function interHelper(bez1, bez2, justCount) {
	        var bbox1 = bezierBBox(bez1),
	            bbox2 = bezierBBox(bez2);
	        if (!isBBoxIntersect(bbox1, bbox2)) {
	            return justCount ? 0 : [];
	        }
	        var l1 = bezlen.apply(0, bez1),
	            l2 = bezlen.apply(0, bez2),
	            n1 = ~~(l1 / 8),
	            n2 = ~~(l2 / 8),
	            dots1 = [],
	            dots2 = [],
	            xy = {},
	            res = justCount ? 0 : [];
	        for (var i = 0; i < n1 + 1; i++) {
	            var p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
	            dots1.push({x: p.x, y: p.y, t: i / n1});
	        }
	        for (i = 0; i < n2 + 1; i++) {
	            p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
	            dots2.push({x: p.x, y: p.y, t: i / n2});
	        }
	        for (i = 0; i < n1; i++) {
	            for (var j = 0; j < n2; j++) {
	                var di = dots1[i],
	                    di1 = dots1[i + 1],
	                    dj = dots2[j],
	                    dj1 = dots2[j + 1],
	                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
	                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
	                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
	                if (is) {
	                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
	                        continue;
	                    }
	                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
	                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
	                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
	                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
	                        if (justCount) {
	                            res++;
	                        } else {
	                            res.push({
	                                x: is.x,
	                                y: is.y,
	                                t1: t1,
	                                t2: t2
	                            });
	                        }
	                    }
	                }
	            }
	        }
	        return res;
	    }
	    function pathIntersection(path1, path2) {
	        return interPathHelper(path1, path2);
	    }
	    function pathIntersectionNumber(path1, path2) {
	        return interPathHelper(path1, path2, 1);
	    }
	    function interPathHelper(path1, path2, justCount) {
	        path1 = path2curve(path1);
	        path2 = path2curve(path2);
	        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
	            res = justCount ? 0 : [];
	        for (var i = 0, ii = path1.length; i < ii; i++) {
	            var pi = path1[i];
	            if (pi[0] == "M") {
	                x1 = x1m = pi[1];
	                y1 = y1m = pi[2];
	            } else {
	                if (pi[0] == "C") {
	                    bez1 = [x1, y1].concat(pi.slice(1));
	                    x1 = bez1[6];
	                    y1 = bez1[7];
	                } else {
	                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
	                    x1 = x1m;
	                    y1 = y1m;
	                }
	                for (var j = 0, jj = path2.length; j < jj; j++) {
	                    var pj = path2[j];
	                    if (pj[0] == "M") {
	                        x2 = x2m = pj[1];
	                        y2 = y2m = pj[2];
	                    } else {
	                        if (pj[0] == "C") {
	                            bez2 = [x2, y2].concat(pj.slice(1));
	                            x2 = bez2[6];
	                            y2 = bez2[7];
	                        } else {
	                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
	                            x2 = x2m;
	                            y2 = y2m;
	                        }
	                        var intr = interHelper(bez1, bez2, justCount);
	                        if (justCount) {
	                            res += intr;
	                        } else {
	                            for (var k = 0, kk = intr.length; k < kk; k++) {
	                                intr[k].segment1 = i;
	                                intr[k].segment2 = j;
	                                intr[k].bez1 = bez1;
	                                intr[k].bez2 = bez2;
	                            }
	                            res = res.concat(intr);
	                        }
	                    }
	                }
	            }
	        }
	        return res;
	    }
	    function isPointInsidePath(path, x, y) {
	        var bbox = pathBBox(path);
	        return isPointInsideBBox(bbox, x, y) &&
	               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
	    }
	    function pathBBox(path) {
	        var pth = paths(path);
	        if (pth.bbox) {
	            return clone(pth.bbox);
	        }
	        if (!path) {
	            return box();
	        }
	        path = path2curve(path);
	        var x = 0,
	            y = 0,
	            X = [],
	            Y = [],
	            p;
	        for (var i = 0, ii = path.length; i < ii; i++) {
	            p = path[i];
	            if (p[0] == "M") {
	                x = p[1];
	                y = p[2];
	                X.push(x);
	                Y.push(y);
	            } else {
	                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
	                X = X.concat(dim.min.x, dim.max.x);
	                Y = Y.concat(dim.min.y, dim.max.y);
	                x = p[5];
	                y = p[6];
	            }
	        }
	        var xmin = mmin.apply(0, X),
	            ymin = mmin.apply(0, Y),
	            xmax = mmax.apply(0, X),
	            ymax = mmax.apply(0, Y),
	            bb = box(xmin, ymin, xmax - xmin, ymax - ymin);
	        pth.bbox = clone(bb);
	        return bb;
	    }
	    function rectPath(x, y, w, h, r) {
	        if (r) {
	            return [
	                ["M", +x + (+r), y],
	                ["l", w - r * 2, 0],
	                ["a", r, r, 0, 0, 1, r, r],
	                ["l", 0, h - r * 2],
	                ["a", r, r, 0, 0, 1, -r, r],
	                ["l", r * 2 - w, 0],
	                ["a", r, r, 0, 0, 1, -r, -r],
	                ["l", 0, r * 2 - h],
	                ["a", r, r, 0, 0, 1, r, -r],
	                ["z"]
	            ];
	        }
	        var res = [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
	        res.toString = toString;
	        return res;
	    }
	    function ellipsePath(x, y, rx, ry, a) {
	        if (a == null && ry == null) {
	            ry = rx;
	        }
	        x = +x;
	        y = +y;
	        rx = +rx;
	        ry = +ry;
	        if (a != null) {
	            var rad = Math.PI / 180,
	                x1 = x + rx * Math.cos(-ry * rad),
	                x2 = x + rx * Math.cos(-a * rad),
	                y1 = y + rx * Math.sin(-ry * rad),
	                y2 = y + rx * Math.sin(-a * rad),
	                res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
	        } else {
	            res = [
	                ["M", x, y],
	                ["m", 0, -ry],
	                ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
	                ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
	                ["z"]
	            ];
	        }
	        res.toString = toString;
	        return res;
	    }
	    var unit2px = Snap._unit2px,
	        getPath = {
	        path: function (el) {
	            return el.attr("path");
	        },
	        circle: function (el) {
	            var attr = unit2px(el);
	            return ellipsePath(attr.cx, attr.cy, attr.r);
	        },
	        ellipse: function (el) {
	            var attr = unit2px(el);
	            return ellipsePath(attr.cx || 0, attr.cy || 0, attr.rx, attr.ry);
	        },
	        rect: function (el) {
	            var attr = unit2px(el);
	            return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height, attr.rx, attr.ry);
	        },
	        image: function (el) {
	            var attr = unit2px(el);
	            return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height);
	        },
	        line: function (el) {
	            return "M" + [el.attr("x1") || 0, el.attr("y1") || 0, el.attr("x2"), el.attr("y2")];
	        },
	        polyline: function (el) {
	            return "M" + el.attr("points");
	        },
	        polygon: function (el) {
	            return "M" + el.attr("points") + "z";
	        },
	        deflt: function (el) {
	            var bbox = el.node.getBBox();
	            return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
	        }
	    };
	    function pathToRelative(pathArray) {
	        var pth = paths(pathArray),
	            lowerCase = String.prototype.toLowerCase;
	        if (pth.rel) {
	            return pathClone(pth.rel);
	        }
	        if (!Snap.is(pathArray, "array") || !Snap.is(pathArray && pathArray[0], "array")) {
	            pathArray = Snap.parsePathString(pathArray);
	        }
	        var res = [],
	            x = 0,
	            y = 0,
	            mx = 0,
	            my = 0,
	            start = 0;
	        if (pathArray[0][0] == "M") {
	            x = pathArray[0][1];
	            y = pathArray[0][2];
	            mx = x;
	            my = y;
	            start++;
	            res.push(["M", x, y]);
	        }
	        for (var i = start, ii = pathArray.length; i < ii; i++) {
	            var r = res[i] = [],
	                pa = pathArray[i];
	            if (pa[0] != lowerCase.call(pa[0])) {
	                r[0] = lowerCase.call(pa[0]);
	                switch (r[0]) {
	                    case "a":
	                        r[1] = pa[1];
	                        r[2] = pa[2];
	                        r[3] = pa[3];
	                        r[4] = pa[4];
	                        r[5] = pa[5];
	                        r[6] = +(pa[6] - x).toFixed(3);
	                        r[7] = +(pa[7] - y).toFixed(3);
	                        break;
	                    case "v":
	                        r[1] = +(pa[1] - y).toFixed(3);
	                        break;
	                    case "m":
	                        mx = pa[1];
	                        my = pa[2];
	                    default:
	                        for (var j = 1, jj = pa.length; j < jj; j++) {
	                            r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
	                        }
	                }
	            } else {
	                r = res[i] = [];
	                if (pa[0] == "m") {
	                    mx = pa[1] + x;
	                    my = pa[2] + y;
	                }
	                for (var k = 0, kk = pa.length; k < kk; k++) {
	                    res[i][k] = pa[k];
	                }
	            }
	            var len = res[i].length;
	            switch (res[i][0]) {
	                case "z":
	                    x = mx;
	                    y = my;
	                    break;
	                case "h":
	                    x += +res[i][len - 1];
	                    break;
	                case "v":
	                    y += +res[i][len - 1];
	                    break;
	                default:
	                    x += +res[i][len - 2];
	                    y += +res[i][len - 1];
	            }
	        }
	        res.toString = toString;
	        pth.rel = pathClone(res);
	        return res;
	    }
	    function pathToAbsolute(pathArray) {
	        var pth = paths(pathArray);
	        if (pth.abs) {
	            return pathClone(pth.abs);
	        }
	        if (!is(pathArray, "array") || !is(pathArray && pathArray[0], "array")) { // rough assumption
	            pathArray = Snap.parsePathString(pathArray);
	        }
	        if (!pathArray || !pathArray.length) {
	            return [["M", 0, 0]];
	        }
	        var res = [],
	            x = 0,
	            y = 0,
	            mx = 0,
	            my = 0,
	            start = 0,
	            pa0;
	        if (pathArray[0][0] == "M") {
	            x = +pathArray[0][1];
	            y = +pathArray[0][2];
	            mx = x;
	            my = y;
	            start++;
	            res[0] = ["M", x, y];
	        }
	        var crz = pathArray.length == 3 &&
	            pathArray[0][0] == "M" &&
	            pathArray[1][0].toUpperCase() == "R" &&
	            pathArray[2][0].toUpperCase() == "Z";
	        for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
	            res.push(r = []);
	            pa = pathArray[i];
	            pa0 = pa[0];
	            if (pa0 != pa0.toUpperCase()) {
	                r[0] = pa0.toUpperCase();
	                switch (r[0]) {
	                    case "A":
	                        r[1] = pa[1];
	                        r[2] = pa[2];
	                        r[3] = pa[3];
	                        r[4] = pa[4];
	                        r[5] = pa[5];
	                        r[6] = +pa[6] + x;
	                        r[7] = +pa[7] + y;
	                        break;
	                    case "V":
	                        r[1] = +pa[1] + y;
	                        break;
	                    case "H":
	                        r[1] = +pa[1] + x;
	                        break;
	                    case "R":
	                        var dots = [x, y].concat(pa.slice(1));
	                        for (var j = 2, jj = dots.length; j < jj; j++) {
	                            dots[j] = +dots[j] + x;
	                            dots[++j] = +dots[j] + y;
	                        }
	                        res.pop();
	                        res = res.concat(catmullRom2bezier(dots, crz));
	                        break;
	                    case "O":
	                        res.pop();
	                        dots = ellipsePath(x, y, pa[1], pa[2]);
	                        dots.push(dots[0]);
	                        res = res.concat(dots);
	                        break;
	                    case "U":
	                        res.pop();
	                        res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
	                        r = ["U"].concat(res[res.length - 1].slice(-2));
	                        break;
	                    case "M":
	                        mx = +pa[1] + x;
	                        my = +pa[2] + y;
	                    default:
	                        for (j = 1, jj = pa.length; j < jj; j++) {
	                            r[j] = +pa[j] + ((j % 2) ? x : y);
	                        }
	                }
	            } else if (pa0 == "R") {
	                dots = [x, y].concat(pa.slice(1));
	                res.pop();
	                res = res.concat(catmullRom2bezier(dots, crz));
	                r = ["R"].concat(pa.slice(-2));
	            } else if (pa0 == "O") {
	                res.pop();
	                dots = ellipsePath(x, y, pa[1], pa[2]);
	                dots.push(dots[0]);
	                res = res.concat(dots);
	            } else if (pa0 == "U") {
	                res.pop();
	                res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
	                r = ["U"].concat(res[res.length - 1].slice(-2));
	            } else {
	                for (var k = 0, kk = pa.length; k < kk; k++) {
	                    r[k] = pa[k];
	                }
	            }
	            pa0 = pa0.toUpperCase();
	            if (pa0 != "O") {
	                switch (r[0]) {
	                    case "Z":
	                        x = +mx;
	                        y = +my;
	                        break;
	                    case "H":
	                        x = r[1];
	                        break;
	                    case "V":
	                        y = r[1];
	                        break;
	                    case "M":
	                        mx = r[r.length - 2];
	                        my = r[r.length - 1];
	                    default:
	                        x = r[r.length - 2];
	                        y = r[r.length - 1];
	                }
	            }
	        }
	        res.toString = toString;
	        pth.abs = pathClone(res);
	        return res;
	    }
	    function l2c(x1, y1, x2, y2) {
	        return [x1, y1, x2, y2, x2, y2];
	    }
	    function q2c(x1, y1, ax, ay, x2, y2) {
	        var _13 = 1 / 3,
	            _23 = 2 / 3;
	        return [
	                _13 * x1 + _23 * ax,
	                _13 * y1 + _23 * ay,
	                _13 * x2 + _23 * ax,
	                _13 * y2 + _23 * ay,
	                x2,
	                y2
	            ];
	    }
	    function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
	        // for more information of where this math came from visit:
	        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
	        var _120 = PI * 120 / 180,
	            rad = PI / 180 * (+angle || 0),
	            res = [],
	            xy,
	            rotate = Snap._.cacher(function (x, y, rad) {
	                var X = x * math.cos(rad) - y * math.sin(rad),
	                    Y = x * math.sin(rad) + y * math.cos(rad);
	                return {x: X, y: Y};
	            });
	        if (!recursive) {
	            xy = rotate(x1, y1, -rad);
	            x1 = xy.x;
	            y1 = xy.y;
	            xy = rotate(x2, y2, -rad);
	            x2 = xy.x;
	            y2 = xy.y;
	            var cos = math.cos(PI / 180 * angle),
	                sin = math.sin(PI / 180 * angle),
	                x = (x1 - x2) / 2,
	                y = (y1 - y2) / 2;
	            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
	            if (h > 1) {
	                h = math.sqrt(h);
	                rx = h * rx;
	                ry = h * ry;
	            }
	            var rx2 = rx * rx,
	                ry2 = ry * ry,
	                k = (large_arc_flag == sweep_flag ? -1 : 1) *
	                    math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
	                cx = k * rx * y / ry + (x1 + x2) / 2,
	                cy = k * -ry * x / rx + (y1 + y2) / 2,
	                f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
	                f2 = math.asin(((y2 - cy) / ry).toFixed(9));
	
	            f1 = x1 < cx ? PI - f1 : f1;
	            f2 = x2 < cx ? PI - f2 : f2;
	            f1 < 0 && (f1 = PI * 2 + f1);
	            f2 < 0 && (f2 = PI * 2 + f2);
	            if (sweep_flag && f1 > f2) {
	                f1 = f1 - PI * 2;
	            }
	            if (!sweep_flag && f2 > f1) {
	                f2 = f2 - PI * 2;
	            }
	        } else {
	            f1 = recursive[0];
	            f2 = recursive[1];
	            cx = recursive[2];
	            cy = recursive[3];
	        }
	        var df = f2 - f1;
	        if (abs(df) > _120) {
	            var f2old = f2,
	                x2old = x2,
	                y2old = y2;
	            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
	            x2 = cx + rx * math.cos(f2);
	            y2 = cy + ry * math.sin(f2);
	            res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
	        }
	        df = f2 - f1;
	        var c1 = math.cos(f1),
	            s1 = math.sin(f1),
	            c2 = math.cos(f2),
	            s2 = math.sin(f2),
	            t = math.tan(df / 4),
	            hx = 4 / 3 * rx * t,
	            hy = 4 / 3 * ry * t,
	            m1 = [x1, y1],
	            m2 = [x1 + hx * s1, y1 - hy * c1],
	            m3 = [x2 + hx * s2, y2 - hy * c2],
	            m4 = [x2, y2];
	        m2[0] = 2 * m1[0] - m2[0];
	        m2[1] = 2 * m1[1] - m2[1];
	        if (recursive) {
	            return [m2, m3, m4].concat(res);
	        } else {
	            res = [m2, m3, m4].concat(res).join().split(",");
	            var newres = [];
	            for (var i = 0, ii = res.length; i < ii; i++) {
	                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
	            }
	            return newres;
	        }
	    }
	    function findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
	        var t1 = 1 - t;
	        return {
	            x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
	            y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
	        };
	    }
	
	    // Returns bounding box of cubic bezier curve.
	    // Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
	    // Original version: NISHIO Hirokazu
	    // Modifications: https://github.com/timo22345
	    function curveDim(x0, y0, x1, y1, x2, y2, x3, y3) {
	        var tvalues = [],
	            bounds = [[], []],
	            a, b, c, t, t1, t2, b2ac, sqrtb2ac;
	        for (var i = 0; i < 2; ++i) {
	            if (i == 0) {
	                b = 6 * x0 - 12 * x1 + 6 * x2;
	                a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
	                c = 3 * x1 - 3 * x0;
	            } else {
	                b = 6 * y0 - 12 * y1 + 6 * y2;
	                a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
	                c = 3 * y1 - 3 * y0;
	            }
	            if (abs(a) < 1e-12) {
	                if (abs(b) < 1e-12) {
	                    continue;
	                }
	                t = -c / b;
	                if (0 < t && t < 1) {
	                    tvalues.push(t);
	                }
	                continue;
	            }
	            b2ac = b * b - 4 * c * a;
	            sqrtb2ac = math.sqrt(b2ac);
	            if (b2ac < 0) {
	                continue;
	            }
	            t1 = (-b + sqrtb2ac) / (2 * a);
	            if (0 < t1 && t1 < 1) {
	                tvalues.push(t1);
	            }
	            t2 = (-b - sqrtb2ac) / (2 * a);
	            if (0 < t2 && t2 < 1) {
	                tvalues.push(t2);
	            }
	        }
	
	        var x, y, j = tvalues.length,
	            jlen = j,
	            mt;
	        while (j--) {
	            t = tvalues[j];
	            mt = 1 - t;
	            bounds[0][j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
	            bounds[1][j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
	        }
	
	        bounds[0][jlen] = x0;
	        bounds[1][jlen] = y0;
	        bounds[0][jlen + 1] = x3;
	        bounds[1][jlen + 1] = y3;
	        bounds[0].length = bounds[1].length = jlen + 2;
	
	
	        return {
	          min: {x: mmin.apply(0, bounds[0]), y: mmin.apply(0, bounds[1])},
	          max: {x: mmax.apply(0, bounds[0]), y: mmax.apply(0, bounds[1])}
	        };
	    }
	
	    function path2curve(path, path2) {
	        var pth = !path2 && paths(path);
	        if (!path2 && pth.curve) {
	            return pathClone(pth.curve);
	        }
	        var p = pathToAbsolute(path),
	            p2 = path2 && pathToAbsolute(path2),
	            attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
	            attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
	            processPath = function (path, d, pcom) {
	                var nx, ny;
	                if (!path) {
	                    return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
	                }
	                !(path[0] in {T: 1, Q: 1}) && (d.qx = d.qy = null);
	                switch (path[0]) {
	                    case "M":
	                        d.X = path[1];
	                        d.Y = path[2];
	                        break;
	                    case "A":
	                        path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
	                        break;
	                    case "S":
	                        if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
	                            nx = d.x * 2 - d.bx;          // And reflect the previous
	                            ny = d.y * 2 - d.by;          // command's control point relative to the current point.
	                        }
	                        else {                            // or some else or nothing
	                            nx = d.x;
	                            ny = d.y;
	                        }
	                        path = ["C", nx, ny].concat(path.slice(1));
	                        break;
	                    case "T":
	                        if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
	                            d.qx = d.x * 2 - d.qx;        // And make a reflection similar
	                            d.qy = d.y * 2 - d.qy;        // to case "S".
	                        }
	                        else {                            // or something else or nothing
	                            d.qx = d.x;
	                            d.qy = d.y;
	                        }
	                        path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
	                        break;
	                    case "Q":
	                        d.qx = path[1];
	                        d.qy = path[2];
	                        path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
	                        break;
	                    case "L":
	                        path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
	                        break;
	                    case "H":
	                        path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
	                        break;
	                    case "V":
	                        path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
	                        break;
	                    case "Z":
	                        path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
	                        break;
	                }
	                return path;
	            },
	            fixArc = function (pp, i) {
	                if (pp[i].length > 7) {
	                    pp[i].shift();
	                    var pi = pp[i];
	                    while (pi.length) {
	                        pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
	                        p2 && (pcoms2[i] = "A"); // the same as above
	                        pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
	                    }
	                    pp.splice(i, 1);
	                    ii = mmax(p.length, p2 && p2.length || 0);
	                }
	            },
	            fixM = function (path1, path2, a1, a2, i) {
	                if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
	                    path2.splice(i, 0, ["M", a2.x, a2.y]);
	                    a1.bx = 0;
	                    a1.by = 0;
	                    a1.x = path1[i][1];
	                    a1.y = path1[i][2];
	                    ii = mmax(p.length, p2 && p2.length || 0);
	                }
	            },
	            pcoms1 = [], // path commands of original path p
	            pcoms2 = [], // path commands of original path p2
	            pfirst = "", // temporary holder for original path command
	            pcom = ""; // holder for previous path command of original path
	        for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
	            p[i] && (pfirst = p[i][0]); // save current path command
	
	            if (pfirst != "C") // C is not saved yet, because it may be result of conversion
	            {
	                pcoms1[i] = pfirst; // Save current path command
	                i && ( pcom = pcoms1[i - 1]); // Get previous path command pcom
	            }
	            p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath
	
	            if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
	            // which may produce multiple C:s
	            // so we have to make sure that C is also C in original path
	
	            fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1
	
	            if (p2) { // the same procedures is done to p2
	                p2[i] && (pfirst = p2[i][0]);
	                if (pfirst != "C") {
	                    pcoms2[i] = pfirst;
	                    i && (pcom = pcoms2[i - 1]);
	                }
	                p2[i] = processPath(p2[i], attrs2, pcom);
	
	                if (pcoms2[i] != "A" && pfirst == "C") {
	                    pcoms2[i] = "C";
	                }
	
	                fixArc(p2, i);
	            }
	            fixM(p, p2, attrs, attrs2, i);
	            fixM(p2, p, attrs2, attrs, i);
	            var seg = p[i],
	                seg2 = p2 && p2[i],
	                seglen = seg.length,
	                seg2len = p2 && seg2.length;
	            attrs.x = seg[seglen - 2];
	            attrs.y = seg[seglen - 1];
	            attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
	            attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
	            attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
	            attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
	            attrs2.x = p2 && seg2[seg2len - 2];
	            attrs2.y = p2 && seg2[seg2len - 1];
	        }
	        if (!p2) {
	            pth.curve = pathClone(p);
	        }
	        return p2 ? [p, p2] : p;
	    }
	    function mapPath(path, matrix) {
	        if (!matrix) {
	            return path;
	        }
	        var x, y, i, j, ii, jj, pathi;
	        path = path2curve(path);
	        for (i = 0, ii = path.length; i < ii; i++) {
	            pathi = path[i];
	            for (j = 1, jj = pathi.length; j < jj; j += 2) {
	                x = matrix.x(pathi[j], pathi[j + 1]);
	                y = matrix.y(pathi[j], pathi[j + 1]);
	                pathi[j] = x;
	                pathi[j + 1] = y;
	            }
	        }
	        return path;
	    }
	
	    // http://schepers.cc/getting-to-the-point
	    function catmullRom2bezier(crp, z) {
	        var d = [];
	        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
	            var p = [
	                        {x: +crp[i - 2], y: +crp[i - 1]},
	                        {x: +crp[i],     y: +crp[i + 1]},
	                        {x: +crp[i + 2], y: +crp[i + 3]},
	                        {x: +crp[i + 4], y: +crp[i + 5]}
	                    ];
	            if (z) {
	                if (!i) {
	                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
	                } else if (iLen - 4 == i) {
	                    p[3] = {x: +crp[0], y: +crp[1]};
	                } else if (iLen - 2 == i) {
	                    p[2] = {x: +crp[0], y: +crp[1]};
	                    p[3] = {x: +crp[2], y: +crp[3]};
	                }
	            } else {
	                if (iLen - 4 == i) {
	                    p[3] = p[2];
	                } else if (!i) {
	                    p[0] = {x: +crp[i], y: +crp[i + 1]};
	                }
	            }
	            d.push(["C",
	                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
	                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
	                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
	                  (p[1].y + 6*p[2].y - p[3].y) / 6,
	                  p[2].x,
	                  p[2].y
	            ]);
	        }
	
	        return d;
	    }
	
	    // export
	    Snap.path = paths;
	
	    /*\
	     * Snap.path.getTotalLength
	     [ method ]
	     **
	     * Returns the length of the given path in pixels
	     **
	     - path (string) SVG path string
	     **
	     = (number) length
	    \*/
	    Snap.path.getTotalLength = getTotalLength;
	    /*\
	     * Snap.path.getPointAtLength
	     [ method ]
	     **
	     * Returns the coordinates of the point located at the given length along the given path
	     **
	     - path (string) SVG path string
	     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
	     **
	     = (object) representation of the point:
	     o {
	     o     x: (number) x coordinate,
	     o     y: (number) y coordinate,
	     o     alpha: (number) angle of derivative
	     o }
	    \*/
	    Snap.path.getPointAtLength = getPointAtLength;
	    /*\
	     * Snap.path.getSubpath
	     [ method ]
	     **
	     * Returns the subpath of a given path between given start and end lengths
	     **
	     - path (string) SVG path string
	     - from (number) length, in pixels, from the start of the path to the start of the segment
	     - to (number) length, in pixels, from the start of the path to the end of the segment
	     **
	     = (string) path string definition for the segment
	    \*/
	    Snap.path.getSubpath = function (path, from, to) {
	        if (this.getTotalLength(path) - to < 1e-6) {
	            return getSubpathsAtLength(path, from).end;
	        }
	        var a = getSubpathsAtLength(path, to, 1);
	        return from ? getSubpathsAtLength(a, from).end : a;
	    };
	    /*\
	     * Element.getTotalLength
	     [ method ]
	     **
	     * Returns the length of the path in pixels (only works for `path` elements)
	     = (number) length
	    \*/
	    elproto.getTotalLength = function () {
	        if (this.node.getTotalLength) {
	            return this.node.getTotalLength();
	        }
	    };
	    // SIERRA Element.getPointAtLength()/Element.getTotalLength(): If a <path> is broken into different segments, is the jump distance to the new coordinates set by the _M_ or _m_ commands calculated as part of the path's total length?
	    /*\
	     * Element.getPointAtLength
	     [ method ]
	     **
	     * Returns coordinates of the point located at the given length on the given path (only works for `path` elements)
	     **
	     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
	     **
	     = (object) representation of the point:
	     o {
	     o     x: (number) x coordinate,
	     o     y: (number) y coordinate,
	     o     alpha: (number) angle of derivative
	     o }
	    \*/
	    elproto.getPointAtLength = function (length) {
	        return getPointAtLength(this.attr("d"), length);
	    };
	    // SIERRA Element.getSubpath(): Similar to the problem for Element.getPointAtLength(). Unclear how this would work for a segmented path. Overall, the concept of _subpath_ and what I'm calling a _segment_ (series of non-_M_ or _Z_ commands) is unclear.
	    /*\
	     * Element.getSubpath
	     [ method ]
	     **
	     * Returns subpath of a given element from given start and end lengths (only works for `path` elements)
	     **
	     - from (number) length, in pixels, from the start of the path to the start of the segment
	     - to (number) length, in pixels, from the start of the path to the end of the segment
	     **
	     = (string) path string definition for the segment
	    \*/
	    elproto.getSubpath = function (from, to) {
	        return Snap.path.getSubpath(this.attr("d"), from, to);
	    };
	    Snap._.box = box;
	    /*\
	     * Snap.path.findDotsAtSegment
	     [ method ]
	     **
	     * Utility method
	     **
	     * Finds dot coordinates on the given cubic beziér curve at the given t
	     - p1x (number) x of the first point of the curve
	     - p1y (number) y of the first point of the curve
	     - c1x (number) x of the first anchor of the curve
	     - c1y (number) y of the first anchor of the curve
	     - c2x (number) x of the second anchor of the curve
	     - c2y (number) y of the second anchor of the curve
	     - p2x (number) x of the second point of the curve
	     - p2y (number) y of the second point of the curve
	     - t (number) position on the curve (0..1)
	     = (object) point information in format:
	     o {
	     o     x: (number) x coordinate of the point,
	     o     y: (number) y coordinate of the point,
	     o     m: {
	     o         x: (number) x coordinate of the left anchor,
	     o         y: (number) y coordinate of the left anchor
	     o     },
	     o     n: {
	     o         x: (number) x coordinate of the right anchor,
	     o         y: (number) y coordinate of the right anchor
	     o     },
	     o     start: {
	     o         x: (number) x coordinate of the start of the curve,
	     o         y: (number) y coordinate of the start of the curve
	     o     },
	     o     end: {
	     o         x: (number) x coordinate of the end of the curve,
	     o         y: (number) y coordinate of the end of the curve
	     o     },
	     o     alpha: (number) angle of the curve derivative at the point
	     o }
	    \*/
	    Snap.path.findDotsAtSegment = findDotsAtSegment;
	    /*\
	     * Snap.path.bezierBBox
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns the bounding box of a given cubic beziér curve
	     - p1x (number) x of the first point of the curve
	     - p1y (number) y of the first point of the curve
	     - c1x (number) x of the first anchor of the curve
	     - c1y (number) y of the first anchor of the curve
	     - c2x (number) x of the second anchor of the curve
	     - c2y (number) y of the second anchor of the curve
	     - p2x (number) x of the second point of the curve
	     - p2y (number) y of the second point of the curve
	     * or
	     - bez (array) array of six points for beziér curve
	     = (object) bounding box
	     o {
	     o     x: (number) x coordinate of the left top point of the box,
	     o     y: (number) y coordinate of the left top point of the box,
	     o     x2: (number) x coordinate of the right bottom point of the box,
	     o     y2: (number) y coordinate of the right bottom point of the box,
	     o     width: (number) width of the box,
	     o     height: (number) height of the box
	     o }
	    \*/
	    Snap.path.bezierBBox = bezierBBox;
	    /*\
	     * Snap.path.isPointInsideBBox
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns `true` if given point is inside bounding box
	     - bbox (string) bounding box
	     - x (string) x coordinate of the point
	     - y (string) y coordinate of the point
	     = (boolean) `true` if point is inside
	    \*/
	    Snap.path.isPointInsideBBox = isPointInsideBBox;
	    Snap.closest = function (x, y, X, Y) {
	        var r = 100,
	            b = box(x - r / 2, y - r / 2, r, r),
	            inside = [],
	            getter = X[0].hasOwnProperty("x") ? function (i) {
	                return {
	                    x: X[i].x,
	                    y: X[i].y
	                };
	            } : function (i) {
	                return {
	                    x: X[i],
	                    y: Y[i]
	                };
	            },
	            found = 0;
	        while (r <= 1e6 && !found) {
	            for (var i = 0, ii = X.length; i < ii; i++) {
	                var xy = getter(i);
	                if (isPointInsideBBox(b, xy.x, xy.y)) {
	                    found++;
	                    inside.push(xy);
	                    break;
	                }
	            }
	            if (!found) {
	                r *= 2;
	                b = box(x - r / 2, y - r / 2, r, r)
	            }
	        }
	        if (r == 1e6) {
	            return;
	        }
	        var len = Infinity,
	            res;
	        for (i = 0, ii = inside.length; i < ii; i++) {
	            var l = Snap.len(x, y, inside[i].x, inside[i].y);
	            if (len > l) {
	                len = l;
	                inside[i].len = l;
	                res = inside[i];
	            }
	        }
	        return res;
	    };
	    /*\
	     * Snap.path.isBBoxIntersect
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns `true` if two bounding boxes intersect
	     - bbox1 (string) first bounding box
	     - bbox2 (string) second bounding box
	     = (boolean) `true` if bounding boxes intersect
	    \*/
	    Snap.path.isBBoxIntersect = isBBoxIntersect;
	    /*\
	     * Snap.path.intersection
	     [ method ]
	     **
	     * Utility method
	     **
	     * Finds intersections of two paths
	     - path1 (string) path string
	     - path2 (string) path string
	     = (array) dots of intersection
	     o [
	     o     {
	     o         x: (number) x coordinate of the point,
	     o         y: (number) y coordinate of the point,
	     o         t1: (number) t value for segment of path1,
	     o         t2: (number) t value for segment of path2,
	     o         segment1: (number) order number for segment of path1,
	     o         segment2: (number) order number for segment of path2,
	     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1,
	     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
	     o     }
	     o ]
	    \*/
	    Snap.path.intersection = pathIntersection;
	    Snap.path.intersectionNumber = pathIntersectionNumber;
	    /*\
	     * Snap.path.isPointInside
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns `true` if given point is inside a given closed path.
	     *
	     * Note: fill mode doesn’t affect the result of this method.
	     - path (string) path string
	     - x (number) x of the point
	     - y (number) y of the point
	     = (boolean) `true` if point is inside the path
	    \*/
	    Snap.path.isPointInside = isPointInsidePath;
	    /*\
	     * Snap.path.getBBox
	     [ method ]
	     **
	     * Utility method
	     **
	     * Returns the bounding box of a given path
	     - path (string) path string
	     = (object) bounding box
	     o {
	     o     x: (number) x coordinate of the left top point of the box,
	     o     y: (number) y coordinate of the left top point of the box,
	     o     x2: (number) x coordinate of the right bottom point of the box,
	     o     y2: (number) y coordinate of the right bottom point of the box,
	     o     width: (number) width of the box,
	     o     height: (number) height of the box
	     o }
	    \*/
	    Snap.path.getBBox = pathBBox;
	    Snap.path.get = getPath;
	    /*\
	     * Snap.path.toRelative
	     [ method ]
	     **
	     * Utility method
	     **
	     * Converts path coordinates into relative values
	     - path (string) path string
	     = (array) path string
	    \*/
	    Snap.path.toRelative = pathToRelative;
	    /*\
	     * Snap.path.toAbsolute
	     [ method ]
	     **
	     * Utility method
	     **
	     * Converts path coordinates into absolute values
	     - path (string) path string
	     = (array) path string
	    \*/
	    Snap.path.toAbsolute = pathToAbsolute;
	    /*\
	     * Snap.path.toCubic
	     [ method ]
	     **
	     * Utility method
	     **
	     * Converts path to a new path where all segments are cubic beziér curves
	     - pathString (string|array) path string or array of segments
	     = (array) array of segments
	    \*/
	    Snap.path.toCubic = path2curve;
	    /*\
	     * Snap.path.map
	     [ method ]
	     **
	     * Transform the path string with the given matrix
	     - path (string) path string
	     - matrix (object) see @Matrix
	     = (string) transformed path string
	    \*/
	    Snap.path.map = mapPath;
	    Snap.path.toString = toString;
	    Snap.path.clone = pathClone;
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob) {
	    var mmax = Math.max,
	        mmin = Math.min;
	
	    // Set
	    var Set = function (items) {
	        this.items = [];
		this.bindings = {};
	        this.length = 0;
	        this.type = "set";
	        if (items) {
	            for (var i = 0, ii = items.length; i < ii; i++) {
	                if (items[i]) {
	                    this[this.items.length] = this.items[this.items.length] = items[i];
	                    this.length++;
	                }
	            }
	        }
	    },
	    setproto = Set.prototype;
	    /*\
	     * Set.push
	     [ method ]
	     **
	     * Adds each argument to the current set
	     = (object) original element
	    \*/
	    setproto.push = function () {
	        var item,
	            len;
	        for (var i = 0, ii = arguments.length; i < ii; i++) {
	            item = arguments[i];
	            if (item) {
	                len = this.items.length;
	                this[len] = this.items[len] = item;
	                this.length++;
	            }
	        }
	        return this;
	    };
	    /*\
	     * Set.pop
	     [ method ]
	     **
	     * Removes last element and returns it
	     = (object) element
	    \*/
	    setproto.pop = function () {
	        this.length && delete this[this.length--];
	        return this.items.pop();
	    };
	    /*\
	     * Set.forEach
	     [ method ]
	     **
	     * Executes given function for each element in the set
	     *
	     * If the function returns `false`, the loop stops running.
	     **
	     - callback (function) function to run
	     - thisArg (object) context object for the callback
	     = (object) Set object
	    \*/
	    setproto.forEach = function (callback, thisArg) {
	        for (var i = 0, ii = this.items.length; i < ii; i++) {
	            if (callback.call(thisArg, this.items[i], i) === false) {
	                return this;
	            }
	        }
	        return this;
	    };
	    /*\
	     * Set.animate
	     [ method ]
	     **
	     * Animates each element in set in sync.
	     *
	     **
	     - attrs (object) key-value pairs of destination attributes
	     - duration (number) duration of the animation in milliseconds
	     - easing (function) #optional easing function from @mina or custom
	     - callback (function) #optional callback function that executes when the animation ends
	     * or
	     - animation (array) array of animation parameter for each element in set in format `[attrs, duration, easing, callback]`
	     > Usage
	     | // animate all elements in set to radius 10
	     | set.animate({r: 10}, 500, mina.easein);
	     | // or
	     | // animate first element to radius 10, but second to radius 20 and in different time
	     | set.animate([{r: 10}, 500, mina.easein], [{r: 20}, 1500, mina.easein]);
	     = (Element) the current element
	    \*/
	    setproto.animate = function (attrs, ms, easing, callback) {
	        if (typeof easing == "function" && !easing.length) {
	            callback = easing;
	            easing = mina.linear;
	        }
	        if (attrs instanceof Snap._.Animation) {
	            callback = attrs.callback;
	            easing = attrs.easing;
	            ms = easing.dur;
	            attrs = attrs.attr;
	        }
	        var args = arguments;
	        if (Snap.is(attrs, "array") && Snap.is(args[args.length - 1], "array")) {
	            var each = true;
	        }
	        var begin,
	            handler = function () {
	                if (begin) {
	                    this.b = begin;
	                } else {
	                    begin = this.b;
	                }
	            },
	            cb = 0,
	            set = this,
	            callbacker = callback && function () {
	                if (++cb == set.length) {
	                    callback.call(this);
	                }
	            };
	        return this.forEach(function (el, i) {
	            eve.once("snap.animcreated." + el.id, handler);
	            if (each) {
	                args[i] && el.animate.apply(el, args[i]);
	            } else {
	                el.animate(attrs, ms, easing, callbacker);
	            }
	        });
	    };
	    setproto.remove = function () {
	        while (this.length) {
	            this.pop().remove();
	        }
	        return this;
	    };
	    /*\
	     * Set.bind
	     [ method ]
	     **
	     * Specifies how to handle a specific attribute when applied
	     * to a set.
	     *
	     **
	     - attr (string) attribute name
	     - callback (function) function to run
	     * or
	     - attr (string) attribute name
	     - element (Element) specific element in the set to apply the attribute to
	     * or
	     - attr (string) attribute name
	     - element (Element) specific element in the set to apply the attribute to
	     - eattr (string) attribute on the element to bind the attribute to
	     = (object) Set object
	    \*/
	    setproto.bind = function (attr, a, b) {
	        var data = {};
	        if (typeof a == "function") {
	            this.bindings[attr] = a;
	        } else {
	            var aname = b || attr;
	            this.bindings[attr] = function (v) {
	                data[aname] = v;
	                a.attr(data);
	            };
	        }
	        return this;
	    };
	    setproto.attr = function (value) {
	        var unbound = {};
	        for (var k in value) {
	            if (this.bindings[k]) {
	                this.bindings[k](value[k]);
	            } else {
	                unbound[k] = value[k];
	            }
	        }
	        for (var i = 0, ii = this.items.length; i < ii; i++) {
	            this.items[i].attr(unbound);
	        }
	        return this;
	    };
	    /*\
	     * Set.clear
	     [ method ]
	     **
	     * Removes all elements from the set
	    \*/
	    setproto.clear = function () {
	        while (this.length) {
	            this.pop();
	        }
	    };
	    /*\
	     * Set.splice
	     [ method ]
	     **
	     * Removes range of elements from the set
	     **
	     - index (number) position of the deletion
	     - count (number) number of element to remove
	     - insertion… (object) #optional elements to insert
	     = (object) set elements that were deleted
	    \*/
	    setproto.splice = function (index, count, insertion) {
	        index = index < 0 ? mmax(this.length + index, 0) : index;
	        count = mmax(0, mmin(this.length - index, count));
	        var tail = [],
	            todel = [],
	            args = [],
	            i;
	        for (i = 2; i < arguments.length; i++) {
	            args.push(arguments[i]);
	        }
	        for (i = 0; i < count; i++) {
	            todel.push(this[index + i]);
	        }
	        for (; i < this.length - index; i++) {
	            tail.push(this[index + i]);
	        }
	        var arglen = args.length;
	        for (i = 0; i < arglen + tail.length; i++) {
	            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
	        }
	        i = this.items.length = this.length -= count - arglen;
	        while (this[i]) {
	            delete this[i++];
	        }
	        return new Set(todel);
	    };
	    /*\
	     * Set.exclude
	     [ method ]
	     **
	     * Removes given element from the set
	     **
	     - element (object) element to remove
	     = (boolean) `true` if object was found and removed from the set
	    \*/
	    setproto.exclude = function (el) {
	        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
	            this.splice(i, 1);
	            return true;
	        }
	        return false;
	    };
	    setproto.insertAfter = function (el) {
	        var i = this.items.length;
	        while (i--) {
	            this.items[i].insertAfter(el);
	        }
	        return this;
	    };
	    setproto.getBBox = function () {
	        var x = [],
	            y = [],
	            x2 = [],
	            y2 = [];
	        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
	            var box = this.items[i].getBBox();
	            x.push(box.x);
	            y.push(box.y);
	            x2.push(box.x + box.width);
	            y2.push(box.y + box.height);
	        }
	        x = mmin.apply(0, x);
	        y = mmin.apply(0, y);
	        x2 = mmax.apply(0, x2);
	        y2 = mmax.apply(0, y2);
	        return {
	            x: x,
	            y: y,
	            x2: x2,
	            y2: y2,
	            width: x2 - x,
	            height: y2 - y,
	            cx: x + (x2 - x) / 2,
	            cy: y + (y2 - y) / 2
	        };
	    };
	    setproto.clone = function (s) {
	        s = new Set;
	        for (var i = 0, ii = this.items.length; i < ii; i++) {
	            s.push(this.items[i].clone());
	        }
	        return s;
	    };
	    setproto.toString = function () {
	        return "Snap\u2018s set";
	    };
	    setproto.type = "set";
	    // export
	    Snap.Set = Set;
	    Snap.set = function () {
	        var set = new Set;
	        if (arguments.length) {
	            set.push.apply(set, Array.prototype.slice.call(arguments, 0));
	        }
	        return set;
	    };
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob) {
	    var names = {},
	        reUnit = /[a-z]+$/i,
	        Str = String;
	    names.stroke = names.fill = "colour";
	    function getEmpty(item) {
	        var l = item[0];
	        switch (l.toLowerCase()) {
	            case "t": return [l, 0, 0];
	            case "m": return [l, 1, 0, 0, 1, 0, 0];
	            case "r": if (item.length == 4) {
	                return [l, 0, item[2], item[3]];
	            } else {
	                return [l, 0];
	            }
	            case "s": if (item.length == 5) {
	                return [l, 1, 1, item[3], item[4]];
	            } else if (item.length == 3) {
	                return [l, 1, 1];
	            } else {
	                return [l, 1];
	            }
	        }
	    }
	    function equaliseTransform(t1, t2, getBBox) {
	        t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
	        t1 = Snap.parseTransformString(t1) || [];
	        t2 = Snap.parseTransformString(t2) || [];
	        var maxlength = Math.max(t1.length, t2.length),
	            from = [],
	            to = [],
	            i = 0, j, jj,
	            tt1, tt2;
	        for (; i < maxlength; i++) {
	            tt1 = t1[i] || getEmpty(t2[i]);
	            tt2 = t2[i] || getEmpty(tt1);
	            if ((tt1[0] != tt2[0]) ||
	                (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
	                (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
	                ) {
	                    t1 = Snap._.transform2matrix(t1, getBBox());
	                    t2 = Snap._.transform2matrix(t2, getBBox());
	                    from = [["m", t1.a, t1.b, t1.c, t1.d, t1.e, t1.f]];
	                    to = [["m", t2.a, t2.b, t2.c, t2.d, t2.e, t2.f]];
	                    break;
	            }
	            from[i] = [];
	            to[i] = [];
	            for (j = 0, jj = Math.max(tt1.length, tt2.length); j < jj; j++) {
	                j in tt1 && (from[i][j] = tt1[j]);
	                j in tt2 && (to[i][j] = tt2[j]);
	            }
	        }
	        return {
	            from: path2array(from),
	            to: path2array(to),
	            f: getPath(from)
	        };
	    }
	    function getNumber(val) {
	        return val;
	    }
	    function getUnit(unit) {
	        return function (val) {
	            return +val.toFixed(3) + unit;
	        };
	    }
	    function getViewBox(val) {
	        return val.join(" ");
	    }
	    function getColour(clr) {
	        return Snap.rgb(clr[0], clr[1], clr[2]);
	    }
	    function getPath(path) {
	        var k = 0, i, ii, j, jj, out, a, b = [];
	        for (i = 0, ii = path.length; i < ii; i++) {
	            out = "[";
	            a = ['"' + path[i][0] + '"'];
	            for (j = 1, jj = path[i].length; j < jj; j++) {
	                a[j] = "val[" + (k++) + "]";
	            }
	            out += a + "]";
	            b[i] = out;
	        }
	        return Function("val", "return Snap.path.toString.call([" + b + "])");
	    }
	    function path2array(path) {
	        var out = [];
	        for (var i = 0, ii = path.length; i < ii; i++) {
	            for (var j = 1, jj = path[i].length; j < jj; j++) {
	                out.push(path[i][j]);
	            }
	        }
	        return out;
	    }
	    function isNumeric(obj) {
	        return isFinite(parseFloat(obj));
	    }
	    function arrayEqual(arr1, arr2) {
	        if (!Snap.is(arr1, "array") || !Snap.is(arr2, "array")) {
	            return false;
	        }
	        return arr1.toString() == arr2.toString();
	    }
	    Element.prototype.equal = function (name, b) {
	        return eve("snap.util.equal", this, name, b).firstDefined();
	    };
	    eve.on("snap.util.equal", function (name, b) {
	        var A, B, a = Str(this.attr(name) || ""),
	            el = this;
	        if (isNumeric(a) && isNumeric(b)) {
	            return {
	                from: parseFloat(a),
	                to: parseFloat(b),
	                f: getNumber
	            };
	        }
	        if (names[name] == "colour") {
	            A = Snap.color(a);
	            B = Snap.color(b);
	            return {
	                from: [A.r, A.g, A.b, A.opacity],
	                to: [B.r, B.g, B.b, B.opacity],
	                f: getColour
	            };
	        }
	        if (name == "viewBox") {
	            A = this.attr(name).vb.split(" ").map(Number);
	            B = b.split(" ").map(Number);
	            return {
	                from: A,
	                to: B,
	                f: getViewBox
	            };
	        }
	        if (name == "transform" || name == "gradientTransform" || name == "patternTransform") {
	            if (b instanceof Snap.Matrix) {
	                b = b.toTransformString();
	            }
	            if (!Snap._.rgTransform.test(b)) {
	                b = Snap._.svgTransform2string(b);
	            }
	            return equaliseTransform(a, b, function () {
	                return el.getBBox(1);
	            });
	        }
	        if (name == "d" || name == "path") {
	            A = Snap.path.toCubic(a, b);
	            return {
	                from: path2array(A[0]),
	                to: path2array(A[1]),
	                f: getPath(A[0])
	            };
	        }
	        if (name == "points") {
	            A = Str(a).split(Snap._.separator);
	            B = Str(b).split(Snap._.separator);
	            return {
	                from: A,
	                to: B,
	                f: function (val) { return val; }
	            };
	        }
	        var aUnit = a.match(reUnit),
	            bUnit = Str(b).match(reUnit);
	        if (aUnit && arrayEqual(aUnit, bUnit)) {
	            return {
	                from: parseFloat(a),
	                to: parseFloat(b),
	                f: getUnit(aUnit)
	            };
	        } else {
	            return {
	                from: this.asPX(name),
	                to: this.asPX(name, b),
	                f: getNumber
	            };
	        }
	    });
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob) {
	    var elproto = Element.prototype,
	    has = "hasOwnProperty",
	    supportsTouch = "createTouch" in glob.doc,
	    events = [
	        "click", "dblclick", "mousedown", "mousemove", "mouseout",
	        "mouseover", "mouseup", "touchstart", "touchmove", "touchend",
	        "touchcancel"
	    ],
	    touchMap = {
	        mousedown: "touchstart",
	        mousemove: "touchmove",
	        mouseup: "touchend"
	    },
	    getScroll = function (xy, el) {
	        var name = xy == "y" ? "scrollTop" : "scrollLeft",
	            doc = el && el.node ? el.node.ownerDocument : glob.doc;
	        return doc[name in doc.documentElement ? "documentElement" : "body"][name];
	    },
	    preventDefault = function () {
	        this.returnValue = false;
	    },
	    preventTouch = function () {
	        return this.originalEvent.preventDefault();
	    },
	    stopPropagation = function () {
	        this.cancelBubble = true;
	    },
	    stopTouch = function () {
	        return this.originalEvent.stopPropagation();
	    },
	    addEvent = function (obj, type, fn, element) {
	        var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
	            f = function (e) {
	                var scrollY = getScroll("y", element),
	                    scrollX = getScroll("x", element);
	                if (supportsTouch && touchMap[has](type)) {
	                    for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
	                        if (e.targetTouches[i].target == obj || obj.contains(e.targetTouches[i].target)) {
	                            var olde = e;
	                            e = e.targetTouches[i];
	                            e.originalEvent = olde;
	                            e.preventDefault = preventTouch;
	                            e.stopPropagation = stopTouch;
	                            break;
	                        }
	                    }
	                }
	                var x = e.clientX + scrollX,
	                    y = e.clientY + scrollY;
	                return fn.call(element, e, x, y);
	            };
	
	        if (type !== realName) {
	            obj.addEventListener(type, f, false);
	        }
	
	        obj.addEventListener(realName, f, false);
	
	        return function () {
	            if (type !== realName) {
	                obj.removeEventListener(type, f, false);
	            }
	
	            obj.removeEventListener(realName, f, false);
	            return true;
	        };
	    },
	    drag = [],
	    dragMove = function (e) {
	        var x = e.clientX,
	            y = e.clientY,
	            scrollY = getScroll("y"),
	            scrollX = getScroll("x"),
	            dragi,
	            j = drag.length;
	        while (j--) {
	            dragi = drag[j];
	            if (supportsTouch) {
	                var i = e.touches && e.touches.length,
	                    touch;
	                while (i--) {
	                    touch = e.touches[i];
	                    if (touch.identifier == dragi.el._drag.id || dragi.el.node.contains(touch.target)) {
	                        x = touch.clientX;
	                        y = touch.clientY;
	                        (e.originalEvent ? e.originalEvent : e).preventDefault();
	                        break;
	                    }
	                }
	            } else {
	                e.preventDefault();
	            }
	            var node = dragi.el.node,
	                o,
	                next = node.nextSibling,
	                parent = node.parentNode,
	                display = node.style.display;
	            // glob.win.opera && parent.removeChild(node);
	            // node.style.display = "none";
	            // o = dragi.el.paper.getElementByPoint(x, y);
	            // node.style.display = display;
	            // glob.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
	            // o && eve("snap.drag.over." + dragi.el.id, dragi.el, o);
	            x += scrollX;
	            y += scrollY;
	            eve("snap.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
	        }
	    },
	    dragUp = function (e) {
	        Snap.unmousemove(dragMove).unmouseup(dragUp);
	        var i = drag.length,
	            dragi;
	        while (i--) {
	            dragi = drag[i];
	            dragi.el._drag = {};
	            eve("snap.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
	            eve.off("snap.drag.*." + dragi.el.id);
	        }
	        drag = [];
	    };
	    /*\
	     * Element.click
	     [ method ]
	     **
	     * Adds a click event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unclick
	     [ method ]
	     **
	     * Removes a click event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.dblclick
	     [ method ]
	     **
	     * Adds a double click event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.undblclick
	     [ method ]
	     **
	     * Removes a double click event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.mousedown
	     [ method ]
	     **
	     * Adds a mousedown event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unmousedown
	     [ method ]
	     **
	     * Removes a mousedown event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.mousemove
	     [ method ]
	     **
	     * Adds a mousemove event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unmousemove
	     [ method ]
	     **
	     * Removes a mousemove event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.mouseout
	     [ method ]
	     **
	     * Adds a mouseout event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unmouseout
	     [ method ]
	     **
	     * Removes a mouseout event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.mouseover
	     [ method ]
	     **
	     * Adds a mouseover event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unmouseover
	     [ method ]
	     **
	     * Removes a mouseover event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.mouseup
	     [ method ]
	     **
	     * Adds a mouseup event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.unmouseup
	     [ method ]
	     **
	     * Removes a mouseup event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.touchstart
	     [ method ]
	     **
	     * Adds a touchstart event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.untouchstart
	     [ method ]
	     **
	     * Removes a touchstart event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.touchmove
	     [ method ]
	     **
	     * Adds a touchmove event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.untouchmove
	     [ method ]
	     **
	     * Removes a touchmove event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.touchend
	     [ method ]
	     **
	     * Adds a touchend event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.untouchend
	     [ method ]
	     **
	     * Removes a touchend event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	
	    /*\
	     * Element.touchcancel
	     [ method ]
	     **
	     * Adds a touchcancel event handler to the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    /*\
	     * Element.untouchcancel
	     [ method ]
	     **
	     * Removes a touchcancel event handler from the element
	     - handler (function) handler for the event
	     = (object) @Element
	    \*/
	    for (var i = events.length; i--;) {
	        (function (eventName) {
	            Snap[eventName] = elproto[eventName] = function (fn, scope) {
	                if (Snap.is(fn, "function")) {
	                    this.events = this.events || [];
	                    this.events.push({
	                        name: eventName,
	                        f: fn,
	                        unbind: addEvent(this.node || document, eventName, fn, scope || this)
	                    });
	                } else {
	                    for (var i = 0, ii = this.events.length; i < ii; i++) if (this.events[i].name == eventName) {
	                        try {
	                            this.events[i].f.call(this);
	                        } catch (e) {}
	                    }
	                }
	                return this;
	            };
	            Snap["un" + eventName] =
	            elproto["un" + eventName] = function (fn) {
	                var events = this.events || [],
	                    l = events.length;
	                while (l--) if (events[l].name == eventName &&
	                               (events[l].f == fn || !fn)) {
	                    events[l].unbind();
	                    events.splice(l, 1);
	                    !events.length && delete this.events;
	                    return this;
	                }
	                return this;
	            };
	        })(events[i]);
	    }
	    /*\
	     * Element.hover
	     [ method ]
	     **
	     * Adds hover event handlers to the element
	     - f_in (function) handler for hover in
	     - f_out (function) handler for hover out
	     - icontext (object) #optional context for hover in handler
	     - ocontext (object) #optional context for hover out handler
	     = (object) @Element
	    \*/
	    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
	        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
	    };
	    /*\
	     * Element.unhover
	     [ method ]
	     **
	     * Removes hover event handlers from the element
	     - f_in (function) handler for hover in
	     - f_out (function) handler for hover out
	     = (object) @Element
	    \*/
	    elproto.unhover = function (f_in, f_out) {
	        return this.unmouseover(f_in).unmouseout(f_out);
	    };
	    var draggable = [];
	    // SIERRA unclear what _context_ refers to for starting, ending, moving the drag gesture.
	    // SIERRA Element.drag(): _x position of the mouse_: Where are the x/y values offset from?
	    // SIERRA Element.drag(): much of this member's doc appears to be duplicated for some reason.
	    // SIERRA Unclear about this sentence: _Additionally following drag events will be triggered: drag.start.<id> on start, drag.end.<id> on end and drag.move.<id> on every move._ Is there a global _drag_ object to which you can assign handlers keyed by an element's ID?
	    /*\
	     * Element.drag
	     [ method ]
	     **
	     * Adds event handlers for an element's drag gesture
	     **
	     - onmove (function) handler for moving
	     - onstart (function) handler for drag start
	     - onend (function) handler for drag end
	     - mcontext (object) #optional context for moving handler
	     - scontext (object) #optional context for drag start handler
	     - econtext (object) #optional context for drag end handler
	     * Additionaly following `drag` events are triggered: `drag.start.<id>` on start,
	     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element is dragged over another element
	     * `drag.over.<id>` fires as well.
	     *
	     * Start event and start handler are called in specified context or in context of the element with following parameters:
	     o x (number) x position of the mouse
	     o y (number) y position of the mouse
	     o event (object) DOM event object
	     * Move event and move handler are called in specified context or in context of the element with following parameters:
	     o dx (number) shift by x from the start point
	     o dy (number) shift by y from the start point
	     o x (number) x position of the mouse
	     o y (number) y position of the mouse
	     o event (object) DOM event object
	     * End event and end handler are called in specified context or in context of the element with following parameters:
	     o event (object) DOM event object
	     = (object) @Element
	    \*/
	    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
	        var el = this;
	        if (!arguments.length) {
	            var origTransform;
	            return el.drag(function (dx, dy) {
	                this.attr({
	                    transform: origTransform + (origTransform ? "T" : "t") + [dx, dy]
	                });
	            }, function () {
	                origTransform = this.transform().local;
	            });
	        }
	        function start(e, x, y) {
	            (e.originalEvent || e).preventDefault();
	            el._drag.x = x;
	            el._drag.y = y;
	            el._drag.id = e.identifier;
	            !drag.length && Snap.mousemove(dragMove).mouseup(dragUp);
	            drag.push({el: el, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
	            onstart && eve.on("snap.drag.start." + el.id, onstart);
	            onmove && eve.on("snap.drag.move." + el.id, onmove);
	            onend && eve.on("snap.drag.end." + el.id, onend);
	            eve("snap.drag.start." + el.id, start_scope || move_scope || el, x, y, e);
	        }
	        function init(e, x, y) {
	            eve("snap.draginit." + el.id, el, e, x, y);
	        }
	        eve.on("snap.draginit." + el.id, start);
	        el._drag = {};
	        draggable.push({el: el, start: start, init: init});
	        el.mousedown(init);
	        return el;
	    };
	    /*
	     * Element.onDragOver
	     [ method ]
	     **
	     * Shortcut to assign event handler for `drag.over.<id>` event, where `id` is the element's `id` (see @Element.id)
	     - f (function) handler for event, first argument would be the element you are dragging over
	    \*/
	    // elproto.onDragOver = function (f) {
	    //     f ? eve.on("snap.drag.over." + this.id, f) : eve.unbind("snap.drag.over." + this.id);
	    // };
	    /*\
	     * Element.undrag
	     [ method ]
	     **
	     * Removes all drag event handlers from the given element
	    \*/
	    elproto.undrag = function () {
	        var i = draggable.length;
	        while (i--) if (draggable[i].el == this) {
	            this.unmousedown(draggable[i].init);
	            draggable.splice(i, 1);
	            eve.unbind("snap.drag.*." + this.id);
	            eve.unbind("snap.draginit." + this.id);
	        }
	        !draggable.length && Snap.unmousemove(dragMove).unmouseup(dragUp);
	        return this;
	    };
	});
	
	// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob) {
	    var elproto = Element.prototype,
	        pproto = Paper.prototype,
	        rgurl = /^\s*url\((.+)\)/,
	        Str = String,
	        $ = Snap._.$;
	    Snap.filter = {};
	    /*\
	     * Paper.filter
	     [ method ]
	     **
	     * Creates a `<filter>` element
	     **
	     - filstr (string) SVG fragment of filter provided as a string
	     = (object) @Element
	     * Note: It is recommended to use filters embedded into the page inside an empty SVG element.
	     > Usage
	     | var f = paper.filter('<feGaussianBlur stdDeviation="2"/>'),
	     |     c = paper.circle(10, 10, 10).attr({
	     |         filter: f
	     |     });
	    \*/
	    pproto.filter = function (filstr) {
	        var paper = this;
	        if (paper.type != "svg") {
	            paper = paper.paper;
	        }
	        var f = Snap.parse(Str(filstr)),
	            id = Snap._.id(),
	            width = paper.node.offsetWidth,
	            height = paper.node.offsetHeight,
	            filter = $("filter");
	        $(filter, {
	            id: id,
	            filterUnits: "userSpaceOnUse"
	        });
	        filter.appendChild(f.node);
	        paper.defs.appendChild(filter);
	        return new Element(filter);
	    };
	
	    eve.on("snap.util.getattr.filter", function () {
	        eve.stop();
	        var p = $(this.node, "filter");
	        if (p) {
	            var match = Str(p).match(rgurl);
	            return match && Snap.select(match[1]);
	        }
	    });
	    eve.on("snap.util.attr.filter", function (value) {
	        if (value instanceof Element && value.type == "filter") {
	            eve.stop();
	            var id = value.node.id;
	            if (!id) {
	                $(value.node, {id: value.id});
	                id = value.id;
	            }
	            $(this.node, {
	                filter: Snap.url(id)
	            });
	        }
	        if (!value || value == "none") {
	            eve.stop();
	            this.node.removeAttribute("filter");
	        }
	    });
	    /*\
	     * Snap.filter.blur
	     [ method ]
	     **
	     * Returns an SVG markup string for the blur filter
	     **
	     - x (number) amount of horizontal blur, in pixels
	     - y (number) #optional amount of vertical blur, in pixels
	     = (string) filter representation
	     > Usage
	     | var f = paper.filter(Snap.filter.blur(5, 10)),
	     |     c = paper.circle(10, 10, 10).attr({
	     |         filter: f
	     |     });
	    \*/
	    Snap.filter.blur = function (x, y) {
	        if (x == null) {
	            x = 2;
	        }
	        var def = y == null ? x : [x, y];
	        return Snap.format('\<feGaussianBlur stdDeviation="{def}"/>', {
	            def: def
	        });
	    };
	    Snap.filter.blur.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.shadow
	     [ method ]
	     **
	     * Returns an SVG markup string for the shadow filter
	     **
	     - dx (number) #optional horizontal shift of the shadow, in pixels
	     - dy (number) #optional vertical shift of the shadow, in pixels
	     - blur (number) #optional amount of blur
	     - color (string) #optional color of the shadow
	     - opacity (number) #optional `0..1` opacity of the shadow
	     * or
	     - dx (number) #optional horizontal shift of the shadow, in pixels
	     - dy (number) #optional vertical shift of the shadow, in pixels
	     - color (string) #optional color of the shadow
	     - opacity (number) #optional `0..1` opacity of the shadow
	     * which makes blur default to `4`. Or
	     - dx (number) #optional horizontal shift of the shadow, in pixels
	     - dy (number) #optional vertical shift of the shadow, in pixels
	     - opacity (number) #optional `0..1` opacity of the shadow
	     = (string) filter representation
	     > Usage
	     | var f = paper.filter(Snap.filter.shadow(0, 2, 3)),
	     |     c = paper.circle(10, 10, 10).attr({
	     |         filter: f
	     |     });
	    \*/
	    Snap.filter.shadow = function (dx, dy, blur, color, opacity) {
	        if (typeof blur == "string") {
	            color = blur;
	            opacity = color;
	            blur = 4;
	        }
	        if (typeof color != "string") {
	            opacity = color;
	            color = "#000";
	        }
	        color = color || "#000";
	        if (blur == null) {
	            blur = 4;
	        }
	        if (opacity == null) {
	            opacity = 1;
	        }
	        if (dx == null) {
	            dx = 0;
	            dy = 2;
	        }
	        if (dy == null) {
	            dy = dx;
	        }
	        color = Snap.color(color);
	        return Snap.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>', {
	            color: color,
	            dx: dx,
	            dy: dy,
	            blur: blur,
	            opacity: opacity
	        });
	    };
	    Snap.filter.shadow.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.grayscale
	     [ method ]
	     **
	     * Returns an SVG markup string for the grayscale filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.grayscale = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	        return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>', {
	            a: 0.2126 + 0.7874 * (1 - amount),
	            b: 0.7152 - 0.7152 * (1 - amount),
	            c: 0.0722 - 0.0722 * (1 - amount),
	            d: 0.2126 - 0.2126 * (1 - amount),
	            e: 0.7152 + 0.2848 * (1 - amount),
	            f: 0.0722 - 0.0722 * (1 - amount),
	            g: 0.2126 - 0.2126 * (1 - amount),
	            h: 0.0722 + 0.9278 * (1 - amount)
	        });
	    };
	    Snap.filter.grayscale.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.sepia
	     [ method ]
	     **
	     * Returns an SVG markup string for the sepia filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.sepia = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	        return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>', {
	            a: 0.393 + 0.607 * (1 - amount),
	            b: 0.769 - 0.769 * (1 - amount),
	            c: 0.189 - 0.189 * (1 - amount),
	            d: 0.349 - 0.349 * (1 - amount),
	            e: 0.686 + 0.314 * (1 - amount),
	            f: 0.168 - 0.168 * (1 - amount),
	            g: 0.272 - 0.272 * (1 - amount),
	            h: 0.534 - 0.534 * (1 - amount),
	            i: 0.131 + 0.869 * (1 - amount)
	        });
	    };
	    Snap.filter.sepia.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.saturate
	     [ method ]
	     **
	     * Returns an SVG markup string for the saturate filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.saturate = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	        return Snap.format('<feColorMatrix type="saturate" values="{amount}"/>', {
	            amount: 1 - amount
	        });
	    };
	    Snap.filter.saturate.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.hueRotate
	     [ method ]
	     **
	     * Returns an SVG markup string for the hue-rotate filter
	     **
	     - angle (number) angle of rotation
	     = (string) filter representation
	    \*/
	    Snap.filter.hueRotate = function (angle) {
	        angle = angle || 0;
	        return Snap.format('<feColorMatrix type="hueRotate" values="{angle}"/>', {
	            angle: angle
	        });
	    };
	    Snap.filter.hueRotate.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.invert
	     [ method ]
	     **
	     * Returns an SVG markup string for the invert filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.invert = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	//        <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" color-interpolation-filters="sRGB"/>
	        return Snap.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>', {
	            amount: amount,
	            amount2: 1 - amount
	        });
	    };
	    Snap.filter.invert.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.brightness
	     [ method ]
	     **
	     * Returns an SVG markup string for the brightness filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.brightness = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	        return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>', {
	            amount: amount
	        });
	    };
	    Snap.filter.brightness.toString = function () {
	        return this();
	    };
	    /*\
	     * Snap.filter.contrast
	     [ method ]
	     **
	     * Returns an SVG markup string for the contrast filter
	     **
	     - amount (number) amount of filter (`0..1`)
	     = (string) filter representation
	    \*/
	    Snap.filter.contrast = function (amount) {
	        if (amount == null) {
	            amount = 1;
	        }
	        return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>', {
	            amount: amount,
	            amount2: .5 - amount / 2
	        });
	    };
	    Snap.filter.contrast.toString = function () {
	        return this();
	    };
	});
	
	// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
	    var box = Snap._.box,
	        is = Snap.is,
	        firstLetter = /^[^a-z]*([tbmlrc])/i,
	        toString = function () {
	            return "T" + this.dx + "," + this.dy;
	        };
	    /*\
	     * Element.getAlign
	     [ method ]
	     **
	     * Returns shift needed to align the element relatively to given element.
	     * If no elements specified, parent `<svg>` container will be used.
	     - el (object) @optional alignment element
	     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
	     = (object|string) Object in format `{dx: , dy: }` also has a string representation as a transformation string
	     > Usage
	     | el.transform(el.getAlign(el2, "top"));
	     * or
	     | var dy = el.getAlign(el2, "top").dy;
	    \*/
	    Element.prototype.getAlign = function (el, way) {
	        if (way == null && is(el, "string")) {
	            way = el;
	            el = null;
	        }
	        el = el || this.paper;
	        var bx = el.getBBox ? el.getBBox() : box(el),
	            bb = this.getBBox(),
	            out = {};
	        way = way && way.match(firstLetter);
	        way = way ? way[1].toLowerCase() : "c";
	        switch (way) {
	            case "t":
	                out.dx = 0;
	                out.dy = bx.y - bb.y;
	            break;
	            case "b":
	                out.dx = 0;
	                out.dy = bx.y2 - bb.y2;
	            break;
	            case "m":
	                out.dx = 0;
	                out.dy = bx.cy - bb.cy;
	            break;
	            case "l":
	                out.dx = bx.x - bb.x;
	                out.dy = 0;
	            break;
	            case "r":
	                out.dx = bx.x2 - bb.x2;
	                out.dy = 0;
	            break;
	            default:
	                out.dx = bx.cx - bb.cx;
	                out.dy = 0;
	            break;
	        }
	        out.toString = toString;
	        return out;
	    };
	    /*\
	     * Element.align
	     [ method ]
	     **
	     * Aligns the element relatively to given one via transformation.
	     * If no elements specified, parent `<svg>` container will be used.
	     - el (object) @optional alignment element
	     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
	     = (object) this element
	     > Usage
	     | el.align(el2, "top");
	     * or
	     | el.align("middle");
	    \*/
	    Element.prototype.align = function (el, way) {
	        return this.transform("..." + this.getAlign(el, way));
	    };
	});
	
	module.exports = Snap


/***/ },
/* 5 */
/*!**********************!*\
  !*** ./~/eve/eve.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
	// 
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	// 
	// http://www.apache.org/licenses/LICENSE-2.0
	// 
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	// ┌────────────────────────────────────────────────────────────┐ \\
	// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
	// ├────────────────────────────────────────────────────────────┤ \\
	// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
	// └────────────────────────────────────────────────────────────┘ \\
	
	(function (glob) {
	    var version = "0.4.2",
	        has = "hasOwnProperty",
	        separator = /[\.\/]/,
	        comaseparator = /\s*,\s*/,
	        wildcard = "*",
	        fun = function () {},
	        numsort = function (a, b) {
	            return a - b;
	        },
	        current_event,
	        stop,
	        events = {n: {}},
	        firstDefined = function () {
	            for (var i = 0, ii = this.length; i < ii; i++) {
	                if (typeof this[i] != "undefined") {
	                    return this[i];
	                }
	            }
	        },
	        lastDefined = function () {
	            var i = this.length;
	            while (--i) {
	                if (typeof this[i] != "undefined") {
	                    return this[i];
	                }
	            }
	        },
	    /*\
	     * eve
	     [ method ]
	
	     * Fires event with given `name`, given scope and other parameters.
	
	     > Arguments
	
	     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
	     - scope (object) context for the event handlers
	     - varargs (...) the rest of arguments will be sent to event handlers
	
	     = (object) array of returned values from the listeners. Array has two methods `.firstDefined()` and `.lastDefined()` to get first or last not `undefined` value.
	    \*/
	        eve = function (name, scope) {
	            name = String(name);
	            var e = events,
	                oldstop = stop,
	                args = Array.prototype.slice.call(arguments, 2),
	                listeners = eve.listeners(name),
	                z = 0,
	                f = false,
	                l,
	                indexed = [],
	                queue = {},
	                out = [],
	                ce = current_event,
	                errors = [];
	            out.firstDefined = firstDefined;
	            out.lastDefined = lastDefined;
	            current_event = name;
	            stop = 0;
	            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
	                indexed.push(listeners[i].zIndex);
	                if (listeners[i].zIndex < 0) {
	                    queue[listeners[i].zIndex] = listeners[i];
	                }
	            }
	            indexed.sort(numsort);
	            while (indexed[z] < 0) {
	                l = queue[indexed[z++]];
	                out.push(l.apply(scope, args));
	                if (stop) {
	                    stop = oldstop;
	                    return out;
	                }
	            }
	            for (i = 0; i < ii; i++) {
	                l = listeners[i];
	                if ("zIndex" in l) {
	                    if (l.zIndex == indexed[z]) {
	                        out.push(l.apply(scope, args));
	                        if (stop) {
	                            break;
	                        }
	                        do {
	                            z++;
	                            l = queue[indexed[z]];
	                            l && out.push(l.apply(scope, args));
	                            if (stop) {
	                                break;
	                            }
	                        } while (l)
	                    } else {
	                        queue[l.zIndex] = l;
	                    }
	                } else {
	                    out.push(l.apply(scope, args));
	                    if (stop) {
	                        break;
	                    }
	                }
	            }
	            stop = oldstop;
	            current_event = ce;
	            return out;
	        };
	        // Undocumented. Debug only.
	        eve._events = events;
	    /*\
	     * eve.listeners
	     [ method ]
	
	     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.
	
	     > Arguments
	
	     - name (string) name of the event, dot (`.`) or slash (`/`) separated
	
	     = (array) array of event handlers
	    \*/
	    eve.listeners = function (name) {
	        var names = name.split(separator),
	            e = events,
	            item,
	            items,
	            k,
	            i,
	            ii,
	            j,
	            jj,
	            nes,
	            es = [e],
	            out = [];
	        for (i = 0, ii = names.length; i < ii; i++) {
	            nes = [];
	            for (j = 0, jj = es.length; j < jj; j++) {
	                e = es[j].n;
	                items = [e[names[i]], e[wildcard]];
	                k = 2;
	                while (k--) {
	                    item = items[k];
	                    if (item) {
	                        nes.push(item);
	                        out = out.concat(item.f || []);
	                    }
	                }
	            }
	            es = nes;
	        }
	        return out;
	    };
	    
	    /*\
	     * eve.on
	     [ method ]
	     **
	     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
	     | eve.on("*.under.*", f);
	     | eve("mouse.under.floor"); // triggers f
	     * Use @eve to trigger the listener.
	     **
	     > Arguments
	     **
	     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
	     - f (function) event handler function
	     **
	     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
	     > Example:
	     | eve.on("mouse", eatIt)(2);
	     | eve.on("mouse", scream);
	     | eve.on("mouse", catchIt)(1);
	     * This will ensure that `catchIt` function will be called before `eatIt`.
	     *
	     * If you want to put your handler before non-indexed handlers, specify a negative value.
	     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
	    \*/
	    eve.on = function (name, f) {
	        name = String(name);
	        if (typeof f != "function") {
	            return function () {};
	        }
	        var names = name.split(comaseparator);
	        for (var i = 0, ii = names.length; i < ii; i++) {
	            (function (name) {
	                var names = name.split(separator),
	                    e = events,
	                    exist;
	                for (var i = 0, ii = names.length; i < ii; i++) {
	                    e = e.n;
	                    e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
	                }
	                e.f = e.f || [];
	                for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
	                    exist = true;
	                    break;
	                }
	                !exist && e.f.push(f);
	            }(names[i]));
	        }
	        return function (zIndex) {
	            if (+zIndex == +zIndex) {
	                f.zIndex = +zIndex;
	            }
	        };
	    };
	    /*\
	     * eve.f
	     [ method ]
	     **
	     * Returns function that will fire given event with optional arguments.
	     * Arguments that will be passed to the result function will be also
	     * concated to the list of final arguments.
	     | el.onclick = eve.f("click", 1, 2);
	     | eve.on("click", function (a, b, c) {
	     |     console.log(a, b, c); // 1, 2, [event object]
	     | });
	     > Arguments
	     - event (string) event name
	     - varargs (…) and any other arguments
	     = (function) possible event handler function
	    \*/
	    eve.f = function (event) {
	        var attrs = [].slice.call(arguments, 1);
	        return function () {
	            eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
	        };
	    };
	    /*\
	     * eve.stop
	     [ method ]
	     **
	     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
	    \*/
	    eve.stop = function () {
	        stop = 1;
	    };
	    /*\
	     * eve.nt
	     [ method ]
	     **
	     * Could be used inside event handler to figure out actual name of the event.
	     **
	     > Arguments
	     **
	     - subname (string) #optional subname of the event
	     **
	     = (string) name of the event, if `subname` is not specified
	     * or
	     = (boolean) `true`, if current event’s name contains `subname`
	    \*/
	    eve.nt = function (subname) {
	        if (subname) {
	            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
	        }
	        return current_event;
	    };
	    /*\
	     * eve.nts
	     [ method ]
	     **
	     * Could be used inside event handler to figure out actual name of the event.
	     **
	     **
	     = (array) names of the event
	    \*/
	    eve.nts = function () {
	        return current_event.split(separator);
	    };
	    /*\
	     * eve.off
	     [ method ]
	     **
	     * Removes given function from the list of event listeners assigned to given name.
	     * If no arguments specified all the events will be cleared.
	     **
	     > Arguments
	     **
	     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
	     - f (function) event handler function
	    \*/
	    /*\
	     * eve.unbind
	     [ method ]
	     **
	     * See @eve.off
	    \*/
	    eve.off = eve.unbind = function (name, f) {
	        if (!name) {
	            eve._events = events = {n: {}};
	            return;
	        }
	        var names = name.split(comaseparator);
	        if (names.length > 1) {
	            for (var i = 0, ii = names.length; i < ii; i++) {
	                eve.off(names[i], f);
	            }
	            return;
	        }
	        names = name.split(separator);
	        var e,
	            key,
	            splice,
	            i, ii, j, jj,
	            cur = [events];
	        for (i = 0, ii = names.length; i < ii; i++) {
	            for (j = 0; j < cur.length; j += splice.length - 2) {
	                splice = [j, 1];
	                e = cur[j].n;
	                if (names[i] != wildcard) {
	                    if (e[names[i]]) {
	                        splice.push(e[names[i]]);
	                    }
	                } else {
	                    for (key in e) if (e[has](key)) {
	                        splice.push(e[key]);
	                    }
	                }
	                cur.splice.apply(cur, splice);
	            }
	        }
	        for (i = 0, ii = cur.length; i < ii; i++) {
	            e = cur[i];
	            while (e.n) {
	                if (f) {
	                    if (e.f) {
	                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
	                            e.f.splice(j, 1);
	                            break;
	                        }
	                        !e.f.length && delete e.f;
	                    }
	                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
	                        var funcs = e.n[key].f;
	                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
	                            funcs.splice(j, 1);
	                            break;
	                        }
	                        !funcs.length && delete e.n[key].f;
	                    }
	                } else {
	                    delete e.f;
	                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
	                        delete e.n[key].f;
	                    }
	                }
	                e = e.n;
	            }
	        }
	    };
	    /*\
	     * eve.once
	     [ method ]
	     **
	     * Binds given event handler with a given name to only run once then unbind itself.
	     | eve.once("login", f);
	     | eve("login"); // triggers f
	     | eve("login"); // no listeners
	     * Use @eve to trigger the listener.
	     **
	     > Arguments
	     **
	     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
	     - f (function) event handler function
	     **
	     = (function) same return function as @eve.on
	    \*/
	    eve.once = function (name, f) {
	        var f2 = function () {
	            eve.unbind(name, f2);
	            return f.apply(this, arguments);
	        };
	        return eve.on(name, f2);
	    };
	    /*\
	     * eve.version
	     [ property (string) ]
	     **
	     * Current version of the library.
	    \*/
	    eve.version = version;
	    eve.toString = function () {
	        return "You are running Eve " + version;
	    };
	    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : ( true ? (!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return eve; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))) : (glob.eve = eve));
	})(this);


/***/ },
/* 6 */
/*!************************************!*\
  !*** ./src/vendor/pan-zoom.coffee ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter, PanZoom, debug, findPos, getRelativePosition, init,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	EventEmitter = __webpack_require__(/*! events */ 7);
	
	debug = __webpack_require__(/*! debug */ 8)('kartograph-pan-zoom');
	
	findPos = function(obj) {
	  var posX, posY;
	  posX = obj.offsetLeft;
	  posY = obj.offsetTop;
	  while (obj.offsetParent) {
	    if (obj === document.getElementsByTagName('body')[0]) {
	      break;
	    } else {
	      posX = posX + obj.offsetParent.offsetLeft;
	      posY = posY + obj.offsetParent.offsetTop;
	      obj = obj.offsetParent;
	    }
	  }
	  return [posX, posY];
	};
	
	getRelativePosition = function(e, obj) {
	  var pos, x, y;
	  x = void 0;
	  y = void 0;
	  if (e.pageX || e.pageY) {
	    x = e.pageX;
	    y = e.pageY;
	  } else {
	    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	  }
	  pos = findPos(obj);
	  x -= pos[0];
	  y -= pos[1];
	  return {
	    x: x,
	    y: y
	  };
	};
	
	PanZoom = (function(superClass) {
	  extend(PanZoom, superClass);
	
	  function PanZoom(paper, options) {
	    var mousewheelevt;
	    this.paper = paper;
	    if (options == null) {
	      options = {};
	    }
	    this.handleMouseUp = bind(this.handleMouseUp, this);
	    this.handleMouseDown = bind(this.handleMouseDown, this);
	    this.handleScroll = bind(this.handleScroll, this);
	    this.dragging = bind(this.dragging, this);
	    this.container = this.paper.node.parentNode;
	    this.settings = {};
	    this.initialPos = {
	      x: 0,
	      y: 0
	    };
	    mousewheelevt = /Firefox/i.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel';
	    this.enabled = false;
	    this.dragThreshold = 5;
	    this.dragTime = 0;
	    this.settings.maxZoom = options.maxZoom || 9;
	    this.settings.minZoom = options.minZoom || 0;
	    this.settings.zoomStep = options.zoomStep || 0.1;
	    this.settings.initialZoom = options.initialZoom || 0;
	    this.settings.initialPosition = options.initialPosition || {
	      x: 0,
	      y: 0
	    };
	    this.currZoom = this.settings.initialZoom;
	    this.currPos = this.settings.initialPosition;
	    this.repaint(true);
	    if (this.container.attachEvent) {
	      this.container.attachEvent('on' + mousewheelevt, this.handleScroll);
	      this.container.attachEvent('onmousedown', this.handleMouseDown);
	      this.container.attachEvent('onmouseup', this.handleMouseUp);
	    } else if (this.container.addEventListener) {
	      this.container.addEventListener(mousewheelevt, this.handleScroll, false);
	      this.container.addEventListener('mousedown', this.handleMouseDown, false);
	      this.container.addEventListener('mouseup', this.handleMouseUp, false);
	    }
	  }
	
	  PanZoom.prototype.getPaperDim = function() {
	    return {
	      w: parseInt(this.paper.attr('width')),
	      h: parseInt(this.paper.attr('height'))
	    };
	  };
	
	  PanZoom.prototype.repaint = function(force, deltaX, deltaY) {
	    var newHeight, newPos, newWidth, paperDim;
	    if (deltaX == null) {
	      deltaX = 0;
	    }
	    if (deltaY == null) {
	      deltaY = 0;
	    }
	    debug('repaint zoom: %s, pos: %o', this.currZoom, this.currPos);
	    newPos = {
	      x: this.currPos.x + deltaX,
	      y: this.currPos.y + deltaY
	    };
	    paperDim = this.getPaperDim();
	    newWidth = paperDim.w * (1 - (this.currZoom * this.settings.zoomStep));
	    newHeight = paperDim.h * (1 - (this.currZoom * this.settings.zoomStep));
	    if (newPos.x < 0) {
	      newPos.x = 0;
	    } else if (newPos.x > paperDim.w * this.currZoom * this.settings.zoomStep) {
	      newPos.x = paperDim.w * this.currZoom * this.settings.zoomStep;
	    }
	    if (newPos.y < 0) {
	      newPos.y = 0;
	    } else if (newPos.y > paperDim.h * this.currZoom * this.settings.zoomStep) {
	      newPos.y = paperDim.h * this.currZoom * this.settings.zoomStep;
	    }
	    debug('new pos: %o, new size: %o', newPos, {
	      width: newWidth,
	      height: newHeight
	    });
	    if (!force && newPos.x === this.currPos.x && newPos.y === this.currPos.y) {
	      return false;
	    }
	    this.currPos = newPos;
	    this.setViewBox(this.currPos.x, this.currPos.y, newWidth, newHeight);
	    return true;
	  };
	
	  PanZoom.prototype.setViewBox = function(x, y, w, h) {
	    return this.paper.attr({
	      viewBox: x + "," + y + "," + w + "," + h
	    });
	  };
	
	  PanZoom.prototype.dragging = function(e) {
	    var dx, dy, evt, newHeight, newPoint, newWidth, paperDim;
	    if (!this.enabled) {
	      return false;
	    }
	    evt = window.event || e;
	    paperDim = this.getPaperDim();
	    newWidth = paperDim.w * (1 - (this.currZoom * this.settings.zoomStep));
	    newHeight = paperDim.h * (1 - (this.currZoom * this.settings.zoomStep));
	    newPoint = getRelativePosition(evt, this.container);
	    dx = newWidth * (newPoint.x - this.initialPos.x) / paperDim.w * -1;
	    dy = newHeight * (newPoint.y - this.initialPos.y) / paperDim.h * -1;
	    this.initialPos = newPoint;
	    this.applyPan(dx, dy);
	    this.dragTime += 1;
	    if (evt.preventDefault) {
	      evt.preventDefault();
	    } else {
	      evt.returnValue = false;
	    }
	    return false;
	  };
	
	  PanZoom.prototype.applyZoom = function(val, centerPoint) {
	    var deltaX, deltaY, paperDim;
	    if (!this.enabled) {
	      return;
	    }
	    this.emit('beforeApplyZoom', val, centerPoint, this);
	    paperDim = this.getPaperDim();
	    this.currZoom += val;
	    if (this.currZoom <= this.settings.minZoom) {
	      this.currZoom = this.settings.minZoom;
	    } else if (this.currZoom >= this.settings.maxZoom) {
	      this.currZoom = this.settings.maxZoom;
	    } else {
	      centerPoint = centerPoint || {
	        x: paperDim.w / 2,
	        y: paperDim.h / 2
	      };
	      deltaX = paperDim.w * this.settings.zoomStep * centerPoint.x / paperDim.w * val;
	      deltaY = paperDim.h * this.settings.zoomStep * centerPoint.y / paperDim.h * val;
	    }
	    if (this.repaint(false, deltaX, deltaY)) {
	      return this.emit('afterApplyZoom', val, centerPoint, this);
	    }
	  };
	
	  PanZoom.prototype.applyPan = function(dX, dY) {
	    var deltaX, deltaY;
	    this.emit('beforeApplyPan', dX, dY, this);
	    deltaX = dX;
	    deltaY = dY;
	    if (this.repaint(false, deltaX, deltaY)) {
	      return this.emit('afterApplyPan', dX, dY, this);
	    }
	  };
	
	  PanZoom.prototype.handleScroll = function(e) {
	    var delta, evt, zoomCenter;
	    if (!this.enabled) {
	      return false;
	    }
	    evt = window.event || e;
	    delta = evt.detail || evt.wheelDelta * -1;
	    zoomCenter = getRelativePosition(evt, this.container);
	    if (delta > 0) {
	      delta = -1;
	    } else if (delta < 0) {
	      delta = 1;
	    }
	    this.applyZoom(delta, zoomCenter);
	    if (evt.preventDefault) {
	      evt.preventDefault();
	    } else {
	      evt.returnValue = false;
	    }
	    return false;
	  };
	
	  PanZoom.prototype.handleMouseDown = function(e) {
	    var evt;
	    if (!this.enabled) {
	      return false;
	    }
	    evt = window.event || e;
	    this.dragTime = 0;
	    this.initialPos = getRelativePosition(evt, this.container);
	    this.container.className += ' grabbing';
	    this.container.onmousemove = this.dragging;
	    document.onmousemove = function() {
	      return false;
	    };
	    if (evt.preventDefault) {
	      evt.preventDefault();
	    } else {
	      evt.returnValue = false;
	    }
	    return false;
	  };
	
	  PanZoom.prototype.handleMouseUp = function(e) {
	    document.onmousemove = null;
	    this.container.className = this.container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
	    return this.container.onmousemove = null;
	  };
	
	  PanZoom.prototype.enable = function() {
	    return this.enabled = true;
	  };
	
	  PanZoom.prototype.disable = function() {
	    return this.enabled = false;
	  };
	
	  PanZoom.prototype.zoomIn = function(steps) {
	    return this.applyZoom(steps);
	  };
	
	  PanZoom.prototype.zoomOut = function(steps) {
	    if (steps > 0) {
	      return this.applyZoom(-steps);
	    } else {
	      return this.applyZoom(steps);
	    }
	  };
	
	  PanZoom.prototype.pan = function(deltaX, deltaY) {
	    return this.applyPan(-deltaX, -deltaY);
	  };
	
	  PanZoom.prototype.isDragging = function() {
	    return this.dragTime > this.dragThreshold;
	  };
	
	  PanZoom.prototype.getCurrentPosition = function() {
	    return this.currPos;
	  };
	
	  PanZoom.prototype.getCurrentZoom = function() {
	    return this.currZoom;
	  };
	
	  return PanZoom;
	
	})(EventEmitter);
	
	init = function(Snap, Element, Paper) {
	  return Paper.prototype.panzoom = function(options) {
	    if (this._panzoomInstance) {
	      return this._panzoomInstance;
	    } else {
	      return this._panzoomInstance = new PanZoom(this, options);
	    }
	  };
	};
	
	module.exports = init;


/***/ },
/* 7 */
/*!****************************!*\
  !*** ./~/events/events.js ***!
  \****************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 8 */
/*!********************************!*\
  !*** ./~/debug/src/browser.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(/*! ./debug */ 10);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // NB: In an Electron preload script, document will be defined but not fully
	  // initialized. Since we know we're in Chrome, we'll just detect this case
	  // explicitly
	  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
	    return true;
	  }
	
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
	    // double check webkit in userAgent just in case we are in a worker
	    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  try {
	    return JSON.stringify(v);
	  } catch (err) {
	    return '[UnexpectedJSONParseError]: ' + err.message;
	  }
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs(args) {
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return;
	
	  var c = 'color: ' + this.color;
	  args.splice(1, 0, c, 'color: inherit')
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-zA-Z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  try {
	    return exports.storage.debug;
	  } catch(e) {}
	
	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	  if (typeof process !== 'undefined' && 'env' in process) {
	    return process.env.DEBUG;
	  }
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage() {
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../../process/browser.js */ 9)))

/***/ },
/* 9 */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 10 */
/*!******************************!*\
  !*** ./~/debug/src/debug.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = createDebug.debug = createDebug.default = createDebug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(/*! ms */ 11);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 * @param {String} namespace
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor(namespace) {
	  var hash = 0, i;
	
	  for (i in namespace) {
	    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
	    hash |= 0; // Convert to 32bit integer
	  }
	
	  return exports.colors[Math.abs(hash) % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function createDebug(namespace) {
	
	  function debug() {
	    // disabled?
	    if (!debug.enabled) return;
	
	    var self = debug;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // turn the `arguments` into a proper Array
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %O
	      args.unshift('%O');
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    // apply env-specific formatting (colors, etc.)
	    exports.formatArgs.call(self, args);
	
	    var logFn = debug.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	
	  debug.namespace = namespace;
	  debug.enabled = exports.enabled(namespace);
	  debug.useColors = exports.useColors();
	  debug.color = selectColor(namespace);
	
	  // env-specific initialization logic for debug instances
	  if ('function' === typeof exports.init) {
	    exports.init(debug);
	  }
	
	  return debug;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 11 */
/*!***********************!*\
  !*** ./~/ms/index.js ***!
  \***********************/
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000
	var m = s * 60
	var h = m * 60
	var d = h * 24
	var y = d * 365.25
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function (val, options) {
	  options = options || {}
	  var type = typeof val
	  if (type === 'string' && val.length > 0) {
	    return parse(val)
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ?
				fmtLong(val) :
				fmtShort(val)
	  }
	  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
	}
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = String(str)
	  if (str.length > 10000) {
	    return
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
	  if (!match) {
	    return
	  }
	  var n = parseFloat(match[1])
	  var type = (match[2] || 'ms').toLowerCase()
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n
	    default:
	      return undefined
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd'
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h'
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm'
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's'
	  }
	  return ms + 'ms'
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms'
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) {
	    return
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's'
	}


/***/ },
/* 12 */
/*!**************************!*\
  !*** ./src/utils.coffee ***!
  \**************************/
/***/ function(module, exports) {

	var log, type, warn;
	
	warn = function(s) {
	  var e;
	  try {
	    return console.warn.apply(console, arguments);
	  } catch (error) {
	    e = error;
	    try {
	      return opera.postError.apply(opera, arguments);
	    } catch (error) {
	      e = error;
	      return alert(Array.prototype.join.call(arguments, ' '));
	    }
	  }
	};
	
	log = function(s) {
	  var e;
	  try {
	    return console.debug.apply(console, arguments);
	  } catch (error) {
	    e = error;
	    try {
	      return opera.postError.apply(opera, arguments);
	    } catch (error) {
	      e = error;
	      return alert(Array.prototype.join.call(arguments, ' '));
	    }
	  }
	};
	
	type = (function() {
	
	  /*
	  for browser-safe type checking+
	  ported from jQuery's $.type
	   */
	  var classToType, i, len, name, ref;
	  classToType = {};
	  ref = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Undefined", "Null"];
	  for (i = 0, len = ref.length; i < len; i++) {
	    name = ref[i];
	    classToType["[object " + name + "]"] = name.toLowerCase();
	  }
	  return function(obj) {
	    var strType;
	    strType = Object.prototype.toString.call(obj);
	    return classToType[strType] || "object";
	  };
	})();
	
	module.exports = {
	  warn: warn,
	  log: log,
	  type: type
	};


/***/ },
/* 13 */
/*!******************************!*\
  !*** ./src/core/view.coffee ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
	    kartograph - a svg mapping library
	    Copyright (C) 2011  Gregor Aisch
	
	    This program is free software: you can redistribute it and/or modify
	    it under the terms of the GNU General Public License as published by
	    the Free Software Foundation, either version 3 of the License, or
	    (at your option) any later version.
	
	    This program is distributed in the hope that it will be useful,
	    but WITHOUT ANY WARRANTY; without even the implied warranty of
	    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	    GNU General Public License for more detailme.
	
	    You should have received a copy of the GNU General Public License
	    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */
	var BBox, View, geom;
	
	geom = __webpack_require__(/*! ./geom */ 14);
	
	BBox = __webpack_require__(/*! ./bbox */ 17);
	
	View = (function() {
	
	  /*
	  2D coordinate transfomation
	   */
	  View.fromXML = function(xml) {
	
	    /*
	    constructs a view from XML
	     */
	    var bbox, bbox_xml, h, pad, w;
	    w = Number(xml.getAttribute('w'));
	    h = Number(xml.getAttribute('h'));
	    pad = Number(xml.getAttribute('padding'));
	    bbox_xml = xml.getElementsByTagName('bbox')[0];
	    bbox = BBox.fromXML(bbox_xml);
	    return new View(bbox, w, h, pad);
	  };
	
	  function View(bbox, width, height, padding, halign, valign) {
	    this.bbox = bbox;
	    this.width = width;
	    this.padding = padding != null ? padding : 0;
	    this.halign = halign != null ? halign : 'center';
	    this.valign = valign != null ? valign : 'center';
	    this.height = height;
	    this.scale = Math.min((width - padding * 2) / bbox.width, (height - padding * 2) / bbox.height);
	  }
	
	  View.prototype.project = function(x, y) {
	    var bbox, h, s, w, xf, yf;
	    if (y == null) {
	      y = x[1];
	      x = x[0];
	    }
	    s = this.scale;
	    bbox = this.bbox;
	    h = this.height;
	    w = this.width;
	    xf = this.halign === "center" ? (w - bbox.width * s) * 0.5 : this.halign === "left" ? this.padding * s : w - (bbox.width - this.padding) * s;
	    yf = this.valign === "center" ? (h - bbox.height * s) * 0.5 : this.valign === "top" ? this.padding * s : 0;
	    x = (x - bbox.left) * s + xf;
	    y = (y - bbox.top) * s + yf;
	    return [x, y];
	  };
	
	  View.prototype.projectPath = function(path) {
	    var bbox, cont, contours, i, j, len, len1, new_path, pcont, r, ref, ref1, ref2, ref3, x, y;
	    if (path.type === "path") {
	      contours = [];
	      bbox = [99999, 99999, -99999, -99999];
	      ref = path.contours;
	      for (i = 0, len = ref.length; i < len; i++) {
	        pcont = ref[i];
	        cont = [];
	        for (j = 0, len1 = pcont.length; j < len1; j++) {
	          ref1 = pcont[j], x = ref1[0], y = ref1[1];
	          ref2 = this.project(x, y), x = ref2[0], y = ref2[1];
	          cont.push([x, y]);
	          bbox[0] = Math.min(bbox[0], x);
	          bbox[1] = Math.min(bbox[1], y);
	          bbox[2] = Math.max(bbox[2], x);
	          bbox[3] = Math.max(bbox[3], y);
	        }
	        contours.push(cont);
	      }
	      new_path = new geom.Path(path.type, contours, path.closed);
	      new_path._bbox = bbox;
	      return new_path;
	    } else if (path.type === "circle") {
	      ref3 = this.project(path.x, path.y), x = ref3[0], y = ref3[1];
	      r = path.r * this.scale;
	      return new geom.Circle(x, y, r);
	    }
	  };
	
	  View.prototype.asBBox = function() {
	    return new BBox(0, 0, this.width, this.height);
	  };
	
	  return View;
	
	})();
	
	module.exports = View;


/***/ },
/* 14 */
/*!************************************!*\
  !*** ./src/core/geom/index.coffee ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var geom;
	
	geom = __webpack_require__(/*! ./path */ 15);
	
	geom.clipping = __webpack_require__(/*! ./clipping */ 16);
	
	module.exports = geom;


/***/ },
/* 15 */
/*!***********************************!*\
  !*** ./src/core/geom/path.coffee ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var Circle, Line, Path, Snap, __area, __is_clockwise, __point_in_polygon, clipping,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Snap = __webpack_require__(/*! ../../vendor/snap */ 3);
	
	clipping = __webpack_require__(/*! ./clipping */ 16);
	
	Path = (function() {
	
	  /*
	  represents complex polygons (aka multi-polygons)
	   */
	  Path.fromSVG = function(path) {
	
	    /*
	    loads a path from a SVG path string
	     */
	    var closed, cmd, contour, contours, cx, cy, len1, m, path_data, path_str, r, res, sep, type;
	    contours = [];
	    type = path.nodeName;
	    res = null;
	    if (type === "path") {
	      path_str = path.getAttribute('d').trim();
	      path_data = Snap.parsePathString(path_str);
	      closed = path_data[path_data.length - 1] === "Z";
	      sep = closed ? "Z M" : "M";
	      contour = [];
	      for (m = 0, len1 = path_data.length; m < len1; m++) {
	        cmd = path_data[m];
	        if (cmd.length === 0) {
	          continue;
	        }
	        if (cmd[0] === "M") {
	          if (contour.length > 2) {
	            contours.push(contour);
	            contour = [];
	          }
	          contour.push([cmd[1], cmd[2]]);
	        } else if (cmd[0] === "L") {
	          contour.push([cmd[1], cmd[2]]);
	        } else if (cmd[0] === "Z") {
	          if (contour.length > 2) {
	            contours.push(contour);
	            contour = [];
	          }
	        }
	      }
	      if (contour.length >= 2) {
	        contours.push(contour);
	        contour = [];
	      }
	      res = new Path(type, contours, closed);
	    } else if (type === "circle") {
	      cx = path.getAttribute("cx");
	      cy = path.getAttribute("cy");
	      r = path.getAttribute("r");
	      res = new Circle(cx, cy, r);
	    }
	    return res;
	  };
	
	  function Path(type, contours, closed) {
	    var cnt, len1, m;
	    if (closed == null) {
	      closed = true;
	    }
	    this.type = type;
	    this.contours = [];
	    for (m = 0, len1 = contours.length; m < len1; m++) {
	      cnt = contours[m];
	      if (!__is_clockwise(cnt)) {
	        cnt.reverse();
	      }
	      this.contours.push(cnt);
	    }
	    this.closed = closed;
	  }
	
	  Path.prototype.clipToBBox = function(bbox) {
	    throw new Error("path clipping is not implemented yet");
	  };
	
	  Path.prototype.toSVG = function(paper) {
	
	    /* translates this path to a SVG path string */
	    var str;
	    str = this.svgString();
	    return paper.path(str);
	  };
	
	  Path.prototype.svgString = function() {
	    var contour, fst, glue, len1, len2, m, o, ref, ref1, str, x, y;
	    str = "";
	    glue = this.closed ? "Z M" : "M";
	    ref = this.contours;
	    for (m = 0, len1 = ref.length; m < len1; m++) {
	      contour = ref[m];
	      fst = true;
	      str += str === "" ? "M" : glue;
	      for (o = 0, len2 = contour.length; o < len2; o++) {
	        ref1 = contour[o], x = ref1[0], y = ref1[1];
	        if (!fst) {
	          str += "L";
	        }
	        str += x + ',' + y;
	        fst = false;
	      }
	    }
	    if (this.closed) {
	      str += "Z";
	    }
	    return str;
	  };
	
	  Path.prototype.area = function() {
	    var area, cnt, len1, m, ref;
	    if (this.areas != null) {
	      return this._area;
	    }
	    this.areas = [];
	    this._area = 0;
	    ref = this.contours;
	    for (m = 0, len1 = ref.length; m < len1; m++) {
	      cnt = ref[m];
	      area = __area(cnt);
	      this.areas.push(area);
	      this._area += area;
	    }
	    return this._area;
	  };
	
	  Path.prototype.centroid = function() {
	    var S, _lengths, a, area, cnt, cnt_orig, cx, cy, diff, dx, dy, i, j, k, l, len, m, o, p0, p1, q, ref, ref1, ref2, ref3, ref4, s, sp, t, total_len, u, w, x, x_, y, y_;
	    if (this._centroid != null) {
	      return this._centroid;
	    }
	    area = this.area();
	    cx = cy = 0;
	    for (i = m = 0, ref = this.contours.length - 1; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
	      cnt_orig = this.contours[i];
	      cnt = [];
	      l = cnt_orig.length;
	      a = this.areas[i];
	      k = a / area;
	      if (k === 0) {
	        continue;
	      }
	      for (j = o = 0, ref1 = l - 1; 0 <= ref1 ? o <= ref1 : o >= ref1; j = 0 <= ref1 ? ++o : --o) {
	        p0 = cnt_orig[j];
	        p1 = cnt_orig[(j + 1) % l];
	        diff = 0;
	        cnt.push(p0);
	        if (p0[0] === p1[0]) {
	          diff = Math.abs(p0[1] - p1[1]);
	        }
	        if (p0[1] === p1[1]) {
	          diff = Math.abs(p0[0] - p1[0]);
	        }
	        if (diff > 10) {
	          S = Math.floor(diff * 2);
	          for (s = q = 1, ref2 = S - 1; 1 <= ref2 ? q <= ref2 : q >= ref2; s = 1 <= ref2 ? ++q : --q) {
	            sp = [p0[0] + s / S * (p1[0] - p0[0]), p0[1] + s / S * (p1[1] - p0[1])];
	            cnt.push(sp);
	          }
	        }
	      }
	      x = y = x_ = y_ = 0;
	      l = cnt.length;
	      _lengths = [];
	      total_len = 0;
	      for (j = t = 0, ref3 = l - 1; 0 <= ref3 ? t <= ref3 : t >= ref3; j = 0 <= ref3 ? ++t : --t) {
	        p0 = cnt[j];
	        p1 = cnt[(j + 1) % l];
	        dx = p1[0] - p0[0];
	        dy = p1[1] - p0[1];
	        len = Math.sqrt(dx * dx + dy * dy);
	        _lengths.push(len);
	        total_len += len;
	      }
	      for (j = u = 0, ref4 = l - 1; 0 <= ref4 ? u <= ref4 : u >= ref4; j = 0 <= ref4 ? ++u : --u) {
	        p0 = cnt[j];
	        w = _lengths[j] / total_len;
	        x += w * p0[0];
	        y += w * p0[1];
	      }
	      cx += x * k;
	      cy += y * k;
	    }
	    this._centroid = [cx, cy];
	    return this._centroid;
	  };
	
	  Path.prototype.isInside = function(x, y) {
	    var bbox, cnt, i, m, ref;
	    bbox = this._bbox;
	    if (x < bbox[0] || x > bbox[2] || y < bbox[1] || y > bbox[3]) {
	      return false;
	    }
	    for (i = m = 0, ref = this.contours.length - 1; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
	      cnt = this.contours[i];
	      if (__point_in_polygon(cnt, [x, y])) {
	        return true;
	      }
	    }
	    return false;
	  };
	
	  return Path;
	
	})();
	
	Circle = (function(superClass) {
	  extend(Circle, superClass);
	
	  function Circle(x3, y3, r1) {
	    this.x = x3;
	    this.y = y3;
	    this.r = r1;
	    Circle.__super__.constructor.call(this, 'circle', null, true);
	  }
	
	  Circle.prototype.toSVG = function(paper) {
	    return paper.circle(this.x, this.y, this.r);
	  };
	
	  Circle.prototype.centroid = function() {
	    return [this.x, this.y];
	  };
	
	  Circle.prototype.area = function() {
	    return Math.PI * this.r * this.r;
	  };
	
	  return Circle;
	
	})(Path);
	
	Line = (function() {
	
	  /*
	  represents simple lines
	   */
	  function Line(points) {
	    this.points = points;
	  }
	
	  Line.prototype.clipToBBox = function(bbox) {
	    var clip, err, i, last_in, lines, m, p0x, p0y, p1x, p1y, pts, ref, ref1, ref2, ref3, x0, x1, y0, y1;
	    clip = new clipping.CohenSutherland().clip;
	    pts = [];
	    lines = [];
	    last_in = false;
	    for (i = m = 0, ref = this.points.length - 2; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
	      ref1 = this.points[i], p0x = ref1[0], p0y = ref1[1];
	      ref2 = this.points[i + 1], p1x = ref2[0], p1y = ref2[1];
	      try {
	        ref3 = clip(bbox, p0x, p0y, p1x, p1y), x0 = ref3[0], y0 = ref3[1], x1 = ref3[2], y1 = ref3[3];
	        last_in = true;
	        pts.push([x0, y0]);
	        if (p1x !== x1 || p1y !== y0 || i === len(this.points) - 2) {
	          pts.push([x1, y1]);
	        }
	      } catch (error) {
	        err = error;
	        if (last_in && pts.length > 1) {
	          lines.push(new Line(pts));
	          pts = [];
	        }
	        last_in = false;
	      }
	    }
	    if (pts.length > 1) {
	      lines.push(new Line(pts));
	    }
	    return lines;
	  };
	
	  Line.prototype.toSVG = function() {
	    var len1, m, pts, ref, ref1, x, y;
	    pts = [];
	    ref = this.points;
	    for (m = 0, len1 = ref.length; m < len1; m++) {
	      ref1 = ref[m], x = ref1[0], y = ref1[1];
	      pts.push(x + ',' + y);
	    }
	    return 'M' + pts.join('L');
	  };
	
	  return Line;
	
	})();
	
	__point_in_polygon = function(polygon, p) {
	  var angle, atan2, dtheta, i, m, n, pi, ref, theta1, theta2, twopi, x1, x2, y1, y2;
	  pi = Math.PI;
	  atan2 = Math.atan2;
	  twopi = pi * 2;
	  n = polygon.length;
	  angle = 0;
	  for (i = m = 0, ref = n - 1; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
	    x1 = polygon[i][0] - p[0];
	    y1 = polygon[i][1] - p[1];
	    x2 = polygon[(i + 1) % n][0] - p[0];
	    y2 = polygon[(i + 1) % n][1] - p[1];
	    theta1 = atan2(y1, x1);
	    theta2 = atan2(y2, x2);
	    dtheta = theta2 - theta1;
	    while (dtheta > pi) {
	      dtheta -= twopi;
	    }
	    while (dtheta < -pi) {
	      dtheta += twopi;
	    }
	    angle += dtheta;
	  }
	  return Math.abs(angle) >= pi;
	};
	
	__is_clockwise = function(contour) {
	  return __area(contour) > 0;
	};
	
	__area = function(contour) {
	  var i, m, n, ref, s, x1, x2, y1, y2;
	  s = 0;
	  n = contour.length;
	  for (i = m = 0, ref = n; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
	    x1 = contour[i][0];
	    y1 = contour[i][1];
	    x2 = contour[(i + 1) % n][0];
	    y2 = contour[(i + 1) % n][1];
	    s += x1 * y2 - x2 * y1;
	  }
	  return s *= 0.5;
	};
	
	module.exports = {
	  Path: Path,
	  Circle: Circle,
	  Line: Line
	};


/***/ },
/* 16 */
/*!***************************************!*\
  !*** ./src/core/geom/clipping.coffee ***!
  \***************************************/
/***/ function(module, exports) {

	
	/*
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
	 */
	var CohenSutherland;
	
	CohenSutherland = (function() {
	  var BOTTOM, INSIDE, LEFT, RIGHT, TOP;
	
	  function CohenSutherland() {}
	
	  INSIDE = 0;
	
	  LEFT = 1;
	
	  RIGHT = 2;
	
	  BOTTOM = 4;
	
	  TOP = 8;
	
	  CohenSutherland.prototype.compute_out_code = function(bbox, x, y) {
	    var code;
	    code = INSIDE;
	    if (x < bbox.left) {
	      code |= LEFT;
	    } else if (x > bbox.right) {
	      code |= RIGHT;
	    }
	    if (y < bbox.top) {
	      code |= TOP;
	    } else if (y > bbox.bottom) {
	      code |= BOTTOM;
	    }
	    return code;
	  };
	
	  CohenSutherland.prototype.clip = function(bbox, x0, y0, x1, y1) {
	    var accept, code0, code1, cout, x, y;
	    code0 = this.compute_out_code(bbox, x0, y0);
	    code1 = this.compute_out_code(bbox, x1, y1);
	    accept = False;
	    while (True) {
	      if (!(code0 | code1)) {
	        accept = True;
	        break;
	      } else if (code0 & code1) {
	        break;
	      } else {
	        cout = code === 0 ? code1 : code0;
	        if (cout & TOP) {
	          x = x0 + (x1 - x0) * (bbox.top - y0) / (y1 - y0);
	          y = bbox.top;
	        } else if (cout & BOTTOM) {
	          x = x0 + (x1 - x0) * (bbox.bottom - y0) / (y1 - y0);
	          y = bbox.bottom;
	        } else if (cout & RIGHT) {
	          y = y0 + (y1 - y0) * (bbox.right - x0) / (x1 - x0);
	          x = bbox.right;
	        } else if (cout & LEFT) {
	          y = y0 + (y1 - y0) * (bbox.left - x0) / (x1 - x0);
	          x = bbox.left;
	        }
	        if (cout === code0) {
	          x0 = x;
	          y0 = y;
	          code0 = this.compute_out_code(bbox, x0, y0);
	        } else {
	          x1 = x;
	          y1 = y;
	          code1 = this.compute_out_code(bbox, x1, y1);
	        }
	      }
	    }
	    if (accept) {
	      return [x0, y0, x1, y1];
	    } else {
	      return null;
	    }
	  };
	
	  return CohenSutherland;
	
	})();
	
	module.exports = {
	  CohenSutherland: CohenSutherland
	};


/***/ },
/* 17 */
/*!******************************!*\
  !*** ./src/core/bbox.coffee ***!
  \******************************/
/***/ function(module, exports) {

	
	/*
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
	 */
	var BBox;
	
	BBox = (function() {
	
	  /*
	  2D bounding box
	   */
	  BBox.fromXML = function(xml) {
	    var h, w, x, y;
	    x = Number(xml.getAttribute('x'));
	    y = Number(xml.getAttribute('y'));
	    w = Number(xml.getAttribute('w'));
	    h = Number(xml.getAttribute('h'));
	    return new BBox(x, y, w, h);
	  };
	
	  function BBox(left, top, width, height) {
	    if (left == null) {
	      left = 0;
	    }
	    if (top == null) {
	      top = 0;
	    }
	    if (width == null) {
	      width = null;
	    }
	    if (height == null) {
	      height = null;
	    }
	    if (width === null) {
	      this.xmin = Number.MAX_VALUE;
	      this.xmax = -Number.MAX_VALUE;
	    } else {
	      this.xmin = this.left = left;
	      this.xmax = this.right = left + width;
	      this.width = width;
	    }
	    if (height === null) {
	      this.ymin = Number.MAX_VALUE;
	      this.ymax = -Number.MAX_VALUE;
	    } else {
	      this.ymin = this.top = top;
	      this.ymax = this.bottom = height + top;
	      this.height = height;
	    }
	  }
	
	  BBox.prototype.update = function(x, y) {
	    if (y == null) {
	      y = x[1];
	      x = x[0];
	    }
	    this.xmin = Math.min(this.xmin, x);
	    this.ymin = Math.min(this.ymin, y);
	    this.xmax = Math.max(this.xmax, x);
	    this.ymax = Math.max(this.ymax, y);
	    this.left = this.xmin;
	    this.top = this.ymin;
	    this.right = this.xmax;
	    this.bottom = this.ymax;
	    this.width = this.xmax - this.xmin;
	    this.height = this.ymax - this.ymin;
	    return this;
	  };
	
	  BBox.prototype.intersects = function(bbox) {
	    return bbox.left < this.right && bbox.right > this.left && bbox.top < this.bottom && bbox.bottom > this.top;
	  };
	
	  BBox.prototype.inside = function(x, y) {
	    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
	  };
	
	  BBox.prototype.join = function(bbox) {
	    this.update(bbox.left, bbox.top);
	    this.update(bbox.right, bbox.bottom);
	    return this;
	  };
	
	  return BBox;
	
	})();
	
	module.exports = BBox;


/***/ },
/* 18 */
/*!******************************!*\
  !*** ./src/core/proj.coffee ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var Aitoff, Azimuthal, BBox, Balthasart, Behrmann, CEA, CantersModifiedSinusoidalI, Conic, Cylindrical, EckertIV, EquidistantAzimuthal, Equirectangular, GallPeters, GoodeHomolosine, Hatano, HoboDyer, LAEA, LAEA_Alaska, LAEA_Hawaii, LAEA_USA, LCC, Loximuthal, Mercator, Mollweide, NaturalEarth, Nicolosi, Orthographic, Proj, PseudoConic, PseudoCylindrical, Robinson, Satellite, Sinusoidal, Stereographic, WagnerIV, WagnerV, Winkel3, proj,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	BBox = __webpack_require__(/*! ./bbox */ 17);
	
	Proj = (function() {
	  Proj.parameters = [];
	
	  Proj.title = "Projection";
	
	  Proj.fromXML = function(xml) {
	
	    /*
	    reconstructs a projection from xml description
	     */
	    var attr, i, id, j, opts, prj, ref;
	    id = xml.getAttribute('id');
	    opts = {};
	    for (i = j = 0, ref = xml.attributes.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
	      attr = xml.attributes[i];
	      if (attr.name !== "id") {
	        opts[attr.name] = attr.value;
	      }
	    }
	    if (proj[id] == null) {
	      throw new Error('unknown projection ' + id);
	    }
	    prj = new proj[id](opts);
	    prj.name = id;
	    return prj;
	  };
	
	  function Proj(opts) {
	    var ref, ref1;
	    this.lon0 = (ref = opts.lon0) != null ? ref : 0;
	    this.lat0 = (ref1 = opts.lat0) != null ? ref1 : 0;
	    this.PI = Math.PI;
	    this.HALFPI = this.PI * .5;
	    this.QUARTERPI = this.PI * .25;
	    this.RAD = this.PI / 180;
	    this.DEG = 180 / this.PI;
	    this.lam0 = this.rad(this.lon0);
	    this.phi0 = this.rad(this.lat0);
	    this.minLat = -90;
	    this.maxLat = 90;
	  }
	
	  Proj.prototype.rad = function(a) {
	    return a * this.RAD;
	  };
	
	  Proj.prototype.deg = function(a) {
	    return a * this.DEG;
	  };
	
	  Proj.prototype.plot = function(polygon, truncate) {
	    var ignore, j, lat, len, lon, points, ref, ref1, vis, x, y;
	    if (truncate == null) {
	      truncate = true;
	    }
	    points = [];
	    ignore = true;
	    for (j = 0, len = polygon.length; j < len; j++) {
	      ref = polygon[j], lon = ref[0], lat = ref[1];
	      vis = this._visible(lon, lat);
	      if (vis) {
	        ignore = false;
	      }
	      ref1 = this.project(lon, lat), x = ref1[0], y = ref1[1];
	      if (!vis && truncate) {
	        points.push(this._truncate(x, y));
	      } else {
	        points.push([x, y]);
	      }
	    }
	    if (ignore) {
	      return null;
	    } else {
	      return [points];
	    }
	  };
	
	  Proj.prototype.sea = function() {
	    var j, l, l0, lat, lon, o, p, q, ref, ref1, ref2, ref3, t;
	    p = this.project.bind(this);
	    o = [];
	    l0 = this.lon0;
	    this.lon0 = 0;
	    for (lon = j = -180; j <= 180; lon = ++j) {
	      o.push(p(lon, this.maxLat));
	    }
	    for (lat = l = ref = this.maxLat, ref1 = this.minLat; ref <= ref1 ? l <= ref1 : l >= ref1; lat = ref <= ref1 ? ++l : --l) {
	      o.push(p(180, lat));
	    }
	    for (lon = q = 180; q >= -180; lon = --q) {
	      o.push(p(lon, this.minLat));
	    }
	    for (lat = t = ref2 = this.minLat, ref3 = this.maxLat; ref2 <= ref3 ? t <= ref3 : t >= ref3; lat = ref2 <= ref3 ? ++t : --t) {
	      o.push(p(-180, lat));
	    }
	    this.lon0 = l0;
	    return o;
	  };
	
	  Proj.prototype.world_bbox = function() {
	    var bbox, j, len, p, s, sea;
	    p = this.project.bind(this);
	    sea = this.sea();
	    bbox = new BBox();
	    for (j = 0, len = sea.length; j < len; j++) {
	      s = sea[j];
	      bbox.update(s[0], s[1]);
	    }
	    return bbox;
	  };
	
	  Proj.prototype.toString = function() {
	    return "[Proj: " + this.name + "]";
	  };
	
	  return Proj;
	
	})();
	
	Cylindrical = (function(superClass) {
	
	  /*
	  Base class for cylindrical projections
	   */
	  extend(Cylindrical, superClass);
	
	  Cylindrical.parameters = ['lon0', 'flip'];
	
	  Cylindrical.title = "Cylindrical Projection";
	
	  function Cylindrical(opts) {
	    var ref, ref1;
	    if (opts == null) {
	      opts = {};
	    }
	    this.flip = Number((ref = opts.flip) != null ? ref : 0);
	    if (this.flip === 1) {
	      opts.lon0 = (ref1 = -opts.lon0) != null ? ref1 : 0;
	    }
	    Cylindrical.__super__.constructor.call(this, opts);
	  }
	
	  Cylindrical.prototype._visible = function(lon, lat) {
	    return true;
	  };
	
	  Cylindrical.prototype.clon = function(lon) {
	    lon -= this.lon0;
	    if (lon < -180) {
	      lon += 360;
	    } else if (lon > 180) {
	      lon -= 360;
	    }
	    return lon;
	  };
	
	  Cylindrical.prototype.ll = function(lon, lat) {
	    if (this.flip === 1) {
	      return [-lon, -lat];
	    } else {
	      return [lon, lat];
	    }
	  };
	
	  return Cylindrical;
	
	})(Proj);
	
	Equirectangular = (function(superClass) {
	
	  /*
	  Equirectangular Projection aka Lonlat aka Plate Carree
	   */
	  extend(Equirectangular, superClass);
	
	  function Equirectangular() {
	    return Equirectangular.__super__.constructor.apply(this, arguments);
	  }
	
	  Equirectangular.title = "Equirectangular Projection";
	
	  Equirectangular.prototype.project = function(lon, lat) {
	    var ref;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lon = this.clon(lon);
	    return [lon * Math.cos(this.phi0) * 1000, lat * -1 * 1000];
	  };
	
	  return Equirectangular;
	
	})(Cylindrical);
	
	CEA = (function(superClass) {
	  extend(CEA, superClass);
	
	  CEA.parameters = ['lon0', 'lat1', 'flip'];
	
	  CEA.title = "Cylindrical Equal Area";
	
	  function CEA(opts) {
	    var ref;
	    CEA.__super__.constructor.call(this, opts);
	    this.lat1 = (ref = opts.lat1) != null ? ref : 0;
	    this.phi1 = this.rad(this.lat1);
	  }
	
	
	  /*
	  Cylindrical Equal Area Projection
	   */
	
	  CEA.prototype.project = function(lon, lat) {
	    var lam, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat * -1);
	    x = lam * Math.cos(this.phi1);
	    y = Math.sin(phi) / Math.cos(this.phi1);
	    return [x * 1000, y * 1000];
	  };
	
	  return CEA;
	
	})(Cylindrical);
	
	GallPeters = (function(superClass) {
	
	  /*
	  Gall-Peters Projection
	   */
	  extend(GallPeters, superClass);
	
	  GallPeters.title = "Gall-Peters Projection";
	
	  GallPeters.parameters = ['lon0', 'flip'];
	
	  function GallPeters(opts) {
	    opts.lat1 = 45;
	    GallPeters.__super__.constructor.call(this, opts);
	  }
	
	  return GallPeters;
	
	})(CEA);
	
	HoboDyer = (function(superClass) {
	
	  /*
	  Hobo-Dyer Projection
	   */
	  extend(HoboDyer, superClass);
	
	  HoboDyer.title = "Hobo-Dyer Projection";
	
	  HoboDyer.parameters = ['lon0', 'flip'];
	
	  function HoboDyer(opts) {
	    opts.lat1 = 37.7;
	    HoboDyer.__super__.constructor.call(this, opts);
	  }
	
	  return HoboDyer;
	
	})(CEA);
	
	Behrmann = (function(superClass) {
	
	  /*
	  Behrmann Projection
	   */
	  extend(Behrmann, superClass);
	
	  Behrmann.title = "Behrmann Projection";
	
	  Behrmann.parameters = ['lon0', 'flip'];
	
	  function Behrmann(opts) {
	    opts.lat1 = 30;
	    Behrmann.__super__.constructor.call(this, opts);
	  }
	
	  return Behrmann;
	
	})(CEA);
	
	Balthasart = (function(superClass) {
	
	  /*
	  Balthasart Projection
	   */
	  extend(Balthasart, superClass);
	
	  Balthasart.title = "Balthasart Projection";
	
	  Balthasart.parameters = ['lon0', 'flip'];
	
	  function Balthasart(opts) {
	    opts.lat1 = 50;
	    Balthasart.__super__.constructor.call(this, opts);
	  }
	
	  return Balthasart;
	
	})(CEA);
	
	Mercator = (function(superClass) {
	
	  /*
	   * you're not really into maps..
	   */
	  extend(Mercator, superClass);
	
	  Mercator.title = "Mercator Projection";
	
	  function Mercator(opts) {
	    Mercator.__super__.constructor.call(this, opts);
	    this.minLat = -85;
	    this.maxLat = 85;
	  }
	
	  Mercator.prototype.project = function(lon, lat) {
	    var lam, math, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    math = Math;
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat * -1);
	    x = lam * 1000;
	    y = math.log((1 + math.sin(phi)) / math.cos(phi)) * 1000;
	    return [x, y];
	  };
	
	  return Mercator;
	
	})(Cylindrical);
	
	PseudoCylindrical = (function(superClass) {
	
	  /*
	  Base class for pseudo cylindrical projections
	   */
	  extend(PseudoCylindrical, superClass);
	
	  function PseudoCylindrical() {
	    return PseudoCylindrical.__super__.constructor.apply(this, arguments);
	  }
	
	  PseudoCylindrical.title = "Pseudo-Cylindrical Projection";
	
	  return PseudoCylindrical;
	
	})(Cylindrical);
	
	NaturalEarth = (function(superClass) {
	
	  /*
	  Natural Earth Projection
	  see here http://www.shadedrelief.com/NE_proj/
	   */
	  extend(NaturalEarth, superClass);
	
	  NaturalEarth.title = "Natural Earth Projection";
	
	  function NaturalEarth(opts) {
	    NaturalEarth.__super__.constructor.call(this, opts);
	    this.A0 = 0.8707;
	    this.A1 = -0.131979;
	    this.A2 = -0.013791;
	    this.A3 = 0.003971;
	    this.A4 = -0.001529;
	    this.B0 = 1.007226;
	    this.B1 = 0.015085;
	    this.B2 = -0.044475;
	    this.B3 = 0.028874;
	    this.B4 = -0.005916;
	    this.C0 = this.B0;
	    this.C1 = 3 * this.B1;
	    this.C2 = 7 * this.B2;
	    this.C3 = 9 * this.B3;
	    this.C4 = 11 * this.B4;
	    this.EPS = 1e-11;
	    this.MAX_Y = 0.8707 * 0.52 * Math.PI;
	  }
	
	  NaturalEarth.prototype.project = function(lon, lat) {
	    var lplam, lpphi, phi2, phi4, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lplam = this.rad(this.clon(lon));
	    lpphi = this.rad(lat * -1);
	    phi2 = lpphi * lpphi;
	    phi4 = phi2 * phi2;
	    x = lplam * (this.A0 + phi2 * (this.A1 + phi2 * (this.A2 + phi4 * phi2 * (this.A3 + phi2 * this.A4)))) * 180 + 500;
	    y = lpphi * (this.B0 + phi2 * (this.B1 + phi4 * (this.B2 + this.B3 * phi2 + this.B4 * phi4))) * 180 + 270;
	    return [x, y];
	  };
	
	  return NaturalEarth;
	
	})(PseudoCylindrical);
	
	Robinson = (function(superClass) {
	
	  /*
	  Robinson Projection
	   */
	  extend(Robinson, superClass);
	
	  Robinson.title = "Robinson Projection";
	
	  function Robinson(opts) {
	    Robinson.__super__.constructor.call(this, opts);
	    this.X = [1, -5.67239e-12, -7.15511e-05, 3.11028e-06, 0.9986, -0.000482241, -2.4897e-05, -1.33094e-06, 0.9954, -0.000831031, -4.4861e-05, -9.86588e-07, 0.99, -0.00135363, -5.96598e-05, 3.67749e-06, 0.9822, -0.00167442, -4.4975e-06, -5.72394e-06, 0.973, -0.00214869, -9.03565e-05, 1.88767e-08, 0.96, -0.00305084, -9.00732e-05, 1.64869e-06, 0.9427, -0.00382792, -6.53428e-05, -2.61493e-06, 0.9216, -0.00467747, -0.000104566, 4.8122e-06, 0.8962, -0.00536222, -3.23834e-05, -5.43445e-06, 0.8679, -0.00609364, -0.0001139, 3.32521e-06, 0.835, -0.00698325, -6.40219e-05, 9.34582e-07, 0.7986, -0.00755337, -5.00038e-05, 9.35532e-07, 0.7597, -0.00798325, -3.59716e-05, -2.27604e-06, 0.7186, -0.00851366, -7.0112e-05, -8.63072e-06, 0.6732, -0.00986209, -0.000199572, 1.91978e-05, 0.6213, -0.010418, 8.83948e-05, 6.24031e-06, 0.5722, -0.00906601, 0.000181999, 6.24033e-06, 0.5322, 0, 0, 0];
	    this.Y = [0, 0.0124, 3.72529e-10, 1.15484e-09, 0.062, 0.0124001, 1.76951e-08, -5.92321e-09, 0.124, 0.0123998, -7.09668e-08, 2.25753e-08, 0.186, 0.0124008, 2.66917e-07, -8.44523e-08, 0.248, 0.0123971, -9.99682e-07, 3.15569e-07, 0.31, 0.0124108, 3.73349e-06, -1.1779e-06, 0.372, 0.0123598, -1.3935e-05, 4.39588e-06, 0.434, 0.0125501, 5.20034e-05, -1.00051e-05, 0.4968, 0.0123198, -9.80735e-05, 9.22397e-06, 0.5571, 0.0120308, 4.02857e-05, -5.2901e-06, 0.6176, 0.0120369, -3.90662e-05, 7.36117e-07, 0.6769, 0.0117015, -2.80246e-05, -8.54283e-07, 0.7346, 0.0113572, -4.08389e-05, -5.18524e-07, 0.7903, 0.0109099, -4.86169e-05, -1.0718e-06, 0.8435, 0.0103433, -6.46934e-05, 5.36384e-09, 0.8936, 0.00969679, -6.46129e-05, -8.54894e-06, 0.9394, 0.00840949, -0.000192847, -4.21023e-06, 0.9761, 0.00616525, -0.000256001, -4.21021e-06, 1, 0, 0, 0];
	    this.NODES = 18;
	    this.FXC = 0.8487;
	    this.FYC = 1.3523;
	    this.C1 = 11.45915590261646417544;
	    this.RC1 = 0.08726646259971647884;
	    this.ONEEPS = 1.000001;
	    this.EPS = 1e-8;
	  }
	
	  Robinson.prototype._poly = function(arr, offs, z) {
	    return arr[offs] + z * (arr[offs + 1] + z * (arr[offs + 2] + z * arr[offs + 3]));
	  };
	
	  Robinson.prototype.project = function(lon, lat) {
	    var i, lplam, lpphi, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lon = this.clon(lon);
	    lplam = this.rad(lon);
	    lpphi = this.rad(lat * -1);
	    phi = Math.abs(lpphi);
	    i = Math.floor(phi * this.C1);
	    if (i >= this.NODES) {
	      i = this.NODES - 1;
	    }
	    phi = this.deg(phi - this.RC1 * i);
	    i *= 4;
	    x = 1000 * this._poly(this.X, i, phi) * this.FXC * lplam;
	    y = 1000 * this._poly(this.Y, i, phi) * this.FYC;
	    if (lpphi < 0.0) {
	      y = -y;
	    }
	    return [x, y];
	  };
	
	  return Robinson;
	
	})(PseudoCylindrical);
	
	EckertIV = (function(superClass) {
	
	  /*
	  Eckert IV Projection
	   */
	  extend(EckertIV, superClass);
	
	  EckertIV.title = "Eckert IV Projection";
	
	  function EckertIV(opts) {
	    EckertIV.__super__.constructor.call(this, opts);
	    this.C_x = .42223820031577120149;
	    this.C_y = 1.32650042817700232218;
	    this.RC_y = .75386330736002178205;
	    this.C_p = 3.57079632679489661922;
	    this.RC_p = .28004957675577868795;
	    this.EPS = 1e-7;
	    this.NITER = 6;
	  }
	
	  EckertIV.prototype.project = function(lon, lat) {
	    var V, c, i, lplam, lpphi, p, ref, s, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lplam = this.rad(this.clon(lon));
	    lpphi = this.rad(lat * -1);
	    p = this.C_p * Math.sin(lpphi);
	    V = lpphi * lpphi;
	    lpphi *= 0.895168 + V * (0.0218849 + V * 0.00826809);
	    i = this.NITER;
	    while (i > 0) {
	      c = Math.cos(lpphi);
	      s = Math.sin(lpphi);
	      V = (lpphi + s * (c + 2) - p) / (1 + c * (c + 2) - s * s);
	      lpphi -= V;
	      if (Math.abs(V) < this.EPS) {
	        break;
	      }
	      i -= 1;
	    }
	    if (i === 0) {
	      x = this.C_x * lplam;
	      y = lpphi < 0 ? -this.C_y : this.C_y;
	    } else {
	      x = this.C_x * lplam * (1 + Math.cos(lpphi));
	      y = this.C_y * Math.sin(lpphi);
	    }
	    return [x, y];
	  };
	
	  return EckertIV;
	
	})(PseudoCylindrical);
	
	Sinusoidal = (function(superClass) {
	
	  /*
	  Sinusoidal Projection
	   */
	  extend(Sinusoidal, superClass);
	
	  function Sinusoidal() {
	    return Sinusoidal.__super__.constructor.apply(this, arguments);
	  }
	
	  Sinusoidal.title = "Sinusoidal Projection";
	
	  Sinusoidal.prototype.project = function(lon, lat) {
	    var lam, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat * -1);
	    x = 1032 * lam * Math.cos(phi);
	    y = 1032 * phi;
	    return [x, y];
	  };
	
	  return Sinusoidal;
	
	})(PseudoCylindrical);
	
	Mollweide = (function(superClass) {
	
	  /*
	  Mollweide Projection
	   */
	  extend(Mollweide, superClass);
	
	  Mollweide.title = "Mollweide Projection";
	
	  function Mollweide(opts, p, cx, cy, cp) {
	    var p2, r, sp;
	    if (p == null) {
	      p = 1.5707963267948966;
	    }
	    if (cx == null) {
	      cx = null;
	    }
	    if (cy == null) {
	      cy = null;
	    }
	    if (cp == null) {
	      cp = null;
	    }
	    Mollweide.__super__.constructor.call(this, opts);
	    this.MAX_ITER = 10;
	    this.TOLERANCE = 1e-7;
	    if (p != null) {
	      p2 = p + p;
	      sp = Math.sin(p);
	      r = Math.sqrt(Math.PI * 2.0 * sp / (p2 + Math.sin(p2)));
	      this.cx = 2 * r / Math.PI;
	      this.cy = r / sp;
	      this.cp = p2 + Math.sin(p2);
	    } else if ((cx != null) && (cy != null) && (typeof cz !== "undefined" && cz !== null)) {
	      this.cx = cx;
	      this.cy = cy;
	      this.cp = cp;
	    } else {
	      warn('kartograph.proj.Mollweide: either p or cx,cy,cp must be defined');
	    }
	  }
	
	  Mollweide.prototype.project = function(lon, lat) {
	    var abs, i, k, lam, math, phi, ref, v, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    math = Math;
	    abs = math.abs;
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat);
	    k = this.cp * math.sin(phi);
	    i = this.MAX_ITER;
	    while (i !== 0) {
	      v = (phi + math.sin(phi) - k) / (1 + math.cos(phi));
	      phi -= v;
	      if (abs(v) < this.TOLERANCE) {
	        break;
	      }
	      i -= 1;
	    }
	    if (i === 0) {
	      phi = phi >= 0 ? this.HALFPI : -this.HALFPI;
	    } else {
	      phi *= 0.5;
	    }
	    x = 1000 * this.cx * lam * math.cos(phi);
	    y = 1000 * this.cy * math.sin(phi);
	    return [x, y * -1];
	  };
	
	  return Mollweide;
	
	})(PseudoCylindrical);
	
	WagnerIV = (function(superClass) {
	
	  /*
	  Wagner IV Projection
	   */
	  extend(WagnerIV, superClass);
	
	  WagnerIV.title = "Wagner IV Projection";
	
	  function WagnerIV(opts) {
	    WagnerIV.__super__.constructor.call(this, opts, 1.0471975511965976);
	  }
	
	  return WagnerIV;
	
	})(Mollweide);
	
	WagnerV = (function(superClass) {
	
	  /*
	  Wagner V Projection
	   */
	  extend(WagnerV, superClass);
	
	  WagnerV.title = "Wagner V Projection";
	
	  function WagnerV(opts) {
	    WagnerV.__super__.constructor.call(this, opts, null, 0.90977, 1.65014, 3.00896);
	  }
	
	  return WagnerV;
	
	})(Mollweide);
	
	Loximuthal = (function(superClass) {
	  var maxLat, minLat;
	
	  extend(Loximuthal, superClass);
	
	  function Loximuthal() {
	    return Loximuthal.__super__.constructor.apply(this, arguments);
	  }
	
	  minLat = -89;
	
	  maxLat = 89;
	
	  Loximuthal.parameters = ['lon0', 'lat0', 'flip'];
	
	  Loximuthal.title = "Loximuthal Projection (equidistant)";
	
	  Loximuthal.prototype.project = function(lon, lat) {
	    var lam, math, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    math = Math;
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat);
	    if (phi === this.phi0) {
	      x = lam * math.cos(this.phi0);
	    } else {
	      x = lam * (phi - this.phi0) / (math.log(math.tan(this.QUARTERPI + phi * 0.5)) - math.log(math.tan(this.QUARTERPI + this.phi0 * 0.5)));
	    }
	    x *= 1000;
	    y = 1000 * (phi - this.phi0);
	    return [x, y * -1];
	  };
	
	  return Loximuthal;
	
	})(PseudoCylindrical);
	
	CantersModifiedSinusoidalI = (function(superClass) {
	
	  /*
	  Canters, F. (2002) Small-scale Map projection Design. p. 218-219.
	  Modified Sinusoidal, equal-area.
	  
	  implementation borrowed from
	  http://cartography.oregonstate.edu/temp/AdaptiveProjection/src/projections/Canters1.js
	   */
	  var C1, C3, C3x3, C5, C5x5;
	
	  extend(CantersModifiedSinusoidalI, superClass);
	
	  function CantersModifiedSinusoidalI() {
	    return CantersModifiedSinusoidalI.__super__.constructor.apply(this, arguments);
	  }
	
	  CantersModifiedSinusoidalI.title = "Canters Modified Sinusoidal I";
	
	  CantersModifiedSinusoidalI.parameters = ['lon0'];
	
	  C1 = 1.1966;
	
	  C3 = -0.1290;
	
	  C3x3 = 3 * C3;
	
	  C5 = -0.0076;
	
	  C5x5 = 5 * C5;
	
	  CantersModifiedSinusoidalI.prototype.project = function(lon, lat) {
	    var me, ref, x, y, y2, y4;
	    me = this;
	    ref = me.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lon = me.rad(me.clon(lon));
	    lat = me.rad(lat);
	    y2 = lat * lat;
	    y4 = y2 * y2;
	    x = 1000 * lon * Math.cos(lat) / (C1 + C3x3 * y2 + C5x5 * y4);
	    y = 1000 * lat * (C1 + C3 * y2 + C5 * y4);
	    return [x, y * -1];
	  };
	
	  return CantersModifiedSinusoidalI;
	
	})(PseudoCylindrical);
	
	Hatano = (function(superClass) {
	  var CN, CS, EPS, FXC, FYCN, FYCS, NITER, ONETOL, RCN, RCS, RXC, RYCN, RYCS;
	
	  extend(Hatano, superClass);
	
	  function Hatano() {
	    return Hatano.__super__.constructor.apply(this, arguments);
	  }
	
	  Hatano.title = "Hatano Projection";
	
	  NITER = 20;
	
	  EPS = 1e-7;
	
	  ONETOL = 1.000001;
	
	  CN = 2.67595;
	
	  CS = 2.43763;
	
	  RCN = 0.37369906014686373063;
	
	  RCS = 0.41023453108141924738;
	
	  FYCN = 1.75859;
	
	  FYCS = 1.93052;
	
	  RYCN = 0.56863737426006061674;
	
	  RYCS = 0.51799515156538134803;
	
	  FXC = 0.85;
	
	  RXC = 1.17647058823529411764;
	
	  Hatano.prototype.project = function(lon, lat) {
	    var c, i, j, lam, phi, ref, ref1, th1, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat);
	    c = Math.sin(phi) * (phi < 0.0 ? CS : CN);
	    for (i = j = ref1 = NITER; j >= 1; i = j += -1) {
	      th1 = (phi + Math.sin(phi) - c) / (1.0 + Math.cos(phi));
	      phi -= th1;
	      if (Math.abs(th1) < EPS) {
	        break;
	      }
	    }
	    x = 1000 * FXC * lam * Math.cos(phi *= 0.5);
	    y = 1000 * Math.sin(phi) * (phi < 0.0 ? FYCS : FYCN);
	    return [x, y * -1];
	  };
	
	  return Hatano;
	
	})(PseudoCylindrical);
	
	GoodeHomolosine = (function(superClass) {
	  extend(GoodeHomolosine, superClass);
	
	  GoodeHomolosine.title = "Goode Homolosine Projection";
	
	  GoodeHomolosine.parameters = ['lon0'];
	
	  function GoodeHomolosine(opts) {
	    GoodeHomolosine.__super__.constructor.call(this, opts);
	    this.lat1 = 41.737;
	    this.p1 = new Mollweide();
	    this.p0 = new Sinusoidal();
	  }
	
	  GoodeHomolosine.prototype.project = function(lon, lat) {
	    var ref;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lon = this.clon(lon);
	    if (Math.abs(lat) > this.lat1) {
	      return this.p1.project(lon, lat);
	    } else {
	      return this.p0.project(lon, lat);
	    }
	  };
	
	  return GoodeHomolosine;
	
	})(PseudoCylindrical);
	
	Nicolosi = (function(superClass) {
	  var EPS;
	
	  extend(Nicolosi, superClass);
	
	  Nicolosi.title = "Nicolosi Globular Projection";
	
	  Nicolosi.parameters = ['lon0'];
	
	  EPS = 1e-10;
	
	  function Nicolosi(opts) {
	    Nicolosi.__super__.constructor.call(this, opts);
	    this.r = this.HALFPI * 100;
	  }
	
	  Nicolosi.prototype._visible = function(lon, lat) {
	    lon = this.clon(lon);
	    return lon > -90 && lon < 90;
	  };
	
	  Nicolosi.prototype.project = function(lon, lat) {
	    var c, d, lam, m, n, phi, r2, ref, sp, tb, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lam = this.rad(this.clon(lon));
	    phi = this.rad(lat);
	    if (Math.abs(lam) < EPS) {
	      x = 0;
	      y = phi;
	    } else if (Math.abs(phi) < EPS) {
	      x = lam;
	      y = 0;
	    } else if (Math.abs(Math.abs(lam) - this.HALFPI) < EPS) {
	      x = lam * Math.cos(phi);
	      y = this.HALFPI * Math.sin(phi);
	    } else if (Math.abs(Math.abs(phi) - this.HALFPI) < EPS) {
	      x = 0;
	      y = phi;
	    } else {
	      tb = this.HALFPI / lam - lam / this.HALFPI;
	      c = phi / this.HALFPI;
	      sp = Math.sin(phi);
	      d = (1 - c * c) / (sp - c);
	      r2 = tb / d;
	      r2 *= r2;
	      m = (tb * sp / d - 0.5 * tb) / (1.0 + r2);
	      n = (sp / r2 + 0.5 * d) / (1.0 + 1.0 / r2);
	      x = Math.cos(phi);
	      x = Math.sqrt(m * m + x * x / (1.0 + r2));
	      x = this.HALFPI * (m + (lam < 0 ? -x : x));
	      y = Math.sqrt(n * n - (sp * sp / r2 + d * sp - 1.0) / (1.0 + 1.0 / r2));
	      y = this.HALFPI * (n + (phi < 0 ? y : -y));
	    }
	    return [x * 100, y * -100];
	  };
	
	  Nicolosi.prototype.sea = function() {
	    var j, math, out, phi, r;
	    out = [];
	    r = this.r;
	    math = Math;
	    for (phi = j = 0; j <= 360; phi = ++j) {
	      out.push([math.cos(this.rad(phi)) * r, math.sin(this.rad(phi)) * r]);
	    }
	    return out;
	  };
	
	  Nicolosi.prototype.world_bbox = function() {
	    return new BBox(-this.r, -this.r, this.r * 2, this.r * 2);
	  };
	
	  return Nicolosi;
	
	})(PseudoCylindrical);
	
	Azimuthal = (function(superClass) {
	
	  /*
	  Base class for azimuthal projections
	   */
	  extend(Azimuthal, superClass);
	
	  Azimuthal.parameters = ['lon0', 'lat0'];
	
	  Azimuthal.title = "Azimuthal Projection";
	
	  function Azimuthal(opts, rad) {
	    if (rad == null) {
	      rad = 1000;
	    }
	    Azimuthal.__super__.constructor.call(this, opts);
	    this.r = rad;
	    this.elevation0 = this.to_elevation(this.lat0);
	    this.azimuth0 = this.to_azimuth(this.lon0);
	  }
	
	  Azimuthal.prototype.to_elevation = function(lat) {
	    return ((lat + 90) / 180) * this.PI - this.HALFPI;
	  };
	
	  Azimuthal.prototype.to_azimuth = function(lon) {
	    return ((lon + 180) / 360) * this.PI * 2 - this.PI;
	  };
	
	  Azimuthal.prototype._visible = function(lon, lat) {
	    var azimuth, cosc, elevation;
	    elevation = this.to_elevation(lat);
	    azimuth = this.to_azimuth(lon);
	    cosc = Math.sin(elevation) * Math.sin(this.elevation0) + Math.cos(this.elevation0) * Math.cos(elevation) * Math.cos(azimuth - this.azimuth0);
	    return cosc >= 0.0;
	  };
	
	  Azimuthal.prototype._truncate = function(x, y) {
	    var r, theta, x1, y1;
	    r = this.r;
	    theta = Math.atan2(y - r, x - r);
	    x1 = r + r * Math.cos(theta);
	    y1 = r + r * Math.sin(theta);
	    return [x1, y1];
	  };
	
	  Azimuthal.prototype.sea = function() {
	    var j, phi, results;
	    results = [];
	    for (phi = j = 0; j <= 360; phi = ++j) {
	      results.push([this.r + Math.cos(this.rad(phi)) * this.r, this.r + Math.sin(this.rad(phi)) * this.r]);
	    }
	    return results;
	  };
	
	  Azimuthal.prototype.world_bbox = function() {
	    return new BBox(0, 0, this.r * 2, this.r * 2);
	  };
	
	  return Azimuthal;
	
	})(Proj);
	
	Orthographic = (function(superClass) {
	
	  /*
	  Orthographic Azimuthal Projection
	  
	  implementation taken from http://www.mccarroll.net/snippets/svgworld/
	   */
	  extend(Orthographic, superClass);
	
	  function Orthographic() {
	    return Orthographic.__super__.constructor.apply(this, arguments);
	  }
	
	  Orthographic.title = "Orthographic Projection";
	
	  Orthographic.prototype.project = function(lon, lat) {
	    var azimuth, elevation, x, xo, y, yo;
	    elevation = this.to_elevation(lat);
	    azimuth = this.to_azimuth(lon);
	    xo = this.r * Math.cos(elevation) * Math.sin(azimuth - this.azimuth0);
	    yo = -this.r * (Math.cos(this.elevation0) * Math.sin(elevation) - Math.sin(this.elevation0) * Math.cos(elevation) * Math.cos(azimuth - this.azimuth0));
	    x = this.r + xo;
	    y = this.r + yo;
	    return [x, y];
	  };
	
	  return Orthographic;
	
	})(Azimuthal);
	
	LAEA = (function(superClass) {
	
	  /*
	  Lambert Azimuthal Equal-Area Projection
	  
	  implementation taken from
	  Snyder, Map projections - A working manual
	   */
	  extend(LAEA, superClass);
	
	  LAEA.title = "Lambert Azimuthal Equal-Area Projection";
	
	  function LAEA(opts) {
	    LAEA.__super__.constructor.call(this, opts);
	    this.scale = Math.sqrt(2) * 0.5;
	  }
	
	  LAEA.prototype.project = function(lon, lat) {
	    var cos, k, lam, math, phi, sin, x, xo, y, yo;
	    phi = this.rad(lat);
	    lam = this.rad(lon);
	    math = Math;
	    sin = math.sin;
	    cos = math.cos;
	    if (false) {
	      xo = this.r * 2;
	      yo = 0;
	    } else {
	      k = math.pow(2 / (1 + sin(this.phi0) * sin(phi) + cos(this.phi0) * cos(phi) * cos(lam - this.lam0)), .5);
	      k *= this.scale;
	      xo = this.r * k * cos(phi) * sin(lam - this.lam0);
	      yo = -this.r * k * (cos(this.phi0) * sin(phi) - sin(this.phi0) * cos(phi) * cos(lam - this.lam0));
	    }
	    x = this.r + xo;
	    y = this.r + yo;
	    return [x, y];
	  };
	
	  return LAEA;
	
	})(Azimuthal);
	
	LAEA_Alaska = (function(superClass) {
	  extend(LAEA_Alaska, superClass);
	
	  function LAEA_Alaska() {
	    var opts;
	    opts = {
	      lon0: -150,
	      lat0: 90
	    };
	    LAEA_Alaska.__super__.constructor.call(this, opts);
	    this.scale = Math.sqrt(2) * 0.5 * 0.33;
	  }
	
	  return LAEA_Alaska;
	
	})(LAEA);
	
	LAEA_Hawaii = (function(superClass) {
	  extend(LAEA_Hawaii, superClass);
	
	  function LAEA_Hawaii(opts) {
	    opts = {
	      lon0: -157,
	      lat0: 20
	    };
	    LAEA_Hawaii.__super__.constructor.call(this, opts);
	  }
	
	  return LAEA_Hawaii;
	
	})(LAEA);
	
	LAEA_USA = (function(superClass) {
	  extend(LAEA_USA, superClass);
	
	  function LAEA_USA(opts) {
	    opts.lon0 = -100;
	    opts.lat0 = 45;
	    LAEA_USA.__super__.constructor.call(this, opts);
	    this.laea_alaska = new LAEA_Alaska();
	    this.laea_hawaii = new LAEA_Hawaii();
	  }
	
	  LAEA_USA.prototype.project = function(lon, lat) {
	    var alaska, hawaii, ref, ref1, ref2, x, y;
	    alaska = lat > 44 && (lon < -127 || lon > 170);
	    hawaii = lon < -127 && lat < 44;
	    if (alaska) {
	      if (lon > 170) {
	        lon -= 380;
	      }
	      ref = this.laea_alaska.project(lon, lat), x = ref[0], y = ref[1];
	    } else if (hawaii) {
	      ref1 = this.laea_hawaii.project(lon, lat), x = ref1[0], y = ref1[1];
	    } else {
	      ref2 = LAEA_USA.__super__.project.call(this, lon, lat), x = ref2[0], y = ref2[1];
	    }
	    if (alaska) {
	      x += -180;
	      y += 100;
	    }
	    if (hawaii) {
	      y += 220;
	      x += -80;
	    }
	    return [x, y];
	  };
	
	  return LAEA_USA;
	
	})(LAEA);
	
	Stereographic = (function(superClass) {
	
	  /*
	  Stereographic projection
	  
	  implementation taken from
	  Snyder, Map projections - A working manual
	   */
	  extend(Stereographic, superClass);
	
	  function Stereographic() {
	    return Stereographic.__super__.constructor.apply(this, arguments);
	  }
	
	  Stereographic.title = "Stereographic Projection";
	
	  Stereographic.prototype.project = function(lon, lat) {
	    var cos, k, k0, lam, phi, sin, x, xo, y, yo;
	    phi = this.rad(lat);
	    lam = this.rad(lon);
	    sin = Math.sin;
	    cos = Math.cos;
	    k0 = 0.5;
	    k = 2 * k0 / (1 + sin(this.phi0) * sin(phi) + cos(this.phi0) * cos(phi) * cos(lam - this.lam0));
	    xo = this.r * k * cos(phi) * sin(lam - this.lam0);
	    yo = -this.r * k * (cos(this.phi0) * sin(phi) - sin(this.phi0) * cos(phi) * cos(lam - this.lam0));
	    x = this.r + xo;
	    y = this.r + yo;
	    return [x, y];
	  };
	
	  return Stereographic;
	
	})(Azimuthal);
	
	Satellite = (function(superClass) {
	
	  /*
	  General perspective projection, aka Satellite projection
	  
	  implementation taken from
	  Snyder, Map projections - A working manual
	  
	  up .. angle the camera is turned away from north (clockwise)
	  tilt .. angle the camera is tilted
	   */
	  extend(Satellite, superClass);
	
	  Satellite.parameters = ['lon0', 'lat0', 'tilt', 'dist', 'up'];
	
	  Satellite.title = "Satellite Projection";
	
	  function Satellite(opts) {
	    var j, l, lat, lon, ref, ref1, ref2, xmax, xmin, xy;
	    Satellite.__super__.constructor.call(this, {
	      lon0: 0,
	      lat0: 0
	    });
	    this.dist = (ref = opts.dist) != null ? ref : 3;
	    this.up = this.rad((ref1 = opts.up) != null ? ref1 : 0);
	    this.tilt = this.rad((ref2 = opts.tilt) != null ? ref2 : 0);
	    this.scale = 1;
	    xmin = Number.MAX_VALUE;
	    xmax = Number.MAX_VALUE * -1;
	    for (lat = j = 0; j <= 179; lat = ++j) {
	      for (lon = l = 0; l <= 360; lon = ++l) {
	        xy = this.project(lon - 180, lat - 90);
	        xmin = Math.min(xy[0], xmin);
	        xmax = Math.max(xy[0], xmax);
	      }
	    }
	    this.scale = (this.r * 2) / (xmax - xmin);
	    Satellite.__super__.constructor.call(this, opts);
	    return;
	  }
	
	  Satellite.prototype.project = function(lon, lat, alt) {
	    var A, H, cos, cos_c, cos_tilt, cos_up, k, lam, phi, ra, sin, sin_tilt, sin_up, x, xo, xt, y, yo, yt;
	    if (alt == null) {
	      alt = 0;
	    }
	    phi = this.rad(lat);
	    lam = this.rad(lon);
	    sin = Math.sin;
	    cos = Math.cos;
	    ra = this.r * (alt + 6371) / 3671;
	    cos_c = sin(this.phi0) * sin(phi) + cos(this.phi0) * cos(phi) * cos(lam - this.lam0);
	    k = (this.dist - 1) / (this.dist - cos_c);
	    k = (this.dist - 1) / (this.dist - cos_c);
	    k *= this.scale;
	    xo = ra * k * cos(phi) * sin(lam - this.lam0);
	    yo = -ra * k * (cos(this.phi0) * sin(phi) - sin(this.phi0) * cos(phi) * cos(lam - this.lam0));
	    cos_up = cos(this.up);
	    sin_up = sin(this.up);
	    cos_tilt = cos(this.tilt);
	    sin_tilt = sin(this.tilt);
	    H = ra * (this.dist - 1);
	    A = ((yo * cos_up + xo * sin_up) * sin(this.tilt) / H) + cos_tilt;
	    xt = (xo * cos_up - yo * sin_up) * cos(this.tilt) / A;
	    yt = (yo * cos_up + xo * sin_up) / A;
	    x = this.r + xt;
	    y = this.r + yt;
	    return [x, y];
	  };
	
	  Satellite.prototype._visible = function(lon, lat) {
	    var azimuth, cosc, elevation;
	    elevation = this.to_elevation(lat);
	    azimuth = this.to_azimuth(lon);
	    cosc = Math.sin(elevation) * Math.sin(this.elevation0) + Math.cos(this.elevation0) * Math.cos(elevation) * Math.cos(azimuth - this.azimuth0);
	    return cosc >= (1.0 / this.dist);
	  };
	
	  Satellite.prototype.sea = function() {
	    var j, phi, results;
	    results = [];
	    for (phi = j = 0; j <= 360; phi = ++j) {
	      results.push([this.r + Math.cos(this.rad(phi)) * this.r, this.r + Math.sin(this.rad(phi)) * this.r]);
	    }
	    return results;
	  };
	
	  return Satellite;
	
	})(Azimuthal);
	
	EquidistantAzimuthal = (function(superClass) {
	
	  /*
	  Equidistant projection
	  
	  implementation taken from
	  Snyder, Map projections - A working manual
	   */
	  extend(EquidistantAzimuthal, superClass);
	
	  function EquidistantAzimuthal() {
	    return EquidistantAzimuthal.__super__.constructor.apply(this, arguments);
	  }
	
	  EquidistantAzimuthal.title = "Equidistant Azimuthal Projection";
	
	  EquidistantAzimuthal.prototype.project = function(lon, lat) {
	    var c, cos, cos_c, k, lam, phi, sin, x, xo, y, yo;
	    phi = this.rad(lat);
	    lam = this.rad(lon);
	    sin = Math.sin;
	    cos = Math.cos;
	    cos_c = sin(this.phi0) * sin(phi) + cos(this.phi0) * cos(phi) * cos(lam - this.lam0);
	    c = Math.acos(cos_c);
	    k = 0.325 * c / sin(c);
	    xo = this.r * k * cos(phi) * sin(lam - this.lam0);
	    yo = -this.r * k * (cos(this.phi0) * sin(phi) - sin(this.phi0) * cos(phi) * cos(lam - this.lam0));
	    x = this.r + xo;
	    y = this.r + yo;
	    return [x, y];
	  };
	
	  EquidistantAzimuthal.prototype._visible = function(lon, lat) {
	    return true;
	  };
	
	  return EquidistantAzimuthal;
	
	})(Azimuthal);
	
	Aitoff = (function(superClass) {
	
	  /*
	  Aitoff projection
	  
	  implementation taken from
	  Snyder, Map projections - A working manual
	   */
	  var COSPHI1;
	
	  extend(Aitoff, superClass);
	
	  Aitoff.title = "Aitoff Projection";
	
	  Aitoff.parameters = ['lon0'];
	
	  COSPHI1 = 0.636619772367581343;
	
	  function Aitoff(opts) {
	    opts.lat0 = 0;
	    Aitoff.__super__.constructor.call(this, opts);
	    this.lam0 = 0;
	  }
	
	  Aitoff.prototype.project = function(lon, lat) {
	    var c, d, lam, phi, ref, x, y;
	    ref = this.ll(lon, lat), lon = ref[0], lat = ref[1];
	    lon = this.clon(lon);
	    lam = this.rad(lon);
	    phi = this.rad(lat);
	    c = 0.5 * lam;
	    d = Math.acos(Math.cos(phi) * Math.cos(c));
	    if (d !== 0) {
	      y = 1.0 / Math.sin(d);
	      x = 2.0 * d * Math.cos(phi) * Math.sin(c) * y;
	      y *= d * Math.sin(phi);
	    } else {
	      x = y = 0;
	    }
	    if (this.winkel) {
	      x = (x + lam * COSPHI1) * 0.5;
	      y = (y + phi) * 0.5;
	    }
	    return [x * 1000, y * -1000];
	  };
	
	  Aitoff.prototype._visible = function(lon, lat) {
	    return true;
	  };
	
	  return Aitoff;
	
	})(PseudoCylindrical);
	
	Winkel3 = (function(superClass) {
	  extend(Winkel3, superClass);
	
	  Winkel3.title = "Winkel Tripel Projection";
	
	  function Winkel3(opts) {
	    Winkel3.__super__.constructor.call(this, opts);
	    this.winkel = true;
	  }
	
	  return Winkel3;
	
	})(Aitoff);
	
	Conic = (function(superClass) {
	  extend(Conic, superClass);
	
	  Conic.title = "Conic Projection";
	
	  Conic.parameters = ['lon0', 'lat0', 'lat1', 'lat2'];
	
	  function Conic(opts) {
	    var ref, ref1;
	    Conic.__super__.constructor.call(this, opts);
	    this.lat1 = (ref = opts.lat1) != null ? ref : 30;
	    this.phi1 = this.rad(this.lat1);
	    this.lat2 = (ref1 = opts.lat2) != null ? ref1 : 50;
	    this.phi2 = this.rad(this.lat2);
	  }
	
	  Conic.prototype._visible = function(lon, lat) {
	    return lat > this.minLat && lat < this.maxLat;
	  };
	
	  Conic.prototype._truncate = function(x, y) {
	    return [x, y];
	  };
	
	  Conic.prototype.clon = function(lon) {
	    lon -= this.lon0;
	    if (lon < -180) {
	      lon += 360;
	    } else if (lon > 180) {
	      lon -= 360;
	    }
	    return lon;
	  };
	
	  return Conic;
	
	})(Proj);
	
	LCC = (function(superClass) {
	
	  /*
	  Lambert Conformal Conic Projection (spherical)
	   */
	  extend(LCC, superClass);
	
	  LCC.title = "Lambert Conformal Conic Projection";
	
	  function LCC(opts) {
	    var abs, c, cos, cosphi, log, n, pow, secant, sin, sinphi, tan;
	    LCC.__super__.constructor.call(this, opts);
	    sin = Math.sin, cos = Math.cos, abs = Math.abs, log = Math.log, tan = Math.tan, pow = Math.pow;
	    this.n = n = sinphi = sin(this.phi1);
	    cosphi = cos(this.phi1);
	    secant = abs(this.phi1 - this.phi2) >= 1e-10;
	    if (secant) {
	      n = log(cosphi / cos(this.phi2)) / log(tan(this.QUARTERPI + 0.5 * this.phi2) / tan(this.QUARTERPI + 0.5 * this.phi1));
	    }
	    this.c = c = cosphi * pow(tan(this.QUARTERPI + .5 * this.phi1), n) / n;
	    if (abs(abs(this.phi0) - this.HALFPI) < 1e-10) {
	      this.rho0 = 0.0;
	    } else {
	      this.rho0 = c * pow(tan(this.QUARTERPI + .5 * this.phi0), -n);
	    }
	    this.minLat = -60;
	    this.maxLat = 85;
	  }
	
	  LCC.prototype.project = function(lon, lat) {
	    var abs, cos, lam, lam_, log, n, phi, pow, rho, sin, tan, x, y;
	    phi = this.rad(lat);
	    lam = this.rad(this.clon(lon));
	    sin = Math.sin, cos = Math.cos, abs = Math.abs, log = Math.log, tan = Math.tan, pow = Math.pow;
	    n = this.n;
	    if (abs(abs(phi) - this.HALFPI) < 1e-10) {
	      rho = 0.0;
	    } else {
	      rho = this.c * pow(tan(this.QUARTERPI + 0.5 * phi), -n);
	    }
	    lam_ = lam * n;
	    x = 1000 * rho * sin(lam_);
	    y = 1000 * (this.rho0 - rho * cos(lam_));
	    return [x, y * -1];
	  };
	
	  return LCC;
	
	})(Conic);
	
	PseudoConic = (function(superClass) {
	  extend(PseudoConic, superClass);
	
	  function PseudoConic() {
	    return PseudoConic.__super__.constructor.apply(this, arguments);
	  }
	
	  return PseudoConic;
	
	})(Conic);
	
	proj = {
	  lonlat: Equirectangular,
	  cea: CEA,
	  gallpeters: GallPeters,
	  hobodyer: HoboDyer,
	  behrmann: Behrmann,
	  balthasart: Balthasart,
	  mercator: Mercator,
	  naturalearth: NaturalEarth,
	  robinson: Robinson,
	  eckert4: EckertIV,
	  sinusoidal: Sinusoidal,
	  mollweide: Mollweide,
	  wagner4: WagnerIV,
	  wagner5: WagnerV,
	  loximuthal: Loximuthal,
	  canters1: CantersModifiedSinusoidalI,
	  hatano: Hatano,
	  goodehomolosine: GoodeHomolosine,
	  nicolosi: Nicolosi,
	  ortho: Orthographic,
	  laea: LAEA,
	  'laea-usa': LAEA_USA,
	  stereo: Stereographic,
	  satellite: Satellite,
	  equi: EquidistantAzimuthal,
	  aitoff: Aitoff,
	  winkel3: Winkel3,
	  lcc: LCC
	};
	
	module.exports = {
	  Proj: Proj,
	  proj: proj
	};


/***/ },
/* 19 */
/*!**********************************!*\
  !*** ./src/core/maplayer.coffee ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var $, EventContext, MapLayer, PANZOOM_EVENTS, Snap, asyncEach, resolve, type,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	$ = __webpack_require__(/*! jquery */ 2);
	
	Snap = __webpack_require__(/*! ../vendor/snap */ 3);
	
	type = __webpack_require__(/*! ../utils */ 12).type;
	
	PANZOOM_EVENTS = ['beforeApplyZoom', 'afterApplyZoom', 'beforeApplyPan', 'afterApplyPan'];
	
	EventContext = (function() {
	  function EventContext(type1, cb, layer) {
	    this.type = type1;
	    this.cb = cb;
	    this.layer = layer;
	    this.handle = bind(this.handle, this);
	  }
	
	  EventContext.prototype.handle = function(e) {
	    var path;
	    path = $(e.target);
	    return this.cb(path.data(), path, e);
	  };
	
	  return EventContext;
	
	})();
	
	MapLayer = (function() {
	  function MapLayer(layer_id, path_id, map, filter, paper) {
	    this.id = layer_id;
	    this.path_id = path_id;
	    this.paper = paper != null ? paper : map.paper;
	    this.view = map.viewBC;
	    this.map = map;
	    this.filter = filter;
	    this.paths = [];
	    this.g = null;
	  }
	
	  MapLayer.prototype.addFragment = function(svg_paths) {
	    var fragment, ref;
	    svg_paths = svg_paths.map(function(i, p) {
	      return $(p).clone().attr({
	        fill: 'none',
	        stroke: '#000'
	      }).get(0);
	    });
	    fragment = Snap.fragment.apply(Snap, svg_paths);
	    if (this.g == null) {
	      this.g = this.paper.g();
	    }
	    this.g.append(fragment);
	    (ref = this.paths).push.apply(ref, svg_paths);
	    return void 0;
	  };
	
	  MapLayer.prototype.getPathsData = function() {
	    return $.map(this.paths, function(p) {
	      return $(p).data();
	    });
	  };
	
	  MapLayer.prototype.setView = function() {};
	
	  MapLayer.prototype.remove = function() {
	
	    /*
	    removes every path
	     */
	    if (typeof this.cancelStyle === "function") {
	      this.cancelStyle();
	    }
	    if (typeof this.cancelTooltips === "function") {
	      this.cancelTooltips();
	    }
	    if (!this.paths) {
	      return;
	    }
	    this.g.remove();
	    this.paths = [];
	    return void 0;
	  };
	
	  MapLayer.prototype.style = function(props, value, duration, delay) {
	    var key;
	    if (type(props) === "string") {
	      key = props;
	      props = {};
	      props[key] = value;
	    } else if (type(props) === "object") {
	      delay = duration;
	      duration = value;
	    }
	    if (duration == null) {
	      duration = 0;
	    }
	    this.cancelStyle = asyncEach(this.paths, 500, function(path) {
	      var anim, attrs, data, dly, dur, prop, val;
	      attrs = {};
	      data = $(path).data();
	      for (prop in props) {
	        val = props[prop];
	        attrs[prop] = resolve(val, data);
	      }
	      dur = resolve(duration, data);
	      dly = resolve(delay, data);
	      if (dly == null) {
	        dly = 0;
	      }
	      if (dur > 0) {
	        anim = Snap.animation(attrs, dur * 1000);
	        return $(path).animate(anim.delay(dly * 1000));
	      } else {
	        if (delay === 0) {
	          return setTimeout(function() {
	            return $(path).attr(attrs);
	          }, 0);
	        } else {
	          return $(path).attr(attrs);
	        }
	      }
	    });
	    return this;
	  };
	
	  MapLayer.prototype.on = function(event, callback) {
	    var ctx, j, len, path, ref, ref1;
	    if (indexOf.call(PANZOOM_EVENTS, event) >= 0) {
	      return (ref = this.panzoom()) != null ? ref.on(event, callback) : void 0;
	    } else {
	      ctx = new EventContext(event, callback, this);
	      ref1 = this.paths;
	      for (j = 0, len = ref1.length; j < len; j++) {
	        path = ref1[j];
	        $(path).bind(event, ctx.handle);
	      }
	      return this;
	    }
	  };
	
	  MapLayer.prototype.panzoom = function() {
	    return this.paper.panzoom();
	  };
	
	  MapLayer.prototype.tooltips = function(content, delay) {
	    var setTooltip;
	    setTooltip = function(path, tt) {
	      var cfg;
	      cfg = {
	        position: {
	          target: 'mouse',
	          viewport: $(window),
	          adjust: {
	            x: 7,
	            y: 7
	          }
	        },
	        show: {
	          delay: delay != null ? delay : 20
	        },
	        events: {
	          show: function(evt, api) {
	            return $('.qtip').filter(function() {
	              return api.elements.tooltip.get(0) !== this;
	            }).hide();
	          }
	        },
	        content: {}
	      };
	      if (tt != null) {
	        if (typeof tt === "string") {
	          cfg.content.text = tt;
	        } else if ($.isArray(tt)) {
	          cfg.content.title = tt[0];
	          cfg.content.text = tt[1];
	        }
	      } else {
	        cfg.content.text = 'n/a';
	      }
	      return $(path).qtip(cfg);
	    };
	    this.cancelTooltips = asyncEach(this.paths, function(path) {
	      var data, tt;
	      data = $(path).data();
	      tt = resolve(content, data);
	      return setTooltip(path, tt);
	    });
	    return this;
	  };
	
	  MapLayer.prototype.sort = function(sortBy) {
	    var j, len, lp, path, ref;
	    this.paths.sort(function(a, b) {
	      var av, bv;
	      av = sortBy(a.data());
	      bv = sortBy(b.data());
	      switch (false) {
	        case av !== bv:
	          return 0;
	        case !(av > bv):
	          return 1;
	        default:
	          return -1;
	      }
	    });
	    lp = false;
	    ref = this.paths;
	    for (j = 0, len = ref.length; j < len; j++) {
	      path = ref[j];
	      if (lp) {
	        $(path).insertAfter(lp);
	      }
	      lp = path;
	    }
	    return this;
	  };
	
	  return MapLayer;
	
	})();
	
	resolve = function(prop, data) {
	  if (type(prop) === 'function') {
	    return prop(data);
	  }
	  return prop;
	};
	
	asyncEach = function(list, chunkSize, fn) {
	  var step, timeout;
	  if (typeof chunkSize === 'function') {
	    fn = chunkSize;
	    chunkSize = 200;
	  }
	  timeout = null;
	  step = function(skip) {
	    var j, n, ref, ref1;
	    for (n = j = ref = skip, ref1 = Math.min(skip + chunkSize, list.length - 1); ref <= ref1 ? j <= ref1 : j >= ref1; n = ref <= ref1 ? ++j : --j) {
	      fn(list[n], n);
	    }
	    if (!(n >= list.length)) {
	      return timeout = setTimeout((function() {
	        return step(n);
	      }), 0);
	    }
	  };
	  step(0);
	  return function() {
	    if (timeout) {
	      return clearTimeout(timeout);
	    }
	  };
	};
	
	module.exports = MapLayer;


/***/ },
/* 20 */
/*!********************************!*\
  !*** ./src/core/lonlat.coffee ***!
  \********************************/
/***/ function(module, exports) {

	
	/*
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
	 */
	var LatLon, LonLat,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	LonLat = (function() {
	
	  /*
	  represents a Point
	   */
	  function LonLat(lon, lat, alt) {
	    if (alt == null) {
	      alt = 0;
	    }
	    this.lon = Number(lon);
	    this.lat = Number(lat);
	    this.alt = Number(alt);
	  }
	
	  LonLat.prototype.distance = function(ll) {
	    var R, a, c, dLat, dLon, deg2rad, lat1, lat2;
	    R = 6371;
	    deg2rad = Math.PI / 180;
	    dLat = (ll.lat - this.lat) * deg2rad;
	    dLon = (ll.lon - this.lon) * deg2rad;
	    lat1 = this.lat * deg2rad;
	    lat2 = ll.lat * deg2rad;
	    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    return R * c;
	  };
	
	  return LonLat;
	
	})();
	
	LatLon = (function(superClass) {
	  extend(LatLon, superClass);
	
	  function LatLon(lat, lon, alt) {
	    if (alt == null) {
	      alt = 0;
	    }
	    LatLon.__super__.constructor.call(this, lon, lat, alt);
	  }
	
	  return LatLon;
	
	})(LonLat);
	
	module.exports = {
	  LonLat: LonLat,
	  LatLon: LatLon
	};


/***/ },
/* 21 */
/*!**********************************!*\
  !*** ./src/core/parsecss.coffee ***!
  \**********************************/
/***/ function(module, exports) {

	
	/*
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
	 */
	
	/*
	    This is a reduced version of Danial Wachsstocks jQuery based CSS parser
	    Everything is removed but the core css-to-object parsing
	
	    jQuery based CSS parser
	    documentation: http://youngisrael-stl.org/wordpress/2009/01/16/jquery-css-parser/
	    Version: 1.3
	    Copyright (c) 2011 Daniel Wachsstock
	    MIT license:
	    Permission is hereby granted, free of charge, to any person
	    obtaining a copy of this software and associated documentation
	    files (the "Software"), to deal in the Software without
	    restriction, including without limitation the rights to use,
	    copy, modify, merge, publish, distribute, sublicense, and/or sell
	    copies of the Software, and to permit persons to whom the
	    Software is furnished to do so, subject to the following
	    conditions:
	
	    The above copyright notice and this permission notice shall be
	    included in all copies or substantial portions of the Software.
	
	    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	    OTHER DEALINGS IN THE SOFTWARE.
	 */
	var REbraces, REcomment_string, REfull, REmunged, munge, munged, parsecss, parsedeclarations, restore, uid;
	
	parsecss = function(str, callback) {
	  var css, i, k, len, props, ref, ret, v;
	  ret = {};
	  str = munge(str);
	  ref = str.split('`b%');
	  for (i = 0, len = ref.length; i < len; i++) {
	    css = ref[i];
	    css = css.split('%b`');
	    if (css.length < 2) {
	      continue;
	    }
	    css[0] = restore(css[0]);
	    props = parsedeclarations(css[1]);
	    if (ret[css[0]] != null) {
	      for (k in props) {
	        v = props[k];
	        ret[css[0]][k] = v;
	      }
	    } else {
	      ret[css[0]] = props;
	    }
	  }
	  if (__type(callback) === 'function') {
	    callback(ret);
	  } else {
	    return ret;
	  }
	};
	
	munged = {};
	
	parsedeclarations = function(index) {
	  var decl, i, len, parsed, ref, str;
	  str = munged[index].replace(/^{|}$/g, '');
	  str = munge(str);
	  parsed = {};
	  ref = str.split(';');
	  for (i = 0, len = ref.length; i < len; i++) {
	    decl = ref[i];
	    decl = decl.split(':');
	    if (decl.length < 2) {
	      continue;
	    }
	    parsed[restore(decl[0])] = restore(decl.slice(1).join(':'));
	  }
	  return parsed;
	};
	
	REbraces = /{[^{}]*}/;
	
	REfull = /\[[^\[\]]*\]|{[^{}]*}|\([^()]*\)|function(\s+\w+)?(\s*%b`\d+`b%){2}/;
	
	REcomment_string = /(?:\/\*(?:[^\*]|\*[^\/])*\*\/)|(\\.|"(?:[^\\\"]|\\.|\\\n)*"|'(?:[^\\\']|\\.|\\\n)*')/g;
	
	REmunged = /%\w`(\d+)`\w%/;
	
	uid = 0;
	
	munge = function(str, full) {
	  var RE, match, replacement;
	  str = str.replace(REcomment_string, function(s, string) {
	    var replacement;
	    if (!string) {
	      return '';
	    }
	    replacement = '%s`' + (++uid) + '`s%';
	    munged[uid] = string.replace(/^\\/, '');
	    return replacement;
	  });
	  RE = full ? REfull : REbraces;
	  while (match = RE.exec(str)) {
	    replacement = '%b`' + (++uid) + '`b%';
	    munged[uid] = match[0];
	    str = str.replace(RE, replacement);
	  }
	  return str;
	};
	
	restore = function(str) {
	  var match;
	  if (str == null) {
	    return str;
	  }
	  while (match = REmunged.exec(str)) {
	    str = str.replace(REmunged, munged[match[1]]);
	  }
	  return str.trim();
	};
	
	module.exports = parsecss;


/***/ },
/* 22 */
/*!***********************************!*\
  !*** ./src/core/maploader.coffee ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	var MapFragment, MapLoader;
	
	MapFragment = __webpack_require__(/*! ./mapfragment */ 23);
	
	MapLoader = (function() {
	  function MapLoader(resolver) {
	    this.resolver = resolver;
	    this._cache = {};
	  }
	
	  MapLoader.prototype.load = function(pan, zoom, callback) {
	    var base, ref, url, zoomLevel;
	    ref = this.resolver(pan, zoom), url = ref[0], zoomLevel = ref[1];
	    if ((base = this._cache)[url] == null) {
	      base[url] = new MapFragment(url);
	    }
	    return this._cache[url].load(function(err, svg) {
	      return callback(err, url, zoomLevel, svg);
	    });
	  };
	
	  return MapLoader;
	
	})();
	
	module.exports = MapLoader;


/***/ },
/* 23 */
/*!*************************************!*\
  !*** ./src/core/mapfragment.coffee ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	var $, MapFragment, warn,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	$ = __webpack_require__(/*! jquery */ 2);
	
	warn = __webpack_require__(/*! ../utils */ 12).warn;
	
	MapFragment = (function() {
	  var LOADED, LOADING, NOT_LOADED;
	
	  NOT_LOADED = 0;
	
	  LOADING = 1;
	
	  LOADED = 2;
	
	  function MapFragment(url) {
	    this.url = url;
	    this.runCallbacks = bind(this.runCallbacks, this);
	    this.state = NOT_LOADED;
	    this.svg = null;
	    this._callbacks = [];
	  }
	
	  MapFragment.prototype.loaded = function() {
	    return this.state === LOADED && (this.svg != null);
	  };
	
	  MapFragment.prototype.loading = function() {
	    return this.state === LOADING;
	  };
	
	  MapFragment.prototype.load = function(callback) {
	    if (this.loaded()) {
	      return callback(null, this.svg);
	    } else if (this.loading()) {
	      return this._callbacks.push(callback);
	    } else {
	      this.state = LOADING;
	      this._callbacks.push(callback);
	      return $.ajax({
	        url: this.url,
	        dataType: "text",
	        success: (function(_this) {
	          return function(result) {
	            var err;
	            _this.state = LOADED;
	            try {
	              _this.svg = $(result);
	            } catch (error) {
	              err = error;
	              warn('something went horribly wrong while parsing svg');
	              _this.runCallbacks(err);
	            }
	            return _this.runCallbacks(null, _this.svg);
	          };
	        })(this),
	        error: (function(_this) {
	          return function(a, b, c) {
	            return _this.runCallbacks(a);
	          };
	        })(this)
	      });
	    }
	  };
	
	  MapFragment.prototype.runCallbacks = function(err, res) {
	    var cb, e, i, len, ref;
	    try {
	      ref = this._callbacks;
	      for (i = 0, len = ref.length; i < len; i++) {
	        cb = ref[i];
	        cb(err, res);
	      }
	    } catch (error) {
	      e = error;
	      warn(e);
	    }
	    return this._callbacks = [];
	  };
	
	  return MapFragment;
	
	})();
	
	module.exports = MapFragment;


/***/ },
/* 24 */
/*!****************************************!*\
  !*** ./src/modules/symbolgroup.coffee ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var Kartograph, LonLat, SymbolGroup, ref, type, warn,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	Kartograph = __webpack_require__(/*! ../core/kartograph */ 1);
	
	LonLat = __webpack_require__(/*! ../core/lonlat */ 20).LonLat;
	
	ref = __webpack_require__(/*! ../utils */ 12), warn = ref.warn, type = ref.type;
	
	SymbolGroup = (function() {
	
	  /* symbol groups
	  
	  Usage:
	  new $K.SymbolGroup(options);
	  map.addSymbols(options)
	   */
	  function SymbolGroup(opts) {
	    this._initTooltips = bind(this._initTooltips, this);
	    var SymbolType, d, i, id, j, k, l, layer, len, len1, len2, len3, n, nid, o, optional, p, ref1, ref2, required;
	    required = ['data', 'location', 'type', 'map'];
	    optional = ['filter', 'tooltip', 'click', 'delay', 'sortBy', 'clustering', 'aggregate', 'clusteringOpts', 'mouseenter', 'mouseleave'];
	    for (j = 0, len = required.length; j < len; j++) {
	      p = required[j];
	      if (opts[p] != null) {
	        this[p] = opts[p];
	      } else {
	        throw new Error("SymbolGroup: missing argument '" + p + "'");
	      }
	    }
	    for (k = 0, len1 = optional.length; k < len1; k++) {
	      p = optional[k];
	      if (opts[p] != null) {
	        this[p] = opts[p];
	      }
	    }
	    SymbolType = this.type;
	    if (SymbolType == null) {
	      warn('could not resolve symbol type', this.type);
	      return;
	    }
	    ref1 = SymbolType.props;
	    for (n = 0, len2 = ref1.length; n < len2; n++) {
	      p = ref1[n];
	      if (opts[p] != null) {
	        this[p] = opts[p];
	      }
	    }
	    this.layers = {
	      mapcanvas: this.map.paper
	    };
	    ref2 = SymbolType.layers;
	    for (o = 0, len3 = ref2.length; o < len3; o++) {
	      l = ref2[o];
	      nid = SymbolGroup._layerid++;
	      id = 'sl_' + nid;
	      if (l.type === 'svg') {
	        layer = this.map.createSVGLayer(id);
	      } else if (l.type === 'html') {
	        layer = this.map.createHTMLLayer(id);
	      }
	      this.layers[l.id] = layer;
	    }
	    this.symbols = [];
	    for (i in this.data) {
	      d = this.data[i];
	      if (type(this.filter) === "function") {
	        if (this.filter(d, i)) {
	          this.add(d, i);
	        }
	      } else {
	        this.add(d, i);
	      }
	    }
	    this.layout();
	    this.render();
	    this.map.addSymbolGroup(this);
	  }
	
	
	  /* adds a new symbol to this group */
	
	  SymbolGroup.prototype.add = function(data, key) {
	    var SymbolType, j, len, ll, p, ref1, sprops, symbol;
	    SymbolType = this.type;
	    ll = this._evaluate(this.location, data, key);
	    if (type(ll) === 'array') {
	      ll = new LonLat(ll[0], ll[1]);
	    }
	    sprops = {
	      layers: this.layers,
	      location: ll,
	      data: data,
	      key: key != null ? key : this.symbols.length,
	      map: this.map
	    };
	    ref1 = SymbolType.props;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      p = ref1[j];
	      if (this[p] != null) {
	        sprops[p] = this._evaluate(this[p], data, key);
	      }
	    }
	    symbol = new SymbolType(sprops);
	    this.symbols.push(symbol);
	    return symbol;
	  };
	
	  SymbolGroup.prototype.layout = function() {
	    var j, layer_id, len, ll, path, path_id, ref1, ref2, s, xy;
	    ref1 = this.symbols;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      s = ref1[j];
	      ll = s.location;
	      if (type(ll) === 'string') {
	        ref2 = ll.split('.'), layer_id = ref2[0], path_id = ref2[1];
	        path = this.map.getLayerPath(layer_id, path_id);
	        if (path != null) {
	          xy = this.map.viewBC.project(path.path.centroid());
	        } else {
	          warn('could not find layer path ' + layer_id + '.' + path_id);
	          continue;
	        }
	      } else {
	        xy = this.map.lonlat2xy(ll);
	      }
	      s.x = xy[0];
	      s.y = xy[1];
	    }
	    return this;
	  };
	
	  SymbolGroup.prototype.render = function() {
	    var j, k, len, len1, node, ref1, ref2, ref3, s, sortBy, sortDir;
	    if (this.sortBy) {
	      sortDir = 'asc';
	      if (type(this.sortBy) === "string") {
	        this.sortBy = this.sortBy.split(' ', 2);
	        sortBy = this.sortBy[0];
	        sortDir = (ref1 = this.sortBy[1]) != null ? ref1 : 'asc';
	      }
	      this.symbols = this.symbols.sort((function(_this) {
	        return function(a, b) {
	          var m, va, vb;
	          if (type(_this.sortBy) === "function") {
	            va = _this.sortBy(a.data, a);
	            vb = _this.sortBy(b.data, b);
	          } else {
	            va = a[sortBy];
	            vb = b[sortBy];
	          }
	          if (va === vb) {
	            return 0;
	          }
	          m = sortDir === 'asc' ? 1 : -1;
	          if (va > vb) {
	            return 1 * m;
	          } else {
	            return -1 * m;
	          }
	        };
	      })(this));
	    }
	    ref2 = this.symbols;
	    for (j = 0, len = ref2.length; j < len; j++) {
	      s = ref2[j];
	      s.render();
	      ref3 = s.nodes();
	      for (k = 0, len1 = ref3.length; k < len1; k++) {
	        node = ref3[k];
	        node.symbol = s;
	      }
	    }
	    if (type(this.tooltip) === "function") {
	      this._initTooltips();
	    }
	    $.each(['click', 'mouseenter', 'mouseleave'], (function(_this) {
	      return function(i, evt) {
	        var len2, n, ref4, results;
	        if (type(_this[evt]) === "function") {
	          ref4 = _this.symbols;
	          results = [];
	          for (n = 0, len2 = ref4.length; n < len2; n++) {
	            s = ref4[n];
	            results.push((function() {
	              var len3, o, ref5, results1;
	              ref5 = s.nodes();
	              results1 = [];
	              for (o = 0, len3 = ref5.length; o < len3; o++) {
	                node = ref5[o];
	                results1.push($(node)[evt]((function(_this) {
	                  return function(e) {
	                    var tgt;
	                    tgt = e.target;
	                    while (!tgt.symbol) {
	                      tgt = $(tgt).parent().get(0);
	                    }
	                    e.stopPropagation();
	                    return _this[evt](tgt.symbol.data, tgt.symbol, e);
	                  };
	                })(this)));
	              }
	              return results1;
	            }).call(_this));
	          }
	          return results;
	        }
	      };
	    })(this));
	    return this;
	  };
	
	  SymbolGroup.prototype.tooltips = function(cb) {
	    this.tooltips = cb;
	    this._initTooltips();
	    return this;
	  };
	
	  SymbolGroup.prototype.remove = function(filter) {
	    var error, id, j, kept, layer, len, ref1, ref2, results, s;
	    kept = [];
	    ref1 = this.symbols;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      s = ref1[j];
	      if ((filter != null) && !filter(s.data)) {
	        kept.push(s);
	        continue;
	      }
	      try {
	        s.clear();
	      } catch (error1) {
	        error = error1;
	        warn('error: symbolgroup.remove');
	      }
	    }
	    if (filter == null) {
	      ref2 = this.layers;
	      results = [];
	      for (id in ref2) {
	        layer = ref2[id];
	        if (id !== "mapcanvas") {
	          results.push(layer.remove());
	        }
	      }
	      return results;
	    } else {
	      return this.symbols = kept;
	    }
	  };
	
	  SymbolGroup.prototype._evaluate = function(prop, data, key) {
	
	    /* evaluates a property function or returns a static value */
	    var val;
	    if (type(prop) === 'function') {
	      return val = prop(data, key);
	    } else {
	      return val = prop;
	    }
	  };
	
	  SymbolGroup.prototype._initTooltips = function() {
	    var cfg, j, k, len, len1, node, ref1, ref2, s, tooltips, tt;
	    tooltips = this.tooltip;
	    ref1 = this.symbols;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      s = ref1[j];
	      cfg = {
	        position: {
	          target: 'mouse',
	          viewport: $(window),
	          adjust: {
	            x: 7,
	            y: 7
	          }
	        },
	        show: {
	          delay: 20
	        },
	        content: {},
	        events: {
	          show: function(evt, api) {
	            return $('.qtip').filter(function() {
	              return this !== api.elements.tooltip.get(0);
	            }).hide();
	          }
	        }
	      };
	      tt = tooltips(s.data, s.key);
	      if (type(tt) === "string") {
	        cfg.content.text = tt;
	      } else if (type(tt) === "array") {
	        cfg.content.title = tt[0];
	        cfg.content.text = tt[1];
	      }
	      ref2 = s.nodes();
	      for (k = 0, len1 = ref2.length; k < len1; k++) {
	        node = ref2[k];
	        $(node).qtip(cfg);
	      }
	    }
	  };
	
	  SymbolGroup.prototype.onResize = function() {
	    var j, len, ref1, s;
	    this.layout();
	    ref1 = this.symbols;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      s = ref1[j];
	      s.update();
	    }
	  };
	
	  SymbolGroup.prototype.update = function(opts, duration, easing) {
	    var j, k, len, len1, p, ref1, ref2, s;
	    if (opts == null) {
	      opts = {};
	    }
	    ref1 = this.symbols;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      s = ref1[j];
	      ref2 = this.type.props;
	      for (k = 0, len1 = ref2.length; k < len1; k++) {
	        p = ref2[k];
	        if (opts[p] != null) {
	          s[p] = this._evaluate(opts[p], s.data);
	        } else if (this[p] != null) {
	          s[p] = this._evaluate(this[p], s.data);
	        }
	      }
	      s.update(duration, easing);
	    }
	    return this;
	  };
	
	  return SymbolGroup;
	
	})();
	
	SymbolGroup._layerid = 0;
	
	Kartograph.prototype.addSymbols = function(opts) {
	  opts.map = this;
	  return new SymbolGroup(opts);
	};
	
	module.exports = SymbolGroup;


/***/ },
/* 25 */
/*!***********************************!*\
  !*** ./src/modules/symbol.coffee ***!
  \***********************************/
/***/ function(module, exports) {

	
	/*
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
	 */
	var Symbol;
	
	Symbol = (function() {
	
	  /* base class for all symbols */
	  function Symbol(opts) {
	    this.location = opts.location;
	    this.data = opts.data;
	    this.map = opts.map;
	    this.layers = opts.layers;
	    this.key = opts.key;
	    this.x = opts.x;
	    this.y = opts.y;
	  }
	
	  Symbol.prototype.init = function() {
	    return this;
	  };
	
	  Symbol.prototype.overlaps = function(symbol) {
	    return false;
	  };
	
	  Symbol.prototype.update = function(opts) {
	    return this;
	  };
	
	  Symbol.prototype.nodes = function() {
	    return [];
	  };
	
	  Symbol.prototype.clear = function() {
	    return this;
	  };
	
	  return Symbol;
	
	})();
	
	module.exports = Symbol;


/***/ },
/* 26 */
/*!*********************************************!*\
  !*** ./src/modules/symbols/piechart.coffee ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	
	/*
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
	 */
	var PieChart, Snap, Symbol, drawChoroLegend, drawCircleSizeLegend, drawPieChart, drawPiechartLegend, pieChartPlugin,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Symbol = __webpack_require__(/*! ../symbol */ 25);
	
	Snap = __webpack_require__(/*! ../../vendor/snap */ 3);
	
	PieChart = (function(superClass) {
	  extend(PieChart, superClass);
	
	
	  /*
	  usage:
	  new SymbolMap({
	      map: map,
	      radius: 10
	      data: [25,75],
	      colors: ['red', 'blue'],
	      titles: ['red pie', 'blue pie']
	  })
	   */
	
	  function PieChart(opts) {
	    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
	    PieChart.__super__.constructor.call(this, opts);
	    this.radius = (ref = opts.radius) != null ? ref : 4;
	    this.styles = (ref1 = opts.styles) != null ? ref1 : '';
	    this.colors = (ref2 = opts.colors) != null ? ref2 : ['#3cc', '#c3c', '#33c', '#cc3'];
	    this.titles = (ref3 = opts.titles) != null ? ref3 : ['', '', '', '', ''];
	    this.values = (ref4 = opts.values) != null ? ref4 : [];
	    this.border = (ref5 = opts.border) != null ? ref5 : false;
	    this.borderWidth = (ref6 = opts.borderWidth) != null ? ref6 : 2;
	    this["class"] = (ref7 = opts["class"]) != null ? ref7 : 'piechart';
	  }
	
	  PieChart.prototype.overlaps = function(bubble) {
	    var dx, dy, r1, r2, ref, ref1, x1, x2, y1, y2;
	    ref = [this.x, this.y, this.radius], x1 = ref[0], y1 = ref[1], r1 = ref[2];
	    ref1 = [bubble.x, bubble.y, bubble.radius], x2 = ref1[0], y2 = ref1[1], r2 = ref1[2];
	    if (x1 - r1 > x2 + r2 || x1 + r1 < x2 - r2 || y1 - r1 > y2 + r2 || y1 + r1 < y2 - r2) {
	      return false;
	    }
	    dx = x1 - x2;
	    dy = y1 - y2;
	    if (dx * dx + dy * dy > (r1 + r2) * (r1 + r2)) {
	      return false;
	    }
	    return true;
	  };
	
	  PieChart.prototype.render = function(layers) {
	    var bg;
	    if (this.border != null) {
	      bg = this.layers.mapcanvas.circle(this.x, this.y, this.radius + this.borderWidth).attr({
	        stroke: 'none',
	        fill: this.border
	      });
	    }
	    this.chart = this.layers.mapcanvas.pieChart(this.x, this.y, this.radius, this.values, this.titles, this.colors, "none");
	    this.chart.push(bg);
	    return this;
	  };
	
	  PieChart.prototype.update = function(opts) {
	    this.chart.attr({
	      style: this.styles,
	      "class": this["class"]
	    });
	    if (this.titles != null) {
	      this.chart.attr({
	        title: this.titles[0]
	      });
	    }
	    return this;
	  };
	
	  PieChart.prototype.clear = function() {
	    var ref;
	    if ((ref = this.chart) != null) {
	      ref.remove();
	    }
	    return this.chart = null;
	  };
	
	  PieChart.prototype.nodes = function() {
	    var el, k, len, ref, results;
	    ref = this.chart;
	    results = [];
	    for (k = 0, len = ref.length; k < len; k++) {
	      el = ref[k];
	      results.push(el.node);
	    }
	    return results;
	  };
	
	  return PieChart;
	
	})(Symbol);
	
	PieChart.props = ['radius', 'values', 'styles', 'class', 'titles', 'colors', 'border', 'borderWidth'];
	
	PieChart.layers = [];
	
	drawPieChart = function(cx, cy, r, values, labels, colors, stroke) {
	  var angle, chart, i, k, len, paper, process, rad, sector, total, v;
	  if (isNaN(cx) || isNaN(cy) || isNaN(r)) {
	    return [];
	  }
	  paper = this;
	  rad = Math.PI / 180;
	  chart = Snap.set();
	  angle = -270;
	  total = 0;
	  sector = function(cx, cy, r, startAngle, endAngle, params) {
	    var pathStr, x1, x2, y1, y2;
	    x1 = cx + r * Math.cos(-startAngle * rad);
	    x2 = cx + r * Math.cos(-endAngle * rad);
	    y1 = cy + r * Math.sin(-startAngle * rad);
	    y2 = cy + r * Math.sin(-endAngle * rad);
	    pathStr = [['M'], [cx, cy], ['L'], [x1, y1], ['A'], [r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2], ['Z']].map(function(a) {
	      return a.join(',');
	    }).join('');
	    return paper.path(pathStr).attr(params);
	  };
	  process = function(j) {
	    var angleplus, color, delta, ms, p, popangle, value;
	    value = values[j];
	    angleplus = 360 * value / total;
	    popangle = angle + (angleplus * 0.5);
	    color = colors[j];
	    ms = 500;
	    delta = 30;
	    p = sector(cx, cy, r, angle, angle + angleplus, {
	      fill: color,
	      stroke: stroke,
	      'stroke-width': 1
	    });
	    p.mouseover(function() {
	      return p.stop().animate({
	        transform: "s1.1 1.1 " + cx + " " + cy
	      }, ms, mina.elastic);
	    });
	    p.mouseout(function() {
	      return p.stop().animate({
	        transform: ""
	      }, ms, mina.elastic);
	    });
	    angle += angleplus;
	    return chart.push(p);
	  };
	  for (k = 0, len = values.length; k < len; k++) {
	    v = values[k];
	    total += v;
	  }
	  for (i in values) {
	    process(i);
	  }
	  return chart;
	};
	
	drawChoroLegend = function(x, y, w, textsize, color, real_min, real_max, decl_min, step, title) {
	  var ch_sc_M, ch_sc_m, cw, i, lsteps, paper, r;
	  r = void 0;
	  i = void 0;
	  paper = this;
	  ch_sc_m = Math.floor((real_min - decl_min) / step);
	  ch_sc_M = Math.ceil((real_max - decl_min) / step);
	  lsteps = ch_sc_M - ch_sc_m;
	  cw = w / lsteps;
	  y += Math.floor(title.split('\n').length / 2) * textsize;
	  r = paper.text(x + w / 2, y, title).attr({
	    'font-size': textsize
	  });
	  jQuery(r.node).addClass('legend');
	  i = 0;
	  while (i < lsteps) {
	    r = paper.rect(x + i * cw, y + textsize + 2, cw, textsize).attr({
	      stroke: 'none',
	      fill: color(Math.ceil(decl_min + step * (i + ch_sc_m)))
	    });
	    jQuery(r.node).addClass('legend');
	    i++;
	  }
	  r = paper.text(x, y + 2.5 * textsize + 4, real_min).attr({
	    'font-size': textsize
	  });
	  jQuery(r.node).addClass('legend');
	  i = 1;
	  while (i < lsteps) {
	    r = paper.text(x + i * cw, y + 2.5 * textsize + 4, decl_min + Math.round(step * (i + ch_sc_m))).attr({
	      'font-size': textsize
	    });
	    jQuery(r.node).addClass('legend');
	    i++;
	  }
	  r = paper.text(x + lsteps * cw, y + 2.5 * textsize + 4, real_max).attr({
	    'font-size': textsize
	  });
	  return jQuery(r.node).addClass('legend');
	};
	
	drawPiechartLegend = function(cx, cy, R, sdiag_label, sdiag_color, textsize) {
	  var angle, angstep, i, label_num, nsteps, paper, r, rad, results, sc, sl, str_color, vals, vc, vstep;
	  i = void 0;
	  r = void 0;
	  paper = this;
	  vals = [0.5];
	  str_color = ['#fff'];
	  nsteps = sdiag_label.length;
	  angstep = 90 / nsteps;
	  rad = Math.PI / 180;
	  vstep = nsteps > 1 ? Math.max(2 * R, textsize * nsteps * 1.5) / (nsteps - 1) : 0;
	  angle = angstep - 90;
	  vc = cy - (vstep * (nsteps - 1) / 2);
	  label_num = sdiag_label.length - 1;
	  while (angle < 90) {
	    r = paper.path(['M', cx + R * Math.cos(angle * rad), cy + R * Math.sin(angle * rad), 'L', Math.abs(angle) > 1 ? cx + (vc - cy) / Math.tan(angle * rad) : cx + R * Math.cos(angle * rad), vc, 'L', cx + 1.5 * R, vc]);
	    jQuery(r.node).addClass('legend');
	    r = paper.text(cx + 1.5 * R + 2, vc, sdiag_label[label_num]).attr({
	      'font-size': textsize,
	      'text-anchor': 'start'
	    });
	    jQuery(r.node).addClass('legend');
	    vc += vstep;
	    angle += 2 * angstep;
	    label_num--;
	  }
	  sl = sdiag_label.slice(0);
	  sc = sdiag_color.slice(0);
	  sl.unshift('');
	  sc.unshift('none');
	  i = 0;
	  while (i < nsteps) {
	    vals.push(0.5 / nsteps);
	    str_color.push('#fff');
	    i++;
	  }
	  r = paper.pieChart(cx, cy, R, vals, sl, sc, str_color);
	  i = 0;
	  results = [];
	  while (i < nsteps + 1) {
	    jQuery(r.items[i].node).addClass('legend');
	    results.push(i++);
	  }
	  return results;
	};
	
	drawCircleSizeLegend = function(cx, cy, R, maxv, minv, scale, textsize, props) {
	  var i, minR, ngrad, paper, r, radius, radlabel, value_step, vstep;
	  paper = this;
	  r = void 0;
	  i = void 0;
	  vstep = 1.5 * textsize;
	  ngrad = Math.round(2 * R / vstep);
	  minR = Math.round(Math.sqrt(minv) * scale);
	  r = paper.path(['M', cx, cy + R, 'A', R, R, 0, 0, 1, cx, cy + R - (2 * R)]).attr(props);
	  jQuery(r.node).addClass('legend');
	  r = paper.text(cx + 2, cy + R - (2 * R), maxv.toLocaleString()).attr({
	    'font-size': textsize,
	    'text-anchor': 'start'
	  });
	  jQuery(r.node).addClass('legend');
	  i = ngrad - 1;
	  while (i > 0) {
	    radlabel = Math.round(Math.pow(i * R / (ngrad * scale), 2));
	    value_step = Math.pow(10, Math.round(Math.log10(radlabel - Math.round(Math.pow((i - 1) * R / (ngrad * scale), 2)))));
	    radlabel = Math.round(radlabel / value_step) * value_step;
	    radius = Math.sqrt(radlabel) * scale;
	    if (radlabel > 0 && 2 * (R - radius) > vstep) {
	      r = paper.path(['M', cx, cy + R, 'A', radius, radius, 0, 0, 1, cx, cy + R - (2 * radius)]).attr(props);
	      jQuery(r.node).addClass('legend');
	      r = paper.text(cx + 2, cy + R - (2 * radius), radlabel.toLocaleString()).attr({
	        'font-size': textsize,
	        'text-anchor': 'start'
	      });
	      jQuery(r.node).addClass('legend');
	    }
	    i--;
	  }
	  if (minR !== R) {
	    r = paper.path(['M', cx, cy + R, 'A', minR, minR, 0, 0, 1, cx, cy + R - (2 * minR)]).attr(props);
	    jQuery(r.node).addClass('legend');
	    r = paper.text(cx + 2, cy + R - (2 * minR), minv.toLocaleString()).attr({
	      'font-size': textsize,
	      'text-anchor': 'start'
	    });
	    return jQuery(r.node).addClass('legend');
	  }
	};
	
	pieChartPlugin = function(Snap, Element, Paper) {
	  var base, base1, base2, base3;
	  if ((base = Paper.prototype).pieChart == null) {
	    base.pieChart = drawPieChart;
	  }
	  if ((base1 = Paper.prototype).choroLegend == null) {
	    base1.choroLegend = drawChoroLegend;
	  }
	  if ((base2 = Paper.prototype).pieChartLegend == null) {
	    base2.pieChartLegend = drawPiechartLegend;
	  }
	  return (base3 = Paper.prototype).circleSizeLegend != null ? base3.circleSizeLegend : base3.circleSizeLegend = drawCircleSizeLegend;
	};
	
	Snap.plugin(pieChartPlugin);
	
	module.exports = PieChart;


/***/ }
/******/ ]);
//# sourceMappingURL=kartograph.js.map