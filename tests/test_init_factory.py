from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "init_factory.py"


class InitFactoryTests(unittest.TestCase):
    def test_bootstrap_creates_workspace(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            result = subprocess.run(
                [
                    "python3",
                    str(SCRIPT),
                    "Acme Ops Copilot",
                    "--customer",
                    "SMB operations teams",
                    "--problem",
                    "Too many fragmented workflows",
                    "--workflow",
                    "Triage work and hand off secure actions through MCP",
                    "--workspace-root",
                    tmpdir,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            target = Path(result.stdout.strip())
            self.assertTrue((target / "PRODUCT.md").exists())
            self.assertTrue((target / "ROADMAP.md").exists())
            self.assertTrue((target / "AGENTS.md").exists())
            self.assertTrue((target / "skills" / "frontend.md").exists())
            self.assertTrue((target / "memory" / "executive-summary" / "system-rules.md").exists())
            self.assertIn("Acme Ops Copilot", (target / "PRODUCT.md").read_text(encoding="utf-8"))

    def test_existing_workspace_requires_force(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            first = subprocess.run(
                ["python3", str(SCRIPT), "Repeatable Product", "--workspace-root", tmpdir],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertTrue(Path(first.stdout.strip()).exists())
            second = subprocess.run(
                ["python3", str(SCRIPT), "Repeatable Product", "--workspace-root", tmpdir],
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(second.returncode, 0)
            self.assertIn("already exists", second.stderr)


if __name__ == "__main__":
    unittest.main()
