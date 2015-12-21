!function(){var e={files:["simple-data.json","run-simple.sh"],help:{}};(function(){function e(e){return null!=e&&""!==e}function n(t){return(Array.isArray(t)?t.map(n):t&&"object"==typeof t?Object.keys(t).filter(function(e){return t[e]}):[t]).filter(e).join(" ")}function t(e){return o[e]||e}function r(e){var n=String(e).replace(a,t);return n===""+e?e:n}var i={};i.merge=function s(n,t){if(1===arguments.length){for(var r=n[0],i=1;i<n.length;i++)r=s(r,n[i]);return r}var o=n["class"],a=t["class"];(o||a)&&(o=o||[],a=a||[],Array.isArray(o)||(o=[o]),Array.isArray(a)||(a=[a]),n["class"]=o.concat(a).filter(e));for(var l in t)"class"!=l&&(n[l]=t[l]);return n},i.joinClasses=n,i.cls=function(e,t){for(var r=[],o=0;o<e.length;o++)t&&t[o]?r.push(i.escape(n([e[o]]))):r.push(n(e[o]));var a=n(r);return a.length?' class="'+a+'"':""},i.style=function(e){return e&&"object"==typeof e?Object.keys(e).map(function(n){return n+":"+e[n]}).join(";"):e},i.attr=function(e,n,t,r){return"style"===e&&(n=i.style(n)),"boolean"==typeof n||null==n?n?" "+(r?e:e+'="'+e+'"'):"":0==e.indexOf("data")&&"string"!=typeof n?(-1!==JSON.stringify(n).indexOf("&")&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),n&&"function"==typeof n.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+e+"='"+JSON.stringify(n).replace(/'/g,"&apos;")+"'"):t?(n&&"function"==typeof n.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+e+'="'+i.escape(n)+'"'):(n&&"function"==typeof n.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+e+'="'+n+'"')},i.attrs=function(e,t){var r=[],o=Object.keys(e);if(o.length)for(var a=0;a<o.length;++a){var s=o[a],l=e[s];"class"==s?(l=n(l))&&r.push(" "+s+'="'+l+'"'):r.push(i.attr(s,l,!1,t))}return r.join("")};var o={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},a=/[&<>"]/g;return i.escape=r,i.rethrow=function l(e,n,t,r){if(!(e instanceof Error))throw e;if(!("undefined"==typeof window&&n||r))throw e.message+=" on line "+t,e;try{r=r||require("fs").readFileSync(n,"utf8")}catch(i){l(e,null,t)}var o=3,a=r.split("\n"),s=Math.max(t-o,0),u=Math.min(a.length,t+o),o=a.slice(s,u).map(function(e,n){var r=n+s+1;return(r==t?"  > ":"    ")+r+"| "+e}).join("\n");throw e.path=n,e.message=(n||"Jade")+":"+t+"\n"+o+"\n\n"+e.message,e},i.DebugItem=function(e,n){this.lineno=e,this.filename=n},i})();e.help["job-type"]="<p>Type of the job you want to run. It can either be a single process one or a multi-process one.</p>\n",e.help["job-name"]="<p>Name of the job you want to use.</p>\n",e.extract=function(e,n){var t={valid:!0,data:{model:n},errors:[]};return t},e.template=function(e){var n=[];return n.push('#!/bin/bash\necho "Start process"\nCOUNTER=0\nwhile [  $COUNTER -lt 10 ]; do\n    sleep 1\n    echo "Working... $COUNTER"\n    let COUNTER=COUNTER+1\ndone\necho "Done"\n '),n.join("")},e.definition={order:["job"],views:{job:{id:"job",label:"Job",attributes:["job-definition"]}},definitions:{"job-definition":{label:"Definition",parameters:[{id:"job-type",label:"Type",type:"enum","default":0,size:1,"enum":{labels:["Single-process","Multi-process"],values:[1,4]}},{id:"job-name",label:"Name",type:"string","default":"Your job name",size:1}]}}},SimPut.registerTemplateLibrary("simple",e)}();