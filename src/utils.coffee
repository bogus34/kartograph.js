warn = (s) ->
    try
        console.warn.apply console, arguments
    catch e
        try
            opera.postError.apply opera, arguments
        catch e
            alert Array.prototype.join.call( arguments, ' ')

log = (s) ->
    try
        console.debug.apply console, arguments
    catch e
        try
            opera.postError.apply opera, arguments
        catch e
            alert Array.prototype.join.call( arguments, ' ')

type = do ->
    ###
    for browser-safe type checking+
    ported from jQuery's $.type
    ###
    classToType = {}
    for name in ["Boolean", "Number", "String", "Function", "Array", "Date",
        "RegExp", "Undefined", "Null"]
        classToType["[object " + name + "]"] = name.toLowerCase()

    (obj) ->
        strType = Object::toString.call(obj)
        classToType[strType] or "object"

asyncEach = (list, chunkSize, fn, done) ->
    if typeof chunkSize is 'function'
        done = fn
        fn = chunkSize
        chunkSize = 200
    timeout = null
    step = (skip) ->
        for n in [skip..Math.min(skip + chunkSize, list.length - 1)]
            fn list[n], n

        if n >= list.length
            timeout = null
            setTimeout ( -> done() ), 0 if done
        else
            timeout = setTimeout (-> step(n)), 0

    step 0
    -> clearTimeout timeout if timeout

module.exports = {warn, log, type, asyncEach}
