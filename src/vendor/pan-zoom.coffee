EventEmitter = require 'events'
debug = require('debug')('kartograph-pan-zoom')

findPos = (obj) ->
    posX = obj.offsetLeft
    posY = obj.offsetTop
    while obj.offsetParent
        if obj == document.getElementsByTagName('body')[0]
            break
        else
            posX = posX + obj.offsetParent.offsetLeft
            posY = posY + obj.offsetParent.offsetTop
            obj = obj.offsetParent
    [posX, posY]

getRelativePosition = (e, obj) ->
    x = undefined
    y = undefined
    if e.pageX or e.pageY
        x = e.pageX
        y = e.pageY
    else
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    pos = findPos(obj)
    x -= pos[0]
    y -= pos[1]
    {x, y}

class PanZoom extends EventEmitter
    constructor: (@paper, options = {}) ->
        @container = @paper.node.parentNode
        @settings = {}

        @initialPos =
          x: 0
          y: 0

        @deltaX = 0
        @deltaY = 0

        mousewheelevt = if /Firefox/i.test(navigator.userAgent)
            'DOMMouseScroll'
        else
            'mousewheel'

        @enabled = false
        @dragThreshold = 5
        @dragTime = 0

        @settings.maxZoom = options.maxZoom or 9
        @settings.minZoom = options.minZoom or 0
        @settings.zoomStep = options.zoomStep or 0.1
        @settings.initialZoom = options.initialZoom or 0
        @settings.initialPosition = options.initialPosition or
          x: 0
          y: 0
        @currZoom = @settings.initialZoom
        @currPos = @settings.initialPosition

        @repaint(true)

        if @container.attachEvent
            #if IE (and Opera depending on user setting)
            @container.attachEvent 'on' + mousewheelevt, @handleScroll
            @container.attachEvent 'onmousedown', @handleMouseDown
            @container.attachEvent 'onmouseup', @handleMouseUp
        else if @container.addEventListener
            #WC3 browsers
            @container.addEventListener mousewheelevt, @handleScroll, false
            @container.addEventListener 'mousedown', @handleMouseDown, false
            @container.addEventListener 'mouseup', @handleMouseUp, false

    getPaperDim: ->
        w: parseInt @paper.attr('width')
        h: parseInt @paper.attr('height')


    repaint: (force) ->
        debug 'repaint zoom: %s, pos: %o', @currZoom, @currPos

        newPos =
            x: @currPos.x + @deltaX
            y: @currPos.y + @deltaY

        paperDim = @getPaperDim()

        newWidth = paperDim.w * (1 - (@currZoom * @settings.zoomStep))
        newHeight = paperDim.h * (1 - (@currZoom * @settings.zoomStep))

        if newPos.x < 0
            newPos.x = 0
        else if newPos.x > paperDim.w * @currZoom * @settings.zoomStep
            newPos.x = paperDim.w * @currZoom * @settings.zoomStep

        if newPos.y < 0
            newPos.y = 0
        else if newPos.y > paperDim.h * @currZoom * @settings.zoomStep
            newPos.y = paperDim.h * @currZoom * @settings.zoomStep

        debug 'new pos: %o, new size: %o', newPos, {width: newWidth, height: newHeight}

        return false if not force and
            newPos.x is @currPos.x and
            newPos.y is @currPos.y

        @currPos = newPos
        @setViewBox @currPos.x, @currPos.y, newWidth, newHeight
        true

    setViewBox: (x, y, w, h) ->
        @paper.attr viewBox: "#{x},#{y},#{w},#{h}"

    dragging: (e) =>
        return false unless @enabled
        evt = window.event or e

        paperDim = @getPaperDim()

        newWidth = paperDim.w * (1 - (@currZoom * @settings.zoomStep))
        newHeight = paperDim.h * (1 - (@currZoom * @settings.zoomStep))
        newPoint = getRelativePosition(evt, @container)

        dx = newWidth * (newPoint.x - (@initialPos.x)) / paperDim.w * -1
        dy = newHeight * (newPoint.y - (@initialPos.y)) / paperDim.h * -1
        @initialPos = newPoint
        @applyPan dx, dy

        @dragTime += 1
        if evt.preventDefault
            evt.preventDefault()
        else
            evt.returnValue = false
        false

    applyZoom: (val, centerPoint) ->
        return unless @enabled

        @emit 'beforeApplyZoom', val, centerPoint, this

        paperDim = @getPaperDim()

        @currZoom += val
        if @currZoom < @settings.minZoom
            @currZoom = @settings.minZoom
        else if @currZoom > @settings.maxZoom
            @currZoom = @settings.maxZoom
        else
            centerPoint = centerPoint or
                x: paperDim.w / 2
                y: paperDim.h / 2
            @deltaX = paperDim.w * @settings.zoomStep * centerPoint.x / paperDim.w * val
            @deltaY = paperDim.h * @settings.zoomStep * centerPoint.y / paperDim.h * val

        @emit 'afterApplyZoom', val, centerPoint, this if @repaint()

    applyPan: (dX, dY) ->
        @emit 'beforeApplyPan', dX, dY, this
        @deltaX = dX
        @deltaY = dY
        @emit 'afterApplyPan', dX, dY, this if @repaint()

    handleScroll: (e) =>
        return false unless @enabled
        evt = window.event or e

        delta = evt.detail or evt.wheelDelta * -1
        zoomCenter = getRelativePosition(evt, @container)
        if delta > 0
            delta = -1
        else if delta < 0
            delta = 1

        @applyZoom delta, zoomCenter

        if evt.preventDefault
            evt.preventDefault()
        else
            evt.returnValue = false
        false

    handleMouseDown: (e) =>
        return false unless @enabled
        evt = window.event or e

        @dragTime = 0
        @initialPos = getRelativePosition(evt, @container)
        @container.className += ' grabbing'
        @container.onmousemove = @dragging
        document.onmousemove = -> false

        if evt.preventDefault
            evt.preventDefault()
        else
            evt.returnValue = false
        false

    handleMouseUp: (e) =>
        #Remove class framework independent
        document.onmousemove = null
        @container.className = @container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '')
        @container.onmousemove = null

    enable: -> @enabled = true
    disable: -> @enabled = false
    zoomIn: (steps) -> @applyZoom steps
    zoomOut: (steps) ->
        if steps > 0
            @applyZoom -steps
        else
            @applyZoom steps
    pan: (deltaX, deltaY) -> @applyPan -deltaX, -deltaY
    isDragging: -> @dragTime > @dragThreshold
    getCurrentPosition: -> @currPos
    getCurrentZoom: -> @currZoom

init = (Snap, Element, Paper) ->
    # Snap.fn.panzoom = (options) ->
    #     if @_panzoomInstance
    #         @_panzoomInstance
    #     else
    #         @_panzoomInstance = new PanZoom(this, options)

    Paper::panzoom = (options) ->
        if @_panzoomInstance
            @_panzoomInstance
        else
            @_panzoomInstance = new PanZoom(this, options)


module.exports = init
