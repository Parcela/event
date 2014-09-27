/**
Centralized mechanism to emit and listen to custom events.

@module event
@class Event
@constructor
 
*/

require('lang-ext');


// to prevent multiple Event instances
// (which might happen: http://nodejs.org/docs/latest/api/modules.html#modules_module_caching_caveats)
// we make sure Event is defined only once. Therefore we bind it to `global` and return it if created before

(function (global, factory) {

    "use strict";

    if (!global._parcelaModules) {
        Object.defineProperty(global, '_parcelaModules', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {} // `writable` is false means we cannot chance the value-reference, but we can change {} its members
        });
    }
    if (!global._parcelaModules.Event) {
		global._parcelaModules.Event = factory();
	}

    module.exports = global._parcelaModules.Event;

}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {

    "use strict";

    var REGEXP_CUSTOMEVENT = /^((?:\w|-)+):((?:\w|-)+)$/,
        REGEXP_WILDCARD_CUSTOMEVENT = /^(?:((?:(?:\w|-)+)|\*):)?((?:(?:\w|-)+)|\*)$/,
        /* REGEXP_WILDCARD_CUSTOMEVENT :
         
        valid:
        'red:save'
        'red:*'
        '*:save'
        '*:*'
        'save'
        
        invalid:
        '*red:save'
        're*d:save'
        'red*:save'
        'red:*save'
        'red:sa*ve'
        'red:save*'
        ':save'
         */
        REGEXP_EVENTNAME_WITH_SEMICOLON = /:((?:\w|-)+)$/,
        Event;

    Event = {
		/**
		Objecthash containing all defined custom-events
		which has a structure like this:
		
		_ce = {
		    'UI:click': {
		        canBeHalted: true,
		        defaultFn: function(){...},
		        haltedFn: function(){...},
		        canPreventRender: true
		    },
		    'redmodel:save': {
		        canBeHalted: true,
		        defaultFn: function(){...},
		        haltedFn: function(){...},
		        canPreventRender: true
		    }
		}
		 *
		@property _ce
		@default {}
		@type Object
		@private
		 
		*/
		_ce: {},

		/**
		Hash map containing all defined before and after subscribers
		which has a structure like this (`b` represents `before` and `a` represents `after`)
		Every item that gets in the array consist by itself of 3 properties:
		
		 ```js
		 subscriberitem = {
			 o: listener,
			 cb: callbackFn(e)
		 };
*
		_subs = {
		    'UI:click': {
		        b: [
		            item,
		            item
		        ],
		        a: [
		            item,
		            item
		        ]
		    },
		    '*:click': {
		        b: [
		            item,
		            item
		        ],
		        a: [
		            item,
		            item
		        ]
		    },
		    'redmodel:save': {
		        b: [
		            item,
		            item
		        ],
		        a: [
		            item,
		            item
		        ]
		    }
		}
		 ```

		@property _subs
		@default {}
		@type Object
		@private
		 
		*/
		_subs: {},

		/**
		Internal list of finalize-subscribers which are invoked at the 
		finalization-cycle, which happens after the after-subscribers.
		It is an array of function-references.
		
		@property _final
		@default []
		@type Array
		@private
		 
		*/
		_final: [],

		/**
		Object that acts as the prototype of the eventobject.
		To add more methods, you can use `_setEventObjProperty`
		
		@property _defaultEventObj
		@default {
		   halt: function()
		   preventRender: function()
		}
		@type Object
		@private
		 
		*/
    	_defaultEventObj:  {},

		/**
		Objecthash containing all notifiers, keyed by customEvent name.
		This list is maintained by `notify`, `unNotify` and `unNotifyAll`
		
		```js
		_notifiers = {
		    'UI:click': {
		        cb:function() {}
		        o: {} // context
		    },
		    'redmodel:*': {
		        cb:function() {}
		        o: {} // context
		    },
		    'bluemodel:save': {
		        cb:function() {}
		        o: {} // context
		    }
		}
		```
		
		@property _notifiers
		@default {}
		@type Object
		@private
		 
		*/
		_notifiers:{},
		
        /**
        Subscribes to a customEvent. The callback will be executed `after` the defaultFn.
        
        @static
        @method after
        @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
               have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
               If `emitterName` is not defined, `UI` is assumed.
        @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
               as its only argument.
        @param [context] {Object} the instance that subscribes to the event.
               any object can passed through, even those are not extended with event-listener methods.
               Note: Objects who are extended with listener-methods should use instance.after() instead.
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
         
        */
        after: function(customEvent, callback, context) {
            return Event._addMultiSubs(false, customEvent, callback, context);
        },

        /**
        Subscribes to a customEvent. The callback will be executed `before` the defaultFn.
        
        @static
        @method before
        @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
               have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
               If `emitterName` is not defined, `UI` is assumed.
        @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
               as its only argument.
        @param [context] {Object} the instance that subscribes to the event.
               any object can passed through, even those are not extended with event-listener methods.
               Note: Objects who are extended with listener-methods should use instance.before() instead.
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
         
        */
        before: function(customEvent, callback, context) {
            return Event._addMultiSubs(true, customEvent, callback, context);
        },


        /**
        Provides access to read and set the customEvent porpoerties
		. 
		Returns an object with getter/setter methods to get or set the event definition properties.
		If the getter/setter is provided with an argument, that property will be set
		and the method is chainable to set further properties.
		If not argument is provided, then the value of that property is returned, thus,
		it cannot be chained.
        
		* defaultFn() --> the default-function of the event
		* haltedFn() --> the function that should be invoked when the event is halted
		* canBeHalted() --> whether the customEvent can be halted
		* canPreventRender() --> whether the customEvent's render can be prevented
		* noRender() --> prevents this customEvent from render the DOM.
		
		@example:
		```js
		// Setting / modifying:
		Event.eventDefinition('myEmitter:myEvent').canBeHalted(false).noRender(false);
		
		// Getting:
		console.log(Event.eventDefinition('myEmitter:myEvent').canBeHalted());
		```
        
        
        @static
        @method eventDefinition
        @param eventName {String} name of the customEvent conform the syntax: `emitterName:eventName`
        @return {Object} getters/setters for the customEvent properties or null if the custom      
         
         */
        eventDefinition: function (eventName) {
            if (!eventName.match(REGEXP_CUSTOMEVENT)) {
				return null;
            }
			var ce = Event._ce[eventName];
			if (!ce) {
				ce = Event._ce[eventName] = {
					canBeHalted: true,
					canPreventRender: true,
					noRender: false					
				};
			}
            return {
                defaultFn: function(defFn) {
					if (defFn === undefined) return ce.defaultFn;
					if (typeof defFn == 'function' || defFn === null) {
						ce.defaultFn = defFn;
					}
					return this;
					
                },
                haltedFn: function(prevFn) {
					if (prevFn === undefined) return ce.haltedFn;
					if (typeof defFn == 'function' || prevFn === null) {
						ce.haltedFn = prevFn;
					}
					return this;
                },
                canBeHalted: function(val) {
					if (val === undefined) return ce.canBeHalted;
                    ce.canBeHalted = !!val;
                    return this;
                },
                canPreventRender: function(val) {
					if (val === undefined) return ce.canPreventRender;
                    ce.canPreventRender = !!val;
                    return this;
                },
                noRender: function(val) {
					if (val === undefined) return ce.noRender;
                    ce.noRender = !!val;
                    return this;
                }
            };
        },

        /**
        Detaches (unsubscribes) the listener from the specified customEvent.
        
        @static
        @method detach
        @param listener {Object} The instance that is going to detach the customEvent.
               When not passed through (or undefined), all customevents of all instances are detached
        @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
               `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
               Can be set as the only argument.
         
        */
        detach: function(listener, customEvent) {
			Event._removeSubscribers(listener, customEvent);
        },

        /**
        Detaches (unsubscribes) the listener from all customevents.
         *
        @static
        @method detachAll
        @param listener {Object} The instance that is going to detach the customEvent
         
        */
        detachAll: function(listener) {
            if (listener) {
                Event._removeSubscribers(listener, '*:*');
            } else {
                Event._subs = {};
            }
        },


        /**
        Adds a subscriber to the finalization-cycle, which happens after the after-subscribers.
        Only get invoked when the cycle was not  halted.
         *
        @method finalize
        @param finallySubscriber {Function} callback to be invoked
               Function recieves the eventobject as its only argument
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
         
         */
        finalize: function (finallySubscriber) {
            var finalHash = Event._final;
            finalHash.push(finallySubscriber);
            return {
                detach: function() {
                    var index = finalHash.indexOf(finallySubscriber);
                    if (index!==-1) finalHash.splice(index, 1);
                }
            };
        },

        /**
        Creates a notifier for the customEvent.
        You can use this to create delayed `eventDefinitions`. When the customEvent is called, the callback gets invoked
        (even before the subsrcibers). Use this callback for delayed customEvent-definitions.
         *
        Use **no** wildcards for the emitterName. You might use wildcards for the eventName. Without wildcards, the
        notification will be unNotified (callback automaticly detached) on the first time the event occurs.

        You **must** specify the full `emitterName:eventName` syntax.
        The module `core-event-dom` uses `notify` to auto-define DOM-events (UI:*).
         *
        @static
        @method notify
        @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
               have the syntax: `emitterName:eventName`. Wildcard `*` may be used only  for`eventName`.
               If `emitterName` should be defined.
        @param callback {Function} subscriber: will be invoked when the customEvent is called (before any subscribers.
                        Recieves 2 arguments: `customEvent` and the `subscriber-object`.
        @param context {Object} context of the callback
        @chainable
         
        */
        notify: function(customEvent, callback, context) {
            Event._notifiers[customEvent] = {
                cb: callback,
                o: context
            };
            return Event;
        },



        /**
        Subscribes to a customEvent. The callback will be executed `after` the defaultFn.
        The subscriber will be automaticly removed once the callback executed the first time.
        No need to `detach()` (unless you want to undescribe before the first event)
         *
        @static
        @method onceAfter
        @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
               have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
               If `emitterName` is not defined, `UI` is assumed.
        @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
               as its only argument.
        @param [context] {Object} the instance that subscribes to the event.
               any object can passed through, even those are not extended with event-listener methods.
               Note: Objects who are extended with listener-methods should use instance.onceAfter() instead.
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
         
        */
        onceAfter: function(customEvent, callback, context) {
            var handler, wrapperFn;
            wrapperFn = function(e) {
                // CAUTIOUS: removing the handler right now would lead into a mismatch of the dispatcher
                // who loops through the array of subscribers!
                // therefore, we must remove once the eventcycle has finished --> we detach by setting it
                // at the end of the global-eventstack:
                // yet there still is a change that the event is called multiple times BEFORE it
                // will reach the defined `setTimeout` --> to avoid multiple invocations, handler is
                // extended with the property `_detached`
                if (!handler._detached) callback.call(this, e);
                handler._detached = true;
                setTimeout(function() {
					handler.detach();
				}, 0);
            };
            handler = Event._addMultiSubs(false, customEvent, wrapperFn, context);
            return handler;
        },

        /**
        Subscribes to a customEvent. The callback will be executed `before` the defaultFn.
        The subscriber will be automaticly removed once the callback executed the first time.
        No need to `detach()` (unless you want to undescribe before the first event)
         *
        @static
        @method onceBefore
        @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
               have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
               If `emitterName` is not defined, `UI` is assumed.
        @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
               as its only argument.
        @param [context] {Object} the instance that subscribes to the event.
               any object can passed through, even those are not extended with event-listener methods.
               Note: Objects who are extended with listener-methods should use instance.onceBefore() instead.
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
         
        */
        onceBefore: function(customEvent, callback, context) {
            var handler, wrapperFn;
            wrapperFn = function(e) {
                // CAUTIOUS: removeing the handler right now would lead into a mismatch of the dispatcher
                // who loops through the array of subscribers!
                // therefore, we must remove once the eventcycle has finished --> we detach by setting it
                // at the end of the global-eventstack.
                // yet there still is a change that the event is called multiple times BEFORE it
                // will reach the defined `setTimeout` --> to avoid multiple invocations, handler is
                // extended with the property `_detached`
                if (!handler._detached) callback.call(this, e);
                handler._detached = true;
                setTimeout(function() {
					handler.detach();
				}, 0);
            };
            handler = Event._addMultiSubs(true, customEvent, wrapperFn, context);
            return handler;
        },

        /**
        Removes all event-definitions of an emitter, specified by its `emitterName`.
        When `emitterName` is not set, ALL event-definitions will be removed.
         *
        @static
        @method undefAllEvents
        @param [emitterName] {String} name of the customEvent conform the syntax: `emitterName:eventName`
         
         */
        undefAllEvents: function (emitterName) {
            if (emitterName) {
				var pattern = new RegExp('^'+emitterName+':');
                Event._ce.each(
                    function(value, key) {
                        if (key.match(pattern)) delete Event._ce[key];
                    }
                );
            }
            else {
                Event._ce = {};
            }
        },

        /**
        Removes the event-definition of the specified customEvent.
         *
        @static
        @method undefEvent
        @param customEvent {String} name of the customEvent conform the syntax: `emitterName:eventName`
         
         */
        undefEvent: function (customEvent) {
            delete Event._ce[customEvent];
        },

        /**
        unNotifies (unsubscribes) the notifier of the specified customEvent.
         *
        @static
        @method unNotify
        @param customEvent {String} conform the syntax: `emitterName:eventName`.
         
        */
        unNotify: function(customEvent) {
            delete Event._notifiers[customEvent];
        },

        //====================================================================================================
        // private methods:
        //====================================================================================================

        /**
        Creates a subscriber to the specified customEvent. The customEvent must conform the syntax:
        `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
        If `emitterName` is not defined, `UI` is assumed.
         *
        Examples of valid customevents:
         *
        
            * 'redmodel:save'
            * 'UI:click'
            * 'click' --> alias for 'UI:click'
            * '`*`:click' --> careful: will listen to both UIs and non-UI- click-events
            * 'redmodel:`*`'
            * '`*`:`*`'
        
         *
        @static
        @method _addMultiSubs
        @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
        @param customEvent {Array} Array of Strings. customEvent should conform the syntax: `emitterName:eventName`, wildcard `*`
                may be used for both `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
        @param callback {Function} subscriber to the event.
        @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
        @private
         
        */
        _addMultiSubs: function(before, customEvent, callback, listener) {
            if (!Array.isArray(customEvent)) {
                return Event._addSubscriber(listener, before, customEvent, callback);
            }
            customEvent.forEach(
                function(ce) {
                    Event._addSubscriber(listener, before, ce, callback);
                }
            );
            return {
                detach: function() {
                    customEvent.each(
                        function(ce) {
                            Event._removeSubscriber(listener, before, ce, callback);
                        }
                    );
                }
            };
        },

        /**
        Creates a subscriber to the specified customEvent. The customEvent must conform the syntax:
        `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
        If `emitterName` is not defined, `UI` is assumed.
         *
        Examples of valid customevents:
         *
        
            * 'redmodel:save'
            * 'UI:click'
            * 'click' --> alias for 'UI:click'
            * '`*`:click' --> careful: will listen to both UIs and non-UI- click-events
            * 'redmodel:`*`'
            * '`*`:`*`'
        
         *
        @static
        @method _addSubscriber
        @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
        @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
        @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
               `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
        @param callback {Function} subscriber to the event.
        @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
        @private
         
        */
        _addSubscriber: function(listener, before, customEvent, callback) {
            var allSubscribers = Event._subs,
                extract = customEvent.match(REGEXP_WILDCARD_CUSTOMEVENT),
                hashtable, item, notifier, customEventWildcardEventName;

            if (!extract) {
                console.error('subscribe-error: eventname does not match pattern');
                return;
            }
            // if extract[1] is undefined, a simple customEvent is going to subscribe (without :)
            // therefore: recomposite customEvent:
            extract[1] || (customEvent='UI:'+customEvent);


            allSubscribers[customEvent] || (allSubscribers[customEvent]={});
            if (before) {
                allSubscribers[customEvent].b || (allSubscribers[customEvent].b=[]);
            }
            else {
                allSubscribers[customEvent].a || (allSubscribers[customEvent].a=[]);
            }

            hashtable = allSubscribers[customEvent][before ? 'b' : 'a'];
            // we need to be able to process an array of customevents
            item = {
                o: listener || Event,
                cb: callback
            };

            // in case of a defined subscription (no wildcard), we should look for notifiers
            if ((extract[1]!=='*') && (extract[2]!=='*')) {
                // before subscribing: we might need to activate notifiers --> with defined eventName should also be cleaned up:
                notifier = Event._notifiers[customEvent];
                if (notifier) {
                    notifier.cb.call(notifier.o, customEvent, item);
                    delete Event._notifiers[customEvent];
                }
                // check the same for wildcard eventName:
                customEventWildcardEventName = customEvent.replace(REGEXP_EVENTNAME_WITH_SEMICOLON, ':*');
                if (
					customEventWildcardEventName !== customEvent && 
					(notifier=Event._notifiers[customEventWildcardEventName])
				) {
                    notifier.cb.call(notifier.o, customEvent, item);
                }
            }

			hashtable.push(item);

            return {
                detach: function() {
                    Event._removeSubscriber(listener, before, customEvent, callback);
                }
            };
        },

        /**
        Emits the event `eventName` on behalf of `emitter`, which becomes e.target in the eventobject.
        During this process, all subscribers and the defaultFn/haltedFn get an eventobject passed through.
        The eventobject is created with at least these properties:


		* e.target --> source that triggered the event (instance or DOM-node), specified by `emitter`
		* e.type --> eventName
		* e.emitter --> emitterName
		* e.status --> status-information:
                 
			  * e.status.ok --> `true|false` whether the event got executed (not halted)
			  * e.status.defaultFn (optional) --> `true` if any defaultFn got invoked
			  * e.status.haltedFn (optional) --> `true` if any haltedFn got invoked
			  * e.status.rendered (optional) --> `true` the vDOM rendered the dom
			  * e.status.halted (optional) --> `reason|true` if the event got halted and optional the why
			  * e.status.renderPrevented (optional) -->  `reason|true` if the event got renderPrevented and optional the why
                 

        The optional `payload` is merged into the eventobject and could be used 
		by the subscribers and the defaultFn/haltedFn.
        
        The eventobject also has these methods:

		* e.halt() --> stops immediate all actions: no more subscribers are invoked, no defaultFn/haltedFn
		* e.preventRender() --> by default, any event will trigger the vDOM 
		  (if exists) to re-render, this can be prevented by calling e.preventRender()
        
        
		* First, before-subscribers are invoked: this is the place where you might call `e.halt()`, `a.preventDefault()` or `e.preventRender()`
		* Next, defaultFn or haltedFn gets invoked, depending on whether e.halt() or has been called
		* Next, after-subscribers get invoked (unless e.halt() has been called)
		* Finally, the finalization takes place: any subscribers are invoked, unless e.halt() has been called
        
        @static
        @method emit
        @param [emitter] {Object} instance that emits the events
        @param customEvent {String} Full customEvent conform syntax `emitterName:eventName`.
               `emitterName` is available as **e.emitter**, `eventName` as **e.type**.
        @param payload {Object} extra payload to be added to the event-object
        @return {Object} eventobject.
         
         */
        emit: function (emitter, customEvent, payload) {           
            var allCustomEvents = Event._ce,
                allSubscribers = Event._subs,
                customEventDefinition, extract, emitterName, eventName, 
				befores = [], afters= [],
				e;

            extract = customEvent.match(REGEXP_CUSTOMEVENT);
            if (!extract) {
                console.error('defined emit-event does not match pattern');
                return;
            }
            emitterName = extract[1];
            eventName = extract[2];
            customEventDefinition = allCustomEvents[customEvent];
			
			var concatSubs = function (which) {
				var subs = allSubscribers[which];
				befores = befores.concat(subs.b);
				afters = afters.concat(subs.a);
			};

            concatSubs(customEvent);
            concatSubs('*:'+eventName);
            concatSubs(emitterName+':*');
            concatSubs('*:*');

			e = Object.create(Event._defaultEventObj);
			e.target = emitter;
			e.type = eventName;
			e.emitter = emitterName;
			e.status = {};
			if (customEventDefinition) {
				e._canBeHalted = customEventDefinition.canBeHalted;
				e._canPreventRender = customEventDefinition.canPreventRender;
			}
			if (payload) {
				// e.merge(payload); is not enough --> DOM-eventobject has many properties that are not "own"-properties
				for (var key in payload) {
					if (!e[key]) e[key]=payload[key];
				}
			}
			befores.some(function(subscriber) {
				subscriber.cb.call(subscriber.o, e);
				return e.status.halted; 
			});
            e.status.ok = !e.status.halted;
            if (customEventDefinition && !e.status.halted) {
                // now invoke defFn
				if (e.status.halted) {
					if (customEventDefinition.haltedFn) {
						e.status.haltedFn=true;
                		e.returnValue = customEventDefinition.haltedFn.call(emitter, e);
					}
				} else {
					if (customEventDefinition.defaultFn) {
						e.status.defaultFn = true;
						e.returnValue = customEventDefinition.defaultFn.call(emitter, e);
					}
				}
            }

            if (e.status.ok) {
				afters.forEach(function(subscriber) {
					subscriber.cb.call(subscriber.o, e);
				});
				Event._final.forEach(function(finallySubscriber) {
					finallySubscriber(e);
				});
            }
            return e;
        },

        /**
        Removes a subscriber from the specified customEvent. The customEvent must conform the syntax:
        `emitterName:eventName`.
         *
        @static
        @method _removeSubscriber
        @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
        @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
        @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
               `emitterName` as well as only `eventName`, in which case 'UI' will become the emmiterName.
        @param [callback] {Function} subscriber to the event, when not set, all subscribers of the listener to this customEvent
                          will be removed.
        @private
         
        */
        _removeSubscriber: function(listener, before, customEvent, callback) {
            var eventSubscribers = Event._subs[customEvent],
                hashtable = eventSubscribers && eventSubscribers[before ? 'b' : 'a'],
                i, subscriber, beforeUsed, afterUsed;
            // remove only subscribers that are not subscribed to systemevents of Parcela (emitterName=='ParcelaEvent'):
            if (hashtable) {
                // unfortunatly we cannot search by reference, because the array has composed objects
                // also: can't use native Array.forEach: removing items within its callback change the array
                // during runtime, making it to skip the next item of the one that's being removed
               for (i=0; i<hashtable.length; ++i) {
                    subscriber = hashtable[i];
                    if ((subscriber.o===(listener || Event)) && (!callback || (subscriber.cb===callback))) {
                        hashtable.splice(i--, 1);
                    }
                }
            }
            // After removal subscriber: check whether both eventSubscribers.a and eventSubscribers.b are empty
            // if so, remove the member from Event._subs to cleanup memory
            if (eventSubscribers) {
                beforeUsed = eventSubscribers.b && (eventSubscribers.b.length>0);
                afterUsed = eventSubscribers.a && (eventSubscribers.a.length>0);
                if (!beforeUsed && !afterUsed) {
                    delete Event._subs[customEvent];
                }
            }
        },

        /**
        Removes subscribers from the multiple customevents. The customEvent must conform the syntax:
        `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
        If `emitterName` is not defined, `UI` is assumed.
         *
        Examples of valid customevents:
         *
        
            * 'redmodel:save'
            * 'UI:click'
            * 'click' --> alias for 'UI:click'
            * '`*`:click' --> careful: will listen to both UIs and non-UI- click-events
            * 'redmodel:`*`'
            * '`*`:`*`'
        
         *
        @static
        @method _removeSubscriber
        @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
        @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
               `emitterName` as well as only `eventName`, in which case 'UI' will become the emmiterName.
        @private
         
        */
        _removeSubscribers: function(listener, customEvent) {
            var emitterName, eventName,
                extract = customEvent.match(REGEXP_WILDCARD_CUSTOMEVENT);
            if (!extract) {
                console.error('_removeSubscribers-error: customEvent '+customEvent+' does not match pattern');
                return;
            }
            emitterName = extract[1] || 'UI';
            eventName = extract[2];
            if ((emitterName!=='*') && (eventName!=='*')) {
                Event._removeSubscriber(listener, true, customEvent);
                Event._removeSubscriber(listener, false, customEvent);
            }
            else {
                // wildcard, we need to look at all the members of Event._subs
                Event._subs.each(
                    function(value, key) {
                        var localExtract = key.match(REGEXP_WILDCARD_CUSTOMEVENT),
                            emitterMatch = (emitterName==='*') || (emitterName===localExtract[1]),
                            eventMatch = (eventName==='*') || (eventName===localExtract[2]);
                        if (emitterMatch && eventMatch) {
                            Event._removeSubscriber(listener, true, key);
                            Event._removeSubscriber(listener, false, key);
                        }
                    }
                );
            }
        },

        /**
        Adds a property to the default eventobject's prototype which passes through all eventcycles.
        Goes through Object.defineProperty with configurable, enumerable and writable
        all set to false.
         *
        @method _setEventObjProperty
        @param property {String} event-object
        @param value {Any}
        @chainable
        @private
         
         */
        _setEventObjProperty: function (property, value) {
			Object.defineProperty(Event._defaultEventObj, property, {
				configurable: false,
				enumerable: false,
				writable: false,
				value: value // `writable` is false means we cannot chance the value-reference, but we can change {} or [] its members
			});
			return Event;
        }

    };
	/**
	Alias for [`after`](#method_after).
	
	
	@static
	@method on
	*/
	Event.on = Event.after;

	/**
	Alias for [`onceAfter`](#method_onceAfter).
	
	
	@static
	@method once
	*/
	Event.once = Event.onceAfter;

    Event._setEventObjProperty('halt', function(reason) {
		if (!this.status.ok && this._canBeHalted) this.status.halted = reason || true;
	})
    ._setEventObjProperty('preventRender', function(reason) {
		if (!this.status.ok && this._canPreventRender) this.status.renderPrevented = reason || true;
	});

    return Event;
}));