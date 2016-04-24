'use strict';

System.register(['app/plugins/sdk', 'moment', 'lodash', './css/clock-panel.css!', './haproxy'], function (_export, _context) {
  var PanelCtrl, moment, _, parseStatLine, parseStatsData, _createClass, panelDefaults, HaproxyCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_cssClockPanelCss) {}, function (_haproxy) {
      parseStatLine = _haproxy.parseStatLine;
      parseStatsData = _haproxy.parseStatsData;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        clockType: '24 hour',
        offsetFromUtc: null,
        offsetFromUtcMinutes: null,
        bgColor: null,
        timeSettings: {
          customFormat: 'HH:mm:ss',
          fontSize: '60px',
          fontWeight: 'normal'
        },
        haproxySettings: {
          url: '/stats/;csv',
          backendName: '',
          serverName: '',
          showStatus: true,
          showWeight: true
        }
      };

      _export('HaproxyCtrl', HaproxyCtrl = function (_PanelCtrl) {
        _inherits(HaproxyCtrl, _PanelCtrl);

        function HaproxyCtrl($scope, $injector) {
          _classCallCheck(this, HaproxyCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HaproxyCtrl).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.timeSettings, panelDefaults.timeSettings);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.update();
          return _this;
        }

        _createClass(HaproxyCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/grafana-haproxy-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'update',
          value: function update() {
            this.renderPanel();
            this.nextTickPromise = this.$timeout(this.update.bind(this), 1000);
          }
        }, {
          key: 'renderPanel',
          value: function renderPanel() {
            var _this2 = this;

            $.get(this.panel.haproxySettings.url).done(this.renderStats.bind(this)).done(this.renderTime.bind(this)).fail(function (error) {
              _this2.error = error;
            });

            this.render();
          }
        }, {
          key: 'renderStats',
          value: function renderStats(data) {
            this.error = void 0;
            var statsData = parseStatsData(data);
            var svNameToMatch = this.panel.haproxySettings.serverName;
            var backend = statsData.find(function (d) {
              return d.svname === svNameToMatch;
            });

            this.server = backend ? backend : {
              svname: this.panel.haproxySettings.serverName,
              status: 'Not found in Haproxy stats output'
            };
          }
        }, {
          key: 'renderTime',
          value: function renderTime() {
            var now = void 0;

            if (this.panel.offsetFromUtc && this.panel.offsetFromUtcMinutes) {
              var offsetInMinutes = parseInt(this.panel.offsetFromUtc, 10) * 60 + parseInt(this.panel.offsetFromUtcMinutes, 10);
              now = moment().utcOffset(offsetInMinutes);
            } else if (this.panel.offsetFromUtc && !this.panel.offsetFromUtcMinutes) {
              now = moment().utcOffset(parseInt(this.panel.offsetFromUtc, 10));
            } else {
              now = moment();
            }

            this.time = now.format(this.getTimeFormat());
          }
        }, {
          key: 'getTimeFormat',
          value: function getTimeFormat() {
            if (this.panel.clockType === '24 hour') {
              return 'HH:mm:ss';
            }

            if (this.panel.clockType === '12 hour') {
              return 'h:mm:ss A';
            }

            return this.panel.timeSettings.customFormat;
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            var _this3 = this;

            this.events.on('render', function () {
              var $panelContainer = elem.find('.panel-container');

              if (_this3.panel.bgColor) {
                $panelContainer.css('background-color', _this3.panel.bgColor);
              } else {
                $panelContainer.css('background-color', '');
              }
            });
          }
        }]);

        return HaproxyCtrl;
      }(PanelCtrl));

      _export('HaproxyCtrl', HaproxyCtrl);

      HaproxyCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=haproxy_ctrl.js.map
