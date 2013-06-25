// Generated by CoffeeScript 1.6.3
/*
net protocol
@result:	結果
@messages:	結果に伴うメッセージ(なくてもいい)
@data:		結果に伴うデータ(なくてもいい、自由)
@push:		アプリケーショングローバルな通知, pullでバインド(push名とデータのkey-value)
*/


(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define([], function() {
    /*
    	原型となるevent dispatcher
    */

    var Comm, EventDispatcher, fullEventName, fullPulltopName;
    EventDispatcher = (function() {
      function EventDispatcher() {
        this._events = {};
      }

      EventDispatcher.prototype.on = function(event, fn) {
        if (this._events[event] == null) {
          this._events[event] = [];
        }
        if (!this.has(event, fn)) {
          return this._events[event].push(fn);
        }
      };

      EventDispatcher.prototype.off = function(event, fn) {
        var elm;
        if (this._events[event] == null) {
          return;
        }
        return this._events[event] = (function() {
          var _i, _len, _ref, _results;
          _ref = this._events[event];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            elm = _ref[_i];
            if (elm !== fn) {
              _results.push(elm);
            }
          }
          return _results;
        }).call(this);
      };

      EventDispatcher.prototype.has = function(event, fn) {
        if (this._events[event] == null) {
          return false;
        }
        return __indexOf.call(this._events[event], fn) >= 0;
      };

      EventDispatcher.prototype.fire = function(event, data) {
        var fn, _i, _len, _ref, _results;
        if (this._events[event] == null) {
          return;
        }
        _ref = this._events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fn = _ref[_i];
          _results.push(fn.call(this, data));
        }
        return _results;
      };

      return EventDispatcher;

    })();
    /*
    	通信クラス本体
    */

    Comm = (function(_super) {
      __extends(Comm, _super);

      function Comm() {
        var name;
        this._data = {};
        for (name in this._actions) {
          this.reset(name);
        }
        Comm.__super__.constructor.call(this);
      }

      /*
      		net definition
      */


      Comm.prototype._url = "";

      Comm.prototype._actions = {};

      /*
      		ajax method
      */


      Comm.prototype.doen = function(action, callbacks) {
        var _this = this;
        if (callbacks == null) {
          callbacks = null;
        }
        this._isValidAction(action);
        return $.ajax({
          url: "" + this._url + "/" + action,
          data: this._data[action],
          dataType: "json",
          type: this._actions[action].method,
          success: function(r) {
            var key, query, value, _name, _ref, _results;
            query = {
              data: r.data,
              messages: r.messages
            };
            _this.fire(fullEventName(action, r.result), query);
            if (callbacks != null) {
              if (typeof callbacks[_name = r.result] === "function") {
                callbacks[_name](query);
              }
            }
            if (r.push) {
              _ref = r.push;
              _results = [];
              for (key in _ref) {
                value = _ref[key];
                _results.push(_this.fire(fullPulltopName(key), value));
              }
              return _results;
            }
          },
          error: function() {}
        });
      };

      /*
      		query manager
      */


      Comm.prototype.reset = function(action) {
        this._isValidAction(action);
        return this._data[action] = $.extend(true, {}, this._actions[action].verzuim);
      };

      Comm.prototype.set = function(action, key, val) {
        this._isValidAction(action);
        return this._data[action][key] = val;
      };

      Comm.prototype.unset = function(action, key) {
        this._isValidAction(action);
        return delete this._data[action][key];
      };

      /*
      		customize bind
      */


      Comm.prototype.on = function(action, result, fn) {
        this._isValidAction(action);
        return _super.prototype.on.call(this, fullEventName(action, result), fn);
      };

      Comm.prototype.off = function(action, result, fn) {
        this._isValidAction(action);
        return _super.prototype.off.call(this, fullEventName(action, result), fn);
      };

      Comm.prototype.pull = function(type, fn) {
        return _super.prototype.on.call(this, fullPulltopName(type), fn);
      };

      Comm.prototype.unpull = function(type, fn) {
        return _super.prototype.off.call(this, fullPulltopName(type), fn);
      };

      /*
      		utils
      */


      Comm.prototype._isValidAction = function(action) {
        if (!this._actions.hasOwnProperty(action)) {
          throw "action: " + action + " isn't defined";
        }
      };

      return Comm;

    })(EventDispatcher);
    /*
    	templates
    */

    fullEventName = function(action, result) {
      return "action:" + action + "." + result;
    };
    fullPulltopName = function(type) {
      return "pull:" + type;
    };
    return Comm;
  });

}).call(this);
