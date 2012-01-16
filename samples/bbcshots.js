/**
 * Create a mosaic image from all headline photos on BBC homepage
 *
 */
var casper = require('casper').create(),
    nbLinks = 0,
    currentLink = 1,
    images = [];

casper.start('http://www.bbc.co.uk/', function() {
    nbLinks = this.evaluate(function() {
        return __utils__.findAll('#carousel_items_items li').length;
    });
    this.echo(nbLinks + ' items founds');
    // hide navigation arrows
    this.evaluate(function() {
        document.querySelector('.nav_left').style.display = "none";
        document.querySelector('.nav_right').style.display = "none";
    });
    this.mouse.move('#promo_carousel');
    this.waitUntilVisible('.autoplay.nav_pause', function() {
        this.echo('Moving over pause button');
        this.mouse.move('.autoplay.nav_pause');
        this.click('.autoplay.nav_pause');
        this.echo('Clicked on pause button');
        this.waitUntilVisible('.autoplay.nav_play', function() {
            this.echo('Carousel has been paused');
            // hide play button
            this.evaluate(function() {
                document.querySelector('.autoplay').style.display = "none";
            });
        });
    });
});

// Capture carrousel area
var next = function() {
    var image = 'bbcshot' + currentLink + '.png';
    images.push(image);
    this.echo('Processing image ' + currentLink);
    this.captureSelector(image, '.carousel_viewport');
    if (currentLink < nbLinks) {
        this.click('.carousel_itemList_li[rel="' + currentLink + '"]');
        this.wait(1000, function() {
            this.then(next);
            currentLink++;
        });
    } else {
        this.then(buildPage);
    }
};

// Building resulting page and image
var buildPage = function() {
    this.echo('Build result page');
    var fs = require('fs');
    this.viewport(624, 400);
    var pageHtml = "<html bgcolor=black><body>";
    images.forEach(function(image) {
        pageHtml += '<img src="file://' + fs.workingDirectory + '/' + image + '"><br>';
    });
    pageHtml += "</body></html>";
    fs.write('result.html', pageHtml, 'w');
    this.thenOpen('file://' + fs.workingDirectory + '/result.html', function() {
        this.echo('Resulting image saved to result.png');
        this.capture('result.png');
    });
};

casper.then(next);

casper.run();
