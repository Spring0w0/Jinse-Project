import os
from typing import Iterable, cast

from flask import Flask, Response, jsonify, request, stream_with_context

from jinse_backend.chat_service import ChatPayloadError, stream_chat_reply
from jinse_backend.config import load_backend_env, get_database_url
from jinse_backend.learning_data import get_learning_module, get_poem_catalog, get_poem_meta, get_poem_timeline
from jinse_backend.db import init_app
from jinse_backend import models as _models  # noqa: F401  # ensure models are registered for migrations


load_backend_env()


def create_app():
    app = Flask(__name__)

    # configure database
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_url()
    init_app(app)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = os.getenv("JINSE_CORS_ORIGIN", "*")
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        return response

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    @app.get("/api/poems")
    def poems():
        return jsonify(get_poem_catalog())

    @app.get("/api/poems/timeline")
    def poem_timeline():
        return jsonify(get_poem_timeline())

    @app.get("/api/poems/<poem_id>")
    def poem_meta(poem_id):
        return jsonify(get_poem_meta(poem_id))

    @app.get("/api/poems/<poem_id>/<module_name>")
    def poem_module(poem_id, module_name):
        try:
            return jsonify(get_learning_module(poem_id, module_name))
        except KeyError:
            return jsonify({"error": "unknown module"}), 404

    @app.route("/api/chat", methods=["OPTIONS"])
    def chat_options():
        return Response(status=204)

    @app.post("/api/chat")
    def chat():
        payload = request.get_json(silent=True) or {}

        try:
            chunks = stream_chat_reply(payload)
        except ChatPayloadError as error:
            return jsonify({"error": str(error)}), 400

        return Response(
            stream_with_context(cast(Iterable[str], chunks)),
            content_type="text/plain; charset=utf-8",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    return app


app = create_app()


if __name__ == "__main__":
    host = os.getenv("JINSE_BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("JINSE_BACKEND_PORT", "5001"))
    app.run(host=host, port=port, threaded=True)
