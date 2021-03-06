"use strict";

/**
Adds methods to simplify listening to custom events.

It can be merged into any class or object instance that needs to listen to  custom events
@example

	myObject.merge(Parcela.Event.Listener);
	
	MyClass.mergePrototypes(Parcela.Event.Listener);
	
	
@module event
@submodule event-listener
@class Event.Listener
*/

var Event = require('event');

module.exports = {
    /**
    Subscribes to a customEvent on behalf of the object who calls this method.
    The callback will be executed `after` the defaultFn.
    
    @method after
    @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
           have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
           If `emitterName` is not defined, `UI` is assumed.
    @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
           as its only argument.
    @param [filter] {String|Function} to filter the event.
           Use a String if you want to filter DOM-events by a `selector`
           Use a function if you want to filter by any other means. If the function returns a trully value, the
           subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
           the subscriber.
    @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
    @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
    */
    after: function (customEvent, callback, filter, prepend) {
        return Event.after(customEvent, callback, this, filter, prepend);
    },

    /**
    Subscribes to a customEvent on behalf of the object who calls this method.
    The callback will be executed `before` the defaultFn.
    
    @method before
    @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
           have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
           If `emitterName` is not defined, `UI` is assumed.
    @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
           as its only argument.
    @param [filter] {String|Function} to filter the event.
           Use a String if you want to filter DOM-events by a `selector`
           Use a function if you want to filter by any other means. If the function returns a trully value, the
           subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
           the subscriber.
    @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
    @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
    */
    before: function (customEvent, callback, filter, prepend) {
        return Event.before(customEvent, callback, this, filter, prepend);
    },

    /**
    Detaches (unsubscribes) the listener from the specified customEvent,
    on behalf of the object who calls this method.
    
    @method detach
    @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
           `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
    */
    detach: function(customEvent) {
        Event.detach(this, customEvent);
    },

    /**
    Detaches (unsubscribes) the listener from all customevents,
    on behalf of the object who calls this method.
    
    @method detachAll
    */
    detachAll: function() {
        Event.detachAll(this);
    },

    /**
    Alias for [`after`](#method_after).
	
	@method on
    */
    on: function (/* customEvent, callback, filter, prepend */) {
        return Event.after.apply(Event, arguments);
    },

    /**
    Alias for [`onceAfter`](#method_onceAfter).
	
	@method once
    */
    once: function (/* customEvent, callback, filter, prepend */) {
        return Event.onceAfter.apply(Event, arguments);
    },

    /**
    Subscribes to a customEvent on behalf of the object who calls this method.
    The callback will be executed `after` the defaultFn.
    The subscriber will be automaticly removed once the callback executed the first time.
    No need to `detach()` (unless you want to undescribe before the first event)
    
    @method onceAfter
    @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
           have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
           If `emitterName` is not defined, `UI` is assumed.
    @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
           as its only argument.
    @param [filter] {String|Function} to filter the event.
           Use a String if you want to filter DOM-events by a `selector`
           Use a function if you want to filter by any other means. If the function returns a trully value, the
           subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
           the subscriber.
    @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
    @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
    */
    onceAfter: function (customEvent, callback, filter, prepend) {
        return Event.onceAfter(customEvent, callback, this, filter, prepend);
    },

    /**
    Subscribes to a customEvent on behalf of the object who calls this method.
    The callback will be executed `before` the defaultFn.
    The subscriber will be automaticly removed once the callback executed the first time.
    No need to `detach()` (unless you want to undescribe before the first event)
    
    @method onceBefore
    @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
           have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
           If `emitterName` is not defined, `UI` is assumed.
    @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
           as its only argument.
    @param [filter] {String|Function} to filter the event.
           Use a String if you want to filter DOM-events by a `selector`
           Use a function if you want to filter by any other means. If the function returns a trully value, the
           subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
           the subscriber.
    @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
    @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
    */
    onceBefore: function (customEvent, callback, filter, prepend) {
        return Event.onceBefore(customEvent, callback, this, filter, prepend);
    }
};