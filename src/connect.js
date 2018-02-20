'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _normalizeProps = require('./normalizeProps');

var _normalizeProps2 = _interopRequireDefault(_normalizeProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function noop() {}

function getStore(component) {
  return component.$store;
}

function getAttrs(component) {
  return component.$attrs;
}

function getStates(component, mapStateToProps) {
  var store = getStore(component);
  var attrs = getAttrs(component);

  return mapStateToProps(store.getState(), attrs) || {};
}

function getActions(component, mapActionsToProps) {
  var store = getStore(component);

  return mapActionsToProps(store.dispatch, getAttrs.bind(null, component)) || {};
}

function getProps(component) {
  var props = {};
  var attrs = getAttrs(component);
  var stateNames = component.vuaReduxStateNames;
  var actionNames = component.vuaReduxActionNames;

  for (var ii = 0; ii < stateNames.length; ii++) {
    props[stateNames[ii]] = component[stateNames[ii]];
  }

  for (var _ii = 0; _ii < actionNames.length; _ii++) {
    props[actionNames[_ii]] = component[actionNames[_ii]];
  }

  return _extends({}, props, attrs);
}

/**
 * 1. utilities are moved above because vue stores methods, states and props
 * in the same namespace
 * 2. actions are set while created
 */

/**
 * @param mapStateToProps
 * @param mapActionsToProps
 * @returns Object
 */
export default function connect(mapStateToProps, mapActionsToProps) {
  mapStateToProps = mapStateToProps || noop;
  mapActionsToProps = mapActionsToProps || noop;

  return function (children) {

    /** @namespace children.collect */
    if (children.collect) {
      children.props = _extends({}, (0, _normalizeProps2.default)(children.props || {}), (0, _normalizeProps2.default)(children.collect || {}));

      var msg = 'vue-redux: collect is deprecated, use props ' + ('in ' + (children.name || 'anonymous') + ' component');

      console.warn(msg);
    }

    return {
      name: 'ConnectVueRedux-' + (children.name || 'children'),

      components: children.components,
      beforeMount: children.beforeMount,
      mounted: children.mounted,
      computed: children.computed,
      methods: children.methods,
      
      render: function render(h) {
        var props = getProps(this);

        return h(children, { props: props });
      },
      data: function data() {
        var state = getStates(this, mapStateToProps);
        var actions = getActions(this, mapActionsToProps);
        var stateNames = Object.keys(state);
        var actionNames = Object.keys(actions);

        return _extends({}, state, actions, {
          vuaReduxStateNames: stateNames,
          vuaReduxActionNames: actionNames
        });
      },
      created: function created() {
        var _this = this;

        var store = getStore(this);

        this.vuaReduxUnsubscribe = store.subscribe(function () {
          var state = getStates(_this, mapStateToProps);
          var stateNames = Object.keys(state);
          _this.vuaReduxStateNames = stateNames;

          for (var ii = 0; ii < stateNames.length; ii++) {
            _this[stateNames[ii]] = state[stateNames[ii]];
          }
        });
      },
      beforeDestroy: function beforeDestroy() {
        this.vuaReduxUnsubscribe();
      }
    };
  };
}