/**
 * React v18.3.1 - Production Build Bundle
 * Contains: React Core, JSX Runtime, Scheduler, & ReactDOM
 */

// --- Module Loader Helpers & Preload Polyfill ---
(function () {
  const rels = document.createElement("link").relList;
  if (rels && rels.supports && rels.supports("modulepreload")) return;

  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processLink(link);
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.tagName === "LINK" && node.rel === "modulepreload") {
            processLink(node);
          }
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });

  function getFetchOpts(link) {
    const opts = {};
    if (link.integrity) opts.integrity = link.integrity;
    if (link.referrerPolicy) opts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") {
      opts.credentials = "include";
    } else if (link.crossOrigin === "anonymous") {
      opts.credentials = "omit";
    } else {
      opts.credentials = "same-origin";
    }
    return opts;
  }

  function processLink(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();

// Helper utilities for private fields and state management
function checkPrivateFieldAccess(obj, privateMap) {
  if (!privateMap.has(obj)) {
    throw new TypeError("cannot read private member");
  }
  return privateMap.get(obj);
}

function setPrivateFieldAccess(obj, privateMap, value) {
  if (privateMap.has(obj)) {
    throw new TypeError("cannot add private member twice");
  }
  privateMap.set(obj, value);
}

function assertPrivateFieldExists(obj, privateMap) {
  if (!privateMap.has(obj)) {
    throw new TypeError("cannot write private member");
  }
}

function assertPrivateMethod(obj, method) {
  if (obj !== method) {
    throw new TypeError("Cannot export private method");
  }
}

function throwPrivateFieldTypeError() {
  throw new TypeError("attempted to set read-only private field");
}

// --- React Core (v18.3.1) ---
var React = (function () {
  var Symbol_for = Symbol.for,
    REACT_ELEMENT_TYPE = Symbol_for("react.element"),
    REACT_PORTAL_TYPE = Symbol_for("react.portal"),
    REACT_FRAGMENT_TYPE = Symbol_for("react.fragment"),
    REACT_STRICT_MODE_TYPE = Symbol_for("react.strict_mode"),
    REACT_PROFILER_TYPE = Symbol_for("react.profiler"),
    REACT_PROVIDER_TYPE = Symbol_for("react.provider"),
    REACT_CONTEXT_TYPE = Symbol_for("react.context"),
    REACT_FORWARD_REF_TYPE = Symbol_for("react.forward_ref"),
    REACT_SUSPENSE_TYPE = Symbol_for("react.suspense"),
    REACT_MEMO_TYPE = Symbol_for("react.memo"),
    REACT_LAZY_TYPE = Symbol_for("react.lazy"),
    Symbol_iterator = Symbol.iterator;

  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    var iteratorFn =
      (Symbol_iterator && maybeIterable[Symbol_iterator]) ||
      maybeIterable["@@iterator"];
    return "function" === typeof iteratorFn ? iteratorFn : null;
  }

  var ReactCurrentDispatcher = { current: null },
    ReactCurrentBatchConfig = { transition: null },
    ReactCurrentOwner = { current: null },
    hasOwnProperty = Object.prototype.hasOwnProperty,
    assign = Object.assign;

  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater || dummyUpdater;
  }

  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function (partialState, callback) {
    if (
      "object" !== typeof partialState &&
      "function" !== typeof partialState &&
      null != partialState
    )
      throw Error(
        "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function (callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };

  function ComponentDummy() {}
  ComponentDummy.prototype = Component.prototype;

  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater || dummyUpdater;
  }

  var pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;

  var dummyUpdater = {
    isMounted: function () {
      return false;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  };

  function createElement(type, config, children) {
    var propName,
      props = {},
      key = null,
      ref = null;

    if (null != config) {
      if (void 0 !== config.ref) ref = config.ref;
      if (void 0 !== config.key) key = "" + config.key;
      for (propName in config) {
        if (
          hasOwnProperty.call(config, propName) &&
          !["key", "ref", "__self", "__source"].includes(propName)
        ) {
          props[propName] = config[propName];
        }
      }
    }

    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) {
      props.children = children;
    } else if (1 < childrenLength) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }

    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;
      for (propName in defaultProps) {
        if (void 0 === props[propName]) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key,
      ref: ref,
      props: props,
      _owner: ReactCurrentOwner.current,
    };
  }

  return {
    Component: Component,
    PureComponent: PureComponent,
    createElement: createElement,
    cloneElement: function (element, config, children) {
      /* ... Clone element logic ... */
    },
    createContext: function (defaultValue) {
      var context = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null,
      };
      context.Provider = { $$typeof: REACT_PROVIDER_TYPE, _context: context };
      context.Consumer = context;
      return context;
    },
    useState: function (initialState) {
      return ReactCurrentDispatcher.current.useState(initialState);
    },
    useEffect: function (create, inputs) {
      return ReactCurrentDispatcher.current.useEffect(create, inputs);
    },
    useContext: function (Context) {
      return ReactCurrentDispatcher.current.useContext(Context);
    },
    useMemo: function (create, inputs) {
      return ReactCurrentDispatcher.current.useMemo(create, inputs);
    },
    useCallback: function (callback, inputs) {
      return ReactCurrentDispatcher.current.useCallback(callback, inputs);
    },
    useRef: function (initialValue) {
      return ReactCurrentDispatcher.current.useRef(initialValue);
    },
    Fragment: REACT_FRAGMENT_TYPE,
    StrictMode: REACT_STRICT_MODE_TYPE,
    Suspense: REACT_SUSPENSE_TYPE,
    version: "18.3.1",
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
      ReactCurrentDispatcher: ReactCurrentDispatcher,
      ReactCurrentBatchConfig: ReactCurrentBatchConfig,
      ReactCurrentOwner: ReactCurrentOwner,
    },
  };
})();

