try {
  module.exports = require('react');
} catch(e){
  module.exports = window.React;
}