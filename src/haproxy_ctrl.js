import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/clock-panel.css!';

import { parseStatLine, parseStatsData } from './haproxy';

const panelDefaults = {
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

export class HaproxyCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.update();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-haproxy-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  update() {
    this.renderPanel();
    this.nextTickPromise = this.$timeout(this.update.bind(this), 1000);
  }

  renderPanel() {
    $.get(this.panel.haproxySettings.url)
    .done(this.renderStats.bind(this))
    .done(this.renderTime.bind(this))
    .fail((error) => { this.error = error; });

    this.render();
  }

  renderStats(data) {
    this.error = void 0;
    var statsData = parseStatsData(data);
    const svNameToMatch = this.panel.haproxySettings.serverName;
    var backend = statsData.find(d => d.svname === svNameToMatch);

    this.server = backend ? backend : {
      svname: this.panel.haproxySettings.serverName,
      status: 'Not found in Haproxy stats output'
    };
  }

  renderTime() {
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
