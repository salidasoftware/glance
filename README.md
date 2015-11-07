# glance
Tool for quickly reviewing your site for style issues.

## Installation

    npm install glance2pdf

## Usage

    var glance2pdf = require('glance2pdf');
    
    var urls = [
      'http://www.salidasoftware.com',
      'http://www.salidasoftware.com/contact/'
    ];
    
    glance2pdf
      .delay(2000)
      .width(640)
      .height(480)
      .ua('Mozilla/5.0 ;Windows NT 6.1; WOW64; Trident/7.0; rv:11.0; like Gecko')
      .at(urls).then(function(output){
        console.log("Output is in "+output);
      });

### With Authentication

    var glance2pdf = require('glance2pdf');
    
    var urls = [
      'http://www.salidasoftware.com',
      'http://www.salidasoftware.com/contact/'
    ];
    
    glance2pdf
      .delay(2000)
      .width(640)
      .height(480)
      .ua('Mozilla/5.0 ;Windows NT 6.1; WOW64; Trident/7.0; rv:11.0; like Gecko')
      .login('http://www.salidasoftware.com/login')
      .username('open')
      .password('sesame')
      .username_selector('input[name="email"]')        //default is input[name="username"]
      .password_selector('#password')                  //default is input[name="password"]
      .login_button_selector('button[type="submit"]')  //default is input[type="submit"]
      .at(urls).then(function(output){
        console.log("Output is in "+output);
      });
      
      
### With Custon Steps

glance2pdf uses [horseman](http://www.horsemanjs.org/) to drive the browser.  In place of a url, you can also use a horseman promise (glance2pdf will call .close() for you).

    var glance2pdf = require('glance2pdf');
    
    var Horseman = require('node-horseman');
    var horseman = new Horseman();
    horseman.userAgent(glance2pdf.settings.ua);
    horseman.viewport(640, 480);
    var url_promise = horseman
    .open('http://local.juicyplatform.com/dev')
    .do(function(done){
      setTimeout(done,600);
    })
    .evaluate(function(){
      localStorage.setItem('home_help', '');
    })
    .open('http://local.juicyplatform.com/dev')
    .do(function(done){
      setTimeout(done,600);
    });
    
    var urls = [
      'http://www.salidasoftware.com',
      'http://www.salidasoftware.com/contact/',
      url_promise
    ];
    
    glance2pdf
      .delay(2000)
      .width(640)
      .height(480)
      .ua('Mozilla/5.0 ;Windows NT 6.1; WOW64; Trident/7.0; rv:11.0; like Gecko')
      .at(urls).then(function(output){
        console.log("Output is in "+output);
      });