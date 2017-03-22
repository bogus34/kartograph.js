Kartograph = require './core/kartograph'
{Proj, proj} = require './core/proj'
BBox = require './core/bbox'

SymbolGroup = require './modules/symbolgroup'
Symbol = require './modules/symbol'
PieChart = require './modules/symbols/piechart'

kartograph = -> new Kartograph(arguments...)

Snap = require './vendor/snap'

module.exports = {
    version: "0.9.0"
    __verbose: false
    Kartograph: Kartograph
    kartograph: kartograph
    map: kartograph
    Proj
    proj
    BBox
    SymbolGroup
    Symbol
    PieChart
    Snap
}
