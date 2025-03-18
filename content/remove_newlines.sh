#!/bin/zsh

# Display usage if no arguments are provided
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <input_folder>"
    echo "Example: $0 ./my_markdown_files"
    exit 1
fi

# Get the input folder from command line argument
input_folder="$1"

# Check if the input folder exists
if [[ ! -d "$input_folder" ]]; then
    echo "Error: Input folder '$input_folder' does not exist or is not a directory."
    exit 1
fi

# Create output folder (input_folder_name_no_newline)
output_folder="${input_folder%/}_no_newline"
mkdir -p "$output_folder"

echo "Processing Markdown files from: $input_folder"
echo "Saving processed files to: $output_folder"

# Process all markdown files in the specified folder
find "$input_folder" -type f -name "*.md" | while read -r file; do
    # Get just the filename without the path
    filename=$(basename "$file")
    new_file="$output_folder/${filename%.md}_no_newline.md"
    
    # Use Perl to replace single newlines with spaces, preserve double newlines
    perl -0777 -pe 's/(?<!\n)\n(?!\n)/ /g' "$file" > "$new_file"
    
    echo "Processed: $filename -> $(basename "$new_file")"
done

echo "All files processed successfully."

