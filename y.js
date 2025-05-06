function choo(){
let a=['abort','click','error','keydown','load','loadend','message','mousedown','mousemove','online','open','popstate','success','touchmove','upgradeneeded','versionchange'].map(a=>'on'+a)
function b(z,y){z.removeAttribute(y)}
function c(z,y,x){z.setAttribute(y,x)}
function d(z,y,x){z[x]!=y[x]&&(y[x]=z[x],z[x]?c(y,x,''):b(y,x))}
function e(z,y,x){return z.hasAttributeNS(y,x)}
function f(z,y){let x=z.value,w=y.value,v='value';d(z,y,'checked'),d(z,y,'disabled'),x!=w||y.type=='range'&&c(y,v,x),x==''||!e(z,'',v)&&b(y,v)}
function g(z,y){let x=z.attributes,w=y.attributes,v,u,t,s,r;for(v=x.length;v--;){u=x[v],t=u.name,s=u.namespaceURI,r=u.value;(s)?(t=u.localName||t,y.getAttributeNS(s,t)!=r&&y.setAttributeNS(s,t,r)):(y.hasAttribute(t)?(y.getAttribute(t)!=r&&r==''?b(y,t):c(y,t,r)):c(y,t,r))}for(v=w.length;v--;){u=w[v];if(u.specified){t=u.name,s=u.namespaceURI;if(s){t=u.localName||t,!e(z,s,t)&&y.removeAttributeNS(s,t)}else if(!e(z,'',t)){b(y,t)}}}}
function h(z,y){let x=z.value,w;if(x!=y.value){y.value=x,w=y.firstChild;if(w&&w.nodeValue!=x){if(x==''&&w.nodeValue==y.placeholder){return}y.firstChild.nodeValue=x}}}
function i(z,y){let x=z.nodeType,w=z.nodeName,v=z.nodeValue;x==3||x==8?y.nodeValue=v:x==1&&g(z,y),w=='INPUT'?f(z,y):w=='OPTION'?d(z,y,'selected'):w=='TEXTAREA'&&h(z,y)}
function j(z,y){return z==y?true:z.id?z.id==y.id:z.type==3?z.nodeValue==y.nodeValue:false}
function k(z,y){a.forEach(w=>y[w]=z[w]?z[w]:''),i(z,y);let q,r,s,t,u,v,w,x=0;for(w=0;;w++){v=z.childNodes[w-x],u=y.childNodes[w],y.a=y.insertBefore,y.c=y.childNodes;if(!v&&!u){break}else if(!v){y.removeChild(u),w--}else if(!u){y.appendChild(v),x++}else if(j(v,u)||(!v.id&&!u.id)){t=l(v,u),t!=u&&(y.replaceChild(t,u),x++)}else{s='',r=y.c.length;for(q=w;q<r;q++){if(j(y.c[q],v)){s=y.c[q];break}}s?(t=l(v,s),t!=s&&x++,y.a(t,u)):(y.a(v,u),x++)}}}
function l(z,y){if(z.f){y=z.f,z=z.e(z.d,z.b)}if(!y){return z}else if(!z){return}else if(z==y){return y}else if(z.tagName!=y.tagName){return z}else{k(z,y);return y}}
function m(){this.z={},this.a=function(z){z=this.z[z];if(z){let y=[],x=arguments,w=x.length,v;for(v=1;v<w;v++){y.push(x[v])}x=z.length;for(w=0;w<x;w++){v=z[w],v.apply(v,y)}}return this},this.b=function(z,y){if(!this.z[z]){this.z[z]=[]}this.z[z].push(y);return this}}
function n(z){if(z){return z.localName!='a'?n(z.parentNode):z}}
function o(z){return z.altKey||z.button||z.ctrlKey||z.metaKey||z.shiftKey}
function p(z){window.ontouchstart=y=>y.preventDefault(),window.onclick=y=>{if(!o(y)){let x=n(y.target);x&&y.preventDefault(),z(x)}}}
this.a=new m(),this.b=this.a.a.bind(this.a),this.c=[],this.d={},this.e={}
this.use=function(z){let y=this;y.c.push(x=>z(x,y.a))}
this.load=function(z){let y=this;y.c.push(x=>z(x,y.b))}
this.route=function(z){this.e=z}
this.mount=function(z){let y=this;window.onpopstate=x=>l(y),p(x=>{x=x&&x.href;x&&(history.pushState({},'',x),l(y))}),y.c.forEach(x=>x(y.d)),y.f=document.getElementById(z),l(y)}
}
function html(a){
}