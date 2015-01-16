$(document).ready(function() {
    adjust_div_heights();
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({'delay': 50});
    json_key_chart_map = init_charts();
    $('.dropdown-button').dropdown({
        constrain_width: false,
        hover: false
    });
    register_command_links();

    start_updating_status_data(json_key_chart_map);
});

$(window).resize(function() {
    adjust_div_heights();
});

function register_command_links(){
    $('.magnetorquer-command').click(function(event){
        target_element = $(event.target);
        console.log(target_element.data('axis'));
        console.log(target_element.data('command'));
        $.ajax({
            dataType : 'json',
            url: "torquer_command",
            cache: false,
            data: {
                axis: target_element.data('axis'),
                comamnd: target_element.data('command')
            }
        });
        event.preventDefault();
    });
    $('.rxn-wheel-command').click(function(event){
        target_element = $(event.target);
        console.log(target_element.data('axis'));
        console.log(target_element.data('command'));
        $.ajax({
            dataType : 'json',
            url: "rxn_wheel_command",
            cache: false,
            data: {
                axis: target_element.data('axis'),
                comamnd: target_element.data('command')
            }
        });
        event.preventDefault();
    });
    $('.update-images-command').click(function(event){
        target_element = $(event.target);
        $.ajax({
            dataType : 'json',
            url: "image_command",
            cache: false,
            success: function(json){
                console.log(json);
            }
        });
        event.preventDefault();
    })
}

function adjust_div_heights() {
    fill_remaining_height(".panel", ".panel-header", ".panel-content");
    fill_remaining_height(".panel-content", ".status-overview-panel-header", ".tab-content");
}

function fill_remaining_height(parent_div_selector, top_div_selector, div_selector) {
    parents = $(parent_div_selector);
    for (i=0; i < parents.length; i++) {
        parent = parents.eq(i);
        parent_height = parent.height();
        top_div_height = parent.find(top_div_selector).height();
        parent.find(div_selector).height(parent_height - top_div_height);
    }
}

function update_feed(text) {
    d = new Date();
    var timestring = d.toTimeString().substring(0, 8);
    add_com_history_item(timestring, text);
}

const TELEM_BEACON = "Telemetry Beacon Received";

function add_com_history_item(time, text) {
    $('#com-history-items').prepend(generate_com_history_item(time, text));
}

function generate_com_history_item(time, text) {
    var com_history_item = '<div class="com-history-item">';
    com_history_item += '<div class="com-history-item-time">';
    com_history_item += time;
    com_history_item += '</div>';
    com_history_item += '<div class="com-history-item-content">';
    com_history_item += text;
    com_history_item += '</div>';
    com_history_item += '</div>';
    return com_history_item;
}

