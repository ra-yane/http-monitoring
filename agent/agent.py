import time
import datetime
import json
import requests

API_ENDPOINT = 'http://0.0.0.0:5000/api/logs'


def watch(logfile):
    fp = open(logfile, 'r')
    next(fp)                                        # Skipping headers
    timestamp = datetime.datetime(1970, 1, 1).strftime('%s')
    logs_to_send = []

    while True:
        log = fp.readline()

        if log and timestamp >= log.split(',')[3]:
            logs_to_send.append(log)
        else:
            send_logs_to_server(logs_to_send)
            logs_to_send = [log]
            timestamp = log.split(',')[3]
            time.sleep(1)


def send_logs_to_server(logs):
    logs = json.dumps(logs)
    try:
        req = requests.request(url=API_ENDPOINT, method='POST', data=logs)
    except requests.exceptions.ConnectionError:
        return


if __name__ == '__main__':
    file = 'sample_csv.csv'
    watch(file)