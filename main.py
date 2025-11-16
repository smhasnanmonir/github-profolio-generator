import tkinter as tk
from tkinter import messagebox, scrolledtext
import requests
import json
import re
from datetime import datetime
import os

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

# GraphQL query to fetch user data + only top 10 repos by stars
GRAPHQL_QUERY = """
query getUser($login: String!) {
  user(login: $login) {
    login
    name
    email
    bio
    company
    location
    websiteUrl
    twitterUsername
    avatarUrl
    url
    createdAt
    updatedAt
    followers { totalCount }
    following { totalCount }

    isHireable
    isDeveloperProgramMember
    isEmployee
    isGitHubStar
    isSiteAdmin
    isViewer
    pronouns
    status { emoji message }
    databaseId
    resourcePath
    anyPinnableItems

    socialAccounts(first: 10) { totalCount nodes { displayName provider url } }
    packages(first: 0) { totalCount nodes { id } }
    lists(first: 0) { totalCount nodes { id } }
    savedReplies(first: 0) { totalCount nodes { id } }

    repositories(first: 25, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        id
        name
        nameWithOwner
        description
        url
        createdAt
        updatedAt
        pushedAt
        isPrivate
        isFork
        stargazerCount
        forkCount
        isArchived
        isDisabled
        isEmpty
        isMirror
        isTemplate
        hasIssuesEnabled
        hasProjectsEnabled
        hasWikiEnabled
        hasDiscussionsEnabled
        visibility
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          totalCount
          totalSize
          edges { size node { name color } }
        }
        repositoryTopics(first: 0) { nodes { topic { name } } }
        watchers { totalCount }
        releases { totalCount }
        deployments { totalCount }
      }
    }

    forkedRepositories: repositories(first: 10, isFork: true, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      nodes {
        id
        name
        nameWithOwner
        description
        url
        createdAt
        updatedAt
        pushedAt
        isPrivate
        isFork
        stargazerCount
        forkCount
        primaryLanguage { name color }
        parent { nameWithOwner url owner { login } stargazerCount forkCount }
      }
    }

    starredRepositories(first: 5, orderBy: {field: STARRED_AT, direction: DESC}) {
      totalCount
      nodes {
        id
        name
        nameWithOwner
        owner { login }
        description
        url
        stargazerCount
        forkCount
        primaryLanguage { name color }
        createdAt
        updatedAt
        isPrivate
        isFork
      }
    }

    watching: watching(first: 5) {
      totalCount
      nodes {
        id
        name
        nameWithOwner
        owner { login }
        description
        url
        stargazerCount
        forkCount
        primaryLanguage { name color }
        createdAt
        updatedAt
        isPrivate
        isFork
      }
    }

    gists(first: 0) { totalCount nodes { id } }

    issues(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        id
        number
        title
        url
        createdAt
        updatedAt
        state
        stateReason
        closed
        closedAt
        repository { name nameWithOwner owner { login } }
        author { login }
        comments { totalCount }
        reactions { totalCount }
        participants { totalCount }
      }
    }

    pullRequests(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        id
        number
        title
        url
        createdAt
        updatedAt
        state
        merged
        mergedAt
        closedAt
        isDraft
        repository { name nameWithOwner owner { login } }
        author { login }
        comments { totalCount }
        reactions { totalCount }
        participants { totalCount }
        reviewRequests(first: 0) { totalCount }
        reviews(first: 0) { totalCount }
        commits(first: 0) { totalCount }
        additions
        deletions
        changedFiles
      }
    }

    commitComments { totalCount }
    gistComments { totalCount }
    organizations(first: 10) { totalCount nodes { id login } }

    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      hasAnyContributions
      hasActivityInThePast
      hasAnyRestrictedContributions
      contributionCalendar { totalContributions colors }
      commitContributionsByRepository(maxRepositories: 10) {
        repository {
          name
          nameWithOwner
          owner { login }
          url
          primaryLanguage { name color }
        }
        contributions(first: 10) {
          totalCount
          nodes { occurredAt commitCount }
        }
      }
    }

    sponsors: sponsorshipsAsMaintainer(first: 0) { totalCount nodes { id } }
    sponsoring: sponsorshipsAsSponsor(first: 0) { totalCount nodes { id } }
    sponsorshipsAsSponsor(first: 0) { totalCount nodes { id } }
    sponsorshipsAsMaintainer(first: 0) { totalCount nodes { id } }
    totalCommitComments: commitComments { totalCount }
    totalGistComments: gistComments { totalCount }
    pinnedItems(first: 5) { totalCount nodes { ... on Repository { id name nameWithOwner description url primaryLanguage { name color } stargazerCount forkCount } }
    }
    publicKeys(first: 5) { totalCount nodes { id key fingerprint createdAt } }
  }
}
"""

class GitHubGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("GitHub Data Fetcher")
        self.token = None

        # Token input
        tk.Label(root, text="GitHub Token:").pack(anchor="w")
        self.token_entry = tk.Entry(root, width=60, show="*")
        self.token_entry.pack(anchor="w", padx=5, pady=5)
        tk.Button(root, text="Verify Token", command=self.verify_token).pack(pady=5)

        # Username input (disabled until token verified)
        tk.Label(root, text="GitHub Profile URL:").pack(anchor="w")
        self.user_entry = tk.Entry(root, width=60, state="disabled")
        self.user_entry.pack(anchor="w", padx=5, pady=5)
        self.fetch_button = tk.Button(root, text="Fetch Data", command=self.fetch_user, state="disabled")
        self.fetch_button.pack(pady=5)

        # Output area
        self.output = scrolledtext.ScrolledText(root, width=100, height=35)
        self.output.pack(padx=5, pady=5)

    def verify_token(self):
        token = self.token_entry.get().strip()
        if not token:
            messagebox.showerror("Error", "Token cannot be empty")
            return
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get("https://api.github.com/user", headers=headers)
        if r.status_code == 200:
            self.token = token
            messagebox.showinfo("Success", f"Token verified! Logged in as {r.json()['login']}")
            self.user_entry.config(state="normal")
            self.fetch_button.config(state="normal")
        else:
            messagebox.showerror("Error", f"Invalid token: {r.status_code}\n{r.text}")

    def fetch_user(self):
        url = self.user_entry.get().strip()
        if not url:
            messagebox.showerror("Error", "Please enter a GitHub profile URL")
            return

        match = re.match(r"https?://github\.com/([^/]+)", url)
        if not match:
            messagebox.showerror("Error", "Invalid GitHub profile URL")
            return
        username = match.group(1)

        headers = {"Authorization": f"Bearer {self.token}"}
        variables = {"login": username}
        r = requests.post(GITHUB_GRAPHQL_URL, json={"query": GRAPHQL_QUERY, "variables": variables}, headers=headers)

        if r.status_code != 200:
            messagebox.showerror("Error", f"Failed to fetch data: {r.status_code}\n{r.text}")
            return

        data = r.json()
        if "errors" in data:
            messagebox.showerror("Error", f"GraphQL error: {data['errors']}")
            return

        raw_user = data["data"]["user"]

        # Build a structure that mirrors final_striped.json, using safe defaults where data isn't fetched
        def with_default(value, default):
            return value if value is not None else default

        def shape_user_data(user_obj):
            # Base fields from current query (present)
            shaped_user = {
                "login": user_obj.get("login"),
                "name": user_obj.get("name"),
                "email": user_obj.get("email"),
                "bio": user_obj.get("bio"),
                "company": user_obj.get("company"),
                "location": user_obj.get("location"),
                "websiteUrl": user_obj.get("websiteUrl"),
                "twitterUsername": user_obj.get("twitterUsername"),
                "avatarUrl": user_obj.get("avatarUrl"),
                "url": user_obj.get("url"),
                "createdAt": user_obj.get("createdAt"),
                "updatedAt": user_obj.get("updatedAt"),
                "followers": with_default(user_obj.get("followers"), {"totalCount": 0}),
                "following": with_default(user_obj.get("following"), {"totalCount": 0}),
            }

            # Fields not fetched: ensure presence with defaults to match final_striped.json structure
            shaped_user.update({
                "isHireable": False,
                "isDeveloperProgramMember": False,
                "isEmployee": False,
                "isGitHubStar": False,
                "isSiteAdmin": False,
                "isViewer": False,
                "pronouns": None,
                "socialAccounts": {"totalCount": 0, "nodes": []},
                "status": None,
                "databaseId": None,
                "resourcePath": None,
                "anyPinnableItems": False,
                "packages": {"totalCount": 0, "nodes": []},
                "lists": {"totalCount": 0, "nodes": []},
                "savedReplies": {"totalCount": 0, "nodes": []},
            })

            # Repositories (we have a limited subset); normalize to include keys seen in final_striped.json
            repos = user_obj.get("repositories") or {"totalCount": 0, "nodes": []}
            normalized_nodes = []
            for repo in repos.get("nodes", []):
                normalized_nodes.append({
                    "id": repo.get("id"),
                    "name": repo.get("name"),
                    "nameWithOwner": repo.get("nameWithOwner"),
                    "description": repo.get("description"),
                    "url": repo.get("url"),
                    "createdAt": repo.get("createdAt"),
                    "updatedAt": repo.get("updatedAt"),
                    "pushedAt": repo.get("pushedAt"),
                    "isPrivate": repo.get("isPrivate", False),
                    "isFork": repo.get("isFork", False),
                    "stargazerCount": repo.get("stargazerCount", 0),
                    "forkCount": repo.get("forkCount", 0),
                    "isArchived": repo.get("isArchived", False),
                    "isDisabled": repo.get("isDisabled", False),
                    "isEmpty": repo.get("isEmpty", False),
                    "isMirror": repo.get("isMirror", False),
                    "isTemplate": repo.get("isTemplate", False),
                    "hasIssuesEnabled": repo.get("hasIssuesEnabled", True),
                    "hasProjectsEnabled": repo.get("hasProjectsEnabled", True),
                    "hasWikiEnabled": repo.get("hasWikiEnabled", True),
                    "hasDiscussionsEnabled": repo.get("hasDiscussionsEnabled", False),
                    "visibility": repo.get("visibility"),
                    "primaryLanguage": repo.get("primaryLanguage"),
                    "languages": repo.get("languages", {"totalCount": 0, "totalSize": 0, "edges": []}),
                    "repositoryTopics": repo.get("repositoryTopics", {"nodes": []}),
                    "watchers": repo.get("watchers", {"totalCount": 0}),
                    "releases": repo.get("releases", {"totalCount": 0}),
                    "deployments": repo.get("deployments", {"totalCount": 0}),
                    "vulnerability": repo.get("vulnerability", {"totalCount": 0}),
                    "fundingLinks": repo.get("fundingLinks", []),
                    "interactionAbility": repo.get("interactionAbility"),
                    "_popularity_score": repo.get("_popularity_score"),
                })
            shaped_user["repositories"] = {
                "totalCount": repos.get("totalCount", 0),
                "nodes": normalized_nodes,
            }

            # Additional complex sections: use fetched data when available, else defaults
            shaped_user["forkedRepositories"] = user_obj.get("forkedRepositories", {"totalCount": 0, "nodes": []})
            shaped_user["starredRepositories"] = user_obj.get("starredRepositories", {"totalCount": 0, "nodes": []})
            shaped_user["watching"] = user_obj.get("watching", {"totalCount": 0, "nodes": []})
            shaped_user["gists"] = user_obj.get("gists", {"totalCount": 0, "nodes": []})
            shaped_user["issues"] = user_obj.get("issues", {"totalCount": 0, "nodes": []})
            shaped_user["pullRequests"] = user_obj.get("pullRequests", {"totalCount": 0, "nodes": []})
            shaped_user["commitComments"] = user_obj.get("commitComments", {"totalCount": 0, "nodes": []})
            shaped_user["gistComments"] = user_obj.get("gistComments", {"totalCount": 0, "nodes": []})
            shaped_user["organizations"] = user_obj.get("organizations", {"totalCount": 0, "nodes": []})
            shaped_user["contributionsCollection"] = user_obj.get("contributionsCollection", {})
            shaped_user["sponsors"] = user_obj.get("sponsors", {"totalCount": 0, "nodes": []})
            shaped_user["sponsoring"] = user_obj.get("sponsoring", {"totalCount": 0, "nodes": []})
            shaped_user["sponsorshipsAsSponsor"] = user_obj.get("sponsorshipsAsSponsor", {"totalCount": 0, "nodes": []})
            shaped_user["sponsorshipsAsMaintainer"] = user_obj.get("sponsorshipsAsMaintainer", {"totalCount": 0, "nodes": []})
            shaped_user["totalCommitComments"] = user_obj.get("totalCommitComments", {"totalCount": 0})
            shaped_user["totalGistComments"] = user_obj.get("totalGistComments", {"totalCount": 0})
            shaped_user["totalIssueComments"] = user_obj.get("totalIssueComments", {"totalCount": 0})
            shaped_user["totalDiscussionComments"] = user_obj.get("totalDiscussionComments", {"totalCount": 0})
            shaped_user["pinnedItems"] = user_obj.get("pinnedItems", {"totalCount": 0, "nodes": []})
            shaped_user["publicKeys"] = user_obj.get("publicKeys", {"totalCount": 0, "nodes": []})

            return shaped_user

        shaped_user_data = shape_user_data(raw_user)

        # Build contribution_activity from contributionsCollection when available
        cc = raw_user.get("contributionsCollection", {}) or {}
        total_commit = cc.get("totalCommitContributions", 0) or 0
        total_issue = cc.get("totalIssueContributions", 0) or 0
        total_pr = cc.get("totalPullRequestContributions", 0) or 0
        total_pr_reviews = cc.get("totalPullRequestReviewContributions", 0) or 0
        total_repo = cc.get("totalRepositoryContributions", 0) or 0
        has_any = bool(cc.get("hasAnyContributions", False))

        # Summary values
        calendar = cc.get("contributionCalendar", {}) or {}
        total_year = calendar.get("totalContributions", 0) or 0

        ccr = cc.get("commitContributionsByRepository", []) or []
        active_repos = len(ccr)
        # Compute most active language from repositories' primaryLanguage across contributions
        language_counts = {}
        for entry in ccr:
            repo = (entry or {}).get("repository") or {}
            lang = (repo.get("primaryLanguage") or {}).get("name")
            if lang:
                language_counts[lang] = language_counts.get(lang, 0) + 1
        most_active_language = None
        if language_counts:
            most_active_language = max(language_counts.items(), key=lambda kv: kv[1])[0]

        shaped = {
            "username": username,
            "fetched_at": datetime.utcnow().isoformat(),
            "user_data": shaped_user_data,
            "optimization_mode": "full",
            "contribution_activity": {
                "contribution_statistics": {
                    "total_commit_contributions": total_commit,
                    "total_issue_contributions": total_issue,
                    "total_pull_request_contributions": total_pr,
                    "total_pull_request_review_contributions": total_pr_reviews,
                    "total_repository_contributions": total_repo,
                    "has_any_contributions": has_any,
                },
                "summary": {
                    "total_contributions_this_year": total_year,
                    "active_repositories": active_repos,
                    "most_active_language": most_active_language,
                },
            },
        }

        # Show in text box
        pretty_json = json.dumps([shaped], indent=2)
        self.output.delete(1.0, tk.END)
        self.output.insert(tk.END, pretty_json)

        # Auto-save JSON with generated name
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"github_{username}_{timestamp}.json"
        save_path = os.path.join(os.getcwd(), filename)
        with open(save_path, "w", encoding="utf-8") as f:
            f.write(pretty_json)

        messagebox.showinfo("Saved", f"Data saved to {save_path}")


if __name__ == "__main__":
    root = tk.Tk()
    app = GitHubGUI(root)
    root.mainloop()
