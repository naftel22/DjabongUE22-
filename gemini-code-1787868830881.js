(function () {
  function defineGetterSetter(obj, prop, getter, setter) {
    Object.defineProperty(obj, prop, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  }

  var globalObj =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof self !== "undefined"
      ? self
      : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : {};

  var loadedModules = {};
  var registeredModules = {};
  var requireFunc = globalObj.parcelRequirebc80;

  if (requireFunc == null) {
    requireFunc = function (id) {
      if (id in loadedModules) return loadedModules[id].exports;
      if (id in registeredModules) {
        var moduleFactory = registeredModules[id];
        delete registeredModules[id];
        var moduleObj = { id: id, exports: {} };
        loadedModules[id] = moduleObj;
        moduleFactory.call(moduleObj.exports, moduleObj, moduleObj.exports);
        return moduleObj.exports;
      }
      var err = new Error("Cannot find module '" + id + "'");
      err.code = "MODULE_NOT_FOUND";
      throw err;
    };

    requireFunc.register = function (id, factory) {
      registeredModules[id] = factory;
    };
    globalObj.parcelRequirebc80 = requireFunc;
  }

  requireFunc.register("iM5Ye", function (moduleExports, exports) {
    defineGetterSetter(moduleExports, "FCPThresholds", () => FCPThresholds);
    defineGetterSetter(moduleExports, "onFCP", () => onFCP);
    defineGetterSetter(moduleExports, "CLSThresholds", () => CLSThresholds);
    defineGetterSetter(moduleExports, "onCLS", () => onCLS);
    defineGetterSetter(moduleExports, "INPThresholds", () => INPThresholds);
    defineGetterSetter(moduleExports, "onINP", () => onINP);
    defineGetterSetter(moduleExports, "LCPThresholds", () => LCPThresholds);
    defineGetterSetter(moduleExports, "onLCP", () => onLCP);
    defineGetterSetter(moduleExports, "TTFBThresholds", () => TTFBThresholds);
    defineGetterSetter(moduleExports, "onTTFB", () => onTTFB);

    let pageShowTimestamp = -1;

    const onPageShow = (callback) => {
      addEventListener(
        "pageshow",
        (event) => {
          if (event.persisted) {
            pageShowTimestamp = event.timeStamp;
            callback(event);
          }
        },
        true
      );
    };

    const createMetricReporter = (onReport, metric, thresholds, reportAllChanges) => {
      let prevValue, prevDelta;
      return (forceReport) => {
        if (metric.value >= 0 && (forceReport || reportAllChanges)) {
          prevDelta = metric.value - (prevValue ?? 0);
          if (prevDelta || prevValue === undefined) {
            prevValue = metric.value;
            metric.delta = prevDelta;
            metric.rating = metric.value > thresholds[1] ? "poor" : metric.value > thresholds[0] ? "needs-improvement" : "good";
            onReport(metric);
          }
        }
      };
    };

    const nextFrame = (callback) => {
      requestAnimationFrame(() => requestAnimationFrame(() => callback()));
    };

    const getNavigationEntry = () => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      if (navEntry && navEntry.responseStart > 0 && navEntry.responseStart < performance.now()) {
        return navEntry;
      }
    };

    const getActivationStart = () => getNavigationEntry()?.activationStart ?? 0;

    const initMetric = (name, value = -1) => {
      const navEntry = getNavigationEntry();
      let navType = "navigate";

      if (pageShowTimestamp >= 0) {
        navType = "back-forward-cache";
      } else if (navEntry) {
        if (document.prerendering || getActivationStart() > 0) {
          navType = "prerender";
        } else if (document.wasDiscarded) {
          navType = "restore";
        } else if (navEntry.type) {
          navType = navEntry.type.replace(/_/g, "-");
        }
      }

      return {
        name: name,
        value: value,
        rating: "good",
        delta: 0,
        entries: [],
        id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`,
        navigationType: navType
      };
    };

    const instanceCache = new WeakMap();
    function getInstance(key, ClassRef) {
      return instanceCache.get(key) || instanceCache.set(key, new ClassRef()), instanceCache.get(key);
    }

    class CLSAccumulator {
      callback;
      value = 0;
      entries = [];

      handleShift(entry) {
        if (entry.hadRecentInput) return;

        const firstEntry = this.entries[0];
        const lastEntry = this.entries.at(-1);

        if (this.value && firstEntry && lastEntry && entry.startTime - lastEntry.startTime < 1000 && entry.startTime - firstEntry.startTime < 5000) {
          this.value += entry.value;
          this.entries.push(entry);
        } else {
          this.value = entry.value;
          this.entries = [entry];
        }
        this.callback?.(entry);
      }
    }

    const observePerformance = (type, callback, opts = {}) => {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(type)) {
          const observer = new PerformanceObserver((list) => {
            Promise.resolve().then(() => {
              callback(list.getEntries());
            });
          });
          observer.observe({ type: type, buffered: true, ...opts });
          return observer;
        }
      } catch (e) {}
    };

    const runOnce = (fn) => {
      let executed = false;
      return () => {
        if (!executed) {
          fn();
          executed = true;
        }
      };
    };

    let firstHiddenTimeValue = -1;

    const getVisibilityFallback = () => ("hidden" !== document.visibilityState || document.prerendering ? Infinity : 0);

    const onVisibilityChange = (event) => {
      if ("hidden" === document.visibilityState && firstHiddenTimeValue > -1) {
        firstHiddenTimeValue = "visibilitychange" === event.type ? event.timeStamp : 0;
        cleanupVisibilityListeners();
      }
    };

    const attachVisibilityListeners = () => {
      addEventListener("visibilitychange", onVisibilityChange, true);
      addEventListener("prerenderingchange", onVisibilityChange, true);
    };

    const cleanupVisibilityListeners = () => {
      removeEventListener("visibilitychange", onVisibilityChange, true);
      removeEventListener("prerenderingchange", onVisibilityChange, true);
    };

    const getVisibilityTracker = () => {
      if (firstHiddenTimeValue < 0) {
        const activationStart = getActivationStart();
        const hiddenEntry = document.prerendering
          ? undefined
          : globalThis.performance
              .getEntriesByType("visibility-state")
              .filter((entry) => "hidden" === entry.name && entry.startTime > activationStart)[0]?.startTime;

        firstHiddenTimeValue = hiddenEntry ?? getVisibilityFallback();
        attachVisibilityListeners();

        onPageShow(() => {
          setTimeout(() => {
            firstHiddenTimeValue = getVisibilityFallback();
            attachVisibilityListeners();
          });
        });
      }
      return {
        get firstHiddenTime() {
          return firstHiddenTimeValue;
        }
      };
    };

    const whenReady = (callback) => {
      if (document.prerendering) {
        addEventListener("prerenderingchange", () => callback(), true);
      } else {
        callback();
      }
    };

    const FCPThresholds = [1800, 3000];
    const onFCP = (onReport, opts = {}) => {
      whenReady(() => {
        const visibility = getVisibilityTracker();
        let report, metric = initMetric("FCP");

        const observer = observePerformance("paint", (entries) => {
          for (const entry of entries) {
            if ("first-contentful-paint" === entry.name) {
              observer.disconnect();
              if (entry.startTime < visibility.firstHiddenTime) {
                metric.value = Math.max(entry.startTime - getActivationStart(), 0);
                metric.entries.push(entry);
                report(true);
              }
            }
          }
        });

        if (observer) {
          report = createMetricReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
          onPageShow((event) => {
            metric = initMetric("FCP");
            report = createMetricReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
            nextFrame(() => {
              metric.value = performance.now() - event.timeStamp;
              report(true);
            });
          });
        }
      });
    };

    const CLSThresholds = [0.1, 0.25];
    const onCLS = (onReport, opts = {}) => {
      onFCP(
        runOnce(() => {
          let report, metric = initMetric("CLS", 0);
          const clsInstance = getInstance(opts, CLSAccumulator);

          const handleShift = (entries) => {
            for (const entry of entries) clsInstance.handleShift(entry);
            if (clsInstance.value > metric.value) {
              metric.value = clsInstance.value;
              metric.entries = clsInstance.entries;
              report();
            }
          };

          const observer = observePerformance("layout-shift", handleShift);

          if (observer) {
            report = createMetricReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);

            document.addEventListener("visibilitychange", () => {
              if ("hidden" === document.visibilityState) {
                handleShift(observer.takeRecords());
                report(true);
              }
            });

            onPageShow(() => {
              clsInstance.value = 0;
              metric = initMetric("CLS", 0);
              report = createMetricReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);
              nextFrame(() => report());
            });

            setTimeout(report);
          }
        })
      );
    };

    let minInteractionId = 0,
      lowestInteractionId = Infinity,
      highestInteractionId = 0;

    const trackInteractions = (entries) => {
      for (const entry of entries) {
        if (entry.interactionId) {
          lowestInteractionId = Math.min(lowestInteractionId, entry.interactionId);
          highestInteractionId = Math.max(highestInteractionId, entry.interactionId);
          minInteractionId = highestInteractionId ? (highestInteractionId - lowestInteractionId) / 7 + 1 : 0;
        }
      }
    };

    let isInteractionObserved;
    const getInteractionCount = () => (isInteractionObserved ? minInteractionId : performance.interactionCount ?? 0);

    let interactionCountBaseline = 0;

    class INPTracker {
      interactions = [];
      interactionMap = new Map();
      onEntry;

      reset() {
        interactionCountBaseline = getInteractionCount();
        this.interactions.length = 0;
        this.interactionMap.clear();
      }

      get INP() {
        const index = Math.min(this.interactions.length - 1, Math.floor((getInteractionCount() - interactionCountBaseline) / 50));
        return this.interactions[index];
      }

      handleEntry(entry) {
        this.onEntry?.(entry);
        if (!entry.interactionId && "first-input" !== entry.entryType) return;

        const worstInteraction = this.interactions.at(-1);
        let existing = this.interactionMap.get(entry.interactionId);

        if (existing || this.interactions.length < 10 || entry.duration > worstInteraction.T) {
          if (existing) {
            if (entry.duration > existing.T) {
              existing.entries = [entry];
              existing.T = entry.duration;
            } else if (entry.duration === existing.T && entry.startTime === existing.entries[0].startTime) {
              existing.entries.push(entry);
            }
          } else {
            existing = { id: entry.interactionId, entries: [entry], T: entry.duration };
            this.interactionMap.set(existing.id, existing);
            this.interactions.push(existing);
          }

          this.interactions.sort((a, b) => b.T - a.T);

          if (this.interactions.length > 10) {
            const removed = this.interactions.splice(10);
            for (const item of removed) this.interactionMap.delete(item.id);
          }
        }
      }
    }

    const runWhenIdleOrHidden = (callback) => {
      const scheduleFn = globalThis.requestIdleCallback || setTimeout;
      if ("hidden" === document.visibilityState) {
        callback();
      } else {
        callback = runOnce(callback);
        document.addEventListener("visibilitychange", callback, { once: true });
        scheduleFn(() => {
          callback();
          document.removeEventListener("visibilitychange", callback);
        });
      }
    };

    const INPThresholds = [200, 500];
    const onINP = (onReport, opts = {}) => {
      if (globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype) {
        whenReady(() => {
          if (!("interactionCount" in performance) && !isInteractionObserved) {
            isInteractionObserved = observePerformance("event", trackInteractions, { type: "event", buffered: true, durationThreshold: 0 });
          }

          let report, metric = initMetric("INP");
          const inpInstance = getInstance(opts, INPTracker);

          const processEntries = (entries) => {
            runWhenIdleOrHidden(() => {
              for (const entry of entries) inpInstance.handleEntry(entry);
              const worstINP = inpInstance.INP;
              if (worstINP && worstINP.T !== metric.value) {
                metric.value = worstINP.T;
                metric.entries = worstINP.entries;
                report();
              }
            });
          };

          const observer = observePerformance("event", processEntries, { durationThreshold: opts.durationThreshold ?? 40 });

          report = createMetricReporter(onReport, metric, INPThresholds, opts.reportAllChanges);

          if (observer) {
            observer.observe({ type: "first-input", buffered: true });

            document.addEventListener("visibilitychange", () => {
              if ("hidden" === document.visibilityState) {
                processEntries(observer.takeRecords());
                report(true);
              }
            });

            onPageShow(() => {
              inpInstance.reset();
              metric = initMetric("INP");
              report = createMetricReporter(onReport, metric, INPThresholds, opts.reportAllChanges);
            });
          }
        });
      }
    };

    class LCPTracker {
      onEntry;
      handleEntry(entry) {
        this.onEntry?.(entry);
      }
    }

    const LCPThresholds = [2500, 4000];
    const onLCP = (onReport, opts = {}) => {
      whenReady(() => {
        const visibility = getVisibilityTracker();
        let report, metric = initMetric("LCP");
        const lcpInstance = getInstance(opts, LCPTracker);

        const handleLCP = (entries) => {
          if (!opts.reportAllChanges) entries = entries.slice(-1);
          for (const entry of entries) {
            lcpInstance.handleEntry(entry);
            if (entry.startTime < visibility.firstHiddenTime) {
              metric.value = Math.max(entry.startTime - getActivationStart(), 0);
              metric.entries = [entry];
              report();
            }
          }
        };

        const observer = observePerformance("largest-contentful-paint", handleLCP);

        if (observer) {
          report = createMetricReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);

          const finalizeLCP = runOnce(() => {
            handleLCP(observer.takeRecords());
            observer.disconnect();
            report(true);
          });

          for (const evtType of ["keydown", "click", "visibilitychange"]) {
            addEventListener(evtType, () => runWhenIdleOrHidden(finalizeLCP), { capture: true, once: true });
          }

          onPageShow((event) => {
            metric = initMetric("LCP");
            report = createMetricReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);
            nextFrame(() => {
              metric.value = performance.now() - event.timeStamp;
              report(true);
            });
          });
        }
      });
    };

    const TTFBThresholds = [800, 1800];
    const runOnLoad = (callback) => {
      if (document.prerendering) {
        whenReady(() => runOnLoad(callback));
      } else if (document.readyState !== "complete") {
        addEventListener("load", () => runOnLoad(callback), true);
      } else {
        setTimeout(callback);
      }
    };

    const onTTFB = (onReport, opts = {}) => {
      let metric = initMetric("TTFB");
      let report = createMetricReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);

      runOnLoad(() => {
        const navEntry = getNavigationEntry();
        if (navEntry) {
          metric.value = Math.max(navEntry.responseStart - getActivationStart(), 0);
          metric.entries = [navEntry];
          report(true);

          onPageShow(() => {
            metric = initMetric("TTFB", 0);
            report = createMetricReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);
            report(true);
          });
        }
      });
    };
  });
})();