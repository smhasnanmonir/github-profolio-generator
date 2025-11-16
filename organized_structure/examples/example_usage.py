#!/usr/bin/env python3
"""
Example usage of generate_portfolio_from_json.py

This script demonstrates how to use the portfolio generator with different input formats.
"""

import json
import os
from generate_portfolio_from_json import generate_portfolio_from_json

def create_example_json():
    """Create an example JSON file for testing."""
    example_data = {
        "login": "example_user",
        "name": "Example User",
        "avatarUrl": "https://avatars.githubusercontent.com/u/123456?v=4",
        "location": "San Francisco, CA",
        "websiteUrl": "https://example.com",
        "followers": {"totalCount": 42},
        "repositories": {
            "nodes": [
                {
                    "name": "awesome-project",
                    "description": "An awesome project that does amazing things",
                    "url": "https://github.com/example_user/awesome-project",
                    "stargazerCount": 150,
                    "forkCount": 25,
                    "createdAt": "2023-01-15T10:30:00Z",
                    "updatedAt": "2024-09-27T15:45:00Z",
                    "isFork": False,
                    "primaryLanguage": {"name": "Python"},
                    "languages": {
                        "edges": [
                            {"node": {"name": "Python"}},
                            {"node": {"name": "JavaScript"}},
                            {"node": {"name": "HTML"}}
                        ]
                    }
                },
                {
                    "name": "cool-library",
                    "description": "A cool library for developers",
                    "url": "https://github.com/example_user/cool-library",
                    "stargazerCount": 75,
                    "forkCount": 12,
                    "createdAt": "2023-06-20T14:20:00Z",
                    "updatedAt": "2024-08-15T09:30:00Z",
                    "isFork": False,
                    "primaryLanguage": {"name": "JavaScript"},
                    "languages": {
                        "edges": [
                            {"node": {"name": "JavaScript"}},
                            {"node": {"name": "TypeScript"}},
                            {"node": {"name": "CSS"}}
                        ]
                    }
                }
            ]
        },
        "contributionsCollection": {
            "totalCommitContributions": 250,
            "totalIssueContributions": 15,
            "totalPullRequestContributions": 8,
            "totalPullRequestReviewContributions": 12,
            "totalRepositoryContributions": 5,
            "commitContributionsByRepository": [
                {
                    "repository": {"name": "awesome-project"},
                    "contributions": {"totalCount": 180}
                },
                {
                    "repository": {"name": "cool-library"},
                    "contributions": {"totalCount": 70}
                }
            ]
        }
    }
    
    # Save example JSON
    example_path = "example_user_data.json"
    with open(example_path, 'w', encoding='utf-8') as f:
        json.dump(example_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created example JSON: {example_path}")
    return example_path

def test_with_existing_data():
    """Test with existing portfolio data."""
    existing_files = [
        "generated_portfolios/portfolio_01_danieka.json",
        "generated_portfolios/portfolio_02_matheusrocha89.json"
    ]
    
    for file_path in existing_files:
        if os.path.exists(file_path):
            print(f"\n🔄 Testing with existing file: {file_path}")
            result = generate_portfolio_from_json(file_path, "test_output")
            
            if result['success']:
                print(f"✅ Successfully regenerated portfolio")
                print(f"   JSON: {result['json_path']}")
                if result['html_path']:
                    print(f"   HTML: {result['html_path']}")
            else:
                print(f"❌ Failed: {result['error']}")
            break

def main():
    """Main function to demonstrate usage."""
    print("🚀 Portfolio Generator from JSON - Example Usage")
    print("=" * 50)
    
    # Test 1: Create and use example JSON
    print("\n📝 Test 1: Creating example JSON and generating portfolio")
    example_path = create_example_json()
    
    result = generate_portfolio_from_json(example_path, "example_output")
    
    if result['success']:
        print(f"✅ Example portfolio generated successfully!")
        print(f"📄 JSON: {result['json_path']}")
        if result['html_path']:
            print(f"🌐 HTML: {result['html_path']}")
    else:
        print(f"❌ Example generation failed: {result['error']}")
    
    # Test 2: Use existing data
    print("\n📝 Test 2: Testing with existing portfolio data")
    test_with_existing_data()
    
    print("\n🎉 Example usage complete!")
    print("\n📖 Usage Instructions:")
    print("   python generate_portfolio_from_json.py input.json [output_dir]")
    print("   python generate_portfolio_from_json.py example_user_data.json")
    print("   python generate_portfolio_from_json.py user_data.json custom_output")

if __name__ == "__main__":
    main()
