Kartograph = require './core/kartograph'
{Proj, proj} = require './core/proj'
BBox = require './core/bbox'

kartograph = -> new Kartograph(arguments...)

module.exports = {
    version: "0.9.0"
    __verbose: false
    Kartograph: Kartograph
    kartograph: kartograph
    map: kartograph
    Proj
    proj
    BBox
}
