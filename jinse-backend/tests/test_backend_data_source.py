import json
import unittest
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"


class BackendDataSourceTest(unittest.TestCase):
    def test_import_script_uses_backend_json_only(self):
        script = (ROOT_DIR / "scripts" / "import_static_to_db.py").read_text(encoding="utf-8")

        self.assertIn('poemCatalog.json', script)
        self.assertIn('poemLearningData.json', script)
        self.assertIn('poemAdvancedLearningData.json', script)
        self.assertIn('DATA_DIR = ROOT_DIR / "data"', script)
        self.assertNotIn('jinse-frontend', script)
        self.assertNotIn('src/mocks', script)

    def test_backend_json_data_files_exist_and_parse(self):
        catalog = json.loads((DATA_DIR / "poemCatalog.json").read_text(encoding="utf-8"))
        basic = json.loads((DATA_DIR / "poemLearningData.json").read_text(encoding="utf-8"))
        advanced = json.loads((DATA_DIR / "poemAdvancedLearningData.json").read_text(encoding="utf-8"))

        self.assertEqual(len(catalog), 6)
        self.assertIn("jinse", basic)
        self.assertIn("jinse", advanced)
        self.assertIn("appreciation", basic["jinse"])
        self.assertIn("quiz", basic["jinse"])
        self.assertIn("similarPoems", basic["jinse"])
        self.assertIn("aiImage", advanced["jinse"])
        self.assertIn("toneAnalysis", advanced["jinse"])
        self.assertIn("knowledgeGraph", advanced["jinse"])


if __name__ == "__main__":
    unittest.main()

