###
net protocol
@result:	結果
@messages:	結果に伴うメッセージ(なくてもいい)
@data:		結果に伴うデータ(なくてもいい、自由)
@push:		アプリケーショングローバルな通知, pullでバインド
###
define [], ->
	###
	原型となるevent dispatcher
	###
	class EventDispatcher
		constructor: ->
			@_events = {}

		on: (event, fn) ->
			@_events[event] = [] unless @_events[event]?
			@_events[event].push fn unless @has event, fn

		off: (event, fn) ->
			return unless @_events[event]?
			@_events[event] =
				elm for elm in @_events[event] when elm isnt fn

		has: (event, fn) ->
			return unless @_events[event]?
			fn in @_events[event]

		fire: (event, data) ->
			return unless @_events[event]?
			fn.call @, data for fn in @_events[event]

	###
	通信クラス本体
	###
	class Comm extends EventDispatcher
		constructor: ->
			@_data = {}
			@reset name for name of @_actions
			super()

		###
		net definition
		###
		_url: ""
		_actions: {} # define: method[, verzuim]

		###
		ajax method
		###
		doen: (action, callbacks = null) ->
			@_isValidAction action

			$.ajax
				url: "#{@_url}/#{action}"
				data: @_data[action]
				dataType: "json"
				type: @_actions[action].method
				success: (r) =>
					query = data: r.data, messages: r.messages

					# default
					@fire fullEventName(action, r.result), query

					# raw
					callbacks?[r.result]? query

					# pull
					@fire fullPulltopName(key), value for key, value of r.push if r.push

				error: =>
					# TODO: handle error

		###
		query manager
		###
		reset: (action) ->
			@_isValidAction action
			@_data[action] = $.extend(true, {}, @_actions[action].verzuim)

		set: (action, key, val) ->
			@_isValidAction action
			@_data[action][key] = val

		unset: (action, key) ->
			@_isValidAction action
			delete @_data[action][key]

		###
		customize bind
		###
		on: (action, result, fn) ->
			@_isValidAction action
			super.on fullEventName(action, result), fn

		off: (action, result, fn) ->
			@_isValidAction action
			super.off fullEventName(action, result), fn

		pull: (type, fn) ->
			super.on fullPulltopName(type), fn

		unpull: (type, fn) ->
			super.off fullPulltopName(type), fn

		###
		utils
		###
		_isValidAction: (action) ->
			throw "action: #{action} isn't defined"  unless @_actions.hasOwnProperty(action)
	
	###
	templates
	###
	# get event names
	fullEventName = (action, result) ->
		"action:#{action}.#{result}"
	
	# also get event names
	fullPulltopName = (type) ->
		"pull:#{type}"

	Comm