function start_updating_status_data(key_map) {
    (function get_beacon_data() {
        $.ajax({
            dataType : 'json',
            url: "beacon_update",
            cache: false,
            success: function(json) {
                handle_beacon_data(json);
                update_feed(TELEM_BEACON);
                setTimeout(get_beacon_data, 500);
            },
            error: function(json,string,opt){
                console.log(json);
                console.log(string);
                console.log(opt);
            }
        });
    })();

    const system_time_selector = "#system-time";
    const gps_latitude_selector = "#latitude";
    const gps_longitude_selector = "#longitude";

    // adjust system time, gps coords, charts, and last updated time
    function handle_beacon_data(beacon_data) {
        if (beacon_data.hasOwnProperty('adc')) {
            adc_data = beacon_data.adc;
            if (adc_data.hasOwnProperty('latitude')) {
                $(gps_latitude_selector).html(adc_data.latitude + '&deg;');
            }
            if (adc_data.hasOwnProperty('longitude')) {
                $(gps_longitude_selector).html(adc_data.longitude + '&deg;');
            }
        } else {
            console.log("Beacon data does not contain ADC data");
        }
        var datetime = null;
        if (beacon_data.hasOwnProperty('timestamp')) {
            adjusted_timestamp = adjust_beacon_timestamp(beacon_data.timestamp);
            datetime = new Date(adjusted_timestamp);
            $(system_time_selector).html(
                datetime.toTimeString().substring(0,8)
            );
            var updated_charts_set = new Set();
            for (category in beacon_data) {
                for (key in beacon_data[category]) {
                    if (key_map.hasOwnProperty(category) && key_map[category].hasOwnProperty(key)) {

                        if (key_map[category][key].hasOwnProperty('table-value-id')) {
                            $("#" + key_map[category][key]['table-value-id']).html(beacon_data[category][key]);
                        }

                        if (key == 'ack') {
                            ack_rate = 100 * (beacon_data[category][key] /
                                    (beacon_data[category]['nack'] + beacon_data[category][key]));
                            add_chart_data_point(key_map[category][key], ack_rate);
                        } else {
                            add_chart_data_point(key_map[category][key], beacon_data[category][key]);
                        }
                        updated_charts_set.add(key_map[category][key].chart);
                    }
                }
            }
            var updated_charts_array = set_to_array(updated_charts_set);
            add_time_values_to_charts(updated_charts_array, datetime);
            for (index in updated_charts_array) {
                updated_charts_array[index].reload();
            }
            current_datetime = new Date();
            $("#last-updated-time").html(current_datetime.toTimeString().substring(0, 8));
        }
    }

    function add_chart_data_point(key_mapping, value) {
        if (key_mapping.gauge) {
            key_mapping.chart.setValue(key_mapping.columnName, value);
        } else {
            key_mapping.chart.addValue(key_mapping.columnName, value);
        }
    }

    function add_time_values_to_charts(charts, datetime) {
        for (index in charts) {
            console.log(charts[index].c3ChartObject);
            if (charts[index].chartSpecs.data.x == 'time') {
                charts[index].addValue('time', datetime);
            }
        }
    }
}

function set_to_array(set) {
    var iterator = set.values();
    var ret = [];
    while(!(i = iterator.next()).done) {
        ret.push(i.value);
    }
    return ret;
}

// Add back constant value that was subtracted on the server
function adjust_beacon_timestamp(timestamp) {
    const adjustment = 0;
    return timestamp + adjustment;
}

