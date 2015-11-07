//https://www.promisejs.org/
var Promise = require('promise');
var jade = require('jade');
var fs = require('fs');
var _ = require('underscore');
var moment = require('moment');

//http://www.horsemanjs.org/
var Horseman = require('node-horseman');

var glance = {
	
	settings: {
		ua: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
		width: 1366,
		height: 768,
		delay: 0,
		login_url: null,
		username_selector: 'input[name="username"]',
		username: '',
		password_selector: 'input[name="password"]',
		password: '',
		login_button_selector: 'input[type="submit"]',
		output_filename: "output.pdf",
		cleanup: true
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
	login: function(url, username, password, username_selector, password_selector, login_button_selector) {
		
		this.login_url(url);
		this.username(username);
		this.password(password);
		this.username_selector(username_selector);
		this.password_selector(password_selector);
		this.login_button_selector(login_button_selector);
		return this;
	},
	login_url: function(url){
		if((typeof url === "string") && (url.length > 0)) {
			this.settings.login_url = url;
		}
		return this;
	},
	username: function(username) {
		if((typeof username === "string") && (username.length > 0)) {
			this.settings.username = username;
		}
		return this;
	},
	password: function(password) {
		if((typeof password === "string") && (password.length > 0)) {
			this.settings.password = password;
		}
		return this;
	},
	username_selector: function(username_selector) {
		if((typeof username_selector === "string") && (username_selector.length > 0)) {
			this.settings.username_selector = username_selector;
		}
		return this;
	},
	password_selector: function(password_selector) {
		if((typeof password_selector === "string") && (password_selector.length > 0)) {
			this.settings.password_selector = password_selector;
		}
		return this;
	},
	login_button_selector: function(login_button_selector) {
		if((typeof login_button_selector === "string") && (login_button_selector.length > 0)) {
			this.settings.login_button_selector = login_button_selector;
		}
		return this;
	},
	cleanup: function(value) {
		this.settings.cleanup = value;
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
		
		return new Promise(function (fulfill, reject){
		
			var promises = [];
				
			_.each(urls, function(url, index){
				
				if(typeof url === "string"){
					
					if(_this.settings.login_url) {
						var horseman = new Horseman();
						horseman.userAgent(_this.settings.ua);
						horseman.viewport(_this.settings.width, _this.settings.height);
						var render_promise = horseman
							.open(_this.settings.login_url)
							.visible(_this.settings.username_selector).then(function(visible){
								if(!visible) {
									console.error("Could not find username field : "+_this.settings.username_selector);
								}
							})
							.visible(_this.settings.password_selector).then(function(visible){
								if(!visible) {
									console.error("Could not find password field : "+_this.settings.password_selector);
								}
							})
							.visible(_this.settings.login_button_selector).then(function(visible){
								if(!visible) {
									console.error("Could not find login button : "+_this.settings.login_button_selector);
								}
							})
							.type(_this.settings.username_selector, _this.settings.username)
							.type(_this.settings.password_selector, _this.settings.password)
							.click(_this.settings.login_button_selector)
							.waitForNextPage().then(function(){
								return horseman.open(url)
								.do(function(done){
									setTimeout(done,_this.settings.delay);
								})
								.screenshot(index+'.png')
								.title()
								.close();
							});
							
						promises.push(render_promise)
					}
					else {
						var horseman = new Horseman();
						horseman.userAgent(_this.settings.ua);
						horseman.viewport(_this.settings.width, _this.settings.height);
						var render_promise = horseman
							.open(url)
							.do(function(done){
								setTimeout(done,_this.settings.delay);
							})
							.screenshot(index+'.png')
							.title()
							.close();
						promises.push(render_promise);
					}
					
				}
				else{
					promises.push(
						url.screenshot(index+'.png')
						.title()
						.close()
					);
				}
				
			});
			
			Promise.all(promises).then(function(titles){
				console.log(JSON.stringify(titles));
				
				var captures = [];
				for(var i = 0; i < urls.length; i++) {
					captures.push({
						url: urls[i],
						title: titles[i],
						filename: i+'.png'
					});
				}
				
				// Generate and store the html output
				var html_filename = "output.html";
				var html = jade.renderFile('output.jade', {captures: captures, title: 'Glance : '+moment().format('MMMM Do YYYY, h:mm:ss a')});
				fs.writeFile(html_filename, html, function(err) {
					if(err) {
						return console.log(err);
					}
				});
				
				// Convert the html output to pdf
				var horseman = new Horseman();
				horseman.open(html_filename)
				.pdf(_this.settings.output_filename, {
					format: 'Letter',
					orientation: 'portrait',
					margin: '0.5in'
				})
				.close()
				.then(function(){
					
					//Cleanup the screenshot and html output files
					if(_this.settings.cleanup) {
						for(var i = 0; i < urls.length; i++) {
							fs.unlinkSync(i+'.png');
						}
						fs.unlinkSync(html_filename);
					}
					
					fulfill(_this.settings.output_filename);
				});
				
			});
			
		});

	}
};

module.exports = glance;