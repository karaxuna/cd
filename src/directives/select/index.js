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