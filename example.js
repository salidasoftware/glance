var glance = require('./glance.js');

var urls = [
  'http://www.salidasoftware.com',
  'http://www.salidasoftware.com/contact/'
];

glance
  .width(640)
  .height(480)
  .cleanup(false)
  .ua('Mozilla/5.0 ;Windows NT 6.1; WOW64; Trident/7.0; rv:11.0; like Gecko')
  .at(urls).then(function(output){
    console.log("Output is in "+output);
  });