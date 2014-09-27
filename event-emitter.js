"use strict";

/**
Adds methods to simplify emitting custom events.

It can be merged into any class or object instance that needs to emit custom events
@example

	myObject.merge(Parcela.Event.Emitter);
	
	MyClass.mergePrototypes(Parcela.Event.Emitter);
	
	
@module event
@submodule event-emitter
@class Emitter
*/

var Event = require('event');


module.exports = {
	/**
	Default `emitterName` to be prepended to events on emision when no explicit emitterName is given.
	
		// Emit with full name:
		this.emit('myName:myCustomEvent', payload);
		
		// Once this is done
		this.emitterName = 'myName';
		
		// Later calls can be simplified to:
		this.emit('myCustomEvent', payload);
		
		
	
	@property emitterName
	@type String
	@default ''
	*/
	emitterName: '',

	/** 
	Prepends the `emitterName` to the event name if it was not explicitely given.
	
	@method _fullEventName
	@param eventName {String} full or partial event name
	@return {String} full event name
	@private
	*/
	_fullEventName: function (eventName) {
		return eventName.indexOf(':') === -1 ? this.emitterName + ':' + eventName : eventName;
	},

	/**
	Defines a CustomEvent. If the eventtype already exists, it will not be overridden,
	unless you force to assign with `.forceAssign()`

	The returned object provides the following setter methods:

	* defaultFn() --> the default-function of the event
	* preventedFn() --> the function that should be invoked when the event is defaultPrevented
	* forceAssign() --> overrides any previous definition
	* unHaltable() --> makes the customEvent cannot be halted
	* unPreventable() --> makes the customEvent's defaultFn cannot be prevented
	* unSilencable() --> makes that emitters cannot make this event to perform silently (using e.silent)
	* unRenderPreventable() --> makes that the customEvent's render cannot be prevented
	* noRender() --> prevents this customEvent from render the dom. Overrules unRenderPreventable()

	@method defineEvent
	@param eventName {String} name of the customEvent.  
		If `emitterName` is set, only the eventType needs to be specified.
	@return {Object} with extra methods that can be chained:

	*/
	defineEvent: function (eventName) {
		return Event.defineEvent(this._fullEventName(eventName));
	},

	/**
	Emits the event `eventName` on behalf of the instance holding this method.
	
	@method emit
	@param eventName {String} name of the event.
		If `emitterName` is set, only the `eventName` can be given.
	@param payload {Object} extra payload to be added to the event-object
	@return {Object} eventObject.
	*/
	emit: function (eventName, payload) {
		return Event.emit(this, this._fullEventName(eventName), payload);
	},

	/* *
	Removes all event-definitions of the instance holding this method.
	
	@method undefAllEvents
	*/
//	undefAllEvents: function (emitterName) {
//		Event.undefAllEvent(emitterName || this.emitterName);
//	},

	/**
	Removes the event-definition of the specified customEvent.

	@method undefEvent
	@param eventName {String} name of the customEvent, without `emitterName`.
		   The calculated customEvent which will be undefined, will have the syntax: `emitterName:eventName`.
		   where `emitterName:` is automaticly prepended.
	 */
	undefEvent: function (eventName) {
		Event.undefEvent(this._fullEventName(eventName));
	}
};