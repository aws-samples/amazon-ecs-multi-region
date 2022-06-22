from flask import Flask, jsonify, request, make_response
from flask.logging import default_handler
from dynamodb_handler import DynamoDBHandler
from http import HTTPStatus

app = Flask(__name__)
app.config.from_pyfile("config.py")
dynamodb_handler = DynamoDBHandler(app.config.get("DYNAMODB_TABLE_NAME"))


@app.route("/healthcheck")
def healthcheck():
    return jsonify({"health": "ok", "region": app.config.get("AWS_REGION")})


@app.route("/books", methods=["GET", "POST"])
def list_or_create():
    if request.method == "GET":
        return _list()
    elif request.method == "POST":
        return _create()


@app.route("/books/<id>", methods=["GET", "DELETE"])
def get_or_delete(id):
    if request.method == "GET":
        return _get(id)
    elif request.method == "DELETE":
        return _delete(id)


def _list():
    books = dynamodb_handler.list_books()
    return jsonify({"books": books})


def _create():
    book = request.json.get("book")
    book_with_id = dynamodb_handler.add_book(book)

    return jsonify({"book": book_with_id})


def _get(id: str):
    book = dynamodb_handler.get_book(id)
    if book:
        return jsonify({"book": book})
    else:
        return _custom_error("Book not found", 404)


def _delete(id: str):
    dynamodb_handler.delete_book(id)
    return ("", HTTPStatus.NO_CONTENT)


if __name__ == "__main__":
    app.run(debug=True)


def _custom_error(message: str, status_code: int):
    response = {"error": message}
    return make_response(jsonify(response), status_code)
