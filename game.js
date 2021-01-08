import './js/libs/weapp-adapter';
import './js/libs/symbol';
window.DOMParser = require('./js/libs/dom-parser.min');

import Main from './js/Main';

document.documentElement.appendChild = function () { };
document.documentElement.removeChild = function () { };

new Main();