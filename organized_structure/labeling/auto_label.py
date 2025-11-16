import argparse
import json
import math
import os
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple


def _safe_get(d: Dict[str, Any], path: List[str], default: Any = None) -> Any:
	current: Any = d
	for key in path:
		if isinstance(current, dict) and key in current:
			current = current[key]
		else:
			return default
	return current


def _collect_languages(user_data: Dict[str, Any]) -> List[Tuple[str, int]]:
	counts: Counter[str] = Counter()
	repos = _safe_get(user_data, ["repositories", "nodes"], []) or []
	for repo in repos:
		pl = _safe_get(repo, ["primaryLanguage", "name"]) or None
		if isinstance(pl, str) and pl:
			counts[pl] += 3  # weight primary langs higher
		# also consider languages.edges list
		edges = _safe_get(repo, ["languages", "edges"], []) or []
		for edge in edges:
			lang_name = _safe_get(edge, ["node", "name"]) or None
			size = _safe_get(edge, ["size"]) or 0
			if isinstance(lang_name, str) and lang_name:
				# log scale the size to avoid single huge files dominating
				counts[lang_name] += int(1 + math.log10(max(1, int(size))))
	return counts.most_common()


def _collect_notable_repos(user_data: Dict[str, Any], limit: int = 3) -> List[Tuple[str, int]]:
	repos = _safe_get(user_data, ["repositories", "nodes"], []) or []
	repo_scores: List[Tuple[str, int]] = []
	for repo in repos:
		name_with_owner = _safe_get(repo, ["nameWithOwner"]) or _safe_get(repo, ["name"]) or None
		stars = int(_safe_get(repo, ["stargazerCount"], 0) or 0)
		forks = int(_safe_get(repo, ["forkCount"], 0) or 0)
		if not name_with_owner:
			continue
		score = stars * 10 + forks
		repo_scores.append((str(name_with_owner), score))
	# include pinned items as a small boost if present
	pinned = _safe_get(user_data, ["pinnedItems", "nodes"], []) or []
	pinned_names = {(_safe_get(p, ["nameWithOwner"]) or _safe_get(p, ["name"]) or ""): 50 for p in pinned}
	enhanced: Dict[str, int] = {}
	for name, score in repo_scores:
		enhanced[name] = score + pinned_names.get(name, 0)
		split_name = name.split("/")
		# also reward repos that match user login as owner
		if len(split_name) == 2 and split_name[0] == _safe_get(user_data, ["login"]):
			enhanced[name] += 5
	return sorted(enhanced.items(), key=lambda x: x[1], reverse=True)[:limit]


def _summarize(user_obj: Dict[str, Any], max_chars: int = 220) -> str:
	user = _safe_get(user_obj, ["user_data"], {}) or {}
	login = _safe_get(user, ["login"]) or ""
	name = _safe_get(user, ["name"]) or ""
	company = _safe_get(user, ["company"]) or ""
	location = _safe_get(user, ["location"]) or ""
	bio = (_safe_get(user, ["bio"]) or "").strip()
	pronouns = _safe_get(user, ["pronouns"]) or ""
	most_active_lang = _safe_get(user_obj, ["contribution_activity", "summary", "most_active_language"]) or ""
	contrib_total = int(
		_safe_get(user_obj, ["contribution_activity", "contribution_statistics", "total_commit_contributions"], 0)
		or 0
	)
	# Compose fragments
	name_part = name or login or "Developer"
	where_parts: List[str] = []
	if location:
		where_parts.append(location)
	if company:
		where_parts.append(company)
	where = ", ".join(where_parts)

	# Languages
	langs = _collect_languages(user)
	lang_names = [ln for ln, _ in langs]
	if not lang_names and most_active_lang:
		lang_names = [most_active_lang]
	lang_str = ", ".join(lang_names[:3])

	# Notable repos
	notables = _collect_notable_repos(user, limit=2)
	notable_names = [n for n, _ in notables]
	notable_str = ", ".join(notable_names)

	fragments: List[str] = []
	start = f"{name_part}"
	if login and name and login.lower() != name.lower():
		start += f" (@{login})"
	if pronouns:
		start += f" ({pronouns})"
	fragments.append(start)
	if where:
		fragments.append(f"based in {where}")
	if bio:
		fragments.append(bio)
	if lang_str:
		fragments.append(f"works with {lang_str}")
	if contrib_total > 0:
		fragments.append(f"{contrib_total}+ commits")
	if notable_str:
		fragments.append(f"notable repos: {notable_str}")

	desc = "; ".join(fragments)
	# length control: prefer to keep the beginning context (name/location/bio)
	if len(desc) > max_chars:
		# try removing commits and notable repos first
		reduced = "; ".join([f for f in fragments if not f.endswith(" commits") and not f.startswith("notable repos:")])
		if len(reduced) > max_chars:
			# fallback: hard cut with ellipsis
			return (reduced[: max(0, max_chars - 1)].rstrip()) + "…"
		return reduced
	return desc


