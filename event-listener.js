"use strict";

/**
 * Extends the Event-instance by adding the object `Listener` to it.
 * The returned object should be merged into any Class-instance or object you want to
 * extend with the listener-methods, so the appropriate methods can be invoked on the instance.
 *
 * Should be called using  the provided `extend`-method like this:
 * @example
 * var Event = require('event');<br>
 * var EventListener = require('event-listener');<br>
 * EventListener.mergeInto(Event);
 *
 * @module event
 * @submodule event-listener
 * @class Event.Listener
 * @since 0.0.1
 *
 * <i>Copyright (c) 2014 Parcela - https://github.com/Parcela</i>
 * New BSD License - https://github.com/ItsAsbreuk/itsa-library/blob/master/LICENSE
 *
*/

var NAME = '[event-listener]: ',

createListener = {
    mergeInto: function (instanceEvent) {
        /**
         * Holds all event-listener methods.
         * The returned object should be merged into any Class-instance or object you want to
         * extend with the listener-methods, so the appropriate methods can be invoked on the instance.
         *
         * See [Event.Listener](Event.Listener.html) for all properties that can be merged.
         *
         * @example
         *     var blueObject = {};
         *     blueObject.merge(Event.Listener);
         *     blueObject.after('*:save', function(e) {
         *         ...
         *     });
         *
         * @example
         *     Members.mergePrototypes(Event.Listener);
         *     var myMembers = new Members();
         *     myMembers.after('PersonalProfile:save', function(e) {
         *         ...
         *     });
         *
         * @for Event
         * @property Listener
         * @type Object
         * @since 0.0.1
         */

        /**
         * This object should be merged into any Class-instance or object that you want to provide
         * event-listener methods. This way, the appropriate methods can be invoked on the instance.
         * instead of using the static Event-methods.
         *
         * It is highly recommendable to merge on the prototype instead of the instance. See the docs.
         *
         * @class Event.Listener
         *
        */
        instanceEvent.Listener = {
            /**
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `after` the defaultFn.
             *
             * @method after
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            after: function (customEvent, callback, filter, prepend) {
                return instanceEvent.after(customEvent, callback, this, filter, prepend);
            },

            /**
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `before` the defaultFn.
             *
             * @method before
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            before: function (customEvent, callback, filter, prepend) {
                return instanceEvent.before(customEvent, callback, this, filter, prepend);
            },

            /**
             * Detaches (unsubscribes) the listener from the specified customEvent,
             * on behalf of the object who calls this method.
             *
             * @method detach
             * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
             *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
             * @since 0.0.1
            */
            detach: function(customEvent) {
                instanceEvent.detach(this, customEvent);
            },

            /**
             * Detaches (unsubscribes) the listener from all customevents,
             * on behalf of the object who calls this method.
             *
             * @method detachAll
             * @since 0.0.1
            */
            detachAll: function() {
                instanceEvent.detachAll(this);
            },

            /**
             * Alias for `after`.
             *
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `after` the defaultFn.
             *
             * @method on
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            on: function (/* customEvent, callback, filter, prepend */) {
                return this.after.apply(this, arguments);
            },

            /**
             * Alias for `onceAfter`.
             *
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `after` the defaultFn.
             * The subscriber will be automaticly removed once the callback executed the first time.
             * No need to `detach()` (unless you want to undescribe before the first event)
             *
             * @method onceAfter
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            once: function (/* customEvent, callback, filter, prepend */) {
                return this.onceAfter.apply(this, arguments);
            },

            /**
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `after` the defaultFn.
             * The subscriber will be automaticly removed once the callback executed the first time.
             * No need to `detach()` (unless you want to undescribe before the first event)
             *
             * @method onceAfter
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            onceAfter: function (customEvent, callback, filter, prepend) {
                return instanceEvent.onceAfter(customEvent, callback, this, filter, prepend);
            },

            /**
             * Subscribes to a customEvent on behalf of the object who calls this method.
             * The callback will be executed `before` the defaultFn.
             * The subscriber will be automaticly removed once the callback executed the first time.
             * No need to `detach()` (unless you want to undescribe before the first event)
             *
             * @method onceBefore
             * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
             *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
             *        If `emitterName` is not defined, `UI` is assumed.
             * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
             *        as its only argument.
             * @param [filter] {String|Function} to filter the event.
             *        Use a String if you want to filter DOM-events by a `selector`
             *        Use a function if you want to filter by any other means. If the function returns a trully value, the
             *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
             *        the subscriber.
             * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
             * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
             * @since 0.0.1
            */
            onceBefore: function (customEvent, callback, filter, prepend) {
                return instanceEvent.onceBefore(customEvent, callback, this, filter, prepend);
            }
        };
    }
};

module.exports = createListener;