// Creates charts and returns a mapping of json keys to chart objects and column names
function init_charts() {

    function Chart(chartSpecs, maxVisibleDataPoints) {
        this.chartSpecs = chartSpecs;
        this.selector = chartSpecs.bindto;
        this.c3ChartObject = {};
        this.columns = this.chartSpecs.data.columns;
        this.maxVisibleDataPoints = maxVisibleDataPoints || 6
    }
    Chart.prototype.generate = function() {
        this.c3ChartObject = c3.generate(this.chartSpecs);
    };
    Chart.prototype.resize = function(size) {
        return this.c3ChartObject.resize(size);
    };
    Chart.prototype.addValue = function(columnName, value) {
        this.getColumn(columnName).push(value)
    };
    Chart.prototype.setValue = function(columnName, value) {
        this.getColumn(columnName)[1] = value;
    };
    Chart.prototype.visibleColumns = function() {
        var visibleColumns = [];
        for (index in this.columns) {
            var columnName = this.columns[index][0];
            var visibleDataPoints = this.columns[index].slice(Math.max(1, this.columns[index].length - this.maxVisibleDataPoints),
                                                              this.columns[index].length);
            var visibleColumn = [columnName].concat(visibleDataPoints);
            visibleColumns.push(visibleColumn);
        }
        return visibleColumns
    };
    Chart.prototype.getColumn = function(columnName) {
        for (index in this.columns) {
            if (this.columns[index][0] == columnName) {
                return this.columns[index];
            }
        }
        return undefined;
    };
    Chart.prototype.reload = function() {
        this.c3ChartObject.load({
            columns: this.visibleColumns()
        })
    };

    size_refreshing_charts = [];

    var cpu_usage_chart = new Chart({
        bindto: '#cpu-usage-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Usage']
            ],
            types: {
                Usage: 'area-step'
            }
        },
        axis: {
            y: {
                label: {
                    text: 'CPU Usage',
                    position: 'outer-middle'
                },
                max: 1.0,
                min: 0,
                tick: {
                    format: d3.format(",%"),
                    values: [0, .25, .5, .75, 1.0]
                },
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                },
                padding: {
                    left: 0
                }
            }
        },
        padding: {
            right: 20
        },
        legend: {
            show: false
        }
    });
    cpu_usage_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = cpu_usage_chart;

    var mem_usage_chart = new Chart({
        bindto: '#mem-usage-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Usage']
            ],
            types: {
                Usage: 'area-step'
            }
        },
        axis: {
            y: {
                label: {
                    text: 'Mem Usage',
                    position: 'outer-middle'
                },
                max: 1.0,
                min: 0,
                tick: {
                    format: d3.format(",%"),
                    values: [0, .25, .5, .75, 1.0]
                },
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                },
                padding: {
                    left: 0
                }
            }
        },
        padding: {
            right: 20
        },
        legend: {
            show: false
        }
    });
    mem_usage_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = mem_usage_chart;

    var storage_usage_chart = new Chart({
        bindto: '#storage-usage-chart',
        data: {
            columns: [
                ['Storage Used']
            ],
            type: 'gauge'
        },
        color: {
            pattern: ['#60B044', '#F6C600', '#F97600', '#FF0000'],
            threshold: {
                values: [30, 60, 90, 100]
            }
        },
        gauge: {
            label: {
                show: false
            }
        }
    });
    storage_usage_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = storage_usage_chart;

    var battery_voltage_chart = new Chart({
        bindto: '#battery-voltage-gauge-chart',
        data: {
            columns: [
                ['Voltage']
            ],
            type: 'gauge'
        },
        color: {
            pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
            threshold: {
                values: [30, 60, 90, 100]
            }
        },
        size: {
            height: 100
        },
        gauge: {
            label: {
                show: false
            }
        }
    });
    battery_voltage_chart.generate();

    var visible_cam_temp_chart = new Chart({
        bindto: '#visible-cam-temp-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Camera'],
                ['Lens 1'],
                ['Lens 2']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Temperature (\u2103)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    visible_cam_temp_chart.generate();
    $('#visible-cam-temp-chart').data('c3', visible_cam_temp_chart);
    size_refreshing_charts[size_refreshing_charts.length] = visible_cam_temp_chart;

    var infrared_cam_temp_chart = new Chart({
        bindto: '#infrared-cam-temp-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Camera'],
                ['Lens 1'],
                ['Lens 2']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Temperature (\u2103)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    infrared_cam_temp_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = infrared_cam_temp_chart;

    var other_parts_temp_chart = new Chart({
        bindto: '#other-parts-temp-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Battery'],
                ['Reaction Wheels'],
                ['CSK Stack'],
                ['Edison Stack']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Temperature (\u2103)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {  
                    format: "%H:%M:%S"  
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    other_parts_temp_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = other_parts_temp_chart;

    var solar_panel_temp_chart = new Chart({
        bindto: '#solar-panel-temp-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Top Panel 1'],
                ['Top Panel 2']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Temperature (\u2103)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    solar_panel_temp_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = solar_panel_temp_chart;

    var solar_panel_current_chart = new Chart({
        bindto: '#solar-panel-current-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Top Panel 1'],
                ['Top Panel 2']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Current (mA)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    solar_panel_current_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = solar_panel_current_chart;

    var solar_panel_voltage_chart = new Chart({
        bindto: '#solar-panel-voltage-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Top Panel 1'],
                ['Top Panel 2']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Voltage (V)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    solar_panel_voltage_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = solar_panel_voltage_chart;

    var battery_current_chart = new Chart({
        bindto: '#battery-current-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['5V'],
                ['3V3'],
                ['12V']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Current (mA)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    battery_current_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = battery_current_chart;

    var device_current_chart = new Chart({
        bindto: '#device-current-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Reaction Wheels'],
                ['Visible Camera'],
                ['Infrared Camera']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Current (mA)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    device_current_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = device_current_chart;

    var reaction_wheel_torque_chart = new Chart({
        bindto: '#reaction-wheel-torque-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['X'],
                ['Y'],
                ['Z']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Torque (N * m)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    reaction_wheel_torque_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = reaction_wheel_torque_chart;

    var magnetometer_reading_chart = new Chart({
        bindto: '#magnetometer-reading-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['X'],
                ['Y'],
                ['Z']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Magnetic Flux (\u00B5T)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    magnetometer_reading_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = magnetometer_reading_chart;

    var magnetorquer_current_chart = new Chart({
        bindto: '#magnetorquer-current-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['X'],
                ['Y'],
                ['Z']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'Current (mA)',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    magnetorquer_current_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = magnetorquer_current_chart;

    var rssi_chart = new Chart({
        bindto: '#rssi-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['RSSI']
            ]
        },
        axis: {
            y: {
                label: {
                    text: 'RSSI (dBm)',
                    position: 'outer-middle'
                },
                padding: {
                    top: 0,
                    bottom: 0
                },
                tick: {
                    max: 0
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: "%H:%M:%S"
                },
                label: {
                    text: 'System Time',
                    position: 'outer-center'
                }
            }
        },
        padding: {
            right: 20
        }
    });
    rssi_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = rssi_chart;

    var packet_ack_rate_chart = new Chart({
        bindto: '#packet-ack-rate-chart',
        data: {
            columns: [
                ['Ack Rate']
            ],
            type: 'gauge'
        },
        color: {
            pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
            threshold: {
                values: [30, 60, 90, 100]
            }
        },
        gauge: {
            label: {
                show: false
            }
        }
    });
    packet_ack_rate_chart.generate();

    // disable x axis clipping
    d3.select('.c3-axis.c3-axis-x').attr('clip-path', "");

    resize_charts(size_refreshing_charts);
    $(document).on('tabChange', function() {
        resize_charts(size_refreshing_charts);
    });
    $(window).resize(function() {
        resize_charts(size_refreshing_charts);
    });

    return {
            "thermal": {
                "vis_cam": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Camera",
                    "gauge": false,
                    "table-value-id": "vis-cam-temp-camera-value"
                },
                "vis_lens_1": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Lens 1",
                    "gauge": false,
                    "table-value-id": "vis-cam-temp-lens1-value"
                },
                "vis_lens_2": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Lens 2",
                    "gauge": false,
                    "table-value-id": "vis-cam-temp-lens2-value"
                },
                "inf_cam": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Camera",
                    "gauge": false,
                    "table-value-id": "inf-cam-temp-camera-value"
                },
                "inf_lens_1": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Lens 1",
                    "gauge": false,
                    "table-value-id": "inf-cam-temp-lens1-value"
                },
                "inf_lens_2": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Lens 2",
                    "gauge": false,
                    "table-value-id": "inf-cam-temp-lens2-value"
                },
                "rxn_wheels": {
                    "chart": other_parts_temp_chart,
                    "columnName": "Reaction Wheels",
                    "gauge": false,
                    "table-value-id": "other-part-temp-rxn-value"
                },
                "battery": {
                    "chart": other_parts_temp_chart,
                    "columnName": "Battery",
                    "gauge": false,
                    "table-value-id": "other-part-temp-battery-value"
                },
                "csk_stack": {
                    "chart": other_parts_temp_chart,
                    "columnName": "CSK Stack",
                    "gauge": false,
                    "table-value-id": "other-part-temp-csk-value"
                },
                "edison_stack": {
                    "chart": other_parts_temp_chart,
                    "columnName": "Edison Stack",
                    "gauge": false,
                    "table-value-id": "other-part-temp-edison-value"
                },
                "top1_panel": {
                    "chart": solar_panel_temp_chart,
                    "columnName": "Top Panel 1",
                    "gauge": false,
                    "table-value-id": "solar-panel-temp-1-value"
                },
                "top2_panel": {
                    "chart": solar_panel_temp_chart,
                    "columnName": "Top Panel 2",
                    "gauge": false,
                    "table-value-id": "solar-panel-temp-2-value"
                }
            },
            "power": {
                "top1_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "Top Panel 1",
                    "gauge": false,
                    "table-value-id": "solar-panel-current-1-value"
                },
                "top2_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "Top Panel 2",
                    "gauge": false,
                    "table-value-id": "solar-panel-current-2-value"
                },
                "top1_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "Top Panel 1",
                    "gauge": false,
                    "table-value-id": "solar-panel-voltage-1-value"
                },
                "top2_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "Top Panel 2",
                    "gauge": false,
                    "table-value-id": "solar-panel-voltage-2-value"
                },
                "battery_voltage": {
                    "chart": battery_voltage_chart,
                    "columnName": "Voltage",
                    "gauge": true
                },
                "5v_current": {
                    "chart": battery_current_chart,
                    "columnName": "5V",
                    "gauge": false,
                    "table-value-id": "bus-current-5v-value"
                },
                "3v3_current": {
                    "chart": battery_current_chart,
                    "columnName": "3V3",
                    "gauge": false,
                    "table-value-id": "bus-current-3v3-value"
                },
                "12v_current": {
                    "chart": battery_current_chart,
                    "columnName": "12V",
                    "gauge": false,
                    "table-value-id": "bus-current-12v-value"
                },
                "rxn_current": {
                    "chart": device_current_chart,
                    "columnName": "Reaction Wheels",
                    "gauge": false,
                    "table-value-id": "device-current-rxn-value"
                },
                "vis_cam_current": {
                    "chart": device_current_chart,
                    "columnName": "Visible Camera",
                    "gauge": false,
                    "table-value-id": "device-current-vis-value"
                },
                "inf_cam_current": {
                    "chart": device_current_chart,
                    "columnName": "Infrared Camera",
                    "gauge": false,
                    "table-value-id": "device-current-inf-value"
                }
            },
            "adc": {
                "rxn_x_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "X",
                    "gauge": false,
                    "table-value-id": "rxn-torque-x-value"
                },
                "rxn_y_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "Y",
                    "gauge": false,
                    "table-value-id": "rxn-torque-y-value"
                },
                "rxn_z_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "Z",
                    "gauge": false,
                    "table-value-id": "rxn-torque-z-value"
                },
                "magnetometer_x": {
                    "chart": magnetometer_reading_chart,
                    "columnName": "X",
                    "gauge": false
                },
                "magnetometer_y": {
                    "chart": magnetometer_reading_chart,
                    "columnName": "Y",
                    "gauge": false
                },
                "magnetometer_z": {
                    "chart": magnetometer_reading_chart,
                    "columnName": "Z",
                    "gauge": false
                },
                "magnetorquer_x_current": {
                    "chart": magnetorquer_current_chart,
                    "columnName": "X",
                    "gauge": false,
                    "table-value-id": "torquer-current-x-value"
                },
                "magnetorquer_y_current": {
                    "chart": magnetorquer_current_chart,
                    "columnName": "Y",
                    "gauge": false,
                    "table-value-id": "torquer-current-y-value"
                },
                "magnetorquer_z_current": {
                    "chart": magnetorquer_current_chart,
                    "columnName": "Z",
                    "gauge": false,
                    "table-value-id": "torquer-current-z-value"
                }
            },
            "cdh": {
                "cpu_usage": {
                    "chart": cpu_usage_chart,
                    "columnName": "Usage",
                    "gauge": false,
                    "table-value-id": "cpu-usage-value"
                },
                "memory_usage": {
                    "chart": mem_usage_chart,
                    "columnName": "Usage",
                    "gauge": false,
                    "table-value-id": "mem-usage-value"
                },
                "storage_usage": {
                    "chart": storage_usage_chart,
                    "columnName": "Storage Used",
                    "gauge": true
                }
            },
            "com": {
                "rssi": {
                    "chart": rssi_chart,
                    "columnName": "RSSI",
                    "gauge": false,
                    "table-value-id": "rssi-value"
                },
                "ack": {
                    "chart": packet_ack_rate_chart,
                    "columnName": "Ack Rate",
                    "gauge": true
                }
            }
        };
}

function resize_charts(chart_list) {
    for (i=0; i < chart_list.length; i++) {
        var chart_element = $(chart_list[i].selector);
        var parent = chart_element.parent();
        chart_list[i].resize({width: (parent.width() *.95)});
    }
}



