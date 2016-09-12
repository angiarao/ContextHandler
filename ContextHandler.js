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
			var self = this;
			cmTarget.addEventListener("contextmenu", function (evt) {
				self.contextMenuHandler(self,evt);
			});
			cmTarget.addEventListener("click", function (evt) {
				document.querySelector("div.cm", function () {
					this.parentNode.removeChild(this);
				});
			});
		},
		getContextObj: function (contextId){
			for(x in current_context){
				if(current_context[x].context_Menu==undefined) continue;
				if(current_context[x].context_Menu.id.toString()==contextId) return current_context[x].context_Menu.contextOptions;
			}
			return null;
		},
		buildContext: function (self,contextOptions) {
			var createElemWithAttrs = new function(elem,attrObj){
				for(x in attrObj){
					key = Object.keys(attrObj[x])[0];
					attr = document.createAttribute(key);
					attr.value = attrObj[x][key];
				}
				return elem;
			};
			var trackedGroupID=contextOptions[0].groupID;
			var ulElem = createElemWithAttrs(document.createElement("ul"),[{"class":"cm-list"}]);
			for(x in contextOptions){
				var currentOption = contextOptions[x];
				var currentOptionClassName = "cm-item";
				var i;
				var subOptionsElem;
				if(currentOption.groupID != trackedGroupID) currentOptionClassName = currentOptionClassName + " cm-br";
				if(currentOption.icon) i = createElemWithAttrs(document.createElement("i"),[{"id":currentOption.iconId}])
				if(currentOption.contextOptions){
					currentOptionClassName = currentOptionClassName + " cm-exp";
					subOptionsElem = self.buildContext(self,currentOption.contextOptions);
				}
				var liElem = createElemWithAttrs(document.createElement("li"),[{"class":currentOptionClassName},{"id":currentOption.optionId}]);
				if(i) liElem.appendChild(i);
				if(subOptionsElem) liElem.appendChild(subOptionsElem);
				liElem.innerText = currentOption.label;
				ulElem.appendChild(liElem);
			}
			return ulElem;		
		},
		contextMenuHandler: function (self,contextMenuEvent) {
			
			var elem = contextMenuEvent.target;
			
			//check if there's context id present up the node and its parents
			var contextId = elem.getAttribute('contextId');;
			while(this !== elem) {
				contextId = elem.getAttribute('contextId');
				if (contextId) break;
				elem = elem.parentElement;
			}

			if(contextId){
				//to prevent opening up the default right click options
				contextMenuEvent.preventDefault();

				console.log('context id  : '+ contextId );	
				var contextOptions = self.getContextObj(contextId);
				if(!contextOptions) return;

				//build context from context options
				var contextMenuBody = createElemWithAttrs(document.createElement("div"),[{"class":"cm"}]).appendChild(
					self.buildContext(self,contextOptions)
				);
				document.body.appendChild(contextMenuBody);

				//to stop propogation of click event inside context menu body
				contextMenuBody.addEventListener("click", function (clickEvent) {
					clickEvent.stopPropagation();
				});


				//need to render the context menu body
				renderContextMenu(self,contextMenuEvent,contextMenuBody);
			}
		},
		renderContextMenu : function(self,contextMenuEvent,contextMenuBody){


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