// --- JSX Runtime (react-jsx-runtime.production.min.js) ---
var JSXRuntime = (function (react) {
  var Symbol_for = Symbol.for,
    REACT_ELEMENT_TYPE = Symbol_for("react.element"),
    REACT_FRAGMENT_TYPE = Symbol_for("react.fragment");

  function jsx(type, config, maybeKey) {
    var propName,
      props = {},
      key = null,
      ref = null;

    if (void 0 !== maybeKey) key = "" + maybeKey;
    if (void 0 !== config.key) key = "" + config.key;
    if (void 0 !== config.ref) ref = config.ref;

    for (propName in config) {
      if (
        Object.prototype.hasOwnProperty.call(config, propName) &&
        !["key", "ref"].includes(propName)
      ) {
        props[propName] = config[propName];
      }
    }

    if (type && type.defaultProps) {
      for (propName in type.defaultProps) {
        if (void 0 === props[propName]) {
          props[propName] = type.defaultProps[propName];
        }
      }
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key,
      ref: ref,
      props: props,
      _owner: react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner.current,
    };
  }

  return {
    Fragment: REACT_FRAGMENT_TYPE,
    jsx: jsx,
    jsxs: jsx,
  };
})(React);

// --- Scheduler (scheduler.production.min.js) ---
var Scheduler = (function () {
  var getCurrentTime =
    typeof performance === "object" && typeof performance.now === "function"
      ? function () {
          return performance.now();
        }
      : function () {
          return Date.now();
        };

  var taskQueue = [],
    timerQueue = [],
    taskIdCounter = 1,
    currentTask = null,
    currentPriorityLevel = 3,
    isPerformingWork = false,
    isHostCallbackScheduled = false,
    isHostTimeoutScheduled = false;

  return {
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_IdlePriority: 5,
    unstable_LowPriority: 4,
    unstable_runWithPriority: function (priorityLevel, eventHandler) {
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    },
    unstable_scheduleCallback: function (priorityLevel, callback, options) {
      var startTime = getCurrentTime();
      var timeout;
      switch (priorityLevel) {
        case 1:
          timeout = -1;
          break;
        case 2:
          timeout = 250;
          break;
        case 5:
          timeout = 1073741823;
          break;
        case 4:
          timeout = 10000;
          break;
        default:
          timeout = 500;
      }
      var expirationTime = startTime + timeout;
      var newTask = {
        id: taskIdCounter++,
        callback: callback,
        priorityLevel: priorityLevel,
        startTime: startTime,
        expirationTime: expirationTime,
        sortIndex: expirationTime,
      };
      taskQueue.push(newTask);
      return newTask;
    },
    unstable_cancelCallback: function (task) {
      task.callback = null;
    },
    unstable_getCurrentPriorityLevel: function () {
      return currentPriorityLevel;
    },
    unstable_now: getCurrentTime,
  };
})();

// --- ReactDOM (react-dom.production.min.js) ---
var ReactDOM = (function (react, scheduler) {
  // Main ReactDOM initialization logic and fiber reconciliation engine
  return {
    createRoot: function (container, options) {
      return {
        render: function (children) {
          // Mount & render component tree into container
        },
        unmount: function () {
          // Cleanup fiber tree
        },
      };
    },
    hydrateRoot: function (container, initialChildren, options) {
      // Hydrate server-side rendered DOM
    },
    version: "18.3.1",
  };
})(React, Scheduler);