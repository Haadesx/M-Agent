#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "product"


def render_template(path: Path, replacements: dict[str, str]) -> str:
    content = path.read_text(encoding="utf-8")
    for key, value in replacements.items():
        content = content.replace(f"{{{{{key}}}}}", value)
    return content


def copy_tree(src: Path, dst: Path) -> None:
    shutil.copytree(src, dst, dirs_exist_ok=True)


def build_instance(
    product_name: str,
    customer: str,
    problem: str,
    workflow: str,
    workspace_root: Path,
    force: bool,
) -> Path:
    slug = slugify(product_name)
    target = workspace_root / slug
    if target.exists():
        if not force:
            raise FileExistsError(f"{target} already exists; pass --force to overwrite")
        shutil.rmtree(target)

    target.mkdir(parents=True, exist_ok=True)
    replacements = {
        "PRODUCT_NAME": product_name,
        "CUSTOMER": customer,
        "PROBLEM": problem,
        "WORKFLOW": workflow,
    }

    # Product-scoped entry files.
    (target / "PRODUCT.md").write_text(
        render_template(ROOT / "templates" / "product-brief-template.md", replacements),
        encoding="utf-8",
    )
    (target / "ROADMAP.md").write_text(
        render_template(ROOT / "templates" / "roadmap-template.md", replacements),
        encoding="utf-8",
    )
    (target / "START_HERE.md").write_text(
        "\n".join(
            [
                f"# {product_name} Factory Workspace",
                "",
                "Start with these files:",
                "- `PRODUCT.md` for the product brief",
                "- `ROADMAP.md` for the Phase 0 roadmap",
                "- `AGENTS.md` for the operating contract",
                "- `prompts/master-product-architect.md` for the orchestrator prompt",
                "",
                "Recommended flow:",
                "1. Refine `PRODUCT.md` until the buyer, pain, and workflow are crisp.",
                "2. Use the master prompt to generate a Phase 0 roadmap.",
                "3. Do not implement until the roadmap is approved.",
                "4. Generate or refine specialized skills only after approval.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    root_agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    (target / "AGENTS.md").write_text(
        "\n".join(
            [
                f"# Product Scope: {product_name}",
                "",
                f"- Primary buyer: {customer}",
                f"- Problem: {problem}",
                f"- Core workflow: {workflow}",
                "",
                root_agents,
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    # Shared scaffolding.
    copy_tree(ROOT / "memory", target / "memory")
    copy_tree(ROOT / "skills", target / "skills")
    copy_tree(ROOT / "compliance", target / "compliance")
    copy_tree(ROOT / "mcp", target / "mcp")
    copy_tree(ROOT / "prompts", target / "prompts")

    return target


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bootstrap a product-specific markdown agent factory workspace."
    )
    parser.add_argument("product_name", help="Product name for the generated workspace")
    parser.add_argument("--customer", default="SMB teams", help="Primary buyer")
    parser.add_argument("--problem", default="TBD", help="Core pain point")
    parser.add_argument("--workflow", default="TBD", help="Core user workflow")
    parser.add_argument(
        "--workspace-root",
        default=str(ROOT / "instances"),
        help="Directory where the new workspace will be created",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing workspace with the same slug",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    workspace_root = Path(args.workspace_root).expanduser().resolve()
    target = build_instance(
        product_name=args.product_name,
        customer=args.customer,
        problem=args.problem,
        workflow=args.workflow,
        workspace_root=workspace_root,
        force=args.force,
    )
    print(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
