$(document).ready(function() {
    adjust_div_heights();
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({'delay': 50});
    json_key_chart_map = init_charts();
});

$(window).resize(function() {
    adjust_div_heights();
//    resize_charts();
});

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

// Creates charts and returns a mapping of json keys to chart objects and column names
function init_charts() {

    function Chart(chartSpecs) {
        this.chartSpecs = chartSpecs;
        this.selector = chartSpecs.bindto;
        this.c3ChartObject = {};
        this.columns = this.chartSpecs.data.columns;
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
            columns: this.columns
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
                    left: 0,
                    right: 1
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
                    left: 0,
                    right: 1
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
                ['Storage Used', 91.4]
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
                ['Voltage', 84]
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
                },
                padding: {
                    right: 1
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
                },
                padding: {
                    right: 1
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
                ['X Panel'],
                ['-X Panel'],
                ['Y Panel'],
                ['-Y Panel'],
                ['Z Panel'],
                ['-Z Panel']
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
                },
                padding: {
                    right: 1
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
                ['X Panel'],
                ['-X Panel'],
                ['Y Panel'],
                ['-Y Panel'],
                ['Z Panel'],
                ['-Z Panel']
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
                },
                padding: {
                    right: 1
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
                ['X Panel'],
                ['-X Panel'],
                ['Y Panel'],
                ['-Y Panel'],
                ['Z Panel'],
                ['-Z Panel']
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
                },
                padding: {
                    right: 1
                }
            }
        },
        padding: {
            right: 20
        }
    });
    solar_panel_voltage_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = solar_panel_voltage_chart;

    battery_current_chart = new Chart({
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
                },
                padding: {
                    right: 1
                }
            }
        },
        padding: {
            right: 20
        }
    });
    battery_current_chart.generate();
    size_refreshing_charts[size_refreshing_charts.length] = battery_current_chart;

    device_current_chart = new Chart({
        bindto: '#device-current-chart',
        data: {
            x: 'time',
            columns: [
                ['time'],
                ['Reaction Wheel'],
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
                },
                padding: {
                    right: 1
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
                },
                padding: {
                    right: 1
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
                },
                padding: {
                    right: 1
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
                },
                padding: {
                    right: 1
                }
            }
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
                },
                padding: {
                    right: 1
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
                ['Ack Rate', 85.9]
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

    var time1 = 1421192626000;
    setTimeout(function() {
        // time is in milliseconds since 19:00:00 Dec 31 1969
        visible_cam_temp_chart.addValue('time', time1);
        visible_cam_temp_chart.addValue('Camera', 90);
        visible_cam_temp_chart.addValue('Lens 1', 88);
        visible_cam_temp_chart.addValue('Lens 2', 78);
        visible_cam_temp_chart.reload();
        }, 500);

    setTimeout(function() {
        // time is in milliseconds since 19:00:00 Dec 31 1969
        visible_cam_temp_chart.addValue('time', time1 + 10000);
        visible_cam_temp_chart.addValue('Camera', 90);
        visible_cam_temp_chart.addValue('Lens 1', 88);
        visible_cam_temp_chart.addValue('Lens 2', 78);
        visible_cam_temp_chart.reload();
        }, 1500);

    setTimeout(function() {
        // time is in milliseconds since 19:00:00 Dec 31 1969
        visible_cam_temp_chart.addValue('time', time1 + 20000);
        visible_cam_temp_chart.addValue('Camera', 90);
        visible_cam_temp_chart.addValue('Lens 1', 88);
        visible_cam_temp_chart.addValue('Lens 2', 78);
        visible_cam_temp_chart.reload();
        }, 2500);

    setTimeout(function() {
        battery_voltage_chart.setValue('Voltage', 91);
        battery_voltage_chart.reload();
    }, 1000);

    resize_charts(size_refreshing_charts);
    $(document).on('tabChange', function() {
        resize_charts(size_refreshing_charts);
    });
    $(window).resize(function() {
        resize_charts(size_refreshing_charts);
    });

    const json_key_mapping = [
        {
            "thermal": {
                "vis_cam": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Camera",
                    "gauge": false
                },
                "vis_lens_1": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Lens 1",
                    "gauge": false
                },
                "vis_lens_2": {
                    "chart": visible_cam_temp_chart,
                    "columnName": "Lens 2",
                    "gauge": false
                },
                "inf_cam": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Camera",
                    "gauge": false
                },
                "inf_lens_1": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Lens 1",
                    "gauge": false
                },
                "inf_lens_2": {
                    "chart": infrared_cam_temp_chart,
                    "columnName": "Lens 2",
                    "gauge": false
                },
                "rxn_wheels": {
                    "chart": other_parts_temp_chart,
                    "columnName": "Reaction Wheels",
                    "gauge": false
                }
            }
        },
        {
            "power": {
                "+x_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "X Panel",
                    "gauge": false
                },
                "-x_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "-X Panel",
                    "gauge": false
                },
                "+y_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "Y Panel",
                    "gauge": false
                },
                "-y_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "-Y Panel",
                    "gauge": false
                },
                "+z_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "Z Panel",
                    "gauge": false
                },
                "-z_current": {
                    "chart": solar_panel_current_chart,
                    "columnName": "-Z Panel",
                    "gauge": false
                },
                "+x_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "X Panel",
                    "gauge": false
                },
                "-x_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "-X Panel",
                    "gauge": false
                },
                "+y_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "Y Panel",
                    "gauge": false
                },
                "-y_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "-Y Panel",
                    "gauge": false
                },
                "+z_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "Z Panel",
                    "gauge": false
                },
                "-z_voltage": {
                    "chart": solar_panel_voltage_chart,
                    "columnName": "-Z Panel",
                    "gauge": false
                },
                "battery_voltage": {
                    "chart": battery_voltage_chart,
                    "columnName": "Voltage",
                    "gauge": true
                },
                "5v_current": {
                    "chart": battery_current_chart,
                    "columnName": "5V",
                    "gauge": false
                },
                "3v3_current": {
                    "chart": battery_current_chart,
                    "columnName": "3V3",
                    "gauge": false
                },
                "12v_current": {
                    "chart": battery_current_chart,
                    "columnName": "12V",
                    "gauge": false
                },
                "rxn_current": {
                    "chart": device_current_chart,
                    "columnName": "Reaction Wheels",
                    "gauge": false
                },
                "vis_cam_current": {
                    "chart": device_current_chart,
                    "columnName": "Visible Camera",
                    "gauge": false
                },
                "inf_cam_current": {
                    "chart": device_current_chart,
                    "columnName": "Infrared Camera",
                    "gauge": false
                }
            }
        },
        {
            "adc": {
                "rxn_x_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "X",
                    "gauge": false
                },
                "rxn_y_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "Y",
                    "gauge": false
                },
                "rxn_z_torque": {
                    "chart": reaction_wheel_torque_chart,
                    "columnName": "Z",
                    "gauge": false
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
                    "gauge": false
                },
                "magnetorquer_y_current": {
                    "chart": magnetorquer_current_chart,
                    "columnName": "Y",
                    "gauge": false
                },
                "magnetorquer_z_current": {
                    "chart": magnetorquer_current_chart,
                    "columnName": "Z",
                    "gauge": false
                }
            },
            "cdh": {
                "cpu_usage": {
                    "chart": cpu_usage_chart,
                    "columnName": "Usage",
                    "gauge": false
                },
                "memory_usage": {
                    "chart": mem_usage_chart,
                    "columnName": "Usage",
                    "gauge": false
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
                    "gauge": false
                },
                "ack": {
                    "chart": packet_ack_rate_chart,
                    "columnName": "Ack Rate",
                    "gauge": true
                }
            }
        }
    ];

}

function resize_charts(chart_list) {
    for (i=0; i < chart_list.length; i++) {
        var chart_element = $(chart_list[i].selector);
        var parent = chart_element.parent();
        chart_list[i].resize({width: (parent.width() *.95)});
    }
}



