/**
* Copyright 2012-2015, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var EventEmitter = require('events').EventEmitter;

function svgToImg(opts) {

    var ev = opts.emitter ? opts.emitter : new EventEmitter();

    var Image = window.Image;
    var Blob = window.Blob;

    var svg = opts.svg;
    var format = opts.format || 'png';
    var canvas = opts.canvas;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" idth="720" height="120"><circle cx="40" cy="60" r="10"></circle></svg>';

    var ctx = canvas.getContext('2d');
    var img = new Image();
    var DOMURL = window.URL || window.webkitURL;
    var svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);

    canvas.height = opts.height || 150;
    canvas.width = opts.width || 300;

    img.onload = function() {
        var imgData;

        DOMURL.revokeObjectURL(url);
        ctx.drawImage(img, 0, 0);

        switch (format) {
        case 'jpeg':
            imgData = canvas.toDataURL('image/jpeg');
            break;
        case 'png':
            imgData = canvas.toDataURL('image/png');
            break;
        case 'webp':
            imgData = canvas.toDataURL('image/webp');
            break;
        case 'svg':
            imgData = svg;
            break;
        default:
            return ev.emit('error', 'Image format is not jpeg, png or svg');
        }

        ev.emit('success', imgData);
    };

    img.onerror = function(err) {
        DOMURL.revokeObjectURL(url);
        console.log(err);
        return ev.emit('error', err);
    };

    img.src = url;

    return ev;
}

module.exports = svgToImg;