def _to_jsonl_records(
	user_objects: List[Dict[str, Any]],
	mode: str,
	max_chars: int,
	include_meta: bool,
	input_mode: str,
) -> List[Dict[str, Any]]:
	records: List[Dict[str, Any]] = []
	for obj in user_objects:
		try:
			description = _summarize(obj, max_chars=max_chars)
			user = _safe_get(obj, ["user_data"], {}) or {}
			login = _safe_get(user, ["login"]) or ""

			# Build input content depending on input_mode
			def build_compact_input() -> str:
				name = _safe_get(user, ["name"]) or login or ""
				bio = (_safe_get(user, ["bio"]) or "").strip()
				company = _safe_get(user, ["company"]) or ""
				location = _safe_get(user, ["location"]) or ""
				followers = int(_safe_get(user, ["followers", "totalCount"], 0) or 0)
				langs = _collect_languages(user)
				lang_list = ", ".join([l for l, _ in langs[:5]])
				notables = _collect_notable_repos(user, limit=3)
				notable_list = ", ".join([n for n, _ in notables])
				commits = int(
					_safe_get(obj, ["contribution_activity", "contribution_statistics", "total_commit_contributions"], 0)
					or 0
				)
				parts: List[str] = []
				parts.append(f"login: {login}")
				if name:
					parts.append(f"name: {name}")
				if location:
					parts.append(f"location: {location}")
				if company:
					parts.append(f"company: {company}")
				if followers:
					parts.append(f"followers: {followers}")
				if lang_list:
					parts.append(f"languages: {lang_list}")
				if commits:
					parts.append(f"commits: {commits}")
				if notable_list:
					parts.append(f"notable_repos: {notable_list}")
				if bio:
					parts.append(f"bio: {bio}")
				return " | ".join(parts)

			if input_mode == "compact":
				input_content: Optional[str] = build_compact_input()
			elif input_mode == "json":
				subset = {
					"login": login,
					"name": _safe_get(user, ["name"]) or "",
					"location": _safe_get(user, ["location"]) or "",
					"company": _safe_get(user, ["company"]) or "",
					"bio": _safe_get(user, ["bio"]) or "",
					"followers": int(_safe_get(user, ["followers", "totalCount"], 0) or 0),
					"top_languages": [l for l, _ in _collect_languages(user)[:5]],
					"notable_repos": [n for n, _ in _collect_notable_repos(user, limit=3)],
				}
				input_content = json.dumps(subset, ensure_ascii=False)
			elif input_mode == "none":
				input_content = ""
			else:
				raise ValueError(f"Unsupported input_mode: {input_mode}")
			if mode == "raw":
				rec: Dict[str, Any] = {"text": description}
			elif mode == "alpaca":
				rec = {
					"instruction": "Write a concise 1–2 sentence professional bio for the developer.",
					"input": input_content,
					"output": description,
				}
			else:
				raise ValueError(f"Unsupported mode: {mode}")
			if include_meta:
				rec["meta"] = {"username": login}
			records.append(rec)
		except Exception as e:  # pragma: no cover
			# Skip malformed entries but continue
			continue
	return records


def main() -> None:
	parser = argparse.ArgumentParser(description="Auto-label developer bios from GitHub profile data")
	parser.add_argument(
		"--input",
		type=str,
		default=os.path.join("organized_structure", "examples", "final_striped_single.json"),
		help="Path to input JSON file (array of user objects)",
	)
	parser.add_argument(
		"--output",
		type=str,
		default=os.path.join("organized_structure", "outputs", "curated_outputs", "developer_bios.jsonl"),
		help="Path to output JSONL file",
	)
	parser.add_argument(
		"--mode",
		type=str,
		choices=["raw", "alpaca"],
		default="alpaca",
		help="Output schema: raw(text) or alpaca(instruction/output)",
	)
	parser.add_argument(
		"--max-chars",
		type=int,
		default=220,
		help="Maximum characters for each generated bio",
	)
	parser.add_argument(
		"--limit",
		type=int,
		default=None,
		help="Optional limit on number of records to process",
	)
	parser.add_argument(
		"--no-meta",
		action="store_true",
		help="Exclude metadata like username from each record",
	)
	parser.add_argument(
		"--input-mode",
		type=str,
		choices=["compact", "json", "none"],
		default="compact",
		help="For alpaca mode, provide contextual input: compact | json | none",
	)
	args = parser.parse_args()

	# Read input
	with open(args.input, "r", encoding="utf-8") as f:
		data = json.load(f)

	if not isinstance(data, list):
		raise ValueError("Input must be a JSON array of user objects")

	items = data if args.limit is None else data[: args.limit]
	records = _to_jsonl_records(items, mode=args.mode, max_chars=args.max_chars, include_meta=not args.no_meta, input_mode=args.input_mode)

	# Ensure output directory
	os.makedirs(os.path.dirname(args.output), exist_ok=True)
	with open(args.output, "w", encoding="utf-8") as out:
		for rec in records:
			out.write(json.dumps(rec, ensure_ascii=False) + "\n")

	print(f"Wrote {len(records)} records to {args.output}")


if __name__ == "__main__":
	main()


