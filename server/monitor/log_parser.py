from datetime import datetime

from .models import Log


def insert_logs_into_db(logs):
    """

    Basically parses the logs sent by the agent.
    Since they are directly sent from a CSV encoded file, or
    a text file, we need to parse the string correctly to be
    able to store all the logs at once using our ORM and not
    one row at a time (we don't want to iterate over our list
    of logs twice)
    :param logs: lists of logs, str formatted
    :return: number of rows modified

    """
    bulk_input = []
    for log in logs:
        log = log.split(",")                                    # Splitting the string into a list
        request = log[4].split(' ')
        bulk_input.append({
            'remotehost': log[0][1:-1],                         # Removing extra quotation marks
            'rfc931': log[1][1:-1],
            'authuser': log[2][1:-1],
            'date': datetime.utcfromtimestamp(int(log[3])),     # Converting Unix Timestamp into a Date
            'method': request[0][1:],
            'resource': request[1],
            'protocol': request[2][:-1],
            'status': log[5],
            'bytes': log[6][:-1]                                # Removing newline marker due to .txt file
        })
    return Log.insert_many(bulk_input).execute()
