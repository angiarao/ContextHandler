(function(global,To){
	if (typeof Window !== "undefined" && global instanceof Window) {
		global.To = To();
	} else {
		if (typeof exports !== "undefined") {
			exports.To = To();
		}
	}
})(typeof window !== "undefined" ? window : this,function(){
	var To = {
		createElemWithAttrs : function(elem,attrObj){
			for(x in attrObj){
				key = Object.keys(attrObj[x])[0];
				value = attrObj[x][key];
				elem.setAttribute(key,value);
			}
			return elem;
		},
		getStyle : function(elem,css3Prop){
			var strValue = "";
			if(window.getComputedStyle){
				strValue = getComputedStyle(elem).getPropertyValue(css3Prop);
		    }else if (elem.currentStyle){  //IE
				try {
		            strValue = elem.currentStyle[css3Prop];
				} catch (e) {}
		    }
		    return strValue;
		},
		toNumber : function(val){
		    return parseInt(val.replace(/[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\]+/g,""));
		},
		getTotalWidth : function(elem){
			var width = To.toNumber(To.getStyle(elem,"width"));
			width+=To.toNumber(To.getStyle(elem,"padding-left"));
			width+=To.toNumber(To.getStyle(elem,"padding-right"));
			width+=To.toNumber(To.getStyle(elem,"margin-left"));
			width+=To.toNumber(To.getStyle(elem,"margin-right"));
			width+=To.toNumber(To.getStyle(elem,"border-left-width"));
			width+=To.toNumber(To.getStyle(elem,"border-left-width"));
		    return parseInt(width);
		},
		getTotalHeight : function(elem){
			var height = To.toNumber(To.getStyle(elem,"height"));
			height+=To.toNumber(To.getStyle(elem,"padding-top"));
			height+=To.toNumber(To.getStyle(elem,"padding-bottom"));
			height+=To.toNumber(To.getStyle(elem,"margin-top"));
			height+=To.toNumber(To.getStyle(elem,"margin-bottom"));
			height+=To.toNumber(To.getStyle(elem,"border-top-width"));
			height+=To.toNumber(To.getStyle(elem,"border-bottom-width"));
		    return parseInt(height);
		},
		getOffsetHeightFromTop : function(elem){
			var totalHeightFromTop = elem.offsetTop;
			while(elem.offsetParent){
				elem = elem.offsetParent;
				totalHeightFromTop += elem.offsetTop;
			}
			return totalHeightFromTop;
		}
	}
	return To;
});

