from flask import Flask
from flask_cors import CORS

from monitor.api import register_api


def create_app():
    """
    Creates the Flask app. It takes care of everything that is
    necessary in order to run the app; especially to register
    the API and enable the CORS.
    :return:
    """
    app = Flask(__name__)
    CORS(app)
    register_api(app)
    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0')
