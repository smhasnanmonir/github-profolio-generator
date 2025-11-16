# Feature Mapping: GitHub Data → ML Models

This document maps which fields from the GitHub API response (`user.json`) are used by each ML model during training and inference.

---

## Overview

The system uses three ML models:
1. **Behavior Classifier** - Predicts developer behavior patterns (maintainer, team_player, innovator, learner)
2. **Skills Classifier** - Predicts which technologies/languages the developer is skilled in (30 classes)
3. **Ranking Model** - Ranks repositories by importance/quality for portfolio selection

---

## Raw Data Fields from `user.json`

### User-Level Fields
```json
{
  "user_data": {
    "login": "username",
    "name": "Full Name",
    "bio": "Bio text",
    "location": "City, Country",
    "company": "Company name",
    "createdAt": "2019-08-29T13:29:02Z",
    "updatedAt": "2025-11-03T12:14:37Z",
    "followers": {"totalCount": 2989},
    "following": {"totalCount": 1},
    "repositories": {"totalCount": 18, "nodes": [...]},
    "contributionsCollection": {
      "totalCommitContributions": 128,
      "totalIssueContributions": 1,
      "totalPullRequestContributions": 2,
      "totalPullRequestReviewContributions": 0
    }
  }
}
```

### Repository-Level Fields
```json
{
  "repositories": {
    "nodes": [
      {
        "name": "repo-name",
        "description": "Repo description",
        "createdAt": "2025-05-14T08:43:59Z",
        "updatedAt": "2025-11-16T19:23:20Z",
        "pushedAt": "2025-11-15T18:02:09Z",
        "stargazerCount": 40945,
        "forkCount": 4056,
        "watchers": {"totalCount": 691},
        "primaryLanguage": {"name": "Python"},
        "languages": {
          "edges": [
            {"size": 258721, "node": {"name": "Python"}}
          ]
        }
      }
    ]
  }
}
```

---

## Model 1: Behavior Classifier (39 Features)

**Purpose**: Predicts 4 binary behavior labels: `[maintainer, team_player, innovator, learner]`

### Direct Features (11 features)
| Feature | Source Field | Description |
|---------|--------------|-------------|
| `total_repos` | `repositories.totalCount` | Total number of repositories |
| `total_stars` | Sum of all `stargazerCount` | Total stars across all repos |
| `total_forks` | Sum of all `forkCount` | Total forks across all repos |
| `total_commits` | `contributionsCollection.totalCommitContributions` | Total commits |
| `total_prs` | `contributionsCollection.totalPullRequestContributions` | Total pull requests |
| `total_issues` | `contributionsCollection.totalIssueContributions` | Total issues created |
| `total_pr_reviews` | `contributionsCollection.totalPullRequestReviewContributions` | Total PR reviews |
| `followers` | `followers.totalCount` | Follower count |
| `following` | `following.totalCount` | Following count |
| `language_diversity` | Count of unique languages | Number of different languages used |
| `account_age_days` | `(now - createdAt)` in days | Account age |

### Activity Metrics (5 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `commits_per_day` | `total_commits / account_age_days` | Daily commit rate |
| `prs_per_day` | `total_prs / account_age_days` | Daily PR rate |
| `issues_per_day` | `total_issues / account_age_days` | Daily issue rate |
| `repo_creation_rate` | `total_repos / account_age_days * 365` | Annual repo creation rate |
| `active_repos` | Count repos with `pushedAt` < 90 days | Recently active repositories |

### Collaboration Metrics (5 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `collaboration_score` | `(total_prs + total_pr_reviews + total_issues) / total_commits` | Collaboration intensity |
| `pr_review_ratio` | `total_pr_reviews / total_prs` | Review participation |
| `team_player_score` | `pr_review_ratio` | Same as PR review ratio |
| `code_review_participation` | `total_pr_reviews / total_commits` | Code review engagement |
| `code_review_index` | `total_pr_reviews / max(total_prs, 1)` | Review to PR ratio |

### Repository Metrics (5 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `avg_stars_per_repo` | `total_stars / total_repos` | Average stars per repository |
| `avg_forks_per_repo` | `total_forks / total_repos` | Average forks per repository |
| `max_stars_repo` | Max `stargazerCount` across repos | Highest starred repository |
| `max_forks_repo` | Max `forkCount` across repos | Most forked repository |
| `repo_active_score` | `active_repos / total_repos` | Proportion of active repos |

### Social & Influence Metrics (6 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `follower_ratio` | `followers / max(following, 1)` | Follower to following ratio |
| `network_influence` | `log1p(followers)` | Log-scaled follower count |
| `influence_growth_rate` | `followers / account_age_days * 365` | Annual follower growth |
| `social_coding_index` | `followers / account_age_days * 365` | Social engagement rate |
| `community_engagement_score` | `(total_prs + total_issues) / total_commits` | Community participation |
| `reputation_score` | Composite popularity metric | Overall reputation |

