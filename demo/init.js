(function(){
    var map = kartograph.map('#map', 800, 600);
    var resolver = function() { return  'svg/world.svg'; };
    map.load(resolver, function(){
        console.log(">>> fragment loaded");
        map.addLayer('countries');
    }, {zoom: 5});
})();
