define ['../comm.js'], (Comm) ->
	class TestComm extends Comm
		_url: 'dummy'
		_actions:
			success: method: 'get'
			failure: method: 'get'