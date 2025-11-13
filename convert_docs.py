#!/usr/bin/env python3
"""
Convert Ghostty MDX documentation to a single Markdown file.
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple


class MDXConverter:
    def __init__(self, docs_dir: str):
        self.docs_dir = Path(docs_dir)
        self.nav_file = self.docs_dir / "nav.json"
        self.output = []
        self.toc_entries = []
        self.section_anchors = {}  # Map paths to anchor IDs

    def slugify(self, text: str) -> str:
        """Convert text to a URL-safe anchor."""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')

    def get_file_path(self, path: str, parent_path: str = "") -> Path:
        """Construct the full file path for a doc page."""
        # Combine parent path with current path
        full_path = parent_path + path

        # Remove leading /docs if present
        if full_path.startswith('/docs'):
            full_path = full_path[5:]

        # If path ends with /, look for index.mdx
        if full_path.endswith('/') or full_path == '':
            full_path += 'index'

        # Add .mdx extension
        file_path = self.docs_dir / (full_path.lstrip('/') + '.mdx')

        return file_path

    def extract_title(self, content: str) -> str:
        """Extract title from frontmatter."""
        match = re.search(r'^---\s*\ntitle:\s*(.+?)\n', content, re.MULTILINE)
        if match:
            title = match.group(1).strip()
            # Remove quotes if present
            if title.startswith('"') and title.endswith('"'):
                title = title[1:-1]
            return title
        return ""

    def remove_frontmatter(self, content: str) -> str:
        """Remove YAML frontmatter from content."""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                return parts[2].strip()
        return content

    def convert_mdx_components(self, content: str) -> str:
        """Convert MDX components to standard Markdown."""

        # Convert callout components (Note, Tip, Important, Warning, Caution)
        callout_types = ['Note', 'Tip', 'Important', 'Warning', 'Caution']
        for callout_type in callout_types:
            # Match opening and closing tags with content in between
            pattern = rf'<{callout_type}>(.*?)</{callout_type}>'

            def replace_callout(match):
                inner_content = match.group(1).strip()
                # Convert to blockquote
                lines = inner_content.split('\n')
                quoted_lines = []
                for i, line in enumerate(lines):
                    if i == 0:
                        # First line gets the label
                        quoted_lines.append(f'> **{callout_type}:** {line}')
                    else:
                        if line.strip():
                            quoted_lines.append(f'> {line}')
                        else:
                            quoted_lines.append('>')
                return '\n'.join(quoted_lines)

            content = re.sub(pattern, replace_callout, content, flags=re.DOTALL)

        # Convert VTSequence component to code block
        # Matches: <VTSequence sequence="BS" /> or <VTSequence sequence={["CSI", "Pn", "Z"]} />
        def replace_vtsequence(match):
            sequence_attr = match.group(1)
            # Remove quotes and braces
            sequence_attr = sequence_attr.replace('{', '').replace('}', '').replace('[', '').replace(']', '')
            sequence_attr = sequence_attr.replace('"', '').replace("'", '')
            # Join with spaces if multiple parts
            parts = [p.strip() for p in sequence_attr.split(',')]
            sequence_text = ' '.join(parts)
            return f'**Sequence:** `{sequence_text}`'

        content = re.sub(r'<VTSequence\s+sequence=([^/]+)/>', replace_vtsequence, content)

        # Convert ButtonLinks component
        button_pattern = r'<ButtonLinks\s+[^>]*links=\{(\[[^\]]+\])\}[^>]*/>'

        def replace_buttonlinks(match):
            links_str = match.group(1)
            # Extract href and text from each link object
            links = []
            for link_match in re.finditer(r'text:\s*"([^"]+)"[^}]*href:\s*"([^"]+)"', links_str):
                text, href = link_match.groups()
                links.append(f'- [{text}]({href})')
            return '\n'.join(links) if links else ''

        content = re.sub(button_pattern, replace_buttonlinks, content, flags=re.DOTALL)

        # Convert CardLinks component
        card_pattern = r'<CardLinks\s+cards=\{(\[.*?\])\s*\}\s*/>'

        def replace_cardlinks(match):
            cards_str = match.group(1)
            # Extract title, description, and href
            links = []
            for card_match in re.finditer(
                r'title:\s*"([^"]+)"[^}]*description:\s*"([^"]+)"[^}]*href:\s*"([^"]+)"',
                cards_str,
                re.DOTALL
            ):
                title, desc, href = card_match.groups()
                desc = desc.replace('\n', ' ').strip()
                links.append(f'- **[{title}]({href})**: {desc}')
            return '\n'.join(links) if links else ''

        content = re.sub(card_pattern, replace_cardlinks, content, flags=re.DOTALL)

        return content

    def fix_internal_links(self, content: str) -> str:
        """Convert internal links to anchor references."""

        def replace_link(match):
            link_text = match.group(1)
            link_url = match.group(2)

            # Only process internal docs links
            if link_url.startswith('/docs/'):
                # Map the URL to an anchor
                anchor = self.section_anchors.get(link_url, None)
                if anchor:
                    return f'[{link_text}](#{anchor})'
                else:
                    # Try without /docs prefix
                    path = link_url.replace('/docs/', '')
                    anchor = self.section_anchors.get(path, None)
                    if anchor:
                        return f'[{link_text}](#{anchor})'
                    # If no mapping, create a best-guess anchor
                    anchor = self.slugify(path.replace('/', '-'))
                    return f'[{link_text}](#{anchor})'
            elif link_url.startswith('/download'):
                # Keep download links as external
                return f'[{link_text}](https://ghostty.org{link_url})'
            elif link_url.startswith('/'):
                # Other internal links (non-docs)
                return f'[{link_text}](https://ghostty.org{link_url})'

            # Keep external links as-is
            return match.group(0)

        # Match markdown links
        content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, content)

        return content

    def process_nav_item(self, item: Dict[str, Any], parent_path: str = "", level: int = 1) -> None:
        """Process a navigation item recursively."""

        if item['type'] == 'folder':
            # Skip release-notes folder entirely
            if item['path'] == '/release-notes':
                print(f"  Skipping release notes folder")
                return

            # Add folder heading
            folder_path = parent_path + item['path']
            title = item['title']
            anchor = self.slugify(f'{folder_path}'.strip('/').replace('/', '-'))

            # Store anchor mapping
            self.section_anchors[folder_path] = anchor

            # Add to TOC
            indent = '  ' * (level - 1)
            self.toc_entries.append(f'{indent}- [{title}](#{anchor})')

            # Add section heading with explicit anchor
            heading = '#' * (level + 1)
            self.output.append(f'\n<a id="{anchor}"></a>')
            self.output.append(f'{heading} {title}\n')

            # Process children
            for child in item.get('children', []):
                self.process_nav_item(child, folder_path, level + 1)

        elif item['type'] == 'link':
            # Process the actual document
            path = parent_path + item['path']
            title = item['title']

            # Get the file
            file_path = self.get_file_path(item['path'], parent_path)

            if not file_path.exists():
                print(f"  Warning: File not found: {file_path}")
                return

            # Read content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract title from frontmatter if not provided
            extracted_title = self.extract_title(content)
            if extracted_title:
                title = extracted_title

            # Create anchor from path
            anchor = self.slugify(f'{path}'.strip('/').replace('/', '-'))

            # Store anchor mapping
            self.section_anchors[path] = anchor
            full_path = f'/docs{path}'
            self.section_anchors[full_path] = anchor

            # Add to TOC
            indent = '  ' * (level - 1)
            self.toc_entries.append(f'{indent}- [{title}](#{anchor})')

            # Remove frontmatter
            content = self.remove_frontmatter(content)

            # Convert MDX components
            content = self.convert_mdx_components(content)

            # Add section heading with explicit anchor
            heading = '#' * (level + 1)
            self.output.append(f'\n<a id="{anchor}"></a>')
            self.output.append(f'{heading} {title}\n')
            self.output.append(content)
            self.output.append('\n')

            print(f"  ✓ Processed: {path}")

    def build_toc(self) -> str:
        """Build table of contents."""
        toc = ['# Ghostty Documentation\n']
        toc.append('> Complete offline documentation for Ghostty terminal emulator\n')
        toc.append('> This file was generated from the official Ghostty documentation\n')
        toc.append('> Original source: https://ghostty.org/docs\n')
        toc.append('\n## Table of Contents\n')
        toc.extend(self.toc_entries)
        toc.append('\n---\n')
        return '\n'.join(toc)

    def convert(self) -> str:
        """Main conversion function."""

        # Load navigation structure
        with open(self.nav_file, 'r', encoding='utf-8') as f:
            nav_data = json.load(f)

        # Process navigation structure
        print("\nProcessing documentation files...")
        for item in nav_data['items']:
            self.process_nav_item(item)

        # Build final document
        result = self.build_toc()
        result += '\n'.join(self.output)

        # Second pass: fix internal links
        print("\nFixing internal links...")
        result = self.fix_internal_links(result)

        return result


def main():
    docs_dir = '/home/user/website/docs'
    output_file = '/home/user/website/ghostty-docs.md'

    print("=" * 70)
    print("Converting Ghostty Documentation from MDX to Markdown")
    print("=" * 70)
    print(f"Source: {docs_dir}")
    print(f"Output: {output_file}")

    converter = MDXConverter(docs_dir)
    markdown_content = converter.convert()

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

    print(f"\n{'=' * 70}")
    print(f"✓ Conversion complete!")
    print(f"{'=' * 70}")
    print(f"Output file: {output_file}")
    print(f"Total sections: {len(converter.toc_entries)}")
    print(f"Total lines: {len(markdown_content.splitlines())}")
    print(f"File size: {len(markdown_content) / 1024:.1f} KB")


if __name__ == '__main__':
    main()
