import unittest

from app import create_app
from jinse_backend.db import db
from jinse_backend.learning_data import get_learning_module, get_poem_catalog, get_poem_meta, get_poem_timeline


class LearningDataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.ctx = cls.app.app_context()
        cls.ctx.push()

    @classmethod
    def tearDownClass(cls):
        db.session.remove()
        cls.ctx.pop()

    def test_poem_catalog_and_meta(self):
        catalog = get_poem_catalog()

        self.assertGreaterEqual(len(catalog), 1)
        self.assertEqual(get_poem_meta("jinse")["title"], "锦瑟")

    def test_poem_timeline_adds_layout_fields(self):
        timeline = get_poem_timeline()

        self.assertIn("timelineIndex", timeline[0])
        self.assertIn(timeline[0]["side"], ("left", "right"))

    def test_learning_modules_keep_frontend_shapes(self):
        appreciation = get_learning_module("jinse", "appreciation")
        tone = get_learning_module("jinse", "tone-analysis")
        graph = get_learning_module("jinse", "knowledge-graph")

        self.assertIn("lines", appreciation)
        self.assertIn("moduleNote", tone)
        self.assertIn("nodes", graph)


if __name__ == "__main__":
    unittest.main()
