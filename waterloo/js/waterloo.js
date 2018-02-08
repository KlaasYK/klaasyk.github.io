var app = angular.module('waterloo', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
function($stateProvider,$urlRouterProvider, $locationProvider)
{
    // $locationProvider.html5Mode(
    // {
    //     enabled: true,
    //     rewriteLinks: 'internal-link'
    // });

// --- Overview ------------------------------------------------------

    $stateProvider.state(
    {
        name: 'main',
        url: '/main',
        templateUrl: '/main.html',
        controller: 'MainCtrl',
        resolve:
        {
            // TODO: load data
        }
    });

// --- Default Route --------------------------------------------------
    $urlRouterProvider.otherwise('/main');
}]);

app.factory('canvas', ['$http', function($http)
{
    var o = {}; // interface binding

    // Map dimensions
    const NCOLS = 123;
    const NROWS = 126;
    const MAP_WIDTH = 3300;
    const MAP_HEIGHT = 3150;
    const ICON_SIZE = 25;
    const ICON_OFFSET = ICON_SIZE / 2.0;
    const CID = 'main-canvas';
    const RATIO = window.devicePixelRatio || 1;

    var backcanvas = document.createElement('canvas');
    var backctx = backcanvas.getContext('2d');
    backctx.canvas.width = MAP_WIDTH;
    backctx.canvas.height = MAP_HEIGHT;

    var canvas = document.getElementById(CID);
    var ctx = canvas.getContext('2d');

    var images = {};
    var loadProcess;
    var loadTotal;



    // View port
    var vp = {};
    vp.width = 0;
    vp.height = 0;
    vp.x = 900;       // TODO vp.x and vp.y initialized by Player!
    vp.y = 1300;

    var grabbed = false;
    var prevX = 0;
    var prevY = 0;

    function click(evt)
    {
        // TODO: check if it was grabbed
    }

    function move(evt)
    {
        if (grabbed)
        {
            vp.x -= RATIO * (evt.clientX - prevX);
            vp.y -= RATIO * (evt.clientY - prevY);
            prevX = evt.clientX;
            prevY = evt.clientY;

            // vp.x = Math.max(0, vp.x);
            // vp.y = Math.max(0, vp.y);

            o.redraw();
        }
    }

    function resetDims()
    {
        vp.width = RATIO * $(canvas).width();
        vp.height = RATIO * $(canvas).height();
        ctx.canvas.width = vp.width;
        ctx.canvas.height = vp.height;
    }

    function imageLoaded()
    {
        ++loadProcess;
        console.log('loaded: ' +  loadProcess + '/' + loadTotal);
        if (loadProcess === loadTotal)
        {
            drawBack();
        }
    }

    function loadImages()
    {
        loadProcess = 0;
        loadTotal = IMG_URI.length;

        for (idx in IMG_URI)
        {
            var img = IMG_URI[idx];
            images[img.img] = new Image();
            images[img.img].onload = imageLoaded;
            images[img.img].src = img.uri;
        }
    }

    o.init = function()
    {
        console.log('init');
        resetDims();
        // TODO: add timeout wrapper!
        window.addEventListener('resize', function() {o.redraw(true);});
        canvas.addEventListener('click', click);
        canvas.addEventListener('mousedown', function(evt)
        {
            prevX = evt.clientX;
            prevY = evt.clientY;
            grabbed = true;
        });
        canvas.addEventListener('mouseleave', function() {grabbed = false;});
        canvas.addEventListener('mouseup', function() {grabbed = false;});
        canvas.addEventListener('mousemove', move);
        loadImages();
    }

    function drawBack()
    {
        backctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // draw map
        backctx.drawImage(images['map'], 0, 0, MAP_WIDTH, MAP_HEIGHT);

        // Draw the fog
        backctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        backctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        backctx.save();
        // Clip circles/squares for each owned/allied unit
        backctx.beginPath();
        backctx.arc(900 + 350, 1300 + 175, 100, 0, Math.PI * 2, false);
        backctx.clip();

        backctx.drawImage(images['map'], 0, 0, MAP_WIDTH, MAP_HEIGHT);
        backctx.restore();

        backctx.drawImage(images['nl-city'],
            900 + 350 - ICON_OFFSET, 1300 + 175 - ICON_OFFSET, ICON_SIZE, ICON_SIZE);

        o.redraw(true);
    }

    o.redraw = function(changed = false)
    {
        if (changed)
            resetDims();

            ctx.clearRect(0, 0, vp.width, vp.height);

            // draw map
            ctx.drawImage(backcanvas,
                vp.x, vp.y, vp.width, vp.height,
                0, 0, vp.width, vp.height);
    }

    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'canvas',
    function($scope, canvas)
    {
        canvas.init();
    }
]);
