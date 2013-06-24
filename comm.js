/**
 *  net protocol
 *  @result:   結果
 *  @messages: 結果に伴うメッセージ(なくてもいい)
 *  @data:     結果に伴うデータ(なくてもいい、自由)
 *  @push:     アプリケーショングローバルな通知, pullでバインド
 */
define(['etc/eventdispatcher'], function (eventDispatcher) {
    $.extend(comm.prototype, eventDispatcher.prototype, {
        /**
         *  net definition
         */
        _url:       '',
        _actions:   {}, // define: method[, verzuim]

        /**
         *  ajax methods
         */
        doen: function (action, callbacks) {
            this._isValidAction(action);

            var that = this;
            $.ajax({
                url: this._url + '/' + action,
                data: this._data[action],
                dataType: 'json',
                type: this._actions[action].method,
                success: function (r) {
                    var query = {data: r.data, messages: r.messages};

                    // defalut mode
                    that.fire(fullEventName(action, r.result), query);

                    // raw mode
                    if (callbacks && callbacks[r.result]) {
                        callbacks[r.result](query);
                    }

                    // pull
                    if (r.push) {
                        $.each(r.push, function (k, v) {
                            that.fire(fullPulltopName(k), v);
                        })
                    }
                },
                error: function () {
                    // TODO: handle error
                }
            });
        },

        /**
         *  query manager
         */
        reset: function (action) {
            this._isValidAction(action);
            this._data[action] = $.extend(true, {}, this._actions[action].verzuim);
        },
        set: function (action, key, val) {
            this._isValidAction(action);
            this._data[action][key] = val;
        },
        unset: function (action, key) {
            this._isValidAction(action);
            delete this._data[action][key];
        },

        /**
         *  customize bind
         */
        on: function (action, result, fn) {
            this._isValidAction(action);
            return eventDispatcher.prototype.on.call(this, fullEventName(action, result), fn);
        },
        off: function (action, result, fn) {
            this._isValidAction(action);
            return eventDispatcher.prototype.off.call(this, fullEventName(action, result), fn);
        },
        pull: function (type, fn) {
            return eventDispatcher.prototype.on.call(this, fullPulltopName(type), fn);
        },
        unpull: function (type, fn) {
            return eventDispatcher.prototype.off.call(this, fullPulltopName(type), fn);
        },

        /**
         * utils
         */
        _isValidAction: function (action) {
            if (!this._actions.hasOwnProperty(action)) {
                throw "action: " + action + " isn't defined";
            }
        }
    });

    return comm;

    /**
     *  class
     */
    function comm() {
        var that = this;

        // init data
        this._data = {};
        $.each(this._actions, function (name, v) {
            that.reset(name);
        });

        eventDispatcher.apply(this, arguments);
    }

    /**
     *  templates
     */
    // get event names
    function fullEventName(action, result) {
        return "action:" + action + "." + result;
    }
    // also get event names
    function fullPulltopName(type) {
        return "pull:" + type;
    }
});
