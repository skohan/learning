(function (global, factory) { typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('backbone'), require('underscore'), require('backbone.radio')) : typeof define === 'function' && define.amd ? define(['exports', 'backbone', 'underscore', 'backbone.radio'], factory) : (global = global || self, (function () { var current = global.Marionette; var exports = global.Marionette = {}; factory(exports, global.Backbone, global._, global.Backbone.Radio); exports.noConflict = function () { global.Marionette = current; return exports; }; }())); }(this, function (exports, Backbone, _, Radio) {
    'use strict'; Backbone = Backbone && Backbone.hasOwnProperty('default') ? Backbone['default'] : Backbone; _ = _ && _.hasOwnProperty('default') ? _['default'] : _; Radio = Radio && Radio.hasOwnProperty('default') ? Radio['default'] : Radio; var version = "4.1.2"; var proxy = function proxy(method) {
        return function (context) {
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
            return method.apply(context, args);
        };
    }; var extend = Backbone.Model.extend; var normalizeMethods = function normalizeMethods(hash) {
        var _this = this; if (!hash) { return; }
        return _.reduce(hash, function (normalizedHash, method, name) {
            if (!_.isFunction(method)) { method = _this[method]; }
            if (method) { normalizedHash[name] = method; }
            return normalizedHash;
        }, {});
    }; var errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number', 'url']; var MarionetteError = extend.call(Error, {
        urlRoot: "http://marionettejs.com/docs/v".concat(version, "/"), url: '', constructor: function constructor(options) {
            var error = Error.call(this, options.message); _.extend(this, _.pick(error, errorProps), _.pick(options, errorProps)); if (Error.captureStackTrace) { this.captureStackTrace(); }
            this.url = this.urlRoot + this.url;
        }, captureStackTrace: function captureStackTrace() { Error.captureStackTrace(this, MarionetteError); }, toString: function toString() { return "".concat(this.name, ": ").concat(this.message, " See: ").concat(this.url); }
    }); function normalizeBindings(context, bindings) {
        if (!_.isObject(bindings)) { throw new MarionetteError({ message: 'Bindings must be an object.', url: 'common.html#bindevents' }); }
        return normalizeMethods.call(context, bindings);
    }
    function bindEvents(entity, bindings) {
        if (!entity || !bindings) { return this; }
        this.listenTo(entity, normalizeBindings(this, bindings)); return this;
    }
    function unbindEvents(entity, bindings) {
        if (!entity) { return this; }
        if (!bindings) { this.stopListening(entity); return this; }
        this.stopListening(entity, normalizeBindings(this, bindings)); return this;
    }
    function normalizeBindings$1(context, bindings) {
        if (!_.isObject(bindings)) { throw new MarionetteError({ message: 'Bindings must be an object.', url: 'common.html#bindrequests' }); }
        return normalizeMethods.call(context, bindings);
    }
    function bindRequests(channel, bindings) {
        if (!channel || !bindings) { return this; }
        channel.reply(normalizeBindings$1(this, bindings), this); return this;
    }
    function unbindRequests(channel, bindings) {
        if (!channel) { return this; }
        if (!bindings) { channel.stopReplying(null, null, this); return this; }
        channel.stopReplying(normalizeBindings$1(this, bindings)); return this;
    }
    var getOption = function getOption(optionName) {
        if (!optionName) { return; }
        if (this.options && this.options[optionName] !== undefined) { return this.options[optionName]; } else { return this[optionName]; }
    }; var mergeOptions = function mergeOptions(options, keys) {
        var _this = this; if (!options) { return; }
        _.each(keys, function (key) { var option = options[key]; if (option !== undefined) { _this[key] = option; } });
    }; function triggerMethodChildren(view, event, shouldTrigger) {
        if (!view._getImmediateChildren) { return; }
        _.each(view._getImmediateChildren(), function (child) {
            if (!shouldTrigger(child)) { return; }
            child.triggerMethod(event, child);
        });
    }
    function shouldTriggerAttach(view) { return !view._isAttached; }
    function shouldAttach(view) {
        if (!shouldTriggerAttach(view)) { return false; }
        view._isAttached = true; return true;
    }
    function shouldTriggerDetach(view) { return view._isAttached; }
    function shouldDetach(view) { view._isAttached = false; return true; }
    function triggerDOMRefresh(view) { if (view._isAttached && view._isRendered) { view.triggerMethod('dom:refresh', view); } }
    function triggerDOMRemove(view) { if (view._isAttached && view._isRendered) { view.triggerMethod('dom:remove', view); } }
    function handleBeforeAttach() { triggerMethodChildren(this, 'before:attach', shouldTriggerAttach); }
    function handleAttach() { triggerMethodChildren(this, 'attach', shouldAttach); triggerDOMRefresh(this); }
    function handleBeforeDetach() { triggerMethodChildren(this, 'before:detach', shouldTriggerDetach); triggerDOMRemove(this); }
    function handleDetach() { triggerMethodChildren(this, 'detach', shouldDetach); }
    function handleBeforeRender() { triggerDOMRemove(this); }
    function handleRender() { triggerDOMRefresh(this); }
    function monitorViewEvents(view) {
        if (view._areViewEventsMonitored || view.monitorViewEvents === false) { return; }
        view._areViewEventsMonitored = true; view.on({ 'before:attach': handleBeforeAttach, 'attach': handleAttach, 'before:detach': handleBeforeDetach, 'detach': handleDetach, 'before:render': handleBeforeRender, 'render': handleRender });
    }
    var splitter = /(^|:)(\w)/gi; var methodCache = {}; function getEventName(match, prefix, eventName) { return eventName.toUpperCase(); }
    var getOnMethodName = function getOnMethodName(event) {
        if (!methodCache[event]) { methodCache[event] = 'on' + event.replace(splitter, getEventName); }
        return methodCache[event];
    }; function triggerMethod(event) {
        var methodName = getOnMethodName(event); var method = getOption.call(this, methodName); var result; if (_.isFunction(method)) { result = method.apply(this, _.drop(arguments)); }
        this.trigger.apply(this, arguments); return result;
    }
    var Events = { triggerMethod: triggerMethod }; var CommonMixin = { normalizeMethods: normalizeMethods, _setOptions: function _setOptions(options, classOptions) { this.options = _.extend({}, _.result(this, 'options'), options); this.mergeOptions(options, classOptions); }, mergeOptions: mergeOptions, getOption: getOption, bindEvents: bindEvents, unbindEvents: unbindEvents, bindRequests: bindRequests, unbindRequests: unbindRequests, triggerMethod: triggerMethod }; _.extend(CommonMixin, Backbone.Events); var DestroyMixin = {
        _isDestroyed: false, isDestroyed: function isDestroyed() { return this._isDestroyed; }, destroy: function destroy(options) {
            if (this._isDestroyed) { return this; }
            this.triggerMethod('before:destroy', this, options); this._isDestroyed = true; this.triggerMethod('destroy', this, options); this.stopListening(); return this;
        }
    }; var RadioMixin = {
        _initRadio: function _initRadio() {
            var channelName = _.result(this, 'channelName'); if (!channelName) { return; }
            if (!Radio) { throw new MarionetteError({ message: 'The dependency "backbone.radio" is missing.', url: 'backbone.radio.html#marionette-integration' }); }
            var channel = this._channel = Radio.channel(channelName); var radioEvents = _.result(this, 'radioEvents'); this.bindEvents(channel, radioEvents); var radioRequests = _.result(this, 'radioRequests'); this.bindRequests(channel, radioRequests); this.on('destroy', this._destroyRadio);
        }, _destroyRadio: function _destroyRadio() { this._channel.stopReplying(null, null, this); }, getChannel: function getChannel() { return this._channel; }
    }; var ClassOptions = ['channelName', 'radioEvents', 'radioRequests']; var MarionetteObject = function MarionetteObject(options) { this._setOptions(options, ClassOptions); this.cid = _.uniqueId(this.cidPrefix); this._initRadio(); this.initialize.apply(this, arguments); }; MarionetteObject.extend = extend; _.extend(MarionetteObject.prototype, CommonMixin, DestroyMixin, RadioMixin, { cidPrefix: 'mno', initialize: function initialize() { } }); var _invoke = _.invokeMap || _.invoke; function getBehaviorClass(options) {
        if (options.behaviorClass) { return { BehaviorClass: options.behaviorClass, options: options }; }
        if (_.isFunction(options)) { return { BehaviorClass: options, options: {} }; }
        throw new MarionetteError({ message: 'Unable to get behavior class. A Behavior constructor should be passed directly or as behaviorClass property of options', url: 'marionette.behavior.html#defining-and-attaching-behaviors' });
    }
    function parseBehaviors(view, behaviors, allBehaviors) { return _.reduce(behaviors, function (reducedBehaviors, behaviorDefiniton) { var _getBehaviorClass = getBehaviorClass(behaviorDefiniton), BehaviorClass = _getBehaviorClass.BehaviorClass, options = _getBehaviorClass.options; var behavior = new BehaviorClass(options, view); reducedBehaviors.push(behavior); return parseBehaviors(view, _.result(behavior, 'behaviors'), reducedBehaviors); }, allBehaviors); }
    var BehaviorsMixin = {
        _initBehaviors: function _initBehaviors() { this._behaviors = parseBehaviors(this, _.result(this, 'behaviors'), []); }, _getBehaviorTriggers: function _getBehaviorTriggers() { var triggers = _invoke(this._behaviors, '_getTriggers'); return _.reduce(triggers, function (memo, _triggers) { return _.extend(memo, _triggers); }, {}); }, _getBehaviorEvents: function _getBehaviorEvents() { var events = _invoke(this._behaviors, '_getEvents'); return _.reduce(events, function (memo, _events) { return _.extend(memo, _events); }, {}); }, _proxyBehaviorViewProperties: function _proxyBehaviorViewProperties() { _invoke(this._behaviors, 'proxyViewProperties'); }, _delegateBehaviorEntityEvents: function _delegateBehaviorEntityEvents() { _invoke(this._behaviors, 'delegateEntityEvents'); }, _undelegateBehaviorEntityEvents: function _undelegateBehaviorEntityEvents() { _invoke(this._behaviors, 'undelegateEntityEvents'); }, _destroyBehaviors: function _destroyBehaviors(options) { _invoke(this._behaviors, 'destroy', options); }, _removeBehavior: function _removeBehavior(behavior) {
            if (this._isDestroyed) { return; }
            this.undelegate(".trig".concat(behavior.cid, " .").concat(behavior.cid)); this._behaviors = _.without(this._behaviors, behavior);
        }, _bindBehaviorUIElements: function _bindBehaviorUIElements() { _invoke(this._behaviors, 'bindUIElements'); }, _unbindBehaviorUIElements: function _unbindBehaviorUIElements() { _invoke(this._behaviors, 'unbindUIElements'); }, _triggerEventOnBehaviors: function _triggerEventOnBehaviors(eventName, view, options) { _invoke(this._behaviors, 'triggerMethod', eventName, view, options); }
    }; var DelegateEntityEventsMixin = {
        _delegateEntityEvents: function _delegateEntityEvents(model, collection) {
            if (model) { this._modelEvents = _.result(this, 'modelEvents'); this.bindEvents(model, this._modelEvents); }
            if (collection) { this._collectionEvents = _.result(this, 'collectionEvents'); this.bindEvents(collection, this._collectionEvents); }
        }, _undelegateEntityEvents: function _undelegateEntityEvents(model, collection) {
            if (this._modelEvents) { this.unbindEvents(model, this._modelEvents); delete this._modelEvents; }
            if (this._collectionEvents) { this.unbindEvents(collection, this._collectionEvents); delete this._collectionEvents; }
        }, _deleteEntityEventHandlers: function _deleteEntityEventHandlers() { delete this._modelEvents; delete this._collectionEvents; }
    }; var TemplateRenderMixin = {
        _renderTemplate: function _renderTemplate(template) { var data = this.mixinTemplateContext(this.serializeData()) || {}; var html = this._renderHtml(template, data); if (typeof html !== 'undefined') { this.attachElContent(html); } }, getTemplate: function getTemplate() { return this.template; }, mixinTemplateContext: function mixinTemplateContext(serializedData) {
            var templateContext = _.result(this, 'templateContext'); if (!templateContext) { return serializedData; }
            if (!serializedData) { return templateContext; }
            return _.extend({}, serializedData, templateContext);
        }, serializeData: function serializeData() {
            if (this.model) { return this.serializeModel(); }
            if (this.collection) { return { items: this.serializeCollection() }; }
        }, serializeModel: function serializeModel() { return this.model.attributes; }, serializeCollection: function serializeCollection() { return _.map(this.collection.models, function (model) { return model.attributes; }); }, _renderHtml: function _renderHtml(template, data) { return template(data); }, attachElContent: function attachElContent(html) { this.Dom.setContents(this.el, html, this.$el); }
    }; var delegateEventSplitter = /^(\S+)\s*(.*)$/; var getNamespacedEventName = function getNamespacedEventName(eventName, namespace) { var match = eventName.match(delegateEventSplitter); return "".concat(match[1], ".").concat(namespace, " ").concat(match[2]); }; var FEATURES = { childViewEventPrefix: false, triggersStopPropagation: true, triggersPreventDefault: true, DEV_MODE: false }; function isEnabled(name) { return !!FEATURES[name]; }
    function setEnabled(name, state) { return FEATURES[name] = state; }
    function buildViewTrigger(view, triggerDef) {
        if (_.isString(triggerDef)) { triggerDef = { event: triggerDef }; }
        var eventName = triggerDef.event; var shouldPreventDefault = !!triggerDef.preventDefault; if (isEnabled('triggersPreventDefault')) { shouldPreventDefault = triggerDef.preventDefault !== false; }
        var shouldStopPropagation = !!triggerDef.stopPropagation; if (isEnabled('triggersStopPropagation')) { shouldStopPropagation = triggerDef.stopPropagation !== false; }
        return function (event) {
            if (shouldPreventDefault) { event.preventDefault(); }
            if (shouldStopPropagation) { event.stopPropagation(); }
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
            view.triggerMethod.apply(view, [eventName, view, event].concat(args));
        };
    }
    var TriggersMixin = { _getViewTriggers: function _getViewTriggers(view, triggers) { var _this = this; return _.reduce(triggers, function (events, value, key) { key = getNamespacedEventName(key, "trig".concat(_this.cid)); events[key] = buildViewTrigger(view, value); return events; }, {}); } }; var _normalizeUIKeys = function normalizeUIKeys(hash, ui) { return _.reduce(hash, function (memo, val, key) { var normalizedKey = _normalizeUIString(key, ui); memo[normalizedKey] = val; return memo; }, {}); }; var uiRegEx = /@ui\.[a-zA-Z-_$0-9]*/g; var _normalizeUIString = function normalizeUIString(uiString, ui) { return uiString.replace(uiRegEx, function (r) { return ui[r.slice(4)]; }); }; var _normalizeUIValues = function normalizeUIValues(hash, ui, property) { _.each(hash, function (val, key) { if (_.isString(val)) { hash[key] = _normalizeUIString(val, ui); } else if (val) { var propertyVal = val[property]; if (_.isString(propertyVal)) { val[property] = _normalizeUIString(propertyVal, ui); } } }); return hash; }; var UIMixin = {
        normalizeUIKeys: function normalizeUIKeys(hash) { var uiBindings = this._getUIBindings(); return _normalizeUIKeys(hash, uiBindings); }, normalizeUIString: function normalizeUIString(uiString) { var uiBindings = this._getUIBindings(); return _normalizeUIString(uiString, uiBindings); }, normalizeUIValues: function normalizeUIValues(hash, property) { var uiBindings = this._getUIBindings(); return _normalizeUIValues(hash, uiBindings, property); }, _getUIBindings: function _getUIBindings() { var uiBindings = _.result(this, '_uiBindings'); return uiBindings || _.result(this, 'ui'); }, _bindUIElements: function _bindUIElements() {
            var _this = this; if (!this.ui) { return; }
            if (!this._uiBindings) { this._uiBindings = this.ui; }
            var bindings = _.result(this, '_uiBindings'); this._ui = {}; _.each(bindings, function (selector, key) { _this._ui[key] = _this.$(selector); }); this.ui = this._ui;
        }, _unbindUIElements: function _unbindUIElements() {
            var _this2 = this; if (!this.ui || !this._uiBindings) { return; }
            _.each(this.ui, function ($el, name) { delete _this2.ui[name]; }); this.ui = this._uiBindings; delete this._uiBindings; delete this._ui;
        }, _getUI: function _getUI(name) { return this._ui[name]; }
    }; function _getEl(el) { return el instanceof Backbone.$ ? el : Backbone.$(el); }
    function setDomApi(mixin) { this.prototype.Dom = _.extend({}, this.prototype.Dom, mixin); return this; }
    var DomApi = {
        createBuffer: function createBuffer() { return document.createDocumentFragment(); }, getDocumentEl: function getDocumentEl(el) { return el.ownerDocument.documentElement; }, getEl: function getEl(selector) { return _getEl(selector); }, findEl: function findEl(el, selector) { return _getEl(el).find(selector); }, hasEl: function hasEl(el, childEl) { return el.contains(childEl && childEl.parentNode); }, detachEl: function detachEl(el) { var _$el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _getEl(el); _$el.detach(); }, replaceEl: function replaceEl(newEl, oldEl) {
            if (newEl === oldEl) { return; }
            var parent = oldEl.parentNode; if (!parent) { return; }
            parent.replaceChild(newEl, oldEl);
        }, swapEl: function swapEl(el1, el2) {
            if (el1 === el2) { return; }
            var parent1 = el1.parentNode; var parent2 = el2.parentNode; if (!parent1 || !parent2) { return; }
            var next1 = el1.nextSibling; var next2 = el2.nextSibling; parent1.insertBefore(el2, next1); parent2.insertBefore(el1, next2);
        }, setContents: function setContents(el, html) { var _$el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _getEl(el); _$el.html(html); }, appendContents: function appendContents(el, contents) { var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}, _ref$_$el = _ref._$el, _$el = _ref$_$el === void 0 ? _getEl(el) : _ref$_$el, _ref$_$contents = _ref._$contents, _$contents = _ref$_$contents === void 0 ? _getEl(contents) : _ref$_$contents; _$el.append(_$contents); }, hasContents: function hasContents(el) { return !!el && el.hasChildNodes(); }, detachContents: function detachContents(el) { var _$el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _getEl(el); _$el.contents().detach(); }
    }; var ViewMixin = {
        Dom: DomApi, _isElAttached: function _isElAttached() { return !!this.el && this.Dom.hasEl(this.Dom.getDocumentEl(this.el), this.el); }, supportsRenderLifecycle: true, supportsDestroyLifecycle: true, _isDestroyed: false, isDestroyed: function isDestroyed() { return !!this._isDestroyed; }, _isRendered: false, isRendered: function isRendered() { return !!this._isRendered; }, _isAttached: false, isAttached: function isAttached() { return !!this._isAttached; }, delegateEvents: function delegateEvents(events) { this._proxyBehaviorViewProperties(); this._buildEventProxies(); var combinedEvents = _.extend({}, this._getBehaviorEvents(), this._getEvents(events), this._getBehaviorTriggers(), this._getTriggers()); Backbone.View.prototype.delegateEvents.call(this, combinedEvents); return this; }, _getEvents: function _getEvents(events) {
            if (events) { return this.normalizeUIKeys(events); }
            if (!this.events) { return; }
            return this.normalizeUIKeys(_.result(this, 'events'));
        }, _getTriggers: function _getTriggers() {
            if (!this.triggers) { return; }
            var triggers = this.normalizeUIKeys(_.result(this, 'triggers')); return this._getViewTriggers(this, triggers);
        }, delegateEntityEvents: function delegateEntityEvents() { this._delegateEntityEvents(this.model, this.collection); this._delegateBehaviorEntityEvents(); return this; }, undelegateEntityEvents: function undelegateEntityEvents() { this._undelegateEntityEvents(this.model, this.collection); this._undelegateBehaviorEntityEvents(); return this; }, destroy: function destroy(options) {
            if (this._isDestroyed || this._isDestroying) { return this; }
            this._isDestroying = true; var shouldTriggerDetach = this._isAttached && !this._disableDetachEvents; this.triggerMethod('before:destroy', this, options); if (shouldTriggerDetach) { this.triggerMethod('before:detach', this); }
            this.unbindUIElements(); this._removeElement(); if (shouldTriggerDetach) { this._isAttached = false; this.triggerMethod('detach', this); }
            this._removeChildren(); this._isDestroyed = true; this._isRendered = false; this._destroyBehaviors(options); this._deleteEntityEventHandlers(); this.triggerMethod('destroy', this, options); this._triggerEventOnBehaviors('destroy', this, options); this.stopListening(); return this;
        }, _removeElement: function _removeElement() { this.$el.off().removeData(); this.Dom.detachEl(this.el, this.$el); }, bindUIElements: function bindUIElements() { this._bindUIElements(); this._bindBehaviorUIElements(); return this; }, unbindUIElements: function unbindUIElements() { this._unbindUIElements(); this._unbindBehaviorUIElements(); return this; }, getUI: function getUI(name) { return this._getUI(name); }, _buildEventProxies: function _buildEventProxies() { this._childViewEvents = this.normalizeMethods(_.result(this, 'childViewEvents')); this._childViewTriggers = _.result(this, 'childViewTriggers'); this._eventPrefix = this._getEventPrefix(); }, _getEventPrefix: function _getEventPrefix() { var defaultPrefix = isEnabled('childViewEventPrefix') ? 'childview' : false; var prefix = _.result(this, 'childViewEventPrefix', defaultPrefix); return prefix === false ? prefix : prefix + ':'; }, _proxyChildViewEvents: function _proxyChildViewEvents(view) { if (this._childViewEvents || this._childViewTriggers || this._eventPrefix) { this.listenTo(view, 'all', this._childViewEventHandler); } }, _childViewEventHandler: function _childViewEventHandler(eventName) {
            var childViewEvents = this._childViewEvents; for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
            if (childViewEvents && childViewEvents[eventName]) { childViewEvents[eventName].apply(this, args); }
            var childViewTriggers = this._childViewTriggers; if (childViewTriggers && childViewTriggers[eventName]) { this.triggerMethod.apply(this, [childViewTriggers[eventName]].concat(args)); }
            if (this._eventPrefix) { this.triggerMethod.apply(this, [this._eventPrefix + eventName].concat(args)); }
        }
    }; _.extend(ViewMixin, BehaviorsMixin, CommonMixin, DelegateEntityEventsMixin, TemplateRenderMixin, TriggersMixin, UIMixin); function renderView(view) {
        if (view._isRendered) { return; }
        if (!view.supportsRenderLifecycle) { view.triggerMethod('before:render', view); }
        view.render(); view._isRendered = true; if (!view.supportsRenderLifecycle) { view.triggerMethod('render', view); }
    }
    function destroyView(view, disableDetachEvents) {
        if (view.destroy) { view._disableDetachEvents = disableDetachEvents; view.destroy(); return; }
        if (!view.supportsDestroyLifecycle) { view.triggerMethod('before:destroy', view); }
        var shouldTriggerDetach = view._isAttached && !disableDetachEvents; if (shouldTriggerDetach) { view.triggerMethod('before:detach', view); }
        view.remove(); if (shouldTriggerDetach) { view._isAttached = false; view.triggerMethod('detach', view); }
        view._isDestroyed = true; if (!view.supportsDestroyLifecycle) { view.triggerMethod('destroy', view); }
    }
    var classErrorName = 'RegionError'; var ClassOptions$1 = ['allowMissingEl', 'parentEl', 'replaceElement']; var Region = function Region(options) { this._setOptions(options, ClassOptions$1); this.cid = _.uniqueId(this.cidPrefix); this._initEl = this.el = this.getOption('el'); this.el = this.el instanceof Backbone.$ ? this.el[0] : this.el; this.$el = this._getEl(this.el); this.initialize.apply(this, arguments); }; Region.extend = extend; Region.setDomApi = setDomApi; _.extend(Region.prototype, CommonMixin, {
        Dom: DomApi, cidPrefix: 'mnr', replaceElement: false, _isReplaced: false, _isSwappingView: false, initialize: function initialize() { }, show: function show(view, options) {
            if (!this._ensureElement(options)) { return; }
            view = this._getView(view, options); if (view === this.currentView) { return this; }
            if (view._isShown) { throw new MarionetteError({ name: classErrorName, message: 'View is already shown in a Region or CollectionView', url: 'marionette.region.html#showing-a-view' }); }
            this._isSwappingView = !!this.currentView; this.triggerMethod('before:show', this, view, options); if (this.currentView || !view._isAttached) { this.empty(options); }
            this._setupChildView(view); this.currentView = view; renderView(view); this._attachView(view, options); this.triggerMethod('show', this, view, options); this._isSwappingView = false; return this;
        }, _getEl: function _getEl(el) {
            if (!el) { throw new MarionetteError({ name: classErrorName, message: 'An "el" must be specified for a region.', url: 'marionette.region.html#additional-options' }); }
            return this.getEl(el);
        }, _setEl: function _setEl() {
            this.$el = this._getEl(this.el); if (this.$el.length) { this.el = this.$el[0]; }
            if (this.$el.length > 1) { this.$el = this.Dom.getEl(this.el); }
        }, _setElement: function _setElement(el) {
            if (el === this.el) { return this; }
            var shouldReplace = this._isReplaced; this._restoreEl(); this.el = el; this._setEl(); if (this.currentView) { var view = this.currentView; if (shouldReplace) { this._replaceEl(view); } else { this.attachHtml(view); } }
            return this;
        }, _setupChildView: function _setupChildView(view) { monitorViewEvents(view); this._proxyChildViewEvents(view); view.on('destroy', this._empty, this); }, _proxyChildViewEvents: function _proxyChildViewEvents(view) {
            var parentView = this._parentView; if (!parentView) { return; }
            parentView._proxyChildViewEvents(view);
        }, _shouldDisableMonitoring: function _shouldDisableMonitoring() { return this._parentView && this._parentView.monitorViewEvents === false; }, _isElAttached: function _isElAttached() { return this.Dom.hasEl(this.Dom.getDocumentEl(this.el), this.el); }, _attachView: function _attachView(view) {
            var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, replaceElement = _ref.replaceElement; var shouldTriggerAttach = !view._isAttached && this._isElAttached() && !this._shouldDisableMonitoring(); var shouldReplaceEl = typeof replaceElement === 'undefined' ? !!_.result(this, 'replaceElement') : !!replaceElement; if (shouldTriggerAttach) { view.triggerMethod('before:attach', view); }
            if (shouldReplaceEl) { this._replaceEl(view); } else { this.attachHtml(view); }
            if (shouldTriggerAttach) { view._isAttached = true; view.triggerMethod('attach', view); }
            view._isShown = true;
        }, _ensureElement: function _ensureElement() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}; if (!_.isObject(this.el)) { this._setEl(); }
            if (!this.$el || this.$el.length === 0) { var allowMissingEl = typeof options.allowMissingEl === 'undefined' ? !!_.result(this, 'allowMissingEl') : !!options.allowMissingEl; if (allowMissingEl) { return false; } else { throw new MarionetteError({ name: classErrorName, message: "An \"el\" must exist in DOM for this region ".concat(this.cid), url: 'marionette.region.html#additional-options' }); } }
            return true;
        }, _getView: function _getView(view) {
            if (!view) { throw new MarionetteError({ name: classErrorName, message: 'The view passed is undefined and therefore invalid. You must pass a view instance to show.', url: 'marionette.region.html#showing-a-view' }); }
            if (view._isDestroyed) { throw new MarionetteError({ name: classErrorName, message: "View (cid: \"".concat(view.cid, "\") has already been destroyed and cannot be used."), url: 'marionette.region.html#showing-a-view' }); }
            if (view instanceof Backbone.View) { return view; }
            var viewOptions = this._getViewOptions(view); return new View(viewOptions);
        }, _getViewOptions: function _getViewOptions(viewOptions) {
            if (_.isFunction(viewOptions)) { return { template: viewOptions }; }
            if (_.isObject(viewOptions)) { return viewOptions; }
            var template = function template() { return viewOptions; }; return { template: template };
        }, getEl: function getEl(el) {
            var context = _.result(this, 'parentEl'); if (context && _.isString(el)) { return this.Dom.findEl(context, el); }
            return this.Dom.getEl(el);
        }, _replaceEl: function _replaceEl(view) { this._restoreEl(); view.on('before:destroy', this._restoreEl, this); this.Dom.replaceEl(view.el, this.el); this._isReplaced = true; }, _restoreEl: function _restoreEl() {
            if (!this._isReplaced) { return; }
            var view = this.currentView; if (!view) { return; }
            this._detachView(view); this._isReplaced = false;
        }, isReplaced: function isReplaced() { return !!this._isReplaced; }, isSwappingView: function isSwappingView() { return !!this._isSwappingView; }, attachHtml: function attachHtml(view) { this.Dom.appendContents(this.el, view.el, { _$el: this.$el, _$contents: view.$el }); }, empty: function empty() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { allowMissingEl: true }; var view = this.currentView; if (!view) {
                if (this._ensureElement(options)) { this.detachHtml(); }
                return this;
            }
            this._empty(view, true); return this;
        }, _empty: function _empty(view, shouldDestroy) {
            view.off('destroy', this._empty, this); this.triggerMethod('before:empty', this, view); this._restoreEl(); delete this.currentView; if (!view._isDestroyed) {
                if (shouldDestroy) { this.removeView(view); } else { this._detachView(view); }
                view._isShown = false; this._stopChildViewEvents(view);
            }
            this.triggerMethod('empty', this, view);
        }, _stopChildViewEvents: function _stopChildViewEvents(view) {
            var parentView = this._parentView; if (!parentView) { return; }
            this._parentView.stopListening(view);
        }, destroyView: function destroyView$1(view) {
            if (view._isDestroyed) { return view; }
            destroyView(view, this._shouldDisableMonitoring()); return view;
        }, removeView: function removeView(view) { this.destroyView(view); }, detachView: function detachView() {
            var view = this.currentView; if (!view) { return; }
            this._empty(view); return view;
        }, _detachView: function _detachView(view) {
            var shouldTriggerDetach = view._isAttached && !this._shouldDisableMonitoring(); var shouldRestoreEl = this._isReplaced; if (shouldTriggerDetach) { view.triggerMethod('before:detach', view); }
            if (shouldRestoreEl) { this.Dom.replaceEl(this.el, view.el); } else { this.detachHtml(); }
            if (shouldTriggerDetach) { view._isAttached = false; view.triggerMethod('detach', view); }
        }, detachHtml: function detachHtml() { this.Dom.detachContents(this.el, this.$el); }, hasView: function hasView() { return !!this.currentView; }, reset: function reset(options) { this.empty(options); this.el = this._initEl; delete this.$el; return this; }, _isDestroyed: false, isDestroyed: function isDestroyed() { return this._isDestroyed; }, destroy: function destroy(options) {
            if (this._isDestroyed) { return this; }
            this.triggerMethod('before:destroy', this, options); this._isDestroyed = true; this.reset(options); if (this._name) { this._parentView._removeReferences(this._name); }
            delete this._parentView; delete this._name; this.triggerMethod('destroy', this, options); this.stopListening(); return this;
        }
    }); function buildRegion(definition, defaults) {
        if (definition instanceof Region) { return definition; }
        if (_.isString(definition)) { return buildRegionFromObject(defaults, { el: definition }); }
        if (_.isFunction(definition)) { return buildRegionFromObject(defaults, { regionClass: definition }); }
        if (_.isObject(definition)) { return buildRegionFromObject(defaults, definition); }
        throw new MarionetteError({ message: 'Improper region configuration type.', url: 'marionette.region.html#defining-regions' });
    }
    function buildRegionFromObject(defaults, definition) { var options = _.extend({}, defaults, definition); var RegionClass = options.regionClass; delete options.regionClass; return new RegionClass(options); }
    var RegionsMixin = {
        regionClass: Region, _initRegions: function _initRegions() { this.regions = this.regions || {}; this._regions = {}; this.addRegions(_.result(this, 'regions')); }, _reInitRegions: function _reInitRegions() { _invoke(this._regions, 'reset'); }, addRegion: function addRegion(name, definition) { var regions = {}; regions[name] = definition; return this.addRegions(regions)[name]; }, addRegions: function addRegions(regions) {
            if (_.isEmpty(regions)) { return; }
            regions = this.normalizeUIValues(regions, 'el'); this.regions = _.extend({}, this.regions, regions); return this._addRegions(regions);
        }, _addRegions: function _addRegions(regionDefinitions) { var _this = this; var defaults = { regionClass: this.regionClass, parentEl: _.partial(_.result, this, 'el') }; return _.reduce(regionDefinitions, function (regions, definition, name) { regions[name] = buildRegion(definition, defaults); _this._addRegion(regions[name], name); return regions; }, {}); }, _addRegion: function _addRegion(region, name) { this.triggerMethod('before:add:region', this, name, region); region._parentView = this; region._name = name; this._regions[name] = region; this.triggerMethod('add:region', this, name, region); }, removeRegion: function removeRegion(name) { var region = this._regions[name]; this._removeRegion(region, name); return region; }, removeRegions: function removeRegions() { var regions = this._getRegions(); _.each(this._regions, this._removeRegion.bind(this)); return regions; }, _removeRegion: function _removeRegion(region, name) { this.triggerMethod('before:remove:region', this, name, region); region.destroy(); this.triggerMethod('remove:region', this, name, region); }, _removeReferences: function _removeReferences(name) { delete this.regions[name]; delete this._regions[name]; }, emptyRegions: function emptyRegions() { var regions = this.getRegions(); _invoke(regions, 'empty'); return regions; }, hasRegion: function hasRegion(name) { return !!this.getRegion(name); }, getRegion: function getRegion(name) {
            if (!this._isRendered) { this.render(); }
            return this._regions[name];
        }, _getRegions: function _getRegions() { return _.clone(this._regions); }, getRegions: function getRegions() {
            if (!this._isRendered) { this.render(); }
            return this._getRegions();
        }, showChildView: function showChildView(name, view, options) { var region = this.getRegion(name); region.show(view, options); return view; }, detachChildView: function detachChildView(name) { return this.getRegion(name).detachView(); }, getChildView: function getChildView(name) { return this.getRegion(name).currentView; }
    }; function setRenderer(renderer) { this.prototype._renderHtml = renderer; return this; }
    var ClassOptions$2 = ['behaviors', 'childViewEventPrefix', 'childViewEvents', 'childViewTriggers', 'collectionEvents', 'events', 'modelEvents', 'regionClass', 'regions', 'template', 'templateContext', 'triggers', 'ui']; function childReducer(children, region) {
        if (region.currentView) { children.push(region.currentView); }
        return children;
    }
    var View = Backbone.View.extend({
        constructor: function constructor(options) { this._setOptions(options, ClassOptions$2); monitorViewEvents(this); this._initBehaviors(); this._initRegions(); Backbone.View.prototype.constructor.apply(this, arguments); this.delegateEntityEvents(); this._triggerEventOnBehaviors('initialize', this, options); }, setElement: function setElement() {
            Backbone.View.prototype.setElement.apply(this, arguments); this._isRendered = this.Dom.hasContents(this.el); this._isAttached = this._isElAttached(); if (this._isRendered) { this.bindUIElements(); }
            return this;
        }, render: function render() {
            var template = this.getTemplate(); if (template === false || this._isDestroyed) { return this; }
            this.triggerMethod('before:render', this); if (this._isRendered) { this._reInitRegions(); }
            this._renderTemplate(template); this.bindUIElements(); this._isRendered = true; this.triggerMethod('render', this); return this;
        }, _removeChildren: function _removeChildren() { this.removeRegions(); }, _getImmediateChildren: function _getImmediateChildren() { return _.reduce(this._regions, childReducer, []); }
    }, { setRenderer: setRenderer, setDomApi: setDomApi }); _.extend(View.prototype, ViewMixin, RegionsMixin); var Container = function Container() { this._init(); }; var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'toArray', 'first', 'initial', 'rest', 'last', 'without', 'isEmpty', 'pluck', 'reduce', 'partition']; _.each(methods, function (method) {
        Container.prototype[method] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
            return _[method].apply(_, [this._views].concat(args));
        };
    }); function stringComparator(comparator, view) { return view.model && view.model.get(comparator); }
    _.extend(Container.prototype, {
        _init: function _init() { this._views = []; this._viewsByCid = {}; this._indexByModel = {}; this._updateLength(); }, _add: function _add(view) { var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._views.length; this._addViewIndexes(view); this._views.splice(index, 0, view); this._updateLength(); }, _addViewIndexes: function _addViewIndexes(view) { this._viewsByCid[view.cid] = view; if (view.model) { this._indexByModel[view.model.cid] = view; } }, _sort: function _sort(comparator, context) {
            if (typeof comparator === 'string') { comparator = _.partial(stringComparator, comparator); return this._sortBy(comparator); }
            if (comparator.length === 1) { return this._sortBy(comparator.bind(context)); }
            return this._views.sort(comparator.bind(context));
        }, _sortBy: function _sortBy(comparator) { var sortedViews = _.sortBy(this._views, comparator); this._set(sortedViews); return sortedViews; }, _set: function _set(views, shouldReset) { this._views.length = 0; this._views.push.apply(this._views, views.slice(0)); if (shouldReset) { this._viewsByCid = {}; this._indexByModel = {}; _.each(views, this._addViewIndexes.bind(this)); this._updateLength(); } }, _swap: function _swap(view1, view2) {
            var view1Index = this.findIndexByView(view1); var view2Index = this.findIndexByView(view2); if (view1Index === -1 || view2Index === -1) { return; }
            var swapView = this._views[view1Index]; this._views[view1Index] = this._views[view2Index]; this._views[view2Index] = swapView;
        }, findByModel: function findByModel(model) { return this.findByModelCid(model.cid); }, findByModelCid: function findByModelCid(modelCid) { return this._indexByModel[modelCid]; }, findByIndex: function findByIndex(index) { return this._views[index]; }, findIndexByView: function findIndexByView(view) { return this._views.indexOf(view); }, findByCid: function findByCid(cid) { return this._viewsByCid[cid]; }, hasView: function hasView(view) { return !!this.findByCid(view.cid); }, _remove: function _remove(view) {
            if (!this._viewsByCid[view.cid]) { return; }
            if (view.model) { delete this._indexByModel[view.model.cid]; }
            delete this._viewsByCid[view.cid]; var index = this.findIndexByView(view); this._views.splice(index, 1); this._updateLength();
        }, _updateLength: function _updateLength() { this.length = this._views.length; }
    }); var classErrorName$1 = 'CollectionViewError'; var ClassOptions$3 = ['behaviors', 'childView', 'childViewContainer', 'childViewEventPrefix', 'childViewEvents', 'childViewOptions', 'childViewTriggers', 'collectionEvents', 'emptyView', 'emptyViewOptions', 'events', 'modelEvents', 'sortWithCollection', 'template', 'templateContext', 'triggers', 'ui', 'viewComparator', 'viewFilter']; var CollectionView = Backbone.View.extend({
        sortWithCollection: true, constructor: function constructor(options) { this._setOptions(options, ClassOptions$3); monitorViewEvents(this); this._initChildViewStorage(); this._initBehaviors(); Backbone.View.prototype.constructor.apply(this, arguments); this.getEmptyRegion(); this.delegateEntityEvents(); this._triggerEventOnBehaviors('initialize', this, options); }, _initChildViewStorage: function _initChildViewStorage() { this._children = new Container(); this.children = new Container(); }, getEmptyRegion: function getEmptyRegion() {
            var $emptyEl = this.$container || this.$el; if (this._emptyRegion && !this._emptyRegion.isDestroyed()) { this._emptyRegion._setElement($emptyEl[0]); return this._emptyRegion; }
            this._emptyRegion = new Region({ el: $emptyEl[0], replaceElement: false }); this._emptyRegion._parentView = this; return this._emptyRegion;
        }, _initialEvents: function _initialEvents() {
            if (this._isRendered) { return; }
            this.listenTo(this.collection, { 'sort': this._onCollectionSort, 'reset': this._onCollectionReset, 'update': this._onCollectionUpdate });
        }, _onCollectionSort: function _onCollectionSort(collection, _ref) {
            var add = _ref.add, merge = _ref.merge, remove = _ref.remove; if (!this.sortWithCollection || this.viewComparator === false) { return; }
            if (add || remove || merge) { return; }
            this.sort();
        }, _onCollectionReset: function _onCollectionReset() { this._destroyChildren(); this._addChildModels(this.collection.models); this.sort(); }, _onCollectionUpdate: function _onCollectionUpdate(collection, options) { var changes = options.changes; var removedViews = changes.removed.length && this._removeChildModels(changes.removed); this._addedViews = changes.added.length && this._addChildModels(changes.added); this._detachChildren(removedViews); this.sort(); this._removeChildViews(removedViews); }, _removeChildModels: function _removeChildModels(models) {
            var _this = this; return _.reduce(models, function (views, model) {
                var removeView = _this._removeChildModel(model); if (removeView) { views.push(removeView); }
                return views;
            }, []);
        }, _removeChildModel: function _removeChildModel(model) {
            var view = this._children.findByModel(model); if (view) { this._removeChild(view); }
            return view;
        }, _removeChild: function _removeChild(view) { this.triggerMethod('before:remove:child', this, view); this.children._remove(view); this._children._remove(view); this.triggerMethod('remove:child', this, view); }, _addChildModels: function _addChildModels(models) { return _.map(models, this._addChildModel.bind(this)); }, _addChildModel: function _addChildModel(model) { var view = this._createChildView(model); this._addChild(view); return view; }, _createChildView: function _createChildView(model) { var ChildView = this._getChildView(model); var childViewOptions = this._getChildViewOptions(model); var view = this.buildChildView(model, ChildView, childViewOptions); return view; }, _addChild: function _addChild(view, index) { this.triggerMethod('before:add:child', this, view); this._setupChildView(view); this._children._add(view, index); this.children._add(view, index); this.triggerMethod('add:child', this, view); }, _getChildView: function _getChildView(child) {
            var childView = this.childView; if (!childView) { throw new MarionetteError({ name: classErrorName$1, message: 'A "childView" must be specified', url: 'marionette.collectionview.html#collectionviews-childview' }); }
            childView = this._getView(childView, child); if (!childView) { throw new MarionetteError({ name: classErrorName$1, message: '"childView" must be a view class or a function that returns a view class', url: 'marionette.collectionview.html#collectionviews-childview' }); }
            return childView;
        }, _getView: function _getView(view, child) { if (view.prototype instanceof Backbone.View || view === Backbone.View) { return view; } else if (_.isFunction(view)) { return view.call(this, child); } }, _getChildViewOptions: function _getChildViewOptions(child) {
            if (_.isFunction(this.childViewOptions)) { return this.childViewOptions(child); }
            return this.childViewOptions;
        }, buildChildView: function buildChildView(child, ChildViewClass, childViewOptions) { var options = _.extend({ model: child }, childViewOptions); return new ChildViewClass(options); }, _setupChildView: function _setupChildView(view) { monitorViewEvents(view); view.on('destroy', this.removeChildView, this); this._proxyChildViewEvents(view); }, _getImmediateChildren: function _getImmediateChildren() { return this.children._views; }, setElement: function setElement() { Backbone.View.prototype.setElement.apply(this, arguments); this._isAttached = this._isElAttached(); return this; }, render: function render() {
            if (this._isDestroyed) { return this; }
            this.triggerMethod('before:render', this); this._destroyChildren(); if (this.collection) { this._addChildModels(this.collection.models); this._initialEvents(); }
            var template = this.getTemplate(); if (template) { this._renderTemplate(template); this.bindUIElements(); }
            this._getChildViewContainer(); this.sort(); this._isRendered = true; this.triggerMethod('render', this); return this;
        }, _getChildViewContainer: function _getChildViewContainer() { var childViewContainer = _.result(this, 'childViewContainer'); this.$container = childViewContainer ? this.$(childViewContainer) : this.$el; if (!this.$container.length) { throw new MarionetteError({ name: classErrorName$1, message: "The specified \"childViewContainer\" was not found: ".concat(childViewContainer), url: 'marionette.collectionview.html#defining-the-childviewcontainer' }); } }, sort: function sort() { this._sortChildren(); this.filter(); return this; }, _sortChildren: function _sortChildren() {
            if (!this._children.length) { return; }
            var viewComparator = this.getComparator(); if (!viewComparator) { return; }
            delete this._addedViews; this.triggerMethod('before:sort', this); this._children._sort(viewComparator, this); this.triggerMethod('sort', this);
        }, setComparator: function setComparator(comparator) {
            var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, preventRender = _ref2.preventRender; var comparatorChanged = this.viewComparator !== comparator; var shouldSort = comparatorChanged && !preventRender; this.viewComparator = comparator; if (shouldSort) { this.sort(); }
            return this;
        }, removeComparator: function removeComparator(options) { return this.setComparator(null, options); }, getComparator: function getComparator() {
            if (this.viewComparator) { return this.viewComparator; }
            if (!this.sortWithCollection || this.viewComparator === false || !this.collection) { return false; }
            return this._viewComparator;
        }, _viewComparator: function _viewComparator(view) { return this.collection.indexOf(view.model); }, filter: function filter() {
            if (this._isDestroyed) { return this; }
            this._filterChildren(); this._renderChildren(); return this;
        }, _filterChildren: function _filterChildren() {
            var _this2 = this; if (!this._children.length) { return; }
            var viewFilter = this._getFilter(); if (!viewFilter) { var shouldReset = this.children.length !== this._children.length; this.children._set(this._children._views, shouldReset); return; }
            delete this._addedViews; this.triggerMethod('before:filter', this); var attachViews = []; var detachViews = []; _.each(this._children._views, function (view, key, children) { (viewFilter.call(_this2, view, key, children) ? attachViews : detachViews).push(view); }); this._detachChildren(detachViews); this.children._set(attachViews, true); this.triggerMethod('filter', this, attachViews, detachViews);
        }, _getFilter: function _getFilter() {
            var viewFilter = this.getFilter(); if (!viewFilter) { return false; }
            if (_.isFunction(viewFilter)) { return viewFilter; }
            if (_.isObject(viewFilter)) { var matcher = _.matches(viewFilter); return function (view) { return matcher(view.model && view.model.attributes); }; }
            if (_.isString(viewFilter)) { return function (view) { return view.model && view.model.get(viewFilter); }; }
            throw new MarionetteError({ name: classErrorName$1, message: '"viewFilter" must be a function, predicate object literal, a string indicating a model attribute, or falsy', url: 'marionette.collectionview.html#defining-the-viewfilter' });
        }, getFilter: function getFilter() { return this.viewFilter; }, setFilter: function setFilter(filter) {
            var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, preventRender = _ref3.preventRender; var filterChanged = this.viewFilter !== filter; var shouldRender = filterChanged && !preventRender; this.viewFilter = filter; if (shouldRender) { this.filter(); }
            return this;
        }, removeFilter: function removeFilter(options) { return this.setFilter(null, options); }, _detachChildren: function _detachChildren(detachingViews) { _.each(detachingViews, this._detachChildView.bind(this)); }, _detachChildView: function _detachChildView(view) {
            var shouldTriggerDetach = view._isAttached && this.monitorViewEvents !== false; if (shouldTriggerDetach) { view.triggerMethod('before:detach', view); }
            this.detachHtml(view); if (shouldTriggerDetach) { view._isAttached = false; view.triggerMethod('detach', view); }
            view._isShown = false;
        }, detachHtml: function detachHtml(view) { this.Dom.detachEl(view.el, view.$el); }, _renderChildren: function _renderChildren() {
            if (this._hasUnrenderedViews) { delete this._addedViews; delete this._hasUnrenderedViews; }
            var views = this._addedViews || this.children._views; this.triggerMethod('before:render:children', this, views); if (this.isEmpty()) { this._showEmptyView(); } else { this._destroyEmptyView(); var els = this._getBuffer(views); this._attachChildren(els, views); }
            delete this._addedViews; this.triggerMethod('render:children', this, views);
        }, _getBuffer: function _getBuffer(views) { var _this3 = this; var elBuffer = this.Dom.createBuffer(); _.each(views, function (view) { renderView(view); view._isShown = true; _this3.Dom.appendContents(elBuffer, view.el, { _$contents: view.$el }); }); return elBuffer; }, _attachChildren: function _attachChildren(els, views) {
            var shouldTriggerAttach = this._isAttached && this.monitorViewEvents !== false; views = shouldTriggerAttach ? views : []; _.each(views, function (view) {
                if (view._isAttached) { return; }
                view.triggerMethod('before:attach', view);
            }); this.attachHtml(els, this.$container); _.each(views, function (view) {
                if (view._isAttached) { return; }
                view._isAttached = true; view.triggerMethod('attach', view);
            });
        }, attachHtml: function attachHtml(els, $container) { this.Dom.appendContents($container[0], els, { _$el: $container }); }, isEmpty: function isEmpty() { return !this.children.length; }, _showEmptyView: function _showEmptyView() {
            var EmptyView = this._getEmptyView(); if (!EmptyView) { return; }
            var options = this._getEmptyViewOptions(); var emptyRegion = this.getEmptyRegion(); emptyRegion.show(new EmptyView(options));
        }, _getEmptyView: function _getEmptyView() {
            var emptyView = this.emptyView; if (!emptyView) { return; }
            return this._getView(emptyView);
        }, _destroyEmptyView: function _destroyEmptyView() { var emptyRegion = this.getEmptyRegion(); if (emptyRegion.hasView()) { emptyRegion.empty(); } }, _getEmptyViewOptions: function _getEmptyViewOptions() {
            var emptyViewOptions = this.emptyViewOptions || this.childViewOptions; if (_.isFunction(emptyViewOptions)) { return emptyViewOptions.call(this); }
            return emptyViewOptions;
        }, swapChildViews: function swapChildViews(view1, view2) {
            if (!this._children.hasView(view1) || !this._children.hasView(view2)) { throw new MarionetteError({ name: classErrorName$1, message: 'Both views must be children of the collection view to swap.', url: 'marionette.collectionview.html#swapping-child-views' }); }
            this._children._swap(view1, view2); this.Dom.swapEl(view1.el, view2.el); if (this.children.hasView(view1) !== this.children.hasView(view2)) { this.filter(); } else { this.children._swap(view1, view2); }
            return this;
        }, addChildView: function addChildView(view, index) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}; if (!view || view._isDestroyed) { return view; }
            if (view._isShown) { throw new MarionetteError({ name: classErrorName$1, message: 'View is already shown in a Region or CollectionView', url: 'marionette.region.html#showing-a-view' }); }
            if (_.isObject(index)) { options = index; }
            if (options.index != null) { index = options.index; }
            if (!this._isRendered) { this.render(); }
            this._addChild(view, index); if (options.preventRender) { this._hasUnrenderedViews = true; return view; }
            var hasIndex = typeof index !== 'undefined'; var isAddedToEnd = !hasIndex || index >= this._children.length; if (isAddedToEnd && !this._hasUnrenderedViews) { this._addedViews = [view]; }
            if (hasIndex) { this._renderChildren(); } else { this.sort(); }
            return view;
        }, detachChildView: function detachChildView(view) { this.removeChildView(view, { shouldDetach: true }); return view; }, removeChildView: function removeChildView(view, options) {
            if (!view) { return view; }
            this._removeChildView(view, options); this._removeChild(view); if (this.isEmpty()) { this._showEmptyView(); }
            return view;
        }, _removeChildViews: function _removeChildViews(views) { _.each(views, this._removeChildView.bind(this)); }, _removeChildView: function _removeChildView(view) {
            var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, shouldDetach = _ref4.shouldDetach; view.off('destroy', this.removeChildView, this); if (shouldDetach) { this._detachChildView(view); } else { this._destroyChildView(view); }
            this.stopListening(view);
        }, _destroyChildView: function _destroyChildView(view) {
            if (view._isDestroyed) { return; }
            var shouldDisableEvents = this.monitorViewEvents === false; destroyView(view, shouldDisableEvents);
        }, _removeChildren: function _removeChildren() { this._destroyChildren(); var emptyRegion = this.getEmptyRegion(); emptyRegion.destroy(); delete this._addedViews; }, _destroyChildren: function _destroyChildren() {
            if (!this._children.length) { return; }
            this.triggerMethod('before:destroy:children', this); if (this.monitorViewEvents === false) { this.Dom.detachContents(this.el, this.$el); }
            this._removeChildViews(this._children._views); this._children._init(); this.children._init(); this.triggerMethod('destroy:children', this);
        }
    }, { setDomApi: setDomApi, setRenderer: setRenderer }); _.extend(CollectionView.prototype, ViewMixin); var ClassOptions$4 = ['collectionEvents', 'events', 'modelEvents', 'triggers', 'ui']; var Behavior = function Behavior(options, view) { this.view = view; this._setOptions(options, ClassOptions$4); this.cid = _.uniqueId(this.cidPrefix); this.ui = _.extend({}, _.result(this, 'ui'), _.result(view, 'ui')); this.listenTo(view, 'all', this.triggerMethod); this.initialize.apply(this, arguments); }; Behavior.extend = extend; _.extend(Behavior.prototype, CommonMixin, DelegateEntityEventsMixin, TriggersMixin, UIMixin, {
        cidPrefix: 'mnb', initialize: function initialize() { }, $: function $() { return this.view.$.apply(this.view, arguments); }, destroy: function destroy() { this.stopListening(); this.view._removeBehavior(this); this._deleteEntityEventHandlers(); return this; }, proxyViewProperties: function proxyViewProperties() { this.$el = this.view.$el; this.el = this.view.el; return this; }, bindUIElements: function bindUIElements() { this._bindUIElements(); return this; }, unbindUIElements: function unbindUIElements() { this._unbindUIElements(); return this; }, getUI: function getUI(name) { return this._getUI(name); }, delegateEntityEvents: function delegateEntityEvents() { this._delegateEntityEvents(this.view.model, this.view.collection); return this; }, undelegateEntityEvents: function undelegateEntityEvents() { this._undelegateEntityEvents(this.view.model, this.view.collection); return this; }, _getEvents: function _getEvents() {
            var _this = this; if (!this.events) { return; }
            var behaviorEvents = this.normalizeUIKeys(_.result(this, 'events')); return _.reduce(behaviorEvents, function (events, behaviorHandler, key) {
                if (!_.isFunction(behaviorHandler)) { behaviorHandler = _this[behaviorHandler]; }
                if (!behaviorHandler) { return events; }
                key = getNamespacedEventName(key, _this.cid); events[key] = behaviorHandler.bind(_this); return events;
            }, {});
        }, _getTriggers: function _getTriggers() {
            if (!this.triggers) { return; }
            var behaviorTriggers = this.normalizeUIKeys(_.result(this, 'triggers')); return this._getViewTriggers(this.view, behaviorTriggers);
        }
    }); var ClassOptions$5 = ['channelName', 'radioEvents', 'radioRequests', 'region', 'regionClass']; var Application = function Application(options) { this._setOptions(options, ClassOptions$5); this.cid = _.uniqueId(this.cidPrefix); this._initRegion(); this._initRadio(); this.initialize.apply(this, arguments); }; Application.extend = extend; _.extend(Application.prototype, CommonMixin, DestroyMixin, RadioMixin, {
        cidPrefix: 'mna', initialize: function initialize() { }, start: function start(options) { this.triggerMethod('before:start', this, options); this.triggerMethod('start', this, options); return this; }, regionClass: Region, _initRegion: function _initRegion() {
            var region = this.region; if (!region) { return; }
            var defaults = { regionClass: this.regionClass }; this._region = buildRegion(region, defaults);
        }, getRegion: function getRegion() { return this._region; }, showView: function showView(view) {
            var region = this.getRegion(); for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) { args[_key - 1] = arguments[_key]; }
            region.show.apply(region, [view].concat(args)); return view;
        }, getView: function getView() { return this.getRegion().currentView; }
    }); var bindEvents$1 = proxy(bindEvents); var unbindEvents$1 = proxy(unbindEvents); var bindRequests$1 = proxy(bindRequests); var unbindRequests$1 = proxy(unbindRequests); var mergeOptions$1 = proxy(mergeOptions); var getOption$1 = proxy(getOption); var normalizeMethods$1 = proxy(normalizeMethods); var triggerMethod$1 = proxy(triggerMethod); var setDomApi$1 = function setDomApi(mixin) { CollectionView.setDomApi(mixin); Region.setDomApi(mixin); View.setDomApi(mixin); }; var setRenderer$1 = function setRenderer(renderer) { CollectionView.setRenderer(renderer); View.setRenderer(renderer); }; var backbone_marionette = { View: View, CollectionView: CollectionView, MnObject: MarionetteObject, Object: MarionetteObject, Region: Region, Behavior: Behavior, Application: Application, isEnabled: isEnabled, setEnabled: setEnabled, monitorViewEvents: monitorViewEvents, Events: Events, extend: extend, DomApi: DomApi, VERSION: version }; exports.Application = Application; exports.Behavior = Behavior; exports.CollectionView = CollectionView; exports.DomApi = DomApi; exports.Events = Events; exports.MnObject = MarionetteObject; exports.Region = Region; exports.VERSION = version; exports.View = View; exports.bindEvents = bindEvents$1; exports.bindRequests = bindRequests$1; exports.default = backbone_marionette; exports.extend = extend; exports.getOption = getOption$1; exports.isEnabled = isEnabled; exports.mergeOptions = mergeOptions$1; exports.monitorViewEvents = monitorViewEvents; exports.normalizeMethods = normalizeMethods$1; exports.setDomApi = setDomApi$1; exports.setEnabled = setEnabled; exports.setRenderer = setRenderer$1; exports.triggerMethod = triggerMethod$1; exports.unbindEvents = unbindEvents$1; exports.unbindRequests = unbindRequests$1; Object.defineProperty(exports, '__esModule', { value: true });
})); this && this.Marionette && (this.Mn = this.Marionette);