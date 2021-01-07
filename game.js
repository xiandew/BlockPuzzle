import './js/libs/weapp-adapter';
import './js/libs/symbol';
import Main from './js/Main';

document.documentElement.appendChild = function () { };
document.documentElement.removeChild = function () { };

new Main();