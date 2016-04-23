import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/clock-panel.css!';

import { parseStatLine, parseStatsData } from './haproxy';

const panelDefaults = {
  mode: 'time',
  clockType: '24 hour',
  offsetFromUtc: null,
  offsetFromUtcMinutes: null,
  bgColor: null,
  countdownSettings: {
    endCountdownTime: moment().seconds(0).milliseconds(0).add(1, 'day').toDate(),
    endText: '00:00:00'
  },
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

export class HaproxyCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);

    if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    }

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.updateClock();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-haproxy-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  updateClock() {
    if (this.panel.mode === 'time') {
      this.renderTime();
    } else {
      this.renderCountdown();
    }

    this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 1000);
  }

  renderTime() {
      var that = this;
    $.get(this.panel.haproxySettings.url)
      .done(function( data ) { 
        //console.log(data); 
        that.error = void 0;
        var statsData = parseStatsData(data);
        var backend = statsData.find( d => { return d.svname === that.panel.haproxySettings.serverName });

        that.server = backend ? backend : {
          svname: that.panel.haproxySettings.serverName,
          status: 'Not found in Haproxy stats output'
        };
    })
    .fail(function(error) {
      that.error = error;
    });

    console.log("DH")
    let now;

    if (this.panel.offsetFromUtc && this.panel.offsetFromUtcMinutes) {
      const offsetInMinutes = (parseInt(this.panel.offsetFromUtc, 10) * 60) + parseInt(this.panel.offsetFromUtcMinutes, 10);
      now = moment().utcOffset(offsetInMinutes);
    } else if (this.panel.offsetFromUtc && !this.panel.offsetFromUtcMinutes) {
      now = moment().utcOffset(parseInt(this.panel.offsetFromUtc, 10));
    } else {
      now = moment();
    }

    this.time = now.format(this.getTimeFormat());
    this.render();
  }

  getTimeFormat() {
    if (this.panel.clockType === '24 hour') {
      return 'HH:mm:ss';
    }

    if (this.panel.clockType === '12 hour') {
      return 'h:mm:ss A';
    }

    return this.panel.timeSettings.customFormat;
  }

  link(scope, elem) {
    this.events.on('render', () => {
      const $panelContainer = elem.find('.panel-container');

      if (this.panel.bgColor) {
        $panelContainer.css('background-color', this.panel.bgColor);
      } else {
        $panelContainer.css('background-color', '');
      }
    });
  }
}

HaproxyCtrl.templateUrl = 'module.html';
