function choo(){
a=['abort','error','keydown','load','loadend','message','mousedown','mousemove','online','open','success','touchmove','touchstart','upgradeneeded','versionchange']
a=a.map(b=>'on'+b),b=a.length
function c(z,y){x=z.attributes,w=y.attributes;for(v=x.length;v--;){u=x[v],t=u.name,s=u.namespaceURI,r=u.value;if(s){t=u.localName||t,q=y.getAttributeNS(s,t);if(q!=r)y.setAttributeNS(s,t,r)}else{if(!y.hasAttribute(t)){y.setAttribute(t,r)}else{q=y.getAttribute(t);if(q!=r){if(r==''){y.removeAttribute(t)}else{y.setAttribute(t,r)}}}}}for(v=w.length;v--;){u=w[v];if(u.specified){t=u.name,s=u.namespaceURI;if(s){t=u.localName||t;if(!z.hasAttributeNS(s,t)){y.removeAttributeNS(s,t)}}else if(!z.hasAttributeNS('',t)){y.removeAttribute(t)}}}}
function d(z,y,x){if(z[x]!=y[x]){y[x]=z[x];if(z[x]){y.setAttribute(x,'')}else{y.removeAttribute(x)}}}
function e(z,y){x=z.value,w=y.value,d(z,y,'checked'),d(z,y,'disabled');if(x!=w||y.type=='range'){y.setAttribute('value',x)}if(x==''||!z.hasAttributeNS('','value')){y.removeAttribute('value')}}
function f(z,y){x=z.value;if(x!=y.value){y.value=x;if(y.firstChild&&y.firstChild.nodeValue!=x){if(x==''&&y.firstChild.nodeValue==y.placeholder){return}y.firstChild.nodeValue=x}}}
function g(z,y){for(x=b;x--;){w=a[x],y[w]=z[w]?z[w]:''}}
function h(z,y){x=z.nodeType,w=z.nodeName;if(x==1){c(z,y)}if((x==3||x==8)&&y.nodeValue!=z.nodeValue){y.nodeValue=z.nodeValue}if(w=='INPUT'){e(z,y)}else if(w=='OPTION'){d(z,y,'selected')}else if(w=='TEXTAREA'){f(z,y)}g(z,y)}
function i(z,y){if(z.id){return z.id==y.id}if(z==y){return true}if(z.type==3){return z.nodeValue==y.nodeValue}return false}
function j(z,y){let s,t,u,v,w=0,x=0;for(w;;w++){v=z.childNodes[w-x],u=y.childNodes[w];if(!v&&!u){break}else if(!v){y.removeChild(u),w--}else if(!u){y.appendChild(v),x++}else if(i(v,u)){t=k(v,u);if(t!=u){y.replaceChild(t,u),x++}}else{s='',r=y.childNodes.length;for(q=w;q<r;q++){if(i(y.childNodes[q],v)){s=y.childNodes[q];break}}if(s){t=k(v,s);if(t!=s){x++}y.insertBefore(t,u)}else if(!v.id&&!u.id){t=k(v,u);if(t!=u){y.replaceChild(t,u),x++}}else{y.insertBefore(v,u),x++}}}}
function k(z,y){if(!y){return z}else if(!z){return}else if(z==y){return y}else if(z.tagName!=y.tagName){return z}else{h(z,y),j(z,y);return y}}
function l(){this.a=function(z,y){this.b=z,this.c=y}}
function m(){this.z={},this.a=function(z){z=this.z[z];if(z){y=[],x=arguments,w=x.length;for(v=1;v<w;v++){y.push(x[v])}x=z.length;for(w=0;w<x;w++){v=z[w],v.apply(v,y)}}return this},this.b=function(z,y){if(!this.z[z]){this.z[z]=[]}this.z[z].push(y);return this}}
function n(z){if(!z){return}if(z.localName!='a'){return n(z.parentNode)}return z}
function o(z){if(z.altKey||z.button||z.ctrlKey||z.metaKey||z.shiftKey){z.preventDefault()}y=n(z.target);if(!y){return}z.preventDefault();return y}
function p(z){document.onclick=function(y){y.preventDefault()},document.onmousedown=function(y){z(o(y))},document.ontouchstart=function(y){z(o(y))}}
this.a=new l(),this.b=new m(),this.c=this.b.a.bind(this.b),this.d=[],this.e={},this.f=function(z){return this.a.b(z,this.c)}
this.use=function(z){y=this,y.d.push(function(x){z(x,y.b)})}
this.load=function(z){y=this,y.d.push(function(x){z(x,y.c)})}
this.route=function(z,y){this.a.a(z,y)}
this.mount=function(z){m=this,p(function(y){if(y&&y.href){history.pushState({},'',y.href),k(m.f(m.e),m.g)}}),m.d.forEach(y=>y(m.e)),m.g=document.getElementById(z),k(m.f(m.e),m.g)}
}
function html(){
}