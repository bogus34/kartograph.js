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
    for name in "Boolean Number String Function Array Date RegExp Undefined Null".split(" ")
        classToType["[object " + name + "]"] = name.toLowerCase()

    (obj) ->
        strType = Object::toString.call(obj)
        classToType[strType] or "object"

module.exports = {warn, log, type}
