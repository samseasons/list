function choo(){
let a=['abort','click','error','keydown','load','loadend','message','mousedown','mousemove','online','open','popstate','success','touchmove','upgradeneeded','versionchange'];a=a.map(b=>'on'+b)
function b(z,y){z.removeAttribute(y)}
function c(z,y,x){z.setAttribute(y,x)}
function d(z,y,x){if(z[x]!=y[x]){y[x]=z[x];if(z[x]){c(y,x,'')}else{b(y,x)}}}
function e(z,y){let x=z.value,w=y.value;d(z,y,'checked'),d(z,y,'disabled');if(x!=w||y.type=='range'){c(y,'value',x)}if(x==''||!z.hasAttributeNS('','value')){b(y,'value')}}
function f(z,y){let x=z.attributes,w=y.attributes,v=x.length,u,t,s,r,q;for(v;v--;){u=x[v],t=u.name,s=u.namespaceURI,r=u.value;if(s){t=u.localName||t,q=y.getAttributeNS(s,t);if(q!=r){y.setAttributeNS(s,t,r)}}else{if(!y.hasAttribute(t)){c(y,t,r)}else{q=y.getAttribute(t);if(q!=r){if(r==''){b(y,t)}else{c(y,t,r)}}}}}for(v=w.length;v--;){u=w[v];if(u.specified){t=u.name,s=u.namespaceURI;if(s){t=u.localName||t;if(!z.hasAttributeNS(s,t)){y.removeAttributeNS(s,t)}}else if(!z.hasAttributeNS('',t)){b(y,t)}}}}
function g(z,y){let x=z.value;if(x!=y.value){y.value=x;if(y.firstChild&&y.firstChild.nodeValue!=x){if(x==''&&y.firstChild.nodeValue==y.placeholder){return}y.firstChild.nodeValue=x}}}
function h(z,y){let x=z.nodeType,w=z.nodeName;if(x==1){f(z,y)}if((x==3||x==8)&&y.nodeValue!=z.nodeValue){y.nodeValue=z.nodeValue}if(w=='INPUT'){e(z,y)}else if(w=='OPTION'){d(z,y,'selected')}else if(w=='TEXTAREA'){g(z,y)}}
function i(z,y){a.forEach(w=>y[w]=z[w]?z[w]:'')}
function j(z,y){if(z.id){return z.id==y.id}if(z==y){return true}if(z.type==3){return z.nodeValue==y.nodeValue}return false}
function k(z,y){let q,r,s,t,u,v,w=0,x=0;for(w;;w++){v=z.childNodes[w-x],u=y.childNodes[w];if(!v&&!u){break}else if(!v){y.removeChild(u),w--}else if(!u){y.appendChild(v),x++}else if(j(v,u)){t=l(v,u);if(t!=u){y.replaceChild(t,u),x++}}else{s='',r=y.childNodes.length;for(q=w;q<r;q++){if(j(y.childNodes[q],v)){s=y.childNodes[q];break}}if(s){t=l(v,s);if(t!=s){x++}y.insertBefore(t,u)}else if(!v.id&&!u.id){t=l(v,u);if(t!=u){y.replaceChild(t,u),x++}}else{y.insertBefore(v,u),x++}}}}
function l(z,y){if(z.f){y=z.f,z=z.d(z.e,z.b)}if(!y){return z}else if(!z){return}else if(z==y){return y}else if(z.tagName!=y.tagName){return z}else{h(z,y),i(z,y),k(z,y);return y}}
function m(){this.z={},this.a=function(z){z=this.z[z];if(z){let y=[],x=arguments,w=x.length,v=1;for(v;v<w;v++){y.push(x[v])}x=z.length;for(w=0;w<x;w++){v=z[w],v.apply(v,y)}}return this},this.b=function(z,y){if(!this.z[z]){this.z[z]=[]}this.z[z].push(y);return this}}
function n(z){if(!z){return}if(z.localName!='a'){return n(z.parentNode)}return z}
function o(z){if(z.altKey||z.button||z.ctrlKey||z.metaKey||z.shiftKey){z.preventDefault()}y=n(z.target);if(!y){return}z.preventDefault();return y}
function p(z){window.onclick=function(y){z(o(y))},window.ontouchstart=function(y){y.preventDefault()}}
this.a={},this.b=new m(),this.c=this.b.a.bind(this.b),this.d=[],this.e={}
this.use=function(z){this.d.push(function(x){z(x,this.b)})}
this.load=function(z){this.d.push(function(x){z(x,this.c)})}
this.route=function(z){this.a=z}
this.mount=function(z){let y=this;window.onpopstate=function(){l(y)};p(function(x){if(x&&x.href){history.pushState({},'',x.href),l(y)}}),y.d.forEach(x=>x(y.e)),y.f=document.getElementById(z),l(y)}
}
function html(a){
}