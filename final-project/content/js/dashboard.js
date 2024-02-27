/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 71.66666666666667, "KoPercent": 28.333333333333332};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.475, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5166666666666667, 500, 1500, "POST REGISTER"], "isController": false}, {"data": [0.43333333333333335, 500, 1500, "Get Single User"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120, 34, 28.333333333333332, 1052.3999999999999, 272, 25620, 606.0, 1502.4000000000005, 2468.9499999999985, 21404.45999999984, 1.9335191660087332, 1.962990857072652, 0.3342118089683064], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST REGISTER", 60, 0, 0.0, 708.3166666666666, 494, 3684, 606.0, 918.7, 1320.6999999999996, 3684.0, 0.974310675197298, 0.8545040809408593, 0.18839210321197752], "isController": false}, {"data": ["Get Single User", 60, 34, 56.666666666666664, 1396.4833333333331, 272, 25620, 693.0, 2308.0999999999995, 3655.4499999999953, 25620.0, 0.9754352879972688, 1.125116340979662, 0.1486014696558339], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,354 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 881 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,511 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,532 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,607 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,895 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,307 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,066 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 25,620 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 972 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 2,475 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,320 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,296 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 2,638 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,415 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 588 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 903 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 5,546 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,290 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 3,709 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,056 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 798 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,303 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,147 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,663 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,095 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,388 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 504 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 507 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,210 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 825 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,387 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 544 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,014 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.9411764705882355, 0.8333333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120, 34, "The operation lasted too long: It took 2,354 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 881 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,511 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,532 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,607 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Get Single User", 60, 34, "The operation lasted too long: It took 2,354 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 881 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,511 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,532 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,607 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
