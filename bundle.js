!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Editor=t():e.Editor=t()}(window,(function(){return function(e){var t={};function n(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(i,s,function(t){return e[t]}.bind(null,s));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=5)}([function(e,t,n){"use strict";t.__esModule=!0,t.createMessage=t.createLifeLine=t.createModel=t.MoveLifeLineCommand=t.MoveMessageCommand=t.AddMessageCommand=t.AddLifeLineCommand=t.SetMessageToCommand=t.SetMessageFromCommand=void 0;var i=function(){function e(e,t){this.message=e,this.end=t,this.oldEnd=this.message.from}return e.prototype.execute=function(){this.message.from=this.end},e.prototype.undo=function(){this.message.from=this.oldEnd},e.prototype.redo=function(){this.execute()},e}();t.SetMessageFromCommand=i;var s=function(){function e(e,t){this.message=e,this.end=t,this.oldEnd=this.message.to}return e.prototype.execute=function(){this.message.to=this.end},e.prototype.undo=function(){this.message.to=this.oldEnd},e.prototype.redo=function(){this.execute()},e}();t.SetMessageToCommand=s;var o=function(){function e(e,t){this.model=e,this.lifeLine=t}return e.prototype.execute=function(){this.model.lifeLines.push(this.lifeLine)},e.prototype.undo=function(){this.model.lifeLines.pop()},e.prototype.redo=function(){this.execute()},e}();t.AddLifeLineCommand=o;var r=function(){function e(e,t){this.model=e,this.message=t}return e.prototype.execute=function(){this.model.messages.push(this.message)},e.prototype.undo=function(){this.model.messages.pop()},e.prototype.redo=function(){this.execute()},e}();t.AddMessageCommand=r;var a=function(){function e(e,t,n){this.model=e,this.message=t,this.position=n,this.oldPosition=this.model.messages.indexOf(t)}return e.prototype.execute=function(){this.model.messages.splice(this.oldPosition,1),this.model.messages.splice(this.position,0,this.message)},e.prototype.undo=function(){this.model.messages.splice(this.position,1),this.model.messages.splice(this.oldPosition,0,this.message)},e.prototype.redo=function(){this.execute()},e}();t.MoveMessageCommand=a;var h=function(){function e(e,t,n){this.model=e,this.lifeLine=t,this.position=n,this.oldPosition=this.model.lifeLines.indexOf(t)}return e.prototype.execute=function(){this.model.lifeLines.splice(this.oldPosition,1),this.model.lifeLines.splice(this.position,0,this.lifeLine)},e.prototype.undo=function(){this.model.lifeLines.splice(this.position,1),this.model.lifeLines.splice(this.oldPosition,0,this.lifeLine)},e.prototype.redo=function(){this.execute()},e}();t.MoveLifeLineCommand=h;var c=0;function u(){return{id:"L"+c++,name:f(4)}}function d(e){var t=l(e),n=function(e,t){for(;;){var n=l(t);if(n!=e)return n}}(t,e);return{id:"M"+c++,from:t,to:n,text:f()}}function f(e){void 0===e&&(e=10);for(var t=["mo","bi","sha","doo","fli","re","po","gra"],n="",i=2+Math.floor(Math.random()*e),s=0;s<i;++s)n+=l(t);return n}function l(e){return e[Math.floor(Math.random()*e.length)]}t.createModel=function(){var e=new Array(5).fill(0).map((function(e){return u()})),t=new Array(7).fill(0).map((function(t){return d(e)}));return{lifeLines:e,messages:t}},t.createLifeLine=u,t.createMessage=d},function(e,t,n){"use strict";t.__esModule=!0,t.Rectangle=t.Point=void 0;var i=function(){function e(e,t){this.x=e,this.y=t}return e.prototype.centeredRect=function(e,t){return new s(this.x-e/2,this.y-t/2,e,t)},e.prototype.rect=function(e,t){return new s(this.x,this.y,e,t)},e.prototype.distance=function(e){var t=this.x-e.x,n=this.y-e.y;return Math.sqrt(t*t+n*n)},e}();t.Point=i;var s=function(){function e(e,t,n,i){this.x=e,this.y=t,this.width=n,this.height=i}return e.prototype.contains=function(e){return this.x<=e.x&&e.x<this.corner().x&&this.y<=e.y&&e.y<this.corner().y},e.prototype.corner=function(){return new i(this.x+this.width,this.y+this.height)},e.prototype.expand=function(t){return new e(this.x-t,this.y-t,this.width+2*t,this.height+2*t)},e.prototype.center=function(){return new i(this.x+this.width/2,this.y+this.height/2)},e}();t.Rectangle=s},function(e,t,n){"use strict";t.__esModule=!0,t.DragLifeLine=t.StartDragLifeLine=t.DragMessage=t.StartDragMessage=t.DragHandle=t.StartDragHandle=t.IdleState=t.DiagramContext=void 0;var i=function(){function e(e,t,n,i){this.commandStack=e,this.model=t,this.renderer=n,this.refreshCallback=i}return e.prototype.refresh=function(e){e&&(this.view=this.renderer.render(this.model)),this.refreshCallback(this.view)},e}();t.DiagramContext=i;var s=function(){function e(e){this.context=e}return e.prototype.mouseDown=function(e){var t=this.context.view.findMessageHandle(e);if(t)return new o(this.context,e,t);var n=this.context.view.findMessage(e);if(n)return new a(this.context,e,n);var i=this.context.view.findLifeLine(e);return i?new c(this.context,e,i):(console.log("IDLE DOWN",e),this)},e.prototype.mouseUp=function(e){return this.context.view.select(null),this.context.refresh(!1),console.log("IDLE UP",e),this},e.prototype.mouseMove=function(e){return this.context.view.testHover(e)&&this.context.refresh(!1),this},e}();t.IdleState=s;var o=function(){function e(e,t,n){this.context=e,this.startDrag=t,this.handle=n}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return new s(this.context)},e.prototype.mouseMove=function(e){return e.distance(this.startDrag)>10?new r(this.context,e,this.handle):this},e}();t.StartDragHandle=o;var r=function(){function e(e,t,n){this.context=e,this.dragPoint=t,this.handle=n,this.context.view.startPendingMessage(n,t.x),this.context.refresh(!1)}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return this.context.view.finishPendingMessage(this.context.commandStack),this.context.refresh(!0),new s(this.context)},e.prototype.mouseMove=function(e){return this.context.view.updatePendingMessage(e.x),this.context.refresh(!1),this},e}();t.DragHandle=r;var a=function(){function e(e,t,n){this.context=e,this.startDrag=t,this.message=n}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return this.context.view.select(this.message),this.context.refresh(!1),new s(this.context)},e.prototype.mouseMove=function(e){return e.distance(this.startDrag)>10?new h(this.context,e,this.message):this},e}();t.StartDragMessage=a;var h=function(){function e(e,t,n){this.context=e,this.dragPoint=t,this.message=n,this.context.view.startDragMessage(n,t.y),this.context.refresh(!1)}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return this.context.view.finishDragMessage(this.context.commandStack),this.context.view.select(this.message),this.context.refresh(!0),new s(this.context)},e.prototype.mouseMove=function(e){return this.context.view.updateDragMessage(e.y),this.context.refresh(!1),this},e}();t.DragMessage=h;var c=function(){function e(e,t,n){this.context=e,this.startDrag=t,this.lifeLine=n}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return new s(this.context)},e.prototype.mouseMove=function(e){return e.distance(this.startDrag)>10?new u(this.context,e,this.lifeLine):this},e}();t.StartDragLifeLine=c;var u=function(){function e(e,t,n){this.context=e,this.dragPoint=t,this.lifeLine=n,this.context.view.startDragLifeLine(this.lifeLine,t.x),this.context.refresh(!1)}return e.prototype.mouseDown=function(e){return this},e.prototype.mouseUp=function(e){return this.context.view.finishDragLifeLine(this.context.commandStack),this.context.refresh(!0),new s(this.context)},e.prototype.mouseMove=function(e){return this.context.view.updateDragLifeLine(e.x),this.context.refresh(!1),this},e}();t.DragLifeLine=u},function(e,t,n){"use strict";t.__esModule=!0,t.CommandStack=void 0;var i=function(){function e(){this.stack=[],this.current=-1}return e.prototype.execute=function(e){this.current+1<this.stack.length&&this.stack.splice(this.current+1,this.stack.length-this.current),this.stack.push(e),this.current+=1,e.execute()},e.prototype.canUndo=function(){return this.current>=0},e.prototype.canRedo=function(){return this.current+1<this.stack.length},e.prototype.undo=function(){this.canUndo()&&(this.stack[this.current].undo(),this.current-=1)},e.prototype.redo=function(){this.canRedo()&&(this.current+=1,this.stack[this.current].redo())},e}();t.CommandStack=i},function(e,t,n){"use strict";t.__esModule=!0,t.Renderer=t.MessageHandle=t.MessageView=t.LifelineView=t.PendingLifeLineView=t.PendingDragMessageView=t.PendingMessageView=t.DiagramView=void 0;var i=n(1),s=n(0),o=function(){function e(e,t,n,i){this.model=e,this.style=t,this.lifeLines=n,this.messages=i,this.messageStart=0,this.pendingMessage=null,this.pendingDragMessage=null,this.pendingLifeLine=null}return e.prototype.testHover=function(e){var t=!1;return this.messages.forEach((function(n){t||(t=n.testHover(e))})),this.lifeLines.forEach((function(n){t||(t=n.testHover(e))})),t},e.prototype.startPendingMessage=function(e,t){this.pendingMessage=new r(e,t)},e.prototype.updatePendingMessage=function(e){var t=this;this.pendingMessage.setPosition(e),this.pendingMessage.hoverOther=null,this.lifeLines.forEach((function(n){Math.abs(n.centerX()-e)<10&&t.pendingMessage.setHover(n,e)}))},e.prototype.finishPendingMessage=function(e){this.pendingMessage.finish(e),this.pendingMessage=null},e.prototype.startDragMessage=function(e,t){this.pendingDragMessage=new a(this,e,t)},e.prototype.updateDragMessage=function(e){this.pendingDragMessage.setPosition(e)},e.prototype.finishDragMessage=function(e){this.pendingDragMessage.finish(e),this.pendingDragMessage=null},e.prototype.startDragLifeLine=function(e,t){this.pendingLifeLine=new h(this,e,t)},e.prototype.updateDragLifeLine=function(e){this.pendingLifeLine.update(e)},e.prototype.finishDragLifeLine=function(e){this.pendingLifeLine.finish(e),this.pendingLifeLine=null},e.prototype.findMessageHandle=function(e){for(var t=0,n=this.messages;t<n.length;t++){var i=n[t];if(i.from.bounds().contains(e))return i.from;if(i.to.bounds().contains(e))return i.to}return null},e.prototype.findMessage=function(e){return this.messages.find((function(t){return t.markerBounds.contains(e)}))},e.prototype.findLifeLine=function(e){return this.lifeLines.find((function(t){return t.hoverBounds.contains(e)}))},e.prototype.layout=function(){var e=this;this.messageStart=0,this.lifeLines.forEach((function(t){e.messageStart=Math.max(e.messageStart,t.headHeight)}));var t=this.layoutMessages(this);this.lifeLines.forEach((function(n){n.x=e.style.leftMargin,n.y=e.style.topMargin,n.lineHeight=t-e.messageStart})),this.lifeLines.forEach((function(t){if(e.messages.forEach((function(n){var i=n.width+2*e.style.messageMargin;if(n.from.lifeLine==t&&n.to.lifeLine.index<t.index)(s=t.centerX()-n.to.lifeLine.centerX())<i&&(t.x+=i-s);else if(n.to.lifeLine==t&&n.from.lifeLine.index<t.index){var s;(s=t.centerX()-n.from.lifeLine.centerX())<i&&(t.x+=i-s)}})),t.index>0){var n=e.lifeLines[t.index-1],i=n.width+e.style.minHeadGap;t.x-n.x<i&&(t.x=n.x+i)}})),this.lifeLines.forEach((function(e){return e.layout()})),this.messages.forEach((function(e){return e.layout()}))},e.prototype.layoutMessages=function(e){var t=this,n=e.messageStart+this.style.messageStartGap;return e.messages.forEach((function(e){e.y=n,n+=t.style.messageGap})),n},e.prototype.select=function(e){this.messages.forEach((function(e){return e.selected=!1})),e&&(e.selected=!0)},e}();t.DiagramView=o;var r=function(){function e(e,t){this.handle=e,this.hoverOther=null,this.y=e.message.y,this.otherHandle=e.message.other(e),e==e.message.from?(this.from=t,this.to=this.otherHandle.lifeLine.centerX()):(this.from=this.otherHandle.lifeLine.centerX(),this.to=t),this.handle.setHover(!1),this.handle.message.editing=!0}return e.prototype.setPosition=function(e){this.handle==this.handle.message.from?this.from=e:this.to=e},e.prototype.setHover=function(e,t){e!=this.otherHandle.lifeLine?(this.hoverOther=e,this.setPosition(this.hoverOther.centerX())):(this.hoverOther=null,this.setPosition(t))},e.prototype.finish=function(e){this.handle.message.editing=!1,null!=this.hoverOther&&this.hoverOther!=this.otherHandle.lifeLine&&(this.handle.message.from==this.handle?e.execute(new s.SetMessageFromCommand(this.handle.message.model,this.hoverOther.model)):e.execute(new s.SetMessageToCommand(this.handle.message.model,this.hoverOther.model)))},e}();t.PendingMessageView=r;var a=function(){function e(e,t,n){this.diagram=e,this.message=t,this.y=n,this.message.y=n,this.oldPosition=e.messages.indexOf(t),this.message.hover=!1}return e.prototype.setPosition=function(e){for(var t=0,n=this.diagram.messages;t<n.length;t++){var i=n[t];if(i!=this.message&&i.markerBounds.y<=e&&e<=i.markerBounds.corner().y){var s=Math.sign(i.markerBounds.center().y-e)>0?1:0;this.diagram.messages.splice(this.diagram.messages.indexOf(this.message),1),this.diagram.messages.splice(this.diagram.messages.indexOf(i)+s,0,this.message),this.diagram.layout()}}this.message.y=e},e.prototype.finish=function(e){var t=this.diagram.messages.indexOf(this.message);t!=this.oldPosition&&e.execute(new s.MoveMessageCommand(this.diagram.model,this.message.model,t))},e}();t.PendingDragMessageView=a;var h=function(){function e(e,t,n){this.diagram=e,this.lifeLine=t,this.snap=!1,this.position=-1,this.x=n,this.y=this.lifeLine.y,this.width=this.lifeLine.width,this.height=this.lifeLine.headHeight+this.lifeLine.lineHeight}return e.prototype.update=function(e){this.x=e,this.snap=!1,this.position=-1;for(var t=null,n=0,i=this.diagram.lifeLines;n<i.length;n++){var s=i[n];if(t){var o=(t.x+t.width+s.x)/2;if(Math.abs(o-e)<10){this.x=o,this.snap=!0,this.position=this.diagram.lifeLines.indexOf(s);break}}else if(e<s.x){this.x=s.x-10,this.snap=!0,this.position=0;break}t=s}!this.snap&&t&&e>t.x+t.width&&(this.x=t.x+t.width+10,this.snap=!0,this.position=this.diagram.lifeLines.indexOf(t)+1)},e.prototype.finish=function(e){this.position>this.lifeLine.index&&(this.position-=1);var t=this.diagram.lifeLines.indexOf(this.lifeLine);this.position>=0&&this.position!=t&&e.execute(new s.MoveLifeLineCommand(this.diagram.model,this.lifeLine.model,this.position))},e}();t.PendingLifeLineView=h;var c=function(){function e(e){this.lineHeight=0,this.x=0,this.y=0,this.selected=!1,this.hover=!1,this.model=e.model,this.text=e.text,this.index=e.index,this.textSize=e.textSize,this.width=e.width,this.ascent=e.ascent,this.headHeight=e.headHeight}return e.prototype.centerX=function(){return this.x+this.width/2},e.prototype.testHover=function(e){return this.setHover(this.hoverBounds.contains(e))},e.prototype.setHover=function(e){return this.hover!=e&&(this.hover=e,!0)},e.prototype.layout=function(){this.hoverBounds=new i.Point(this.x,this.y).rect(this.width,this.headHeight).expand(10),this.markerBounds=new i.Point(this.x,this.y).rect(this.width,this.headHeight+this.lineHeight).expand(10)},e}();t.LifelineView=c;var u=function(){function e(e){this.selected=!1,this.hover=!1,this.markerBounds=null,this.y=0,this.editing=!1,this.model=e.model,this.from=new d(e.from,this),this.to=new d(e.to,this),this.reversed=this.from.lifeLine.index>this.to.lifeLine.index,this.text=e.text,this.textSize=e.textSize,this.width=e.width,this.ascent=e.ascent,this.height=e.height,this.selected=e.selected}return e.prototype.testHover=function(e){var t=!1;return this.markerBounds.contains(e)?(t||(t=this.setHover(!0)),t||(t=this.from.setHover(this.from.bounds().contains(e))),t||(t=this.to.setHover(this.to.bounds().contains(e)))):(t||(t=this.setHover(!1)),t||(t=this.from.setHover(!1)),t||(t=this.to.setHover(!1))),t},e.prototype.setHover=function(e){return this.hover!=e&&(this.hover=e,!0)},e.prototype.layout=function(){this.markerBounds=new i.Rectangle(Math.min(this.from.lifeLine.centerX()-10,this.to.lifeLine.centerX()-10),this.y-this.height-7,Math.abs(this.from.lifeLine.centerX()-this.to.lifeLine.centerX())+20,this.height+20)},e.prototype.other=function(e){return e==this.from?this.to:this.from},e}();t.MessageView=u;var d=function(){function e(e,t){this.lifeLine=e,this.message=t,this.hover=!1}return e.prototype.center=function(){return new i.Point(this.lifeLine.centerX(),this.message.y)},e.prototype.bounds=function(){return this.center().centeredRect(20,20)},e.prototype.setHover=function(e){return this.hover!=e&&(this.hover=e,!0)},e}();t.MessageHandle=d;var f=function(){function e(e,t){this.style=e,this.measurer=t}return e.prototype.render=function(e){var t=this,n=e.lifeLines.map((function(e,n){return t.createLifeline(e,n)})),i={};n.forEach((function(e){i[e.model.id]=e}));var s=e.messages.map((function(e){return t.createMessage(e,i)})),r=new o(e,this.style,n,s);return r.layout(),r},e.prototype.createLifeline=function(e,t){var n=this.measurer.measure(e.name,this.style.lifeLineHeadTextSize),i=Math.max(n.actualBoundingBoxAscent+n.actualBoundingBoxDescent+2*this.style.lifeLineHeadMargin,this.style.minHeadHeight);return new c({model:e,text:e.name,index:t,textSize:this.style.lifeLineHeadTextSize,width:n.width+2*this.style.lifeLineHeadMargin,ascent:n.actualBoundingBoxAscent,headHeight:i})},e.prototype.createMessage=function(e,t){var n=this.measurer.measure(e.text,this.style.messageTextSize),i=t[e.from.id],s=t[e.to.id];return new u({model:e,from:i,to:s,text:e.text,textSize:this.style.messageTextSize,width:n.width,ascent:n.actualBoundingBoxAscent,height:n.actualBoundingBoxAscent+n.actualBoundingBoxDescent})},e}();t.Renderer=f},function(e,t,n){e.exports=n(6)},function(e,t,n){"use strict";function i(){}n.r(t);function s(e){return e()}function o(){return Object.create(null)}function r(e){e.forEach(s)}function a(e){return"function"==typeof e}function h(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(e){return 0===Object.keys(e).length}new Set;function u(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function f(e){e.parentNode.removeChild(e)}function l(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function g(e){return document.createElement(e)}function p(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function m(e){return document.createTextNode(e)}function x(){return m(" ")}function y(){return m("")}function v(e,t,n,i){return e.addEventListener(t,n,i),()=>e.removeEventListener(t,n,i)}function L(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function w(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let M;function k(){if(void 0===M){M=!1;try{"undefined"!=typeof window&&window.parent&&window.parent.document}catch(e){M=!0}}return M}function b(e,t,n){e.classList[n?"add":"remove"](t)}new Set;let $;function H(e){$=e}function S(){if(!$)throw new Error("Function called outside component initialization");return $}const D=[],C=[],P=[],_=[],B=Promise.resolve();let O=!1;function E(){O||(O=!0,B.then(T))}function z(e){P.push(e)}let X=!1;const A=new Set;function T(){if(!X){X=!0;do{for(let e=0;e<D.length;e+=1){const t=D[e];H(t),U(t.$$)}for(H(null),D.length=0;C.length;)C.pop()();for(let e=0;e<P.length;e+=1){const t=P[e];A.has(t)||(A.add(t),t())}P.length=0}while(D.length);for(;_.length;)_.pop()();O=!1,X=!1,A.clear()}}function U(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(z)}}const j=new Set;let R;function F(e,t){e&&e.i&&(j.delete(e),e.i(t))}function V(e,t,n,i){if(e&&e.o){if(j.has(e))return;j.add(e),R.c.push(()=>{j.delete(e),i&&(n&&e.d(1),i())}),e.o(t)}}"undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;new Set(["allowfullscreen","allowpaymentrequest","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","hidden","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"]);let N;function W(e,t,n,i){const{fragment:o,on_mount:h,on_destroy:c,after_update:u}=e.$$;o&&o.m(t,n),i||z(()=>{const t=h.map(s).filter(a);c?c.push(...t):r(t),e.$$.on_mount=[]}),u.forEach(z)}function G(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function I(e,t,n,s,a,h,c=[-1]){const u=$;H(e);const d=e.$$={fragment:null,ctx:null,props:h,update:i,not_equal:a,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:o(),dirty:c,skip_bound:!1};let l=!1;if(d.ctx=n?n(e,t.props||{},(t,n,...i)=>{const s=i.length?i[0]:n;return d.ctx&&a(d.ctx[t],d.ctx[t]=s)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](s),l&&function(e,t){-1===e.$$.dirty[0]&&(D.push(e),E(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}(e,t)),n}):[],d.update(),l=!0,r(d.before_update),d.fragment=!!s&&s(d.ctx),t.target){if(t.hydrate){const e=(g=t.target,Array.from(g.childNodes));d.fragment&&d.fragment.l(e),e.forEach(f)}else d.fragment&&d.fragment.c();t.intro&&F(e.$$.fragment),W(e,t.target,t.anchor,t.customElement),T()}var g;H(u)}"function"==typeof HTMLElement&&(N=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:e}=this.$$;this.$$.on_disconnect=e.map(s).filter(a);for(const e in this.$$.slotted)this.appendChild(this.$$.slotted[e])}attributeChangedCallback(e,t,n){this[e]=n}disconnectedCallback(){r(this.$$.on_disconnect)}$destroy(){G(this,1),this.$destroy=i}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){this.$$set&&!c(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}});class q{$destroy(){G(this,1),this.$destroy=i}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){this.$$set&&!c(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}var Y=n(3),J=n(1),K=n(0),Q=n(4),Z=n(2);function ee(e,t,n){const i=e.slice();return i[20]=t[n],i}function te(e,t,n){const i=e.slice();return i[23]=t[n],i}function ne(e){let t,n,i,s,o,r,a,h,c,l,g,x,y,v,M,k,$,H,S,D,C=e[23].text+"";return{c(){t=p("g"),n=p("rect"),o=p("text"),r=m(C),l=p("line"),M=p("rect"),L(n,"width",i=e[23].width),L(n,"height",s=e[23].headHeight),L(n,"stroke","black"),L(n,"fill","none"),L(o,"dx",a=e[23].width/2),L(o,"dy",h=e[23].headHeight/2+10),L(o,"text-anchor","middle"),L(o,"font-size",c=e[23].textSize),L(l,"x1",g=e[23].width/2),L(l,"y1",x=e[23].headHeight),L(l,"x2",y=e[23].width/2),L(l,"y2",v=e[23].headHeight+e[23].lineHeight),L(l,"stroke-dasharray","4"),L(l,"stroke","black"),L(M,"class","select-marker"),L(M,"x",k=-10),L(M,"y",$=-10),L(M,"width",H=e[23].markerBounds.width),L(M,"height",S=e[23].markerBounds.height),L(M,"rx","10"),L(M,"ry","10"),L(M,"fill","none"),L(M,"stroke-dasharray","4"),L(M,"stroke-width","2"),b(M,"hover",e[23].hover),L(t,"transform",D="translate("+e[23].x+","+e[23].y+")")},m(e,i){d(e,t,i),u(t,n),u(t,o),u(o,r),u(t,l),u(t,M)},p(e,u){4&u&&i!==(i=e[23].width)&&L(n,"width",i),4&u&&s!==(s=e[23].headHeight)&&L(n,"height",s),4&u&&C!==(C=e[23].text+"")&&w(r,C),4&u&&a!==(a=e[23].width/2)&&L(o,"dx",a),4&u&&h!==(h=e[23].headHeight/2+10)&&L(o,"dy",h),4&u&&c!==(c=e[23].textSize)&&L(o,"font-size",c),4&u&&g!==(g=e[23].width/2)&&L(l,"x1",g),4&u&&x!==(x=e[23].headHeight)&&L(l,"y1",x),4&u&&y!==(y=e[23].width/2)&&L(l,"x2",y),4&u&&v!==(v=e[23].headHeight+e[23].lineHeight)&&L(l,"y2",v),4&u&&H!==(H=e[23].markerBounds.width)&&L(M,"width",H),4&u&&S!==(S=e[23].markerBounds.height)&&L(M,"height",S),4&u&&b(M,"hover",e[23].hover),4&u&&D!==(D="translate("+e[23].x+","+e[23].y+")")&&L(t,"transform",D)},d(e){e&&f(t)}}}function ie(e){let t,n,i,s,o,r,a,h,c,l,g,m,x,y,v,w,M;function k(e,t){return e[20].reversed?oe:se}let $=k(e),H=$(e);return{c(){t=p("g"),n=p("line"),H.c(),a=p("circle"),l=p("circle"),x=p("rect"),L(n,"x1",i=e[20].from.lifeLine.centerX()),L(n,"y1",s=e[20].y),L(n,"x2",o=e[20].to.lifeLine.centerX()),L(n,"y2",r=e[20].y),L(n,"stroke","black"),L(n,"marker-end","url(#triangle)"),L(a,"class","point-marker"),L(a,"cx",h=e[20].from.center().x),L(a,"cy",c=e[20].from.center().y),L(a,"r","6"),b(a,"hover",e[20].from.hover),L(l,"class","point-marker"),L(l,"cx",g=e[20].to.center().x),L(l,"cy",m=e[20].to.center().y),L(l,"r","6"),b(l,"hover",e[20].to.hover),L(x,"class","select-marker"),L(x,"x",y=e[20].markerBounds.x),L(x,"y",v=e[20].markerBounds.y),L(x,"width",w=e[20].markerBounds.width),L(x,"height",M=e[20].markerBounds.height),L(x,"rx","10"),L(x,"ry","10"),L(x,"fill","none"),L(x,"stroke-dasharray","4"),L(x,"stroke-width","2"),b(x,"hover",!e[20].selected&&e[20].hover),b(x,"selected",e[20].selected)},m(e,i){d(e,t,i),u(t,n),H.m(t,null),u(t,a),u(t,l),u(t,x)},p(e,u){4&u&&i!==(i=e[20].from.lifeLine.centerX())&&L(n,"x1",i),4&u&&s!==(s=e[20].y)&&L(n,"y1",s),4&u&&o!==(o=e[20].to.lifeLine.centerX())&&L(n,"x2",o),4&u&&r!==(r=e[20].y)&&L(n,"y2",r),$===($=k(e))&&H?H.p(e,u):(H.d(1),H=$(e),H&&(H.c(),H.m(t,a))),4&u&&h!==(h=e[20].from.center().x)&&L(a,"cx",h),4&u&&c!==(c=e[20].from.center().y)&&L(a,"cy",c),4&u&&b(a,"hover",e[20].from.hover),4&u&&g!==(g=e[20].to.center().x)&&L(l,"cx",g),4&u&&m!==(m=e[20].to.center().y)&&L(l,"cy",m),4&u&&b(l,"hover",e[20].to.hover),4&u&&y!==(y=e[20].markerBounds.x)&&L(x,"x",y),4&u&&v!==(v=e[20].markerBounds.y)&&L(x,"y",v),4&u&&w!==(w=e[20].markerBounds.width)&&L(x,"width",w),4&u&&M!==(M=e[20].markerBounds.height)&&L(x,"height",M),4&u&&b(x,"hover",!e[20].selected&&e[20].hover),4&u&&b(x,"selected",e[20].selected)},d(e){e&&f(t),H.d()}}}function se(e){let t,n,i,s,o,r=e[20].text+"";return{c(){t=p("text"),n=m(r),L(t,"x",i=e[20].to.lifeLine.centerX()-e[4].messageMargin),L(t,"y",s=e[20].y-7),L(t,"text-anchor","end"),L(t,"font-size",o=e[20].textSize)},m(e,i){d(e,t,i),u(t,n)},p(e,a){4&a&&r!==(r=e[20].text+"")&&w(n,r),4&a&&i!==(i=e[20].to.lifeLine.centerX()-e[4].messageMargin)&&L(t,"x",i),4&a&&s!==(s=e[20].y-7)&&L(t,"y",s),4&a&&o!==(o=e[20].textSize)&&L(t,"font-size",o)},d(e){e&&f(t)}}}function oe(e){let t,n,i,s,o,r=e[20].text+"";return{c(){t=p("text"),n=m(r),L(t,"x",i=e[20].to.lifeLine.centerX()+e[4].messageMargin),L(t,"y",s=e[20].y-7),L(t,"text-anchor","start"),L(t,"font-size",o=e[20].textSize)},m(e,i){d(e,t,i),u(t,n)},p(e,a){4&a&&r!==(r=e[20].text+"")&&w(n,r),4&a&&i!==(i=e[20].to.lifeLine.centerX()+e[4].messageMargin)&&L(t,"x",i),4&a&&s!==(s=e[20].y-7)&&L(t,"y",s),4&a&&o!==(o=e[20].textSize)&&L(t,"font-size",o)},d(e){e&&f(t)}}}function re(e){let t,n=!e[20].editing&&ie(e);return{c(){n&&n.c(),t=y()},m(e,i){n&&n.m(e,i),d(e,t,i)},p(e,i){e[20].editing?n&&(n.d(1),n=null):n?n.p(e,i):(n=ie(e),n.c(),n.m(t.parentNode,t))},d(e){n&&n.d(e),e&&f(t)}}}function ae(e){let t,n,i,s,o,r,a=e[2].pendingMessage.hoverOther&&he(e);return{c(){t=p("line"),a&&a.c(),r=y(),L(t,"x1",n=e[2].pendingMessage.from),L(t,"y1",i=e[2].pendingMessage.y),L(t,"x2",s=e[2].pendingMessage.to),L(t,"y2",o=e[2].pendingMessage.y),L(t,"fill","none"),L(t,"stroke","black"),L(t,"marker-end","url(#triangle)")},m(e,n){d(e,t,n),a&&a.m(e,n),d(e,r,n)},p(e,h){4&h&&n!==(n=e[2].pendingMessage.from)&&L(t,"x1",n),4&h&&i!==(i=e[2].pendingMessage.y)&&L(t,"y1",i),4&h&&s!==(s=e[2].pendingMessage.to)&&L(t,"x2",s),4&h&&o!==(o=e[2].pendingMessage.y)&&L(t,"y2",o),e[2].pendingMessage.hoverOther?a?a.p(e,h):(a=he(e),a.c(),a.m(r.parentNode,r)):a&&(a.d(1),a=null)},d(e){e&&f(t),a&&a.d(e),e&&f(r)}}}function he(e){let t,n,i;return{c(){t=p("circle"),L(t,"class","point-marker hover"),L(t,"cx",n=e[2].pendingMessage.hoverOther.centerX()),L(t,"cy",i=e[2].pendingMessage.y),L(t,"r","6")},m(e,n){d(e,t,n)},p(e,s){4&s&&n!==(n=e[2].pendingMessage.hoverOther.centerX())&&L(t,"cx",n),4&s&&i!==(i=e[2].pendingMessage.y)&&L(t,"cy",i)},d(e){e&&f(t)}}}function ce(e){let t,n,i,s,o,r,a;return{c(){t=p("line"),L(t,"x1",n=e[2].pendingLifeLine.x),L(t,"y1",i=e[2].pendingLifeLine.y),L(t,"x2",s=e[2].pendingLifeLine.x),L(t,"y2",o=e[2].pendingLifeLine.y+e[2].pendingLifeLine.height),L(t,"stroke-dasharray","4"),L(t,"stroke-width",r=e[2].pendingLifeLine.snap?3:1),L(t,"stroke",a=e[2].pendingLifeLine.snap?"green":"#55CCFF")},m(e,n){d(e,t,n)},p(e,h){4&h&&n!==(n=e[2].pendingLifeLine.x)&&L(t,"x1",n),4&h&&i!==(i=e[2].pendingLifeLine.y)&&L(t,"y1",i),4&h&&s!==(s=e[2].pendingLifeLine.x)&&L(t,"x2",s),4&h&&o!==(o=e[2].pendingLifeLine.y+e[2].pendingLifeLine.height)&&L(t,"y2",o),4&h&&r!==(r=e[2].pendingLifeLine.snap?3:1)&&L(t,"stroke-width",r),4&h&&a!==(a=e[2].pendingLifeLine.snap?"green":"#55CCFF")&&L(t,"stroke",a)},d(e){e&&f(t)}}}function ue(e){let t,n,s,o,a,h,c,w,M,b,$,H,S,D,C,P,_,B,O,E,X,A,T,U,j,R,F,V,N,W,G,I,q,Y=e[2].lifeLines,J=[];for(let t=0;t<Y.length;t+=1)J[t]=ne(te(e,Y,t));let K=e[2].messages,Q=[];for(let t=0;t<K.length;t+=1)Q[t]=re(ee(e,K,t));let Z=e[2].pendingMessage&&ae(e),ie=e[2].pendingLifeLine&&ce(e);return{c(){t=g("div"),n=g("div"),s=p("svg"),o=p("defs"),a=p("marker"),h=p("path"),c=p("style"),w=m(".select-marker {\n                stroke: none;\n            }\n            .select-marker.hover {\n                stroke: #55CCFF;\n            }\n            .select-marker.selected {\n                stroke: #55CC99;\n            }\n            .point-marker {\n                fill: none;\n            }\n            .point-marker.hover {\n                fill: #55CCFF;\n            }\n        ");for(let e=0;e<J.length;e+=1)J[e].c();M=y();for(let e=0;e<Q.length;e+=1)Q[e].c();b=y(),Z&&Z.c(),$=y(),ie&&ie.c(),S=x(),D=g("div"),C=g("ul"),P=g("li"),_=g("button"),B=m("Undo"),E=x(),X=g("li"),A=g("button"),T=m("Redo"),j=x(),R=g("li"),F=g("button"),F.textContent="Add LifeLine",V=x(),N=g("li"),W=g("button"),W.textContent="Add Message",L(h,"d","M 0 0 L 10 5 L 0 10 z"),L(h,"fill","black"),L(a,"id","triangle"),L(a,"viewBox","0 0 10 10"),L(a,"refX","10"),L(a,"refY","5"),L(a,"markerUnits","strokeWidth"),L(a,"markerWidth","10"),L(a,"markerHeight","10"),L(a,"orient","auto-start-reverse"),L(s,"width",e[0]),L(s,"height",e[1]),L(s,"viewBox",H="0 0 "+e[0]+" "+e[1]),_.disabled=O=!e[3].canUndo,L(P,"class","svelte-1wchab6"),A.disabled=U=!e[3].canRedo,L(X,"class","svelte-1wchab6"),L(R,"class","spacer svelte-1wchab6"),L(N,"class","svelte-1wchab6"),L(C,"class","svelte-1wchab6"),L(D,"class","palette svelte-1wchab6"),L(t,"class","container svelte-1wchab6"),z(()=>e[12].call(t))},m(i,r){d(i,t,r),u(t,n),u(n,s),u(s,o),u(o,a),u(a,h),u(s,c),u(c,w);for(let e=0;e<J.length;e+=1)J[e].m(s,null);u(s,M);for(let e=0;e<Q.length;e+=1)Q[e].m(s,null);u(s,b),Z&&Z.m(s,null),u(s,$),ie&&ie.m(s,null),u(t,S),u(t,D),u(D,C),u(C,P),u(P,_),u(_,B),u(C,E),u(C,X),u(X,A),u(A,T),u(C,j),u(C,R),u(R,F),u(C,V),u(C,N),u(N,W),G=function(e,t){"static"===getComputedStyle(e).position&&(e.style.position="relative");const n=g("iframe");n.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),n.setAttribute("aria-hidden","true"),n.tabIndex=-1;const i=k();let s;return i?(n.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",s=v(window,"message",e=>{e.source===n.contentWindow&&t()})):(n.src="about:blank",n.onload=()=>{s=v(n.contentWindow,"resize",t)}),u(e,n),()=>{(i||s&&n.contentWindow)&&s(),f(n)}}(t,e[12].bind(t)),I||(q=[v(n,"mousedown",e[5]),v(n,"mouseup",e[6]),v(n,"mousemove",e[7]),v(_,"click",e[8]),v(A,"click",e[9]),v(F,"click",e[10]),v(W,"click",e[11])],I=!0)},p(e,[t]){if(4&t){let n;for(Y=e[2].lifeLines,n=0;n<Y.length;n+=1){const i=te(e,Y,n);J[n]?J[n].p(i,t):(J[n]=ne(i),J[n].c(),J[n].m(s,M))}for(;n<J.length;n+=1)J[n].d(1);J.length=Y.length}if(20&t){let n;for(K=e[2].messages,n=0;n<K.length;n+=1){const i=ee(e,K,n);Q[n]?Q[n].p(i,t):(Q[n]=re(i),Q[n].c(),Q[n].m(s,b))}for(;n<Q.length;n+=1)Q[n].d(1);Q.length=K.length}e[2].pendingMessage?Z?Z.p(e,t):(Z=ae(e),Z.c(),Z.m(s,$)):Z&&(Z.d(1),Z=null),e[2].pendingLifeLine?ie?ie.p(e,t):(ie=ce(e),ie.c(),ie.m(s,null)):ie&&(ie.d(1),ie=null),1&t&&L(s,"width",e[0]),2&t&&L(s,"height",e[1]),3&t&&H!==(H="0 0 "+e[0]+" "+e[1])&&L(s,"viewBox",H),8&t&&O!==(O=!e[3].canUndo)&&(_.disabled=O),8&t&&U!==(U=!e[3].canRedo)&&(A.disabled=U)},i:i,o:i,d(e){e&&f(t),l(J,e),l(Q,e),Z&&Z.d(),ie&&ie.d(),G(),I=!1,r(q)}}}function de(e,t,n){let i,s,o,r,a,h,c,u,d={lifeLines:[],messages:[],pendingMessage:null},f={canUndo:!1,canRedo:!1};const l={lifeLineHeadTextSize:"24px",lifeLineHeadMargin:10,minHeadHeight:60,topMargin:20,leftMargin:20,minHeadGap:20,messageTextSize:"18px",messageStartGap:80,messageGap:60,messageMargin:15};var g;function p(e,t){o.font=t+" arial";return o.measureText(e)}return g=()=>{const e=document.createElement("canvas");o=e.getContext("2d"),r=Object(K.createModel)(),h=new Q.Renderer(l,{measure:p}),a=new Y.CommandStack,u=new Z.DiagramContext(a,r,h,e=>{n(2,d=e),n(3,f={canUndo:a.canUndo(),canRedo:a.canRedo()})}),c=new Z.IdleState(u),u.refresh(!0)},S().$$.on_mount.push(g),[i,s,d,f,l,function(e){const t=new J.Point(e.clientX,e.clientY);c=c.mouseDown(t)},function(e){const t=new J.Point(e.clientX,e.clientY);c=c.mouseUp(t)},function(e){const t=new J.Point(e.clientX,e.clientY);c=c.mouseMove(t)},function(){a.undo(),u.refresh(!0)},function(){a.redo(),u.refresh(!0)},function(){a.execute(new K.AddLifeLineCommand(r,Object(K.createLifeLine)())),u.refresh(!0)},function(){r.lifeLines.length>=2&&(a.execute(new K.AddMessageCommand(r,Object(K.createMessage)(r.lifeLines))),u.refresh(!0))},function(){i=this.clientWidth,s=this.clientHeight,n(0,i),n(1,s)}]}var fe=class extends q{constructor(e){super(),I(this,e,de,ue,h,{})}};function le(e){let t,n;return t=new fe({}),{c(){var e;(e=t.$$.fragment)&&e.c()},m(e,i){W(t,e,i),n=!0},p:i,i(e){n||(F(t.$$.fragment,e),n=!0)},o(e){V(t.$$.fragment,e),n=!1},d(e){G(t,e)}}}new class extends q{constructor(e){super(),I(this,e,null,le,h,{})}}({target:document.body})}]).default}));
//# sourceMappingURL=bundle.js.map