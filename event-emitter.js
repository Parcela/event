"use strict";

/**
 * Extends the Event-instance by adding the method `Emitter` to it.
 * The `Emitter-method` returns an object that should be merged into any Class-instance or object you
 * want to extend with the emit-methods, so the appropriate methods can be invoked on the instance.
 *
 * <i>Copyright (c) 2014 Parcela - https://github.com/Parcela</i>
 * New BSD License - https://github.com/ItsAsbreuk/itsa-library/blob/master/LICENSE
 *
 * Should be called using  the provided `extend`-method like this:
 * @example
 *     var Event = require('event');<br>
 *     var EventEmitter = require('event-emitter');<br>
 *     EventEmitter.mergeInto(Event);
 *
 * @module event
 * @submodule event-emitter
 * @class Event.Emitter
 * @since 0.0.1
*/

var NAME = '[event-emitter]: ',
    REGEXP_EMITTER = /^(\w|-)+$/,

createEmitter = {
    mergeInto: function (instanceEvent) {
        /**
         * Creates an object which holds all event-emission methods.
         * The returned object should be merged into any Class-instance or object you want to
         * extend with the emit-methods, so the appropriate methods can be invoked on the instance.
         *
         * See [Event.Emitter](Event.Emitter.html) for all properties that can be merged.
         *
         * @example
         *     var greenObject = {};
         *     greenObject.merge(Event.Emitter('green'));
         *     greenObject.emit('save'); // --> emits the customEvent `green:save`
         *
         * @example
         *     Profile.mergePrototypes(Event.Emitter('PersonalProfile'));
         *     var myProfile = new Profile({name: Marco});
         *     myProfile.emit('save'); // --> emits the customEvent `PersonalProfile:save`
         *
         * @for Event
         * @method Emitter
         * @param emitterName {String} the Event-instance that is responsible for the event-system.
         *        Should be an instance created by the class provided by `core-custom-event`
         * @return {Object} with the methods which should be merged inside an instance.
         * @since 0.0.1
         */

        /**
         * This object should be merged into any Class-instance or object that you want to provide
         * event-emitter methods. This way, the appropriate methods can be invoked on the instance.
         * instead of using the static Event-methods.
         *
         * When merging, you need to merge a method with the `emitterName` as its only argument. f.e:
         * Event.Emitter('PersonalProfile')
         *
         * It is highly recommendable to merge on the prototype instead of the instance. See the docs.
         *
         * @class Event.Emitter
         *
        */
        instanceEvent.Emitter = function(emitterName) {
            var composeCustomevent = function(eventName) {
                    return emitterName+':'+eventName;
                },
                newEmitter;
            if (!REGEXP_EMITTER.test(emitterName)) {
                console.error(NAME, 'Emitter invoked with invalid argument: you must specify a valid emitterName');
                return;
            }
            newEmitter = {
                /**
                 * Defines a CustomEvent. If the eventtype already exists, it will not be overridden,
                 * unless you force to assign with `.forceAssign()`
                 *
                 * The returned object comes with 4 methods which can be invoked chainable:
                 *
                 * <ul>
                 *     <li>defaultFn() --> the default-function of the event</li>
                 *     <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
                 *     <li>forceAssign() --> overrides any previous definition</li>
                 *     <li>unHaltable() --> makes the customEvent cannot be halted</li>
                 *     <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
                 *     <li>unSilencable() --> makes that emitters cannot make this event to perform silently (using e.silent)</li>
                 *     <li>unRenderPreventable() --> makes that the customEvent's render cannot be prevented</li>
                 *     <li>noRender() --> prevents this customEvent from render the dom. Overrules unRenderPreventable()</li>
                 * </ul>
                 *
                 * @method defineEvent
                 * @param eventName {String} name of the customEvent, without `emitterName`.
                 *        The final event that will be created has the syntax: `emitterName:eventName`,
                 *        where `emitterName:` is automaticly prepended.
                 * @return {Object} with extra methods that can be chained:
                 * <ul>
                 *      <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
                 *      <li>unRenderPreventable() --> makes that the customEvent's render cannot be prevented</li>
                 *      <li>forceAssign() --> overrides any previous definition</li>
                 *      <li>defaultFn() --> the default-function of the event</li>
                 *      <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
                 * </ul>
                 * @since 0.0.1
                 */
                defineEvent: function (eventName) {
                    return instanceEvent.defineEvent(composeCustomevent(eventName));
                },

                /**
                 * Emits the event `eventName` on behalf of the instance holding this method.
                 *
                 * @method emit
                 * @param eventName {String} name of the event to be sent (available as e.type)
                 *        you could pass a customEvent here 'emitterName:eventName', which would
                 *        overrule the `instance-emitterName`
                 * @param payload {Object} extra payload to be added to the event-object
                 * @return {Promise}
                 * <ul>
                 *     <li>on success: returnValue {Any} of the defaultFn</li>
                 *     <li>on error: reason {Any} Either: description 'event was halted', 'event was defaultPrevented' or the returnvalue of the preventedFn</li>
                 * </ul>
                 * @since 0.0.1
                 */
                emit: function(eventName, payload) {
                    return instanceEvent.emit(this, eventName, payload);
                },

                /**
                 * Removes all event-definitions of the instance holding this method.
                 *
                 * @method undefAllEvents
                 * @since 0.0.1
                 */
                undefAllEvents: function () {
                    instanceEvent.undefEvent(emitterName);
                },

                /**
                 * Removes the event-definition of the specified customEvent.
                 *
                 * @method undefEvent
                 * @param eventName {String} name of the customEvent, without `emitterName`.
                 *        The calculated customEvent which will be undefined, will have the syntax: `emitterName:eventName`.
                 *        where `emitterName:` is automaticly prepended.
                 * @since 0.0.1
                 */
                undefEvent: function (eventName) {
                    instanceEvent.undefEvent(composeCustomevent(eventName));
                }

            };
            // register the emittername:
            instanceEvent.defineEmitter(newEmitter, emitterName);
            return newEmitter;
        };
    }
};

module.exports = createEmitter;