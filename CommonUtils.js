(function(global,CommonUtils){
	if (typeof Window !== "undefined" && global instanceof Window) {
		global.CommonUtils = CommonUtils();
	} else {
		if (typeof exports !== "undefined") {
			exports.CommonUtils = CommonUtils();
		}
	}
})(typeof window !== "undefined" ? window : this, function(){
	var CommonUtils = {		
		qAll:function(parentElement,query){
			return parentElement.querySelectorAll(query);
		},
		q:function(parentElement,query){
			return parentElement.querySelector(query);
		},
		createElemWithAttrs : function(tagName,attrObj){
			elem = document.createElement(tagName);
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
			var width = CommonUtils.toNumber(CommonUtils.getStyle(elem,"width"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"padding-left"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"padding-right"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"margin-left"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"margin-right"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"border-right-width"));
			width+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"border-left-width"));
		    return parseInt(width);
		},
		getTotalHeight : function(elem){
			var height = CommonUtils.toNumber(CommonUtils.getStyle(elem,"height"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"padding-top"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"padding-bottom"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"margin-top"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"margin-bottom"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"border-top-width"));
			height+=CommonUtils.toNumber(CommonUtils.getStyle(elem,"border-bottom-width"));
		    return parseInt(height);
		},
		getOffsetHeightFromTop : function(elem){
			var totalHeightFromTop = elem.offsetTop;
			while(elem.offsetParent){
				elem = elem.offsetParent;
				totalHeightFromTop += elem.offsetTop;
			}
			return totalHeightFromTop;
		},
		getOffsetLeftFromWindow : function(elem){
			var totalLeftFromTop = elem.offsetLeft;
			while(elem.offsetParent){
				elem = elem.offsetParent;
				totalLeftFromTop += elem.offsetLeft;
			}
			return totalLeftFromTop;
		}
	}
	return CommonUtils;
});