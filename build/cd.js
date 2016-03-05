/* global angular */
angular.module('cd', []);
angular.module('cd').factory('cdUtils', [function () {
    return {
        extend: function (a /*, bs.., exclInsts*/) {
            var args = arguments,
                exclInsts = [Array],
                bs;

            if (args[args.length - 1] instanceof Array) {
                bs = Array.prototype.slice.call(args, 1, args.length - 1);
                args[args.length - 1].forEach(function (exclInst) {
                    if (exclInsts.indexOf(exclInst) === -1) {
                        exclInsts.push(exclInst);
                    }
                });
            } else {
                bs = Array.prototype.slice.call(args, 1, args.length);
            }

            for (var i = 0, b; b = bs[i]; i++) {
                for (var prop in b) {
                    if (b.hasOwnProperty(prop)) {
                        var isExclInst = false;
                        if (exclInsts) {
                            for (var j = 0; j < exclInsts.length; j++) {
                                if (b[prop] instanceof exclInsts[j]) {
                                    isExclInst = true;
                                }
                            }
                        }

                        if (a[prop] instanceof Array && b[prop] instanceof Array) {
                            a[prop].splice.apply(a[prop], [0, a[prop].length].concat(b[prop]));
                        } else if (typeof b[prop] === 'object' && b[prop] !== null && !isExclInst) {
                            a[prop] = a[prop] !== undefined ? a[prop] : {};
                            this.extend(a[prop], b[prop], exclInsts);
                        } else {
                            a[prop] = b[prop];
                        }
                    }
                }
            }
            return a;
        },

        setProp: function (obj, prop, value) {
            var parts = prop.split('.');
            var _ref = obj;
            for (var i = 0, part; part = parts[i]; i++) {
                if (i === parts.length - 1) {
                    _ref[part] = value;
                } else {
                    _ref = (_ref[part] = _ref[part] || {});
                }
            }
        },

        getProp: function (obj, prop) {
            var parts = prop.split('.');
            var _ref = obj;
            for (var i = 0, part; part = parts[i]; i++) {
                if (i === parts.length - 1) {
                    return _ref[part];
                } else {
                    _ref = _ref[part] || {};
                }
            }
        },

        findOne: function (ar, query, fn) {
            for (var i = 0, a; a = ar[i]; i++) {
                var m = this.matchesQuery(a, query);
                if (m) {
                    if (fn) fn(a, i);
                    return a;
                }
            }

            if (fn) fn(null);
            return null;
        },

        matchesQuery: function (obj, query) {
            switch (typeof query) {
                case 'object':
                    for (var prop in query) {
                        var val = this.getProp(obj, prop);
                        if (val !== query[prop])
                            return false;
                    }
                    return true;
                case 'function':
                    return query(obj);
            }
        },

        find: function (ar, query, fn) {
            var results = [];
            for (var i = 0, a; a = ar[i]; i++)
                if (this.matchesQuery(a, query))
                    results.push(a);

            if (fn) fn(results);
            return results;
        },

        contains: function (ar, obj, comparer) {
            for (var i = 0, a; a = ar[i]; i++)
                if (this.equals(a, obj, comparer))
                    return true;
            return false;
        },

        any: function (items, query) {
            for (var i = 0, item; item = items[i]; i++)
                if (this.matchesQuery(item, query))
                    return true;
            return false;
        },

        union: function (ar1, ar2, comparer, fn) {
            var results = [];
            for (var i = 0; i < ar1.length; i++)
                results.push(ar1[i]);
            for (var i = 0; i < ar2.length; i++) {
                var isNotInAr1 = !this.contains(ar1, ar2[i], comparer);
                if (isNotInAr1)
                    results.push(ar2[i]);
            };
            if (fn) fn(results);
            return results;
        },

        except: function (ar1, ar2, comparer, fn) {
            var results = [];
            for (var i = 0; i < ar1.length; i++) {
                var a = ar1[i];
                if (!this.contains(ar2, a, comparer))
                    results.push(a);
            }
            if (fn) fn(results);
            return results;
        },

        max: function (ar) {
            var max;
            for (var i = 0; i < ar.length; i++) {
                var a = ar[i];
                if (typeof max === 'undefined' || a > max)
                    max = a;
            }
            return max;
        },

        isNull: function (x) {
            return x === null;
        },

        isUndefined: function (x) {
            return x === undefined;
        },

        isNullOrUndefined: function (x) {
            return this.isNull(x) || this.isUndefined(x);
        },

        isEmptyString: function (x) {
            return x === '';
        },

        isString: function (x) {
            return typeof x === 'string';
        },

        isNonEmptyString: function (x) {
            return this.isString(x) && x.length > 0;
        },

        equals: function (item1, item2, comparer) {
            if (this.isNullOrUndefined(item1) || this.isNullOrUndefined(item2))
                return false;
            else if (typeof comparer === 'function')
                return comparer(item1, item2);
            else if (typeof comparer === 'object') {
                var val1 = this.getProp(item1, comparer);
                var val2 = this.getProp(item2, comparer);
                return val1 === val2;
            } else
                return item1 === item2;
        }
    };
}]);
angular.module("cd").run(["$templateCache", function($templateCache) {$templateCache.put("directives/select/index.html","<div class=\"cd-select\" ng-class=\"expanded ? \'cd-expanded\' : null\" tabindex=\"0\">\r\n    <fieldset class=\"cd-head\" ng-disabled=\"disabled\" ng-click=\"expanded = !expanded\">\r\n        <!-- Multiple selection -->\r\n        <div ng-if=\"multiple\" class=\"cd-selection cd-multiple\">\r\n            <div ng-if=\"!selection.length\" class=\"cd-placeholder\">\r\n                <span ng-bind=\"placeholder\"></span>\r\n            </div>\r\n            <div ng-repeat=\"item in selection\" class=\"cd-tag\">\r\n                <div>\r\n                    <span class=\"cd-caption\" ng-bind=\"getCaption(item)\"></span>\r\n                </div>\r\n                <div>\r\n                    <button class=\"cd-remove\" ng-click=\"remove(item)\" cd-stop-propagation>x</button>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- Single selection -->\r\n        <div ng-if=\"!multiple\" class=\"cd-selection cd-single\">\r\n            <div class=\"cd-selected-text\" ng-class=\"!selection ? \'cd-placeholder\' : null\">\r\n                <span ng-bind=\"selection ? getCaption(selection) : expanded ? null : placeholder\"></span>\r\n            </div>\r\n        </div>\r\n        <div class=\"cd-buttons\">\r\n            <table boder=\"0\">\r\n                <tr>\r\n                    <td ng-if=\"!multiple && selection && !disabled\">\r\n                        <button type=\"button\" class=\"cd-button cd-button-clear btn-not-style\" ng-click=\"clear();\" cd-stop-propagation tabindex=\"-1\">\r\n                            <span>x</span>\r\n                        </button>\r\n                    </td>\r\n                    <td>\r\n                        <button type=\"button\" class=\"cd-button cd-button-collapse btn-not-style\" tabindex=\"-1\">\r\n                            <span>v</span>\r\n                        </button>\r\n                    </td>\r\n                </tr>\r\n            </table>\r\n        </div>\r\n    </fieldset>\r\n    <!-- Tether.js will move this part into body tag -->\r\n    <div class=\"cd-select-body\" ng-class=\"expanded ? \'cd-expanded\' : null\">\r\n        <div ng-if=\"expanded\" class=\"cd-select-dropdown\">\r\n            <div class=\"cd-search\" ng-class=\"$parent.searching ? \'cd-searching\' : null;\" ng-if=\"options.allowSearch !== false;\">\r\n                <input type=\"text\" class=\"cd-search-input\" ng-model=\"options.search\" ng-model-options=\"{ debounce: 500 }\" cd-focus-when=\"expanded\" />\r\n            </div>\r\n            <ul class=\"cd-records scroll vertical hard\" ng-if=\"options.records.length\" cd-on-bottom-scroll=\"onBottomScroll()\" cd-on-bottom-scroll-distance=\"100\">\r\n                <li tabindex=\"0\" class=\"cd-record\" ng-repeat=\"record in options.records\" ng-click=\"select(record)\">\r\n                    <span ng-bind-html=\"getOptionCaption(record)\"></span>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n    </div>\r\n</div>\r\n");}]);
angular.module('cd').directive('cdStopPropagation', [function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			element.on('click', function(e){
				e.stopPropagation();
			});
		}
	};
}]);
/* global Tether */
angular.module('cd').directive('cdSelect', ['$q', '$injector', '$timeout', '$sce', 'cdUtils', function (q, injector, timeout, sce, utils) {
    return {
        restrict: 'E',
        templateUrl: 'directives/select/index.html',
        replace: true,
        require: 'ngModel',
        scope: {
            options: '=cdOptions',
            disabled: '=ngDisabled',
            required: '=ngRequired',
            expanded: '=cdExpanded',
            placeholder: '@cdPlaceholder',
            keyProp: '@cdKeyProp',
            displayProp: '@cdDisplayProp',
            comparerProp: '@cdComparerProp',
            optionCaptionProp: '@cdOptionCaptionProp',
            locals: '=cdLocals',
            appendToBody: '=cdAppendToBody',
            multiple: '=cdMultiple'
        },
        link: function (scope, element, attrs, modelCtrl) {
            /**
             * Get selection caption. Default display property is `name`.
             * Custom display property can be set via `cd-display-prop` attribute
             * @param  {Object} record
             */
            scope.getCaption = function (selection) {
                return utils.getProp(selection, scope.displayProp || 'name');
            };
            
            /**
             * Get option caption
             * @param  {any} option
             */
            scope.getOptionCaption = function (option) {
                var html = utils.getProp(option, scope.optionCaptionProp || scope.displayProp || 'name');
                return sce.trustAsHtml(html);
            };
            
            /**
             * Clear model value
             */
            scope.clear = function () {
                modelCtrl.$setViewValue(null);
                modelCtrl.$render();
            };
            
            /**
             * Remove tag
             * @param  {Object} item
             */
            scope.remove = function (item) {
                modelCtrl.$modelValue.splice(modelCtrl.$modelValue.indexOf(item), 1);
            };
            
            scope.searching = false;
            scope.scrolling = false;
            
            /**
             * Invokes method and injects parameters from `cd-locals` attribute
             * @param  {Function} fn
             */
            scope.invoke = function (fn) {
                return q.when(injector.invoke(fn, scope.options, scope.locals));
            };
            
            /**
             * Reload options
             */
            scope.reload = function () {
                return scope.invoke(scope.options.reload);
            };
            
            /**
             * Update displayed selection
             */
            modelCtrl.$render = function () {
                if (utils.isNullOrUndefined(modelCtrl.$modelValue)) {
                    scope.selection = null;
                } else {
                    if (scope.keyProp) {
                        if (scope.multiple) {
                            scope.selection = modelCtrl.$modelValue.map(function (value) {
                                var query = {};
                                utils.setProp(query, scope.keyProp, value);
                                return utils.findOne(scope.options.records, query);
                            });
                        } else {
                            var query = {};
                            utils.setProp(query, scope.keyProp, modelCtrl.$modelValue);
                            scope.selection = utils.findOne(scope.options.records, query);
                        }
                    } else {
                        scope.selection = modelCtrl.$modelValue;
                    }
                }
            };

            /**
             * Get value from record by `keyProp` option
             * @param  {any} record
             */
            function getValue(record) {
                if (scope.keyProp) {
                    return utils.getProp(record, scope.keyProp);
                } else {
                    return record;
                }
            }
            
            
            /**
             * Compare records. `comparerProp` is ignored if `keyProp` exists.
             * @param  {any} a
             * @param  {any} b
             */
            function compare(a, b) {
                var comparerProp;
                if (scope.keyProp) {
                    comparerProp = scope.keyProp;
                } else if (scope.comparerProp) {
                    comparerProp = scope.comparerProp;
                } else {
                    comparerProp = 'id';
                }
                
                return utils.getProp(a, comparerProp) === utils.getProp(b, comparerProp);
            }
            
            /**
             * Update model controller with new value
             * @param  {Object} record
             */
            scope.select = function (record) {
                // get value
                var value = getValue(record);

                // if value not set
                if (!modelCtrl.$modelValue) {
                    modelCtrl.$setViewValue(scope.multiple ? [value] : value);
                    modelCtrl.$render();
                }
                // push item to array if does not exist
                else if (scope.multiple) {
                    if (!modelCtrl.$modelValue.some(function (selection) {
                        return compare(selection, record);
                    })) {
                        modelCtrl.$modelValue.push(value);
                    }
                }
                // select if not selected
                else if (!compare(modelCtrl.$modelValue, record)) {
                    modelCtrl.$setViewValue(value);
                    modelCtrl.$render();
                }
                    
                // collapse
                scope.expanded = false;
                        
                // focus current input
                setTimeout(function () {
                    element[0].focus();
                });
            };
            
            // Reference to select body
            var bodyElement;
            
            // Expand on enter
            element.on('keypress', function (e) {
                if (!scope.expanded && e.which === 13) {
                    scope.$apply(function () {
                        scope.expanded = true;
                    });
                }
            });
            
            /**
             * Handles document keydown event
             * @param  {any} e
             */
            function onKeyDown(e) {
                // Move focus to options when up or down keys are pressed
                if (e.which === 40 || e.which === 38) {
                    if (e.which === 40) {
                        focusOption(1);
                    } else if (e.which === 38) {
                        focusOption(-1);
                    }
                    // Prevent document scroll
                    e.preventDefault();
                    return false;
                }
                
                // Select option on enter key
                if (e.which === 13) {
                    var focusedRecordScope = bodyElement.find('.cd-records > .cd-record:focus').scope();
                    if (focusedRecordScope) {
                        scope.$apply(function () {
                            scope.select(focusedRecordScope.record);
                        });
                    }
                    // Prevent reopen
                    e.preventDefault();
                    return false;
                }
                
                // Close on Tab
                if (e.which === 9) {
                    scope.$apply(function () {
                        scope.expanded = false;
                    });
                }
            }
            
            /**
             * If diff is 1 then next option is focused.
             * If diff is -1 then previous option is focused.
             * @param  {any} diff
             */
            function focusOption(diff) {
                setTimeout(function () {
                    var options = bodyElement.find('.cd-records > .cd-record');
                    if (!options.length) {
                        return;
                    }
                    
                    if (options.is(':focus')) {
                        var i, el;
                        for (i = 0; i < options.length; i++) {
                            el = options[i];
                            if (document.activeElement === el) {
                                if (i + diff >= 0 && i + diff < options.length) {
                                    options.get(i + diff).focus();
                                    return;
                                }
                            }
                        }
                        
                        // focus search input if none of inputs are focused
                        if (scope.options.allowSearch !== false) {
                            bodyElement.find('.cd-search > input')[0].focus();
                        }
                    } else {
                        options[0].focus();
                    }
                });
            }

            scope.$watch('expanded', function (expanded, wasExpanded) {
                if (expanded) {
                    scope.searching = true;
                    scope.reload().then(function (result) {
                        scope.searching = false;
                        scope.options.records = result.records;
                        scope.options.total = result.total;
                        
                        // bind events
                        angular.element(document).on('keydown', onKeyDown);
                        
                        // focus search input
                        if (scope.options.allowSearch !== false) {
                            bodyElement.getElementsByClassName('cd-search-input')[0].focus();
                        }
                    });
                } else {
                    scope.options.search = null;
                    scope.options.records = null;
                    scope.options.page = 1;
                    
                    // unbind events
                    angular.element(document).off('keydown', onKeyDown);
                }
            });

            scope.$watch('options.search', function (term) {
                if (scope.expanded) {
                    scope.searching = true;
                    scope.options.page = 1;
                    scope.reload().then(function (result) {
                        scope.searching = false;
                        scope.options.records = result.records;
                        scope.options.total = result.total;
                    });
                }
            });

            scope.onBottomScroll = function () {
                if (!scope.scrolling && scope.options.records.length < scope.options.total) {
                    scope.options.page++;
                    scope.scrolling = true;
                    scope.reload().then(function (result) {
                        scope.scrolling = false;
                        Array.prototype.push.apply(scope.options.records, result.records);
                        scope.options.total = result.total;
                    });
                }
            };
            
            timeout(function () {
                // dropdown
                bodyElement = element[0].getElementsByClassName('cd-select-body')[0];
                
                if (scope.appendToBody) {
                    // create tether instance
                    var tether = new Tether({
                        element: bodyElement,
                        target: element.find('.cd-head')[0],
                        attachment: 'top left',
                        targetAttachment: 'bottom left',
                        constraints: [{
                            to: 'window',
                            attachment: 'together'
                        }]
                    });
                    
                    // update position when dropdown is fully expanded
                    scope.$watch('searching', function (newVal, oldVal) {
                        if (!newVal && oldVal) {
                            setTimeout(position);
                        }
                    });
                    
                    // find all scrollable parents
                    var scrollParent = Tether.Utils.getScrollParent(element[0]);
                    var $scrollParents;
                    while (scrollParent && scrollParent !== document) {
                        if ($scrollParents) {
                            // popup bug fix
                            if ($scrollParents.is(scrollParent)) {
                                break;
                            }
                            $scrollParents = $scrollParents.add(angular.element(scrollParent));
                        } else {
                            $scrollParents = angular.element(scrollParent);
                        }

                        scrollParent = Tether.Utils.getScrollParent(scrollParent);
                    }
                    
                    // update position on scroll
                    $scrollParents.on('scroll', position);
                    
                    // update position
                    function position() {
                        tether.position();
                    }

                    // clean when scope destroyed
                    scope.$on('$destroy', function () {
                        tether.destroy();
                        bodyElement.parentNode.removeChild(bodyElement);
                        $scrollParents.off('scroll', position);
                    });
                }
            });
        }
    }
}]);