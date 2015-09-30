//https://www.promisejs.org/
var Promise = require('promise');
var jade = require('jade');
var fs = require('fs');

//https://github.com/sgentle/phantomjs-node
var phantom = require('phantom');

var glance = {
	
	settings: {
		ua: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
		width: 1366,
		height: 768,
		delay: 0,
		output_filename: "output.pdf"
	},
	ua: function(new_ua) {
		this.settings.ua = new_ua;
		return this;
	},
	width: function(new_width) {
		this.settings.width = new_width;
		return this;
	},
	height: function(new_height) {
		this.settings.height = new_height;
		return this;
	},
	delay: function(new_delay) {
		this.settings.delay = new_delay;
		return this;
	},
	to: function(new_output_filename) {
		if((typeof new_output_filename === "string") && (new_output_filename.length > 0)) {
			this.settings.output_filename = new_output_filename;
		}
		return this;
	},
	at: function(urls, new_output_filename) {
		this.to(new_output_filename);
		
		// Make a reference to this to use in promises/callbacks
		var _this = this;
		
		// Builds a promise for capturing a page's screenshot
		function capture(url, filename){
			return new Promise(function (fulfill, reject){
				phantom.create(function (ph) {
				
					ph.createPage(function (page) {
						
						page.set('settings.userAgent', _this.settings.ua);
						
						page.set('viewportSize', {width: _this.settings.width, height: _this.settings.height});
						
						page.open(url, function (status) {
							console.log(url, status);
							page.evaluate(function () { return document.title; }, function (result) {
								var title = result;
								setTimeout(function(){
									page.render(filename);      
									ph.exit();
									fulfill(title);
								}, _this.settings.delay);
							});
						});
					});
				});
			});
		}
		
		// Build a list of promises for the urls
		var promises = [];
		var filenames = [];
		for(var i = 0; i < urls.length; i++) {
			var filename = 'capture/capture_'+i+'.png';
			filenames.push(filename);
			promises.push(capture(urls[i], filename));
		}
		
		// Execute the promises
		Promise.all(promises).then(function(titles){
		
			// Create context for output template
			var captures = [];
			for(var i = 0; i < urls.length; i++) {
				captures.push({
					url: urls[i],
					title: titles[i],
					filename: filenames[i]
				});
			}
			
			// Generate and store the output
			var html = jade.renderFile('output.jade', {captures: captures});
			fs.writeFile("output.html", html, function(err) {
				if(err) {
					return console.log(err);
				}
			});
			
			// Use PhantomJS to convert the html output to pdf
			// TODO - the pdfs have each page set to match the tallest one which is annoying
			var pdf_promise = capture('output.html', _this.settings.output_filename);
			pdf_promise();
				
			// Clean Up
			// TODO - fix this
			/*fs.unlinkSync('output.html');
			for(var i = 0; i < urls.length; i++) {
				fs.unlinkSync(filenames[i]);
			}*/
		
		});
		return this;
	}
};

module.exports = glance;