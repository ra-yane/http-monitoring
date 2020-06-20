const axios = require('axios');

class DataSender {


    constructor(threshold){
        this.threshold = threshold;
    }

    uploadThreshold() {
            axios.post("http://0.0.0.0:5000/api/client", {
                threshold: this.threshold
              }
            )
              .then((response) => {
                if (response.data.msg === 'success') {
                }
              });
          }
}

module.exports = DataSender;