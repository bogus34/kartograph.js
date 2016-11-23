$ = require 'jquery'

{warn} = require '../utils'

class MapFragment
    NOT_LOADED = 0
    LOADING = 1
    LOADED = 2

    constructor: (@url) ->
        @state = NOT_LOADED
        @svg = null

        @_callbacks = []

    loaded: -> @state is LOADED and @svg?
    loading: -> @state is LOADING

    load: (callback) ->
        if @loaded()
            callback null, @svg
        else if @loading()
            @_callbacks.push callback
        else
            @state = LOADING
            @_callbacks.push callback
            $.ajax
                url: @url
                dataType: "text"
                success: (result) =>
                    @state = LOADED
                    try
                        @svg = $(result)
                    catch err
                        warn 'something went horribly wrong while parsing svg'
                        @runCallbacks err

                    @runCallbacks null, @svg

                error: (a, b, c) ->
                    @runCallbacks a

    runCallbacks: (err, res) =>
        try
            cb(err, res) for cb in @_callbacks
        catch e
            warn e

        @_callbacks = []

module.exports = MapFragment
