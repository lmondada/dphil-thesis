#!/bin/zsh

for file in *.md; do
    if [[ -f "$file" ]]; then
        new_file="${file%.md}_no_newline.md"
        # Use Perl to replace single newlines with spaces, preserve double newlines
        perl -0777 -pe 's/(?<!\n)\n(?!\n)/ /g' "$file" > "$new_file"
        
        echo "Processed: $file -> $new_file"
    fi
done

