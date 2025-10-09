import { distance } from 'fastest-levenshtein';
import keyword_extractor from 'keyword-extractor';


export let kwx = {
  options: {
    maxN: 4, // max number of words in a keyword (N-word generalization)
    maxLength: 40,
    language: 'english',
    sleepDelay: 5,
    extractExceptions: ['well', 'causes'],
    keywords: null,
    atx: null,
    country: null,
    euroscivoc: null,
    detailedOutput: false,
    detailedOutputFunction: null,
    summaryOutputFunction: null
  },

  
  async getKeywordList(content, options) {
    options = {...this.options, ...options};
    const {
      maxN,
      keywords,
      atx, 
      country, 
      euroscivoc,
      detailedOutput,
      detailedOutputFunction,
      summaryOutputFunction
    } = options;

    const start = performance.now();
    const lines = content.split('\n').filter(l => l.trim() !== '');
    let counter = 0;
    this.progress = "0%";

    for (const kw of keywords) {
        kw.kwJoined = kw.newLabelArr.join('');
    }
    const summary = new Set();
    const result = [];
    const foundKeywords = new Set();
    for (const line of lines) {
      const entryLower = line.toLowerCase();
      counter++;
      this.progress = Math.floor(counter / lines.length * 100) + '%';
      
      const words = this.extractKeywords(entryLower, options, false);
      const searchArr = this.generateSearchArray(words, maxN);
      foundKeywords.clear();

      // --- Check similarity between text and thesaurus keywords ---
      for (const kw of keywords) {
        const kwJoined = kw.kwJoined;
        const distLimit = this.calDist(kwJoined.length);

        for (const word of searchArr) {
          if (
            word[0] == kwJoined[0] &&
            Math.abs(word.length - kw.label.length) < 4 &&
            distance(kwJoined, word) <= distLimit
          ) {
            foundKeywords.add(kw);
            break; // small optimization
          }
        }
      }

      // --- Add contextual keywords ---
      const kwURIs = foundKeywords.entries().map(a => a[1].uri).toArray();
      if (atx) {
        for (const x of atx) {
          if (entryLower.includes(x[0]) && !kwURIs.includes(x[2])) {
            foundKeywords.add({ label: x[1], uri: x[2], topic: '' });
            kwURIs.push(x[2]);
          }
        }
      }

      if (country) {
        const gnURIs = [];
        for (const x of country) {
          if (entryLower.includes(x[0]) && !gnURIs.includes(x[2])) {
            foundKeywords.add({ label: x[1], uri: x[2] });
            gnURIs.push(x[2]);
          }
        }
      }

      if (euroscivoc) {
        const esv = foundKeywords.entries().map(a => a[1].topic).toArray().join(';').toLowerCase();
        for (const x of euroscivoc) {
          if (esv.includes(x[1])) {
            foundKeywords.add({ label: x[1], uri: x[2] });
          }
        }
      }

      if (detailedOutput) {
        let output = {
          row: counter,
          line: line,
          keywords: foundKeywords.size>0 ? Array.from(foundKeywords): []
        };
        result.push(output);
        if (detailedOutputFunction) 
          detailedOutputFunction(output);
      } else {
        foundKeywords.forEach(summary.add, summary);
      }
    }

    if (detailedOutput)
      return {
      detailedOutput: result,
      time:((performance.now() - start)/1000)
    };

    let output = {
      summary: Array.from(summary),
      time:((performance.now() - start)/1000)
    };
    if (summaryOutputFunction)
      summaryOutputFunction(output);
    return output;
  },

// --- Utility Methods ---

  extractKeywords(lowerText, options, thesaurus = false) {
    // normalize
    lowerText = lowerText.replace(/_|"|-|\.|:|'|\//g, ' ');
    const { extractExceptions } = options;
    const words = lowerText.split(' ');
    const hasException = extractExceptions.some(w => words.includes(w));

    const extracted = keyword_extractor.extract(lowerText, {
      language: options.language,
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: false
    });

    return hasException
      ? (thesaurus ? words : [...words, ...extracted])
      : extracted;
  },

  calDist(l) {
    return l > 17 ? 3 : l > 12 ? 2 : l > 5 ? 1 : 0
  },

  createNGrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(''));
    }
    return ngrams;
  },

  generateSearchArray(words, maxN) {
    let all = [];
    for (let i = 1; i <= maxN; i++) {
      all.push(...this.createNGrams(words, i));
    }
    return all;
  },

  progress: "0%"

};

let keywordExtractor = kwx;
export default keywordExtractor;
