$(document).ready(function() {
    adjust_div_heights();
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({'delay': 50});
    init_charts();
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

function init_charts() {

    ChartType = {
        LINE : 'line',
        STEP : 'step',
        AREA_STEP : 'area-step',
        GAUGE : 'gauge'
    };

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
                ['data', 91.4]
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
                ['Storage Used', 84]
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
    visible_cam_temp_chart.generate();
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

    setTimeout(function() {
        visible_cam_temp_chart.addValue('time', 15);
        visible_cam_temp_chart.addValue('Camera', 90);
        visible_cam_temp_chart.addValue('Lens 1', 88);
        visible_cam_temp_chart.addValue('Lens 2', 78);
        visible_cam_temp_chart.reload();
        }, 2000);

    resize_charts(size_refreshing_charts);
    $(document).on('tabChange', function() {
        resize_charts(size_refreshing_charts);
    });
    $(window).resize(function() {
        resize_charts(size_refreshing_charts);
    });

}

function resize_charts(chart_list) {
    for (i=0; i < chart_list.length; i++) {
        var chart_element = $(chart_list[i].selector);
        var parent = chart_element.parent();
        chart_list[i].resize({width: (parent.width() *.95)});
    }
}



