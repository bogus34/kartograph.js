#!/bin/sh
BUILD=tmp
VERSION=$(node -e "console.log(require('./package.json').version);")
OUT=dist/kartograph.js
OUTMIN=dist/kartograph.min.js

COFFEE=./node_modules/.bin/coffee
UGLIFY=./node_modules/.bin/uglifyjs

#
# builds all coffee script sources
# to one single minified js file
#
if [ -d dist ]; then
   rm -r dist/*
else
    mkdir dist
fi

cat src/core.coffee > $BUILD
cat src/core/*.coffee >> $BUILD
cat src/modules/*.coffee >> $BUILD
cat src/modules/symbols/*.coffee >> $BUILD
cat $BUILD | $COFFEE -sp > $OUT
$UGLIFY -cm -o $OUTMIN $OUT
rm $BUILD

cp -r assets/* dist/

echo "build complete"