### Advanced Metrics (7 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `maintainer_score` | `active_repos / account_age_days * 365` | Project maintenance activity |
| `innovation_index` | `language_diversity / account_age_days * 365` | Technology exploration rate |
| `learning_velocity` | `language_diversity / account_age_days * 365` | Learning rate indicator |
| `mentorship_score` | `total_pr_reviews / account_age_days * 365` | Mentoring activity |
| `leadership_score` | `total_stars / (total_commits + 1)` | Impact per contribution |
| `development_velocity` | `(total_commits + total_prs) / account_age_days` | Overall development speed |
| `contribution_consistency` | `commits_per_day` | Consistency of contributions |

---

## Model 2: Skills Classifier (43 Features)

**Purpose**: Predicts 30 binary skill labels (which technologies/languages the developer knows)

### Core User Metrics (11 features)
Same as Behavior Classifier's direct features:
- `total_repos`, `total_stars`, `total_forks`, `total_commits`
- `total_prs`, `total_issues`, `followers`, `following`
- `language_diversity`, `active_repos`, `account_age_days`

### Rate Metrics (8 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `avg_stars_per_repo` | `total_stars / total_repos` | Star quality indicator |
| `avg_forks_per_repo` | `total_forks / total_repos` | Fork quality indicator |
| `stars_per_repo` | Same as `avg_stars_per_repo` | Duplicate for compatibility |
| `forks_per_repo` | Same as `avg_forks_per_repo` | Duplicate for compatibility |
| `commits_per_day` | `total_commits / account_age_days` | Daily activity |
| `prs_per_day` | `total_prs / account_age_days` | PR frequency |
| `issues_per_day` | `total_issues / account_age_days` | Issue frequency |
| `follower_ratio` | `followers / following` | Social ratio |

### Collaboration & Quality (4 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `pr_review_ratio` | `total_pr_reviews / total_prs` | Review engagement |
| `collaboration_score` | `(total_prs + total_pr_reviews + total_issues) / total_commits` | Team activity |
| `activity_score` | Composite activity metric | Overall activity level |
| `popularity_score` | `log1p(total_stars + followers)` | Popularity metric |

### Language & Technology Metrics (5 features)
| Feature | Calculation | Source |
|---------|-------------|--------|
| `max_stars_repo` | Max stars across repos | Repository data |
| `max_forks_repo` | Max forks across repos | Repository data |
| `avg_languages_per_repo` | `language_diversity / total_repos` | Language usage density |
| `repo_language_diversity` | Count of unique languages | Language data |
| `language_specialization` | `1.0 / max(language_diversity, 1)` | Specialization vs generalist |

### Advanced Metrics (15 features)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `language_balance` | `std(language_usage_counts)` | Language usage distribution |
| `tech_stack_breadth` | Count of unique languages | Technology breadth |
| `repo_active_score` | `active_repos / total_repos` | Activity proportion |
| `recent_activity_ratio` | Same as `repo_active_score` | Recent activity |
| `code_change_rate` | `total_commits / account_age_days` | Code change frequency |
| `development_velocity` | `(total_commits + total_prs) / account_age_days` | Development speed |
| `activity_intensity_score` | Composite activity metric | Activity intensity |
| `contribution_consistency` | `commits_per_day` | Consistency |
| `work_consistency` | `min(commits_per_day * 10, 1.0)` | Work pattern |
| `repo_creation_rate` | `total_repos / account_age_days * 365` | Creation rate |
| `collaboration_ratio` | `collaboration_score` | Team collaboration |
| `team_player_score` | `pr_review_ratio` | Team player indicator |
| `code_review_participation` | `total_pr_reviews / total_commits` | Review participation |
| `code_review_index` | `total_pr_reviews / max(total_prs, 1)` | Review index |
| `mentorship_score` | `total_pr_reviews / account_age_days * 365` | Mentoring |

### Additional Metrics (continuation)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `social_coding_index` | `followers / account_age_days * 365` | Social coding |
| `community_engagement_score` | `(total_prs + total_issues) / total_commits` | Community engagement |
| `network_influence` | `log1p(followers)` | Network influence |
| `reputation_score` | `popularity_score` | Reputation |
| `impact_factor` | `total_stars / total_repos` | Impact per repo |
| `showcase_score` | `log1p(total_stars)` | Showcase quality |
| `viral_repo_score` | `total_stars / total_repos` | Virality |
| `influence_growth_rate` | `followers / account_age_days * 365` | Influence growth |
| `innovation_index` | `language_diversity / account_age_days * 365` | Innovation |
| `public_repo_ratio` | Assumed 1.0 | Public repo proportion |
| `profile_completeness` | Assumed 0.8 | Profile completeness |

---

## Model 3: Ranking Model (28+ Features)

**Purpose**: Ranks repositories to select top 6 for portfolio

