import re
import json
from datetime import datetime
import requests

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

# Reuse the same GraphQL query from main.py
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


def extract_username(input_str: str) -> str:
    m = re.match(r"https?://github\.com/([^/]+)", input_str)
    return m.group(1) if m else input_str


def fetch_and_shape(token: str, user_input: str):
    username = extract_username(user_input)
    headers = {"Authorization": f"Bearer {token}"}
    variables = {"login": username}
    r = requests.post(GITHUB_GRAPHQL_URL, json={"query": GRAPHQL_QUERY, "variables": variables}, headers=headers)
    r.raise_for_status()
    payload = r.json()
    if "errors" in payload:
        raise RuntimeError(json.dumps(payload["errors"]))

    raw_user = payload["data"]["user"]

    def with_default(value, default):
        return value if value is not None else default

    def shape_user_data(user_obj):
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

        shaped_user.update({
            "isHireable": user_obj.get("isHireable", False),
            "isDeveloperProgramMember": user_obj.get("isDeveloperProgramMember", False),
            "isEmployee": user_obj.get("isEmployee", False),
            "isGitHubStar": user_obj.get("isGitHubStar", False),
            "isSiteAdmin": user_obj.get("isSiteAdmin", False),
            "isViewer": user_obj.get("isViewer", False),
            "pronouns": user_obj.get("pronouns"),
            "socialAccounts": user_obj.get("socialAccounts", {"totalCount": 0, "nodes": []}),
            "status": user_obj.get("status"),
            "databaseId": user_obj.get("databaseId"),
            "resourcePath": user_obj.get("resourcePath"),
            "anyPinnableItems": user_obj.get("anyPinnableItems", False),
            "packages": user_obj.get("packages", {"totalCount": 0, "nodes": []}),
            "lists": user_obj.get("lists", {"totalCount": 0, "nodes": []}),
            "savedReplies": user_obj.get("savedReplies", {"totalCount": 0, "nodes": []}),
        })

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

    cc = raw_user.get("contributionsCollection", {}) or {}
    total_commit = cc.get("totalCommitContributions", 0) or 0
    total_issue = cc.get("totalIssueContributions", 0) or 0
    total_pr = cc.get("totalPullRequestContributions", 0) or 0
    total_pr_reviews = cc.get("totalPullRequestReviewContributions", 0) or 0
    total_repo = cc.get("totalRepositoryContributions", 0) or 0
    has_any = bool(cc.get("hasAnyContributions", False))
    calendar = cc.get("contributionCalendar", {}) or {}
    total_year = calendar.get("totalContributions", 0) or 0
    ccr = cc.get("commitContributionsByRepository", []) or []
    active_repos = len(ccr)
    language_counts = {}
    for entry in ccr:
        repo = (entry or {}).get("repository") or {}
        lang = (repo.get("primaryLanguage") or {}).get("name")
        if lang:
            language_counts[lang] = language_counts.get(lang, 0) + 1
    most_active_language = max(language_counts.items(), key=lambda kv: kv[1])[0] if language_counts else None

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

    return [shaped]


