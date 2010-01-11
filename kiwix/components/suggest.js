/* Max sets the number of results to show in dropdown, up to 10 */
const Cc=Components;
const Ci=Cc.interfaces;
const Cg=Ci.nsIComponentRegistrar;
const g=Cc.ID("7f7984b9-acc4-4da9-a159-c378fdca4f46");
const max=5;

function gS(){};
gS.prototype={
   startSearch:function(s,p,t,l){
    var j=this,q=Cc.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
     q.onload=function(){
         
       var r=[],n=q.responseXML.getElementsByTagName('suggestion');
       for (var i=0;i<Math.min(5,n.length);i++)
         r.push(n[i].getAttribute('data'));      
       l.onSearchResult(j,new gR(4,r));
     };
     q.open('GET','http://google.com/complete/search?output=toolbar&q='+encodeURIComponent(s),true);
     q.send(null);
   },
   stopSearch:function(){},
   QueryInterface:function(a){return this}
}
function gR(z,r){this._z=z;this._r=r;}
gR.prototype={
   _z:0,_r:[],
   get searchResult(){return this._z},
   get matchCount(){return this._r.length},
   getValueAt:function(i){return this._r[i]},
   getStyleAt:function(i){return null},
   getImageAt:function(i){return ''},
   QueryInterface:function(a){if(a.equals(Ci.nsIAutoCompleteResult))return this}
}
var gF={createInstance:function(o,i){return new gS().QueryInterface(i)}}
var gM={
   registerSelf:function(c,f,l,t){c.QueryInterface(Cg).registerFactoryLocation(g,"Kiwix search Suggest",
      "@mozilla.org/autocomplete/search;1?name=kiwix-suggest",f,l,t)},
   unregisterSelf:function(c,l,t){c.QueryInterface(Cg).unregisterFactoryLocation(g,l)},
   getClassObject:function(c,a,i){return gF},
   canUnload:function(c){return true}
}
function NSGetModule(c,f){return gM}