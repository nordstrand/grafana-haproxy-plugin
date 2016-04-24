'use strict';

System.register([], function (_export, _context) {

  function parseStatLine(line) {
    var fields = 'pxname,svname,qcur,qmax,scur,smax,slim,stot,bin,bout,dreq,dresp,ereq,econ,eresp,wretr,wredis,status,weight,act,bck,chkfail,chkdown,lastchg,downtime,qlimit,pid,iid,sid,throttle,lbtot,tracked,type,rate,rate_lim,rate_max,check_status,check_code,check_duration,hrsp_1xx,hrsp_2xx,hrsp_3xx,hrsp_4xx,hrsp_5xx,hrsp_other,hanafail,req_rate,req_rate_max,req_tot,cli_abrt,srv_abrt,comp_in,comp_out,comp_byp,comp_rsp,lastsess,last_chk,last_agt,qtime,ctime,rtime,ttime,'.split(',');

    var obj = {};
    line.split(',').forEach(function (data, idx) {
      obj[fields[idx]] = data;
    });

    return obj;
  }
  return {
    setters: [],
    execute: function () {
      function parseStatsData(data) {
        var splitData = data.split('\n');
        var lines = splitData.slice(1, splitData.length - 2);

        return lines.map(parseStatLine);
      }
      _export('parseStatsData', parseStatsData);
    }
  };
});
//# sourceMappingURL=haproxy.js.map
