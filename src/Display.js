const blessed = require('blessed');
const contrib = require('blessed-contrib');
const dataSender = require('./DataSender');
const Retriever = require('./DataRetriever');


class Display {

    constructor() {

        this.timelineBox_data = [['Date', 'Average Req/s (Last 10s)']];

        this.statsObject = {};

        this.newStat = {
            date: null,
            id: 0,
            successRate_10_data: [],
            successRate_120_data: [],
            general_10_data: null,
            general_120_data: null,
            errors_10_data: null,
            errors_120_data: null,
        };

        this.alertBox_data = {
            headers: ['Date', 'Message'],
            data: []
        };


        this.requestsPerSecond_10_data = {
            title: '',
            style: {line: 'cyan'},
            x: [0, 0, 0, 0, 0, 0],
            y: [0, 0, 0, 0, 0, 0]
        };

        this.requestsPerSecond_120_data = {
            title: '',
            style: {line: 'yellow'},
            x: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            y: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };

        this.threshold = 10;


        this.screen = blessed.screen({
            title: 'HTTP Logs Monitor'
        });
        this.grid = new contrib.grid({
            rows: 12,
            cols: 12,
            screen: this.screen
        });

        this.helpBox = this.grid.set(9, 0, 3, 2, blessed.box, {
            tags: true,
            content: '{center}{bold}----- HELP -----{/bold}\n\n' +
                'Navigate with UP and DOWN keys or\n your mouse in the Timeline.\nSelect a time period with ENTER\nVisualize statistics on the different panels\nEvents are raised in the red alert box\nPress ESC to quit',
            style: {
                fg: '#32E6A7',
                bg: 'black',
                border: {
                    fg: '#32E6A7'
                }
            }
        });


        this.timelineBox = this.grid.set(0, 0, 9, 2, blessed.listtable, {
            parent: this.screen,
            label: 'Timeline',
            keys: true,
            mouse: true,
            selectedBg: 'white',
            selectedFg: 'black',
            style: {
                bg: 'black',
                border: {
                    fg: 'white'
                }
            },
            align: "left",
            noCellBorders: true,
            interactive: true,
            focused: true,
            data: this.timelineBox_data
        });

        this.timelineBox.on('select', (item, index) => {
            if (this.newStat.date) {
                this.successRate_10.setData(this.statsObject[index].successRate_10_data);
                this.successRate_120.setData(this.statsObject[index].successRate_120_data);
                this.general_10.setContent(this.statsObject[index].general_10_data);
                this.general_120.setContent(this.statsObject[index].general_120_data);
                this.errors_10.setContent(this.statsObject[index].errors_10_data);
                this.errors_120.setContent(this.statsObject[index].errors_120_data);
            }

            this.screen.render()

        });

        this.requestsPerSecond_10 = this.grid.set(0, 2, 3, 5, contrib.line, {
            showNthLabel: 3,
            label: '{white-fg}Average requests per second value (on the last 10s){/white-fg}',
            tags: true,
            showLegend: false,
            style: {
                line: "green",
                text: "white",
                baseline: "white",
                bg: "black",
                border: {
                    fg: "yellow"
                }
            }
        });

        this.requestsPerSecond_120 = this.grid.set(0, 7, 3, 5, contrib.line, {
            showNthLabel: 3,
            label: '{white-fg}Average requests per second value (on the last 2min){/white-fg}',
            tags: true,
            showLegend: false,
            style: {
                line: "green",
                text: "white",
                baseline: "white",
                bg: "black",
                border: {
                    fg: "yellow"
                }
            }
        });

        this.successRate_10 = this.grid.set(3, 2, 3, 2, contrib.donut, {
            label: '{white-fg}Success Rate (Last 10s){/white-fg}',
            tags: true,
            radius: 15,
            arcWidth: 4,
            yPadding: -1,
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.general_10 = this.grid.set(3, 4, 3, 3, blessed.box, {
            label: '{white-fg}Statistics (Last 10s){/white-fg}',
            tags: true,
            keys: true,
            fg: 'white',
            selectedBg: 'black',
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.successRate_120 = this.grid.set(3, 7, 3, 2, contrib.donut, {
            label: '{white-fg}Success Rate (Last 2min){/white-fg}',
            tags: true,
            radius: 15,
            arcWidth: 4,
            yPadding: -1,
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.general_120 = this.grid.set(3, 9, 3, 3, blessed.box, {
            label: '{white-fg}Statistics (Last 2min){/white-fg}',
            tags: true,
            keys: true,
            fg: 'white',
            selectedBg: 'black',
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.errors_10 = this.grid.set(6, 2, 3, 5, blessed.box, {
            tags: true,
            label: '{white-fg}Focus on errors (Last 10s){/white-fg}',
            keys: true,
            fg: 'white',
            selectedBg: 'black',
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.errors_120 = this.grid.set(6, 7, 3, 5, blessed.box, {
            tags: true,
            label: '{white-fg}Focus on errors (Last 2min){/white-fg}',
            keys: true,
            fg: 'white',
            selectedBg: 'black',
            style: {
                bg: "black",
                border: {
                    fg: "#32E6A7"
                }
            }
        });

        this.alertBox = this.grid.set(9, 2, 3, 10, contrib.table, {
            keys: true,
            mouse: true,
            interactive: true,
            tags: true,
            label: '{red-fg}Alerts{/red-fg}',
            columnSpacing: 1,
            columnWidth: [15, 150],
            fg: 'white',
            style: {
                bg: 'black',
                border: {
                    fg: 'red'
                }
            }
        });

        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });

        this.screen.on('resize', () => {
            this.timelineBox.emit('attach');
            this.requestsPerSecond_10.emit('attach');
            this.requestsPerSecond_120.emit('attach');
            this.successRate_10.emit('attach');
            this.successRate_120.emit('attach');
            this.general_10.emit('attach');
            this.general_120.emit('attach');
            this.errors_10.emit('attach');
            this.errors_120.emit('attach');
            this.alertBox.emit('attach')
        });

        this.displayHome();


    }

    initComponents() {
        this.timelineBox.setContent('');
        this.requestsPerSecond_10.setData({title: '', x: [], y: []});
        this.requestsPerSecond_120.setData({title: '', x: [], y: []});
        this.successRate_10.setData([]);
        this.successRate_120.setData([]);
        this.general_10.setContent('');
        this.general_120.setContent('');
        this.errors_10.setContent('');
        this.errors_120.setContent('');

        this.screen.render();
    }

    displayHome() {

        this.form = this.grid.set(3, 3, 6, 6, blessed.form, {
            parent: this.screen,
            name: 'form',
            tags: true,
            keys: true,
            content: '{center}{bold}HTTP LOG MONITOR !{/bold}\n\n\n\n' +
                '{left} You\'re about to enter the HTTP Log Monitor.\n' +
                ' You will be able to visualize data statistics as requests are sent and processed by the server.\n' +
                ' The monitor has an Alert feature that allows you to \n' +
                ' get informed when the number of requests per second exceeds a certain threshold. \n' +
                ' This threshold is set at 10 by default, but you can adjust it to your convenience.',
            style: {
                fg: 'yellow',
                bg: 'black',
                border: {
                    fg: 'yellow'
                }
            }
        });


        this.thresholdInputLabel = blessed.text({
            parent: this.form,
            content: 'Enter a threshold (optional): ',
            top: 14,
            left: 1,
            shrink: true,
            style: {
                fg: 'yellow',
                bg: 'black',
            }
        });

        this.thresholdInput = blessed.textbox({
            parent: this.form,
            name: 'thresholdInput',
            top: 14,
            left: 31,
            shrink: true,
            inputOnFocus: true,
            style: {
                fg: 'yellow',
                bg: 'black',
                focus: {
                    fg: 'red',
                    bg: 'white'
                }
            }
        });

        this.sumbitButton = blessed.button({
            parent: this.form,
            name: 'submit',
            tags: true,
            content: '   {bold}START MONITORING{/bold}   ',
            bottom: 2,
            left: 'center',
            shrink: true,
            style: {
                fg: 'yellow',
                bg: 'black',
                focus: {
                    fg: 'red',
                    bg: 'white'
                }
            }
        });

        this.sumbitButton.on('press', () => {
            this.initComponents();
            this.form.submit();
        });

        this.form.on('submit', (data) => {
            if (data.thresholdInput) {
                this.threshold = data.thresholdInput;
            }

            const Sender = new dataSender(this.threshold);
            Sender.uploadThreshold();

            const dataRetriever = new Retriever();
            dataRetriever.setDisplay(this);

            this.form.destroy();
            this.timelineBox.focus();
            this.screen.render();
        });


        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });

        this.screen.key(['u'], () => {
            this.updateData();
        });

        this.screen.on('resize', () => {
            this.form.emit('attach')
        });

        this.form.focus();
        this.screen.render();

    }

    updateData(stats) {

        if (stats && stats.t10.general.date !== this.newStat.date && stats.t120.general.count) {

            this.newStat.id = this.newStat.id + 1;
            this.newStat.date = stats.t10.general.date;

            this.requestsPerSecond_10_data.x.shift();
            this.requestsPerSecond_10_data.x.push(stats.t10.general.date);
            this.requestsPerSecond_10_data.y.shift();
            this.requestsPerSecond_10_data.y.push(stats.t10.general.events_per_second);

            this.requestsPerSecond_120_data.x.shift();
            this.requestsPerSecond_120_data.x.push(stats.t120.general.date);
            this.requestsPerSecond_120_data.y.shift();
            this.requestsPerSecond_120_data.y.push(stats.t120.general.events_per_second);

            this.requestsPerSecond_10.setData(this.requestsPerSecond_10_data);
            this.requestsPerSecond_120.setData(this.requestsPerSecond_120_data);

            this.newStat.successRate_10_data = [{
                label: ' ',
                percent: (stats.t10.general.count - stats.t10.errors.count) * 100 / stats.t10.general.count,
                color: 'cyan'
            }];
            this.newStat.successRate_120_data = [{
                label: ' ',
                percent: (stats.t120.general.count - stats.t120.errors.count) * 100 / stats.t120.general.count,
                color: 'yellow'
            }];

            const most_hit_section_10 = [Object.keys(stats.t10.general.section_proportion)[0],
                stats.t10.general.section_proportion[Object.keys(stats.t10.general.section_proportion)[0]]];

            const method_proportion_10s = [];
            for (let key in stats.t10.general.method_proportion) {
                method_proportion_10s.push(key + ' (' + stats.t10.general.method_proportion[key].toString() + ') ')
            }


            if (stats.t10.general.count) {
                this.newStat.general_10_data = 'During the 10 seconds before ' + stats.t10.general.date + ':\n\n\n' +
                    'The server has been pinged ' + stats.t10.general.count + ' times.\n' +
                    stats.t10.general.bytes.toString() + ' bytes have been exchanged.\n' +
                    'The most popular section was /' +
                    most_hit_section_10[0] + ' with ' + most_hit_section_10[1] + ' hits.\n'+
                    'Different methods occurrences: \n\n   ' +
                    method_proportion_10s.join(', ');
            } else {
                this.newStat.general_10_data = 'No logs were sent.'
            }


            const most_hit_section_120 = [Object.keys(stats.t120.general.section_proportion)[0],
                stats.t120.general.section_proportion[Object.keys(stats.t120.general.section_proportion)[0]]];

            const method_proportion_120s = [];
            for (let key in stats.t120.general.method_proportion) {
                method_proportion_120s.push(key + ' (' + stats.t120.general.method_proportion[key].toString() + ') ')
            }

            if (stats.t120.general.count) {
                this.newStat.general_120_data = 'During the 2 minutes before ' + stats.t120.general.date + ':\n\n\n' +
                    'The server has been pinged ' + stats.t120.general.count + ' times.\n' +
                    stats.t120.general.bytes.toString() + ' bytes have been exchanged.\n' +
                    'The most popular section was /' +
                    most_hit_section_120[0] + ' with ' + most_hit_section_120[1] + ' hits.\n' +
                    'Different methods occurrences: \n\n  ' +
                    method_proportion_120s.join(', ');
            } else {
                this.newStat.general_120_data = 'No logs were sent.'
            }

            const status_proportion_10s = [];
            for (let key in stats.t10.errors.status_proportion) {
                if (stats.t10.errors.status_proportion[key]===1){
                    status_proportion_10s.push(stats.t10.errors.status_proportion[key].toString() + ' was a ' + key + ' error')
                }else{
                    status_proportion_10s.push(stats.t10.errors.status_proportion[key].toString() + ' were ' + key + ' errors')
                }
            }

            const method_err_10s = [];
            for (let key in stats.t10.errors.method_proportion) {
                method_err_10s.push(key + ' (' + stats.t10.errors.method_proportion[key].toString() + ') ')
            }

            if (stats.t10.errors.count){
                this.newStat.errors_10_data = '\n ' + stats.t10.errors.count +
                    ' errors occurred during the last 10 seconds. (for a total of '+ stats.t10.errors.bytes + ' bytes)\n\n' +
                    ' Among those errors, ' + status_proportion_10s.join(', ') + '.\n' +
                    ' Methods used : ' + method_err_10s.join(', ') + '.'
            }


            const status_proportion_120s = [];
            for (let key in stats.t120.errors.status_proportion) {
                if (stats.t120.errors.status_proportion[key]===1){
                    status_proportion_120s.push(stats.t120.errors.status_proportion[key].toString() + ' was a ' + key + ' error')
                }else{
                    status_proportion_120s.push(stats.t120.errors.status_proportion[key].toString() + ' were ' + key + ' errors')
                }
            }

            const method_err_120s = [];
            for (let key in stats.t120.errors.method_proportion) {
                method_err_120s.push(key + ' (' + stats.t120.errors.method_proportion[key].toString() + ') ')
            }

            if (stats.t120.errors.count){
                this.newStat.errors_120_data = '\n ' + stats.t120.errors.count +
                    ' errors occurred during the last 2 minutes. (for a total of '+ stats.t120.errors.bytes + ' bytes)\n\n' +
                    ' Among those errors, ' + status_proportion_120s.join(', ') + '.\n' +
                    ' Methods used : ' + method_err_120s.join(', ') + '.'
            }




            this.statsObject[this.newStat.id] = {
                date: this.newStat.date,
                id: this.newStat.id,
                successRate_10_data: this.newStat.successRate_10_data,
                successRate_120_data: this.newStat.successRate_120_data,
                general_10_data: this.newStat.general_10_data,
                general_120_data: this.newStat.general_120_data,
                errors_10_data: this.newStat.errors_10_data,
                errors_120_data: this.newStat.errors_120_data,
            };

            this.timelineBox_data.push([stats.t10.general.date,
                stats.t10.general.events_per_second.toString() + ' requests per s']);

            this.timelineBox.setData(this.timelineBox_data);

            if (stats.event === 1) {
                this.alertBox_data.data.push([stats.t10.general.date, "-- ALERT -- The number of requests per second exceeded the threshold."]);
                this.alertBox.setData(this.alertBox_data)
            } else if (stats.event === -1) {
                this.alertBox_data.data.push([stats.t10.general.date, "-- RECOVERY -- The traffic returned to a normal state."]);
                this.alertBox.setData(this.alertBox_data)
            }


            this.screen.render();


        }
    }

    show(text) {
        this.message = blessed.message({
            parent: this.screen,
            keys: true,
            bg: 'white',
            fg: 'black',
            bold: true,
            align: 'center',
            valign: 'middle',
            top: 'center',
            left: 'center',
            width: '50%',
            height: '50%',
            padding: {
                top: 1,
                left: 3,
                right: 3,
            }
        });

        this.message.display(text + "\n\nPress any key to dismiss", 0, () => {
            this.message.destroy();
        });
    }

}


module.exports = Display;