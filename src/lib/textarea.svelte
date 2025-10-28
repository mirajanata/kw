<script>
  import { allKeywords, kwFormat, formatKeyword, atx, country, euroscivoc, ignoreKw } from './shared.svelte'

  import { kwx } from '../kwx/kwx.js'

  let fileContent, fileName, keywords
  let modifiedContent = '';


  // Handle file selection and reading
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileName = file.name; // Store the original file name
    const reader = new FileReader();
    reader.onload = function(e) {
      fileContent = e.target.result; // Read the file content
      //console.log(fileContent)
      prg = '0%';
      // @ts-ignore
      modifiedContent = fileContent; // Set modified content to be the same initially
    };
    reader.readAsText(file);
    //console.log(file)
  }

  // Trigger file download after modification
  function saveFile() {
    const blob = new Blob([modifiedContent.replace(/\—|\n\n/g,'').replace(/\n\n/g,'\n')], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // Save with the original file name
    link.click();
    // Clean up URL object after download
    URL.revokeObjectURL(link.href);
  }

  //possible to solve with keyword selection
  let problematic = [];
  //let problematic = ['cation', 'geology', 'information', 'containment', 'granite', 'mass wasting', 'capping', 'primary', 'polder', 'coast', 'rock', 'placer', 'atmospheric causes', 'joint', 'copper'];

  let prg = '0%';
  $: prg = (kwx.progress).toString().split('.')[0] + '%';

   async function getKeywords(){
    kwx.progress=0;
    let content = modifiedContent.split('\n');
    let newContent = '';
    // filter out keywords with more than 4 words and more than 40 characters
    let filteredKeywords = await allKeywords.arr
      .filter(a => (a.newLabelArr.length < 5 && a.len < 40))
      .filter(a => !problematic.includes(a.label)); 

    if (kwFormat.significant){
      filteredKeywords = filteredKeywords.filter(a => ignoreKw.indexOf(`-${a.uri.split('/')[6]}-`) == -1);
    }  

    let rout = "";
    let r = await kwx.getKeywordList(
      modifiedContent, 
      {
        keywords: filteredKeywords,
        atx: atx,
        country: kwFormat.geonames ? country: null,
        euroscivoc: kwFormat.specific ? euroscivoc:null,
        detailedOutput: true,
        detailedOutputFunction: async (item)=> {
          rout += item.line + '\n\n\t' +  item.keywords.map(a => formatKeyword(a.label, a.uri)).join('') + '\n';
          rout += '————————————————————————————————————————————————————\n';
          if (kwx.progress%10==0) {
            kwx.progress = kwx.progress;
            // todo: propagate to svelte?
          }
        }
      }
    );
    console.log("kwx time(s):"+r.time);

    newContent += rout;

    modifiedContent = newContent;
    prg = 'analysed ' + content.length + ' texts, in ' + (r.time).toFixed(2) + 's, avg. ' + Math.round(r.kwCount/(content.length==0?1:content.length)) + ' of total ' +  r.kwCount + ' keywords';
  }

</script>

<div class="mb-2">
  <label class="block text-sm font-medium text-gray-900 dark:text-white" for="file_input">
    Upload file
    <span class="text-sm text-gray-500 dark:text-gray-300" id="file_input_help">(.txt, .csv, .tsv)</span>
  </label>
</div>
<div class="flex justify-between">
  <div>
    <!-- tsv not ready yet -->
    <input accept="text/csv, text/txt, text/tsv" on:change={handleFileUpload} class="text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" type="file">
    {#if modifiedContent.length > 2}
      <button type="button" on:click={saveFile} class="ml-6 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">download CSV file</button>
    {/if}
  </div>
  <div class="">
    {#if modifiedContent == ''}
      <button type="button" class="dark:text-gray-500 text-white bg-gray-300 dark:bg-gray-700 cursor-not-allowed font-medium rounded-lg text-xl px-5 py-2.5 mb-3 text-center" disabled>add keywords</button>
    {:else}
      <button type="button" on:click={getKeywords} class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          add keywords
        </span>
      </button>
    {/if}
  </div>
</div>

<div class="mt-4">
  <textarea bind:value={modifiedContent}
    id="message" rows="4" class="block p-2.5 min-h-96 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your text here..."></textarea>
</div>

<div class="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700 mt-1">
  <div class="bg-gradient-to-r to-emerald-600 from-sky-400 h-0.5 rounded-full" style="width: {prg}"></div>
</div>
{#if prg != '0%'}
  <div class="flex justify-end mb-1">
    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{prg}</span>
  </div>
{/if}