### Repository Quality Metrics
| Feature | Source | Description |
|---------|--------|-------------|
| `stars` | `stargazerCount` | Repository stars |
| `forks` | `forkCount` | Repository forks |
| `watchers` | `watchers.totalCount` | Repository watchers |
| `days_since_update` | `(now - updatedAt)` in days | Recency |
| `days_since_creation` | `(now - createdAt)` in days | Age |
| `is_owner` | Check if `owner == user.login` | Ownership |

### Language Metrics (per repository)
| Feature | Source | Description |
|---------|--------|-------------|
| `primary_language` | `primaryLanguage.name` | Main language |
| `language_count` | `languages.totalCount` | Number of languages |
| `language_diversity` | Count unique languages | Diversity |

### User-Level Features (inherited from above)
All 43 features from the Skills Classifier are also used in the Ranking Model, plus additional repository-specific features.

### Engineered Features (specific to ranking)
| Feature | Calculation | Description |
|---------|-------------|-------------|
| `contribution_consistency` | User-level metric | Consistency score |
| `repo_creation_rate` | User-level metric | Creation rate |
| `multitasking_score` | `active_repos / total_repos` | Multitasking ability |
| `code_change_rate` | `total_commits / account_age_days` | Change rate |
| `language_specialization` | `1.0 / language_diversity` | Specialization |
| `language_balance` | Standard deviation of usage | Balance |
| `repo_language_diversity` | Count languages in repo | Repo diversity |
| `tech_stack_breadth` | Total languages | Stack breadth |
| `avg_languages_per_repo` | `languages / repos` | Language density |
| `avg_repo_size` | `total_commits / total_repos` | Average size |

---

## Feature Engineering Pipeline

### Step 1: Raw Data Extraction
```python
# From user.json
followers = user_data['followers']['totalCount']
total_repos = user_data['repositories']['totalCount']
total_commits = user_data['contributionsCollection']['totalCommitContributions']
```

### Step 2: Aggregation
```python
# Aggregate repository data
total_stars = sum(repo['stargazerCount'] for repo in repositories)
total_forks = sum(repo['forkCount'] for repo in repositories)
language_counts = aggregate_languages_across_repos()
```

### Step 3: Derivation
```python
# Calculate derived features
account_age_days = (datetime.now() - parse(createdAt)).days
commits_per_day = total_commits / account_age_days
collaboration_score = (total_prs + total_pr_reviews + total_issues) / total_commits
```

### Step 4: Normalization & Scaling
- StandardScaler applied to all features
- Log transformation for skewed features (followers, stars)
- Ratio features bounded to [0, 1]

---

## Special Handling

### Timezone Conversion
All datetime fields are converted to timezone-naive before calculations:
```python
createdAt = pd.to_datetime(createdAt).tz_localize(None)
```

### Missing Data
- Missing numeric values filled with 0
- Missing strings filled with empty string
- Division by zero handled with `max(value, 1)`

### Language Data
Languages are extracted from both:
1. `primaryLanguage.name` (weighted 3x)
2. `languages.edges` (weighted by log of size)

---

## Model Output Formats

### Behavior Classifier Output
```python
[1, 0, 1, 0]  # Binary array
# Maps to: [maintainer, team_player, innovator, learner]
# Example: [1, 0, 1, 0] = Maintainer + Innovator
```

### Skills Classifier Output
```python
[1, 1, 0, 0, ..., 0]  # 30-element binary array
# Each index maps to a specific technology
# 1 = skilled, 0 = not skilled
```

### Ranking Model Output
```python
[0.85, 0.72, 0.91, ...]  # Continuous scores
# Higher score = more important for portfolio
```

---

## Summary Table

| Data Field | Behavior | Skills | Ranking |
|------------|----------|--------|---------|
| `followers` | ✓ | ✓ | ✓ |
| `following` | ✓ | ✓ | ✓ |
| `total_commits` | ✓ | ✓ | ✓ |
| `total_prs` | ✓ | ✓ | ✓ |
| `total_issues` | ✓ | ✓ | ✓ |
| `total_pr_reviews` | ✓ | ✓ | ✓ |
| `stargazerCount` | ✓ | ✓ | ✓ |
| `forkCount` | ✓ | ✓ | ✓ |
| `languages` | ✓ | ✓ | ✓ |
| `createdAt` | ✓ | ✓ | ✓ |
| `updatedAt` | - | - | ✓ |
| `pushedAt` | ✓ | ✓ | ✓ |
| `watchers` | - | - | ✓ |
| `description` | - | - | - |
| `bio` | - | - | - |

**Total Features:**
- Behavior: 39 features
- Skills: 43 features  
- Ranking: 28+ features (plus user-level features)

---

## Notes

1. **No Hardcoded Logic**: All predictions come from trained models, no rule-based fallbacks
2. **Label Names**: Only the label name mappings are hardcoded (e.g., 0 → "maintainer")
3. **Feature Overlap**: Many features are shared across models to maintain consistency
4. **Data Quality**: Models are sensitive to missing data; proper handling is critical

---

*Last Updated: 2025-11-16*

