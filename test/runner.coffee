require ['testcomm'], (TestComm) ->
	mocha.setup 'bdd'
	comm = null
	assert = (expr, msg = 'failed') ->
		throw new Error msg unless expr

	beforeEach ->
		comm = new TestComm

	describe 'CommTest', ->
		describe 'イベントの付け外し', ->
			it 'ちゃんとつくか', (done) ->
				comm.on 'success', 'success', ->
					done()
				comm.doen 'success'

			it '重複してつかないか', (done) ->
				cnt = 0
				onComplete = ->
					cnt++
					assert false if cnt > 1

				comm.on 'success', 'success', onComplete
				comm.on 'success', 'success', onComplete
				comm.on 'success', 'success', ->
					done()
				comm.doen 'success'

			it 'つけわけができるか', (done) ->
				comm.on 'success', 'success', ->
					assert false
				comm.on 'failure', 'success', ->
					assert false
				comm.on 'failure', 'failure', ->
					done()
				comm.doen 'failure'

			it '正常にはずせるか', (done) ->
				onComplete = ->
					assert false

				comm.on 'success', 'success', onComplete
				comm.on 'success', 'success', ->
					done()
				comm.off 'success', 'success', onComplete

				comm.doen 'success'

		describe 'pullのつけはずし', ->
			it 'ちゃんとつくか', (done) ->
				comm.pull 'token', ->
					done()
				comm.doen 'success'

			it '重複してつかないか', (done) ->
				cnt = 0
				onComplete = ->
					cnt++
					assert false if cnt > 1

				comm.pull 'token', onComplete
				comm.pull 'token', onComplete
				comm.pull 'token', ->
					done()
				comm.doen 'success'

			it 'つけわけができるか1', (done) ->
				comm.pull 'token', ->
					done()
				comm.pull 'csrf', ->
					assert false
				comm.doen 'success'

			it 'つけわけができるか2', (done) ->
				comm.pull 'token', ->
					assert false
				comm.pull 'csrf', ->
					done()
				comm.doen 'failure'

			it '正常にはずせるか', (done) ->
				cnt = 0
				onComplete = ->
					assert false
				onPull = ->
					cnt++
					done() if cnt > 1

				comm.pull 'token', onComplete
				comm.pull 'csrf', onComplete
				comm.pull 'csrf', onPull
				comm.pull 'token', onPull
				comm.unpull 'csrf', onComplete
				comm.unpull 'token', onComplete

				comm.doen 'success'
				comm.doen 'failure'

		describe '通信プロトコル', ->
			it 'data', (done) ->
				comm.on 'success', 'success', (query) ->
					assert query.data is 'user_info'
					done()
				comm.doen 'success'

			it 'messages', (done) ->
				comm.on 'failure', 'failure', (query) ->
					assert query.messages.email is 'invalid'
					done()
				comm.doen 'failure'

			it 'pull', (done) ->
				comm.pull 'token', (newToken) ->
					assert newToken is 'abcdef'
					done()
				comm.doen 'success'

	mocha.run()
