(function(global, ContextContract) {
    if (typeof Window !== "undefined" && global instanceof Window) {
        global.ContextMenu = ContextContract();
    } else {
        if (typeof exports !== "undefined") {
            exports.ContextMenu = ContextContract();
        }
    }
})(typeof window !== "undefined" ? window : this, function() {
    var fn = {
        bindEvents: function(cmTarget) {
            cmTarget.addEventListener("contextmenu", function(evt) {
                fn.contextMenuHandler(evt);
            });
            cmTarget.addEventListener("click", function(evt) {
                fn.removeContextObj();
            });
        },
        qAll: function(parentElement, query) {
            return parentElement.querySelectorAll(query);
        },
        q: function(parentElement, query) {
            return parentElement.querySelector(query);
        },
        createElemWithAttrs: function(tagName, attrObj) {
            elem = document.createElement(tagName);
            for (var x in attrObj) {
                key = Object.keys(attrObj[x])[0];
                value = attrObj[x][key];
                elem.setAttribute(key, value);
            }
            return elem;
        },
        getStyle: function(elem, css3Prop) {
            var strValue = "";
            if (window.getComputedStyle) {
                strValue = getComputedStyle(elem).getPropertyValue(css3Prop);
            } else if (elem.currentStyle) { //IE
                try {
                    strValue = elem.currentStyle[css3Prop];
                } catch (e) {}
            }
            return strValue;
        },
        toNumber: function(val) {
            return parseInt(val.replace(/[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\]+/g, ""));
        },
        getTotalWidth: function(elem) {
            var width = fn.toNumber(fn.getStyle(elem, "width"));
            width += fn.toNumber(fn.getStyle(elem, "padding-left"));
            width += fn.toNumber(fn.getStyle(elem, "padding-right"));
            width += fn.toNumber(fn.getStyle(elem, "margin-left"));
            width += fn.toNumber(fn.getStyle(elem, "margin-right"));
            width += fn.toNumber(fn.getStyle(elem, "border-right-width"));
            width += fn.toNumber(fn.getStyle(elem, "border-left-width"));
            return parseInt(width);
        },
        getTotalHeight: function(elem) {
            var height = fn.toNumber(fn.getStyle(elem, "height"));
            height += fn.toNumber(fn.getStyle(elem, "padding-top"));
            height += fn.toNumber(fn.getStyle(elem, "padding-bottom"));
            height += fn.toNumber(fn.getStyle(elem, "margin-top"));
            height += fn.toNumber(fn.getStyle(elem, "margin-bottom"));
            height += fn.toNumber(fn.getStyle(elem, "border-top-width"));
            height += fn.toNumber(fn.getStyle(elem, "border-bottom-width"));
            return parseInt(height);
        },
        getOffsetHeightFromTop: function(elem) {
            var totalHeightFromTop = elem.offsetTop;
            while (elem.offsetParent) {
                elem = elem.offsetParent;
                totalHeightFromTop += elem.offsetTop;
            }
            return totalHeightFromTop;
        },
        getOffsetLeftFromWindow: function(elem) {
            var totalLeftFromTop = elem.offsetLeft;
            while (elem.offsetParent) {
                elem = elem.offsetParent;
                totalLeftFromTop += elem.offsetLeft;
            }
            return totalLeftFromTop;
        },
        removeContextObj: function() {
            var cm = fn.q(document, "div.cm");
            if (cm) cm.parentNode.removeChild(cm);
        },
        getContextObj: function(contextId) {
            for (x in current_context) {
                if (current_context[x].context_Menu === undefined) continue;
                if (current_context[x].context_Menu.id.toString() == contextId) return current_context[x].context_Menu.contextOptions;
            }
            return null;
        },
        buildListItem: function(currentOption, addLine) {
            var currentOptionClassName = "cm-item";
            var icon;
            var subOptionsElem;
            if (addLine) currentOptionClassName = currentOptionClassName + " cm-br";
            if (currentOption.iconId) icon = fn.createElemWithAttrs("i", [{ "id": currentOption.iconId }]);
            if (currentOption.contextOptions) {
                currentOptionClassName = currentOptionClassName + " cm-exp";
                subOptionsElem = fn.buildContext(currentOption.contextOptions);
            }
            var liElem = fn.createElemWithAttrs("li", [{ "class": currentOptionClassName }, { "id": currentOption.optionId }]);
            if (icon) liElem.appendChild(icon);
            liElem.appendChild(document.createTextNode(currentOption.label));
            if (subOptionsElem) liElem.appendChild(subOptionsElem);
            return liElem;
        },
        buildContext: function(contextOptions) {
            trackedGroupID = contextOptions[0].groupId;
            var ulElem = fn.createElemWithAttrs("ul", [{ "class": "cm-list" }]);
            var addLine;
            for (var x in contextOptions) {
                addLine = false;
                if (contextOptions[x].groupId != trackedGroupID) {
                    trackedGroupID = contextOptions[x].groupId;
                    addLine = true;
                }
                ulElem.appendChild(fn.buildListItem(contextOptions[x], addLine));
            }
            return ulElem;
        },
        getContextId: function(elem) {
            var contextId;
            while (elem) {
                contextId = elem.getAttribute('context-id');
                if (contextId) break;
                elem = elem.parentElement;
            };
            return contextId;
        },
        contextMenuHandler: function(contextMenuEvent) {

            //to remove already present contextobj in html
            fn.removeContextObj();

            //check if there's context id present up the node and its parents
            var contextId = fn.getContextId(contextMenuEvent.target);

            if (contextId) {
                //to prevent opening up the default right click options
                contextMenuEvent.preventDefault();
                console.log('context id  : ' + contextId);
                var contextOptions = fn.getContextObj(contextId);
                if (!contextOptions) return;

                //build context from context options
                var contextMenuBody = fn.createElemWithAttrs("div", [{ "class": "cm" }]);
                contextMenuBody.appendChild(fn.buildContext(contextOptions));
                document.body.appendChild(contextMenuBody);
                //need to render the context menu body
                fn.renderContextMenu(contextMenuEvent, contextMenuBody);
                //to handle click event inside context menu body
                contextMenuBody.addEventListener("click", function(clickEvent) {
                    fn.clickEventHandler(contextMenuBody, clickEvent)
                });
            }
        },
        clickEventHandler: function(contextMenuBody, clickEvent) {
            clickEvent.stopPropagation();
            var screenHt = window.screen.availHeight;
            var screenWt = window.screen.availWidth;
            var ss = contextMenuBody.getAttribute("ss");
            var cmItemHeight = fn.getTotalHeight(contextMenuBody.querySelector("ul.cm-list>li.cm-item"));
            var elem = clickEvent.target;
            var parentElement = elem;

            //getParentElement
            while (parentElement && parentElement.className.indexOf("cm-list") == -1) {
                parentElement = parentElement.parentElement;
            }
            if (!parentElement) return;

            //remove the active sub element
            var activeElem = parentElement.querySelector(".cm-item.cm-exp.active");
            if (activeElem) activeElem.className = activeElem.className.replace(" active", "");

            //actual element
            while (elem && elem.className.indexOf("cm-item") == -1) {
                elem = elem.parentElement;
                if (elem.className.indexOf("cm-list") !== -1) return;
            }

            if (elem && elem.className.indexOf("cm-exp") !== -1) {
                var targetElem = elem.querySelector("ul.cm-list");
                var totalOffsetTop = fn.getOffsetHeightFromTop(elem);
                var left, top = elem.offsetTop;
                elem.className = elem.className + " active";
                var totalHeightOfTargetElem = fn.getTotalHeight(targetElem);
                var totalHeightOfParentElem = fn.getTotalHeight(parentElement);
                var diffY = screenHt - (totalOffsetTop + totalHeightOfTargetElem);
                if (diffY < 100) top = (totalHeightOfParentElem - totalHeightOfTargetElem);
                if (ss.indexOf('tl') != -1) {
                    left = "-" + fn.getTotalWidth(targetElem);
                } else {
                    left = fn.getTotalWidth(parentElement);
                }
                targetElem.removeAttribute("style");
                targetElem.setAttribute("style", "top: " + top + "px;" + "left: " + left + "px;");
                var activeElems = parentElement.querySelectorAll(".cm-item.cm-exp.active");
                Object.keys(activeElems).forEach(function(key) {
                    activeElem = activeElems[key];
                    if (!activeElem) return;
                    activeElem.className = activeElem.className.replace(" active", "");
                });
            }
        },
        renderContextMenu: function(contextMenuEvent, contextMenuBody) {
            var screenHt = window.screen.availHeight;
            var screenWt = window.screen.availWidth;
            var currX = contextMenuEvent.clientX;
            var currY = contextMenuEvent.clientY;
            var contextMenuBodyHeight = fn.getTotalHeight(contextMenuBody.children[0]);
            var contextMenuBodyWidth = fn.getTotalWidth(contextMenuBody.children[0]);
            var top, left;
            var diffX = (screenWt * 0.8) - (currX + contextMenuBodyWidth);
            var diffY = screenHt - (currY + contextMenuBodyHeight);
            var ss;
            if (diffX < 0) {
                left = "left: " + (currX - contextMenuBodyWidth) + "px;";
                ss = "tl";
            } else {
                left = "left: " + currX + "px;";
                ss = "tr";
            }

            if (diffY < 0) {
                top = "top: " + (currY - contextMenuBodyHeight) + "px;";
            } else {
                top = "top: " + currY + "px;";
            }
            contextMenuBody.setAttribute("style", top + left);
            contextMenuBody.setAttribute("ss", ss);
        }
    };

    var contextContract = {
        init: function(config) {
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
