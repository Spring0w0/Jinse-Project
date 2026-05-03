import os
import unittest

from jinse_backend.chat_service import stream_chat_reply
from jinse_backend.prompting import build_messages
from jinse_backend.validation import normalize_chat_payload


def build_sample_payload():
    return {
        "message": "这首诗的核心情感是什么？",
        "history": [
            {"role": "user", "content": "庄生晓梦迷蝴蝶是什么意思？"},
            {"role": "assistant", "content": "这句化用了庄周梦蝶的典故。"},
        ],
        "routeContext": {
            "name": "poem-appreciation",
            "path": "/poem-appreciation",
            "label": "诗句赏析",
            "poemId": "jinse",
            "poemTitle": "锦瑟",
        },
    }


class ChatServiceTest(unittest.TestCase):
    def setUp(self):
        os.environ.pop("OPENAI_API_KEY", None)

    def test_normalize_chat_payload_keeps_route_context(self):
        payload = normalize_chat_payload(build_sample_payload())

        self.assertEqual(payload["message"], "这首诗的核心情感是什么？")
        self.assertEqual(payload["routeContext"]["poemId"], "jinse")
        self.assertEqual(payload["routeContext"]["poemTitle"], "锦瑟")
        self.assertEqual(len(payload["history"]), 2)

    def test_build_messages_includes_dynamic_poem_context(self):
        messages = build_messages(normalize_chat_payload(build_sample_payload()))

        joined = "\n".join(content for _, content in messages)
        self.assertIn("当前诗歌：锦瑟", joined)
        self.assertIn("诗歌 ID：jinse", joined)
        self.assertIn("当前页面：诗句赏析", joined)
        self.assertEqual(messages[-1], ("human", "这首诗的核心情感是什么？"))

    def test_fallback_streams_plain_text_without_openai_key(self):
        reply = "".join(stream_chat_reply(build_sample_payload()))

        self.assertIn("锦瑟", reply)
        self.assertIn("诗句赏析", reply)
        self.assertIn("情感", reply)


if __name__ == "__main__":
    unittest.main()
