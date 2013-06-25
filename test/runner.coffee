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
				comm.off 'success', 'success', onComplete
				comm.on 'success', 'success', ->
					done()

				comm.doen 'success'

	mocha.run()
