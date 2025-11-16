#!/usr/bin/env python3
"""
Portfolio Generator - Main Entry Point

This is the main script to generate portfolios from JSON input.
It automatically handles the organized folder structure.

Usage:
    python portfolio_generator.py input.json [output_dir]
    python portfolio_generator.py input.json
"""

import sys
import os

# Add the organized structure to Python path
sys.path.append('organized_structure/core_files')
sys.path.append('organized_structure/generation')

def main():
    """Main entry point for portfolio generation."""
    if len(sys.argv) < 2:
        print("🚀 Portfolio Generator")
        print("=" * 40)
        print("Usage: python portfolio_generator.py input.json [output_dir]")
        print("\nExamples:")
        print("  python portfolio_generator.py user_data.json")
        print("  python portfolio_generator.py user_data.json custom_output")
        print("\n📁 Organized Structure:")
        print("  organized_structure/")
        print("  ├── core_files/          # Core functionality")
        print("  ├── training/            # Training scripts")
        print("  ├── generation/          # Generation scripts")
        print("  ├── models/             # ML models")
        print("  ├── outputs/            # Generated portfolios")
        print("  ├── documentation/      # Documentation")
        print("  └── examples/           # Example files")
        return
    
    input_json = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'generated_portfolios'
    
    # Import and run the robust generator
    try:
        from generate_portfolio_from_json_robust import generate_portfolio_from_json
        
        print("🚀 Portfolio Generator - Organized Structure")
        print("=" * 50)
        
        result = generate_portfolio_from_json(input_json, output_dir)
        
        if result['success']:
            print(f"\n🎉 Portfolio generation successful!")
            print(f"📄 JSON: {result['json_path']}")
            if result['html_path']:
                print(f"🌐 HTML: {result['html_path']}")
            print(f"📊 Summary: {result['summary_path']}")
        else:
            print(f"\n❌ Portfolio generation failed: {result['error']}")
            sys.exit(1)
            
    except ImportError as e:
        print(f"❌ Error importing modules: {e}")
        print("Make sure you're running from the project root directory")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
