"""Fetch LeetCode + GitHub stats and write them into index.html.

Elements to update are tagged with data-stat="..." in index.html.
Run: python3 scripts/update_stats.py
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

LEETCODE_USER = "Akshat248"
GITHUB_USER = "AkshatGupte"
MILESTONE_STEP = 100  # XP bar fills toward the next multiple of this
INDEX = Path(__file__).resolve().parent.parent / "index.html"

UA = {"User-Agent": "portfolio-stats-updater"}


def fetch_json(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def leetcode_stats():
    query = """query($u: String!) { matchedUser(username: $u) {
      submitStatsGlobal { acSubmissionNum { difficulty count } } } }"""
    body = json.dumps({"query": query, "variables": {"u": LEETCODE_USER}}).encode()
    res = fetch_json(
        "https://leetcode.com/graphql",
        data=body,
        headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"},
    )
    counts = res["data"]["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"]
    return {c["difficulty"].lower(): c["count"] for c in counts}


def github_repos():
    return fetch_json(f"https://api.github.com/users/{GITHUB_USER}")["public_repos"]


def set_text(html, key, text):
    """Replace the inner text of every element tagged data-stat="key"."""
    pattern = re.compile(rf'(<(\w+)[^>]*\bdata-stat="{key}"[^>]*>)(.*?)(</\2>)', re.S)
    html, n = pattern.subn(lambda m: m.group(1) + text + m.group(4), html)
    if n == 0:
        sys.exit(f'No element with data-stat="{key}" found in index.html')
    return html


def main():
    lc = leetcode_stats()
    total = lc["all"]
    pct = round(100 * (total % MILESTONE_STEP) / MILESTONE_STEP)

    html = INDEX.read_text()
    html = set_text(html, "total", str(total))
    html = set_text(html, "medium", str(lc["medium"]))
    html = set_text(html, "hard", str(lc["hard"]))
    html = set_text(html, "repos", str(github_repos()))
    html = set_text(
        html,
        "progress-note",
        f"{total} problems solved &middot; {pct}% toward the next milestone",
    )
    html, n = re.subn(
        r'(data-stat="progress-bar" style="width: )\d+(%")', rf"\g<1>{pct}\g<2>", html
    )
    if n == 0:
        sys.exit('No data-stat="progress-bar" element found in index.html')

    INDEX.write_text(html)
    print(f"total={total} easy={lc['easy']} medium={lc['medium']} hard={lc['hard']} progress={pct}%")


if __name__ == "__main__":
    main()
