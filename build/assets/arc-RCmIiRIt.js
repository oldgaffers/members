import{w as ln,c as X}from"./path-aUcfwwLI.js";import{aX as an,aY as j,aZ as w,a_ as rn,a$ as y,W as on,b0 as C,b1 as _,b2 as un,b3 as t,b4 as sn,b5 as tn,b6 as fn}from"../main.js";function cn(l){return l.innerRadius}function yn(l){return l.outerRadius}function gn(l){return l.startAngle}function mn(l){return l.endAngle}function pn(l){return l&&l.padAngle}function dn(l,h,E,q,v,A,Y,a){var I=E-l,i=q-h,n=Y-v,m=a-A,r=m*I-n*i;if(!(r*r<y))return r=(n*(h-A)-m*(l-v))/r,[l+r*I,h+r*i]}function L(l,h,E,q,v,A,Y){var a=l-E,I=h-q,i=(Y?A:-A)/C(a*a+I*I),n=i*I,m=-i*a,r=l+n,s=h+m,f=E+n,c=q+m,Z=(r+f)/2,o=(s+c)/2,p=f-r,g=c-s,R=p*p+g*g,T=v-A,b=r*c-f*s,O=(g<0?-1:1)*C(fn(0,T*T*R-b*b)),S=(b*g-p*O)/R,W=(-b*p-g*O)/R,P=(b*g+p*O)/R,d=(-b*p+g*O)/R,x=S-Z,e=W-o,u=P-Z,$=d-o;return x*x+e*e>u*u+$*$&&(S=P,W=d),{cx:S,cy:W,x01:-n,y01:-m,x11:S*(v/T-1),y11:W*(v/T-1)}}function vn(){var l=cn,h=yn,E=X(0),q=null,v=gn,A=mn,Y=pn,a=null,I=ln(i);function i(){var n,m,r=+l.apply(this,arguments),s=+h.apply(this,arguments),f=v.apply(this,arguments)-rn,c=A.apply(this,arguments)-rn,Z=un(c-f),o=c>f;if(a||(a=n=I()),s<r&&(m=s,s=r,r=m),!(s>y))a.moveTo(0,0);else if(Z>on-y)a.moveTo(s*j(f),s*w(f)),a.arc(0,0,s,f,c,!o),r>y&&(a.moveTo(r*j(c),r*w(c)),a.arc(0,0,r,c,f,o));else{var p=f,g=c,R=f,T=c,b=Z,O=Z,S=Y.apply(this,arguments)/2,W=S>y&&(q?+q.apply(this,arguments):C(r*r+s*s)),P=_(un(s-r)/2,+E.apply(this,arguments)),d=P,x=P,e,u;if(W>y){var $=sn(W/r*w(S)),F=sn(W/s*w(S));(b-=$*2)>y?($*=o?1:-1,R+=$,T-=$):(b=0,R=T=(f+c)/2),(O-=F*2)>y?(F*=o?1:-1,p+=F,g-=F):(O=0,p=g=(f+c)/2)}var z=s*j(p),B=s*w(p),G=r*j(T),H=r*w(T);if(P>y){var J=s*j(g),K=s*w(g),M=r*j(R),N=r*w(R),D;if(Z<an)if(D=dn(z,B,M,N,J,K,G,H)){var Q=z-D[0],U=B-D[1],V=J-D[0],k=K-D[1],nn=1/w(tn((Q*V+U*k)/(C(Q*Q+U*U)*C(V*V+k*k)))/2),en=C(D[0]*D[0]+D[1]*D[1]);d=_(P,(r-en)/(nn-1)),x=_(P,(s-en)/(nn+1))}else d=x=0}O>y?x>y?(e=L(M,N,z,B,s,x,o),u=L(J,K,G,H,s,x,o),a.moveTo(e.cx+e.x01,e.cy+e.y01),x<P?a.arc(e.cx,e.cy,x,t(e.y01,e.x01),t(u.y01,u.x01),!o):(a.arc(e.cx,e.cy,x,t(e.y01,e.x01),t(e.y11,e.x11),!o),a.arc(0,0,s,t(e.cy+e.y11,e.cx+e.x11),t(u.cy+u.y11,u.cx+u.x11),!o),a.arc(u.cx,u.cy,x,t(u.y11,u.x11),t(u.y01,u.x01),!o))):(a.moveTo(z,B),a.arc(0,0,s,p,g,!o)):a.moveTo(z,B),!(r>y)||!(b>y)?a.lineTo(G,H):d>y?(e=L(G,H,J,K,r,-d,o),u=L(z,B,M,N,r,-d,o),a.lineTo(e.cx+e.x01,e.cy+e.y01),d<P?a.arc(e.cx,e.cy,d,t(e.y01,e.x01),t(u.y01,u.x01),!o):(a.arc(e.cx,e.cy,d,t(e.y01,e.x01),t(e.y11,e.x11),!o),a.arc(0,0,r,t(e.cy+e.y11,e.cx+e.x11),t(u.cy+u.y11,u.cx+u.x11),o),a.arc(u.cx,u.cy,d,t(u.y11,u.x11),t(u.y01,u.x01),!o))):a.arc(0,0,r,T,R,o)}if(a.closePath(),n)return a=null,n+""||null}return i.centroid=function(){var n=(+l.apply(this,arguments)+ +h.apply(this,arguments))/2,m=(+v.apply(this,arguments)+ +A.apply(this,arguments))/2-an/2;return[j(m)*n,w(m)*n]},i.innerRadius=function(n){return arguments.length?(l=typeof n=="function"?n:X(+n),i):l},i.outerRadius=function(n){return arguments.length?(h=typeof n=="function"?n:X(+n),i):h},i.cornerRadius=function(n){return arguments.length?(E=typeof n=="function"?n:X(+n),i):E},i.padRadius=function(n){return arguments.length?(q=n==null?null:typeof n=="function"?n:X(+n),i):q},i.startAngle=function(n){return arguments.length?(v=typeof n=="function"?n:X(+n),i):v},i.endAngle=function(n){return arguments.length?(A=typeof n=="function"?n:X(+n),i):A},i.padAngle=function(n){return arguments.length?(Y=typeof n=="function"?n:X(+n),i):Y},i.context=function(n){return arguments.length?(a=n??null,i):a},i}export{vn as a};