(function (global, ContextContract) {
	if (typeof Window !== "undefined" && global instanceof Window) {
		global.ContextMenu = ContextContract();
	} else {
		if (typeof exports !== "undefined") {
			exports.ContextMenu = ContextContract();
		}
	}
})(typeof window !== "undefined" ? window : this, function () {
	var fn = {
		bindEvents: function (cmTarget) {
			cmTarget.addEventListener("contextmenu", function (evt) {
				fn.contextMenuHandler(evt);
			});
			cmTarget.addEventListener("click", function (evt) {
				fn.removeContextObj();
			});
		},
		removeContextObj: function(){
			var cm = document.querySelector("div.cm");
			if(cm) cm.parentNode.removeChild(cm);

		},
		getContextObj: function (contextId){
			for(x in current_context){
				if(current_context[x].context_Menu==undefined) continue;
				if(current_context[x].context_Menu.id.toString()==contextId) return current_context[x].context_Menu.contextOptions;
			}
			return null;
		},
		buildListItem: function(currentOption,addLine){
			var currentOptionClassName = "cm-item";
			var icon;
			var subOptionsElem;
			if(addLine)	currentOptionClassName = currentOptionClassName + " cm-br";
			if(currentOption.iconId) icon = To.createElemWithAttrs(document.createElement("i"),[{"id":currentOption.iconId}])
			if(currentOption.contextOptions){
				currentOptionClassName = currentOptionClassName + " cm-exp";
				subOptionsElem = fn.buildContext(currentOption.contextOptions);
			}
			var liElem = To.createElemWithAttrs(document.createElement("li"),[{"class":currentOptionClassName},{"id":currentOption.optionId}]);
			if(icon) liElem.appendChild(icon);
			liElem.appendChild(document.createTextNode(currentOption.label));
			if(subOptionsElem) liElem.appendChild(subOptionsElem);
			return liElem;
		},
		buildContext: function (contextOptions) {
			trackedGroupID=contextOptions[0].groupId;
			var ulElem = To.createElemWithAttrs(document.createElement("ul"),[{"class":"cm-list"}]);
			var addLine;
			for(x in contextOptions){
				addLine = false;	
				if(contextOptions[x].groupId != trackedGroupID){
					trackedGroupID = contextOptions[x].groupId;
					addLine = true;	
				} 
				ulElem.appendChild(fn.buildListItem(contextOptions[x],addLine));
			}
			return ulElem;		
		},
		getContextId: function(elem){
			var contextId;
			while(elem) {
				contextId = elem.getAttribute('context-id');
				if (contextId) break;
				elem = elem.parentElement;
			}
			return contextId;
		},
		contextMenuHandler: function (contextMenuEvent) {

			//to remove already present contextobj in html
			fn.removeContextObj();

			//check if there's context id present up the node and its parents
			var contextId = fn.getContextId(contextMenuEvent.target);

			if(contextId){
				//to prevent opening up the default right click options
				contextMenuEvent.preventDefault();

				console.log('context id  : '+ contextId );	
				var contextOptions = fn.getContextObj(contextId);
				if(!contextOptions) return;

				//build context from context options
				var contextMenuBody = To.createElemWithAttrs(document.createElement("div"),[{"class":"cm"}]);
				contextMenuBody.appendChild(fn.buildContext(contextOptions));
				document.body.appendChild(contextMenuBody);
				//need to render the context menu body
				fn.renderContextMenu(contextMenuEvent,contextMenuBody);
				//to handle click event inside context menu body
				contextMenuBody.addEventListener("click",function(clickEvent){
					fn.clickEventHandler(contextMenuBody,clickEvent)
				});
			}
		},
		clickEventHandler : function(contextMenuBody,clickEvent){
			clickEvent.stopPropagation();
			var ss = contextMenuBody.getAttribute("ss");
			var cmItemHeight = To.getTotalHeight(contextMenuBody.querySelector("ul.cm-list>li.cm-item"));
			var elem = clickEvent.target;
			var parentElement = elem;
			//getParentElement
			while(parentElement && parentElement.className.indexOf("cm-list")==-1){
				parentElement = parentElement.parentElement;
			}
			if(!parentElement) return;

			var activeElem = parentElement.querySelector(".cm-item.cm-exp.active");
			if(activeElem) activeElem.className = activeElem.className.replace(" active","");

			while(elem && elem.className.indexOf("cm-item")==-1){
				elem = elem.parentElement;
				if(elem.className.indexOf("cm-list")!==-1) return;
			}
			

			if(elem && elem.className.indexOf("cm-exp")!==-1){
				var targetElem = elem.querySelector("ul.cm-list");
				var liElems = targetElem.children.length;
				var totalHeightOfSubElems = ((liElems==0)?0:(liElems-1))*cmItemHeight;
				var totalOffset = To.getOffsetHeightFromTop(elem);
				var top = elem.offsetTop;
				var left;
				elem.className = elem.className + " active";
				
				if((totalOffset+totalHeightOfSubElems)>(window.screen.availHeight*0.7)){
					top = top - totalHeightOfSubElems;
				}
				if(ss.indexOf("tl")!=-1){
					left = "-"+To.getTotalWidth(targetElem);
				}else{
					left = To.getTotalWidth(elem);
				}
				
				top = "top: "+ top +"px;"
				left = "left: "+ left +"px;"
				targetElem.removeAttribute("style");
				targetElem.setAttribute("style",top+left);
				var activeElems = parentElement.querySelectorAll(".cm-item.cm-exp.active");
				var iterator = activeElems.keys();
				iterator.next(); //to skip the first element
				x=iterator.next();
				while(!x.done){
					activeElem = activeElems[x.value];
					if(!activeElem) break;
					activeElem.className = activeElem.className.replace(" active","");
					x=iterator.next();
				}
			}
		},
		renderContextMenu : function(contextMenuEvent,contextMenuBody){
			var screenObj = window.screen;
			var goDownRegion = screenObj.availHeight*0.7;
			var showRightRegion = screenObj.availWidth*0.8;
			var currX = contextMenuEvent.clientX;
			var currY = contextMenuEvent.clientY;
			var contextMenuBodyHeight = To.getTotalHeight(contextMenuBody.children[0]);
			var contextMenuBodyWidth = To.getTotalWidth(contextMenuBody.children[0]);
			var top,left;
			if((0<=currX)&&(currX<=showRightRegion)){
				if((0<=currY)&&(currY<=goDownRegion)){
					top = "top: " + currY + "px;";
					left = "left: " + currX + "px;";
					contextMenuBody.setAttribute("style",top+left);
					contextMenuBody.setAttribute("ss","gdtr")
				}else{
					top = "top: " + (currY-contextMenuBodyHeight) + "px;";
					left = "left: " + currX + "px;";
					contextMenuBody.setAttribute("style",top+left);
					contextMenuBody.setAttribute("ss","gutr")
				}
			}else{
				if((0<=currY)&&(currY<=goDownRegion)){
					top = "top: " + (currY) + "px;";
					left = "left: " + (currX-contextMenuBodyWidth) + "px;";
					contextMenuBody.setAttribute("style",top+left);	
					contextMenuBody.setAttribute("ss","gdtl")
				}else{
					top = "top: " + (currY-contextMenuBodyHeight) + "px;";
					left = "left: " + (currX-contextMenuBodyWidth) + "px;";
					contextMenuBody.setAttribute("style",top+left);	
					contextMenuBody.setAttribute("ss","gutl")
				}
			}


		}
	};

	var contextContract =  {
		init: function (config) {
			var cmTarget = config && config.eventTarget;
			if (cmTarget) {
				fn.bindEvents(cmTarget);
			}
		}
	};
	return contextContract;
});

ContextMenu.init({
	eventTarget: document.body
});

