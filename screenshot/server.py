import os
from io import BytesIO
from tempfile import NamedTemporaryFile
from flask import Flask, abort, send_file, Response, request
from flask_cors import CORS
from PIL import Image
from Quartz import (
    CGWindowListCopyWindowInfo, kCGNullWindowID, kCGWindowListOptionAll
)

app = Flask(__name__)
CORS(app)


@app.route("/")
def screenshot():
    """
    w, h で指定されたマス数の盤面部分を切り取った画像を返す。
    chrome でゲームのタブをアクティブに、スクロールは一番上にしておく。
    """
    width = request.args.get('w', default=9, type=int)
    height = request.args.get('h', default=9, type=int)
    image = capture(width, height)
    return serve_image(image)


def serve_image(image: Image) -> Response:
    image_io = BytesIO()
    image.save(image_io, "png")
    image_io.seek(0)
    return send_file(image_io, "image/png")


def capture(width: int, height: int) -> Image:
    with NamedTemporaryFile(suffix=".png", delete=False) as file:
        try:
            window_id = get_window_id()
            os.system("screencapture -x -l %s %s" % (window_id, file.name))
            image = Image.open(file.name)
            return crop(image, width, height)
        finally:
            os.remove(file.name)


def get_window_id() -> int | None:
    for window in CGWindowListCopyWindowInfo(
        kCGWindowListOptionAll,
        kCGNullWindowID
    ):
        if "スイートホームメイドR" in window.get("kCGWindowName", ""):
            return window["kCGWindowNumber"]
    abort(404)


def crop(image: Image, width: int, height: int) -> Image:
    # スクリーンショット中のゲーム画面の位置
    GAME_AREA_TOP = 408
    GAME_AREA_WIDTH = 2588

    # 9x9マス盤面時のレイアウト
    BOARD_LEFT = 638
    BOARD_TOP = 76
    PIECE_SIZE = 146

    game_left = image.size[0] // 2 - GAME_AREA_WIDTH // 2
    game_top = GAME_AREA_TOP

    board_left = game_left + BOARD_LEFT + int((9 - width) * PIECE_SIZE / 2)
    board_top = game_top + BOARD_TOP + int((9 - height) * PIECE_SIZE / 2)
    board_width = width * PIECE_SIZE
    board_height = height * PIECE_SIZE

    return image.crop(
        (
            board_left,
            board_top,
            board_left + board_width,
            board_top + board_height
        )
    )
