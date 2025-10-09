### Summary

This Svelte component processes a user-uploaded text file, extracts relevant keywords, and allows the user to download a modified version of the file with keyword annotations. The code includes functions for file upload, content manipulation, keyword extraction, and file download. Here's a breakdown of key parts:

#### **Imports:**
- **`shared.svelte`:** Imports several variables and helper functions like `allKeywords`, `kwFormat`, `formatKeyword`, `atx`, and `country` used for keyword matching and formatting.
- **`keyword-extractor`:** A library used for extracting keywords from text.
- **`fastest-levenshtein`:** Used to calculate the distance between strings, which helps in matching keywords even if they are slightly misspelled or modified.

#### **State Variables:**
- **`fileContent`**: Stores the content of the uploaded file.
- **`fileName`**: Stores the name of the uploaded file.
- **`keywords`**: Holds the list of detected keywords.
- **`modifiedContent`**: Stores the modified file content after keyword extraction and annotation.
- **`prg`**: Displays the progress of the file processing (in percentage).

#### **Functions:**

1. **`handleFileUpload(event)`**:
   - Handles the file upload event.
   - Reads the file content using `FileReader` and sets it to `fileContent`.
   - Initializes `modifiedContent` with the same content initially.

2. **`saveFile()`**:
   - Allows the user to download the modified content.
   - Removes unnecessary characters (like long dashes or extra newlines) and creates a downloadable blob with the processed content.
   - Downloads the file with the original file name.

3. **`kwExtract(text, thes)`**:
   - A function to extract keywords from text.
   - Replaces special characters and converts the text to lowercase.
   - Uses `keyword-extractor` to extract keywords and combines them with potential thesaurus keywords (if applicable).

4. **`calDist(l)`**:
   - A helper function that calculates a "distance" based on the keyword length, used for matching keywords with similar but not identical terms (i.e., handling minor typos or variations).

5. **`getKeywords()`**:
   - The main function for processing the text and extracting keywords.
   - Splits the content into lines and processes each line to find relevant keywords.
   - Filters out long or irrelevant keywords (based on predefined `problematic` words and length restrictions).
   - Combines single, double, triple, and quad-word combinations to search for matching keywords.
   - Uses Levenshtein distance to find closely related terms.
   - Supports different keyword formats (`specific`, `detailed`, or `groupedOutput`) and also looks for category-specific or country-specific keywords.
   - The output is a modified version of the content with keywords annotated.

6. **Category and Country Matching**:
   - The script checks for predefined category names (from `atx`) and country names (from `country`).
   - Adds these as keywords if they appear in the text.

#### **Keyword Formats (`kwFormat`)**:
- **`specific`**: Only categorized keywords are considered.
- **`detailed`**: Prevents duplicate keywords in the same line and prefers more detailed keyword annotations.
- **`groupedOutput`**: Groups the keywords at the end of each line.

#### **Progress Tracking**:
- The `prg` variable tracks the progress as the file is processed, updating the user with the percentage of lines analyzed.
- The function `getKeywords()` provides performance statistics, including the number of keywords found and the processing time.

#### **Final Output**:
- Once processing is complete, the `modifiedContent` contains the original file content with keyword annotations.
- The user can download this modified version with the `saveFile()` function.

This component is useful for text processing, keyword extraction, and content enhancement, particularly when working with large text datasets that require keyword annotation or classification.  

  
![](https://github.com/schmar00/kw-app/blob/main/src/kwapp720.gif)

# Svelte + Vite

This template should help get you started developing with Svelte in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## notes
```
npm create vite@latest  
```  
-> kw-app  
select Svelte  
select JavaScript  
  
```  
cd kw-app  
npm install  
npm run dev  
```  
  
in app.svelte ->  
```  
	<script>  
	 let count = $state(0);  
	</script>  
	<button onclick={() => count++}>  
	 clicks: {count}  
	</button>  
```  
legacy -> runes mode !!  
__________________________________________  
  
```  
npx svelte-add@latest tailwindcss  
npm i  
npm run dev  
```  
```  
tailwind.config.js ??? ->  
/** @type {import('tailwindcss').Config} */  
export default {  
  content: ["./src/**/*.{html,js,svelte,ts}",  
    './pages/**/*.{html,js}',  
    './components/**/*.{html,js}',  
  ],  
  
  theme: {  
    extend: {}  
  },  
  
  plugins: []  
};  
```