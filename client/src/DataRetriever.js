const axios = require('axios');


class DataRetriever{


    constructor(){
        this.data = [];
        this.display = null;
        this.no_stats_available = false;
        this.run()
    }

    setDisplay(display) {
        this.display = display;
    }

    retrieveData(){
        axios.get('http://0.0.0.0:5000/api/stats').then((response) => {
            if (response.data.stats === null){
                if (!this.no_stats_available) {
                    this.no_stats_available = true;
                    this.display.show('No statistics are available at the moment.')}
            }else{
                this.no_stats_available = false;
                this.display.updateData(response.data.stats);
            }
        })
    }

    run(){
        this.retrieveData();
        setInterval(() => this.retrieveData(), 10000)
    }

}

module.exports = DataRetriever;