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
		},
		buildContext: function (context_id) {
			console.log('context id  : '+ context_id );	
		},
		contextMenuHandler: function (self,event) {
			var elem = event.target;
			var context_id = elem.getAttribute('context_id');;
			while(this !== elem) {
				context_id = elem.getAttribute('context_id');
				if (context_id) break;
				elem = elem.parentElement;
			}
			if(context_id){
				self.buildContext(self,context_id);
				event.preventDefault();
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