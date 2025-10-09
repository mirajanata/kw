<script>
	import { allKeywords } from './shared.svelte'
	import { onMount } from 'svelte';
  import keyword_extractor from 'keyword-extractor';
  import gifmovie from '/src/kwapp720.gif';

	const spEndpoint = 'https://resource.geosphere.at/graphdb/repositories/keyword';
  const spFormat = 'Accept=application%2Fsparql-results%2Bjson';

  const spQuery = `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT DISTINCT ?uri ?p ?l (STRLEN(?l) AS ?len)
        (GROUP_CONCAT(DISTINCT ?t; separator=";") AS ?topic)
        FROM <https://data.geoscience.earth/ncl/geoera/keyword>
        FROM <https://topic>
        WHERE {
        VALUES ?p {skos:prefLabel skos:altLabel}
        ?uri ?p ?l . FILTER(LANG(?l)='en') 
        OPTIONAL {?uri foaf:primaryTopic ?t}
        } GROUP BY ?uri ?p ?l
        ORDER BY DESC (?len)`;

	onMount(() => {
    fetch(spEndpoint + '?query=' + encodeURIComponent(spQuery) + '&' + spFormat)
      .then(res => res.json())
      .then(a => allKeywords.arr = (a.results.bindings.map(b => ({
        label: b.l.value.toLowerCase(),
        newLabelArr: kwExtract(b.l.value, true),
        uri: b.uri.value,
        len: b.len.value,
        topic: b.topic.value
      }))))
      .then(a=>console.log(allKeywords.arr));
  });	

  const extractExceptions = ['well', 'causes'];
    function kwExtract(text, thes){
        text = text.replace(/\_|\"|\-|\.|\:|\//g,' ').toLowerCase();
        let someExist = extractExceptions.some(word => text.split(' ').includes(word));
        let kArr = keyword_extractor.extract(text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false
        })
        // if keyword of thesaurus then without extraction
        return someExist ? thes ? text.split(' ') : text.split(' ').concat(kArr) : kArr;
    }

</script>


<h2 class="mb-4 text-3xl font-thin text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span class="text-transparent font-extrabold bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">keyword</span> assistant</h2>
<div class="text-base font-normal text-gray-500 lg:text-base dark:text-gray-400">
  For automatic keywording with the "<strong>GeoERA Keyword Thesaurus v2.2</strong>", you can load content via CSV file or insert it directly into the text field. Depending on the configuration, the keywords (in English) are appended to the text lines with numbers or URIs “tab-delimited” by clicking on “add keywords”. Keywords can also be searched for manually (on the right-hand side) and inserted into the text field using drag and drop. The result can then be saved as a CSV file (tab-delimited).
  <span class="inline-flex">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="DodgerBlue" class="size-4">
      <path fill-rule="evenodd" d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.515a1.75 1.75 0 0 1-1.75 1.75h-1.5c-.078 0-.155-.005-.23-.015H4.48c-.075.01-.152.015-.23.015h-1.5A1.75 1.75 0 0 1 1 15.265V4.75Zm16.5 7.385V11.01a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25v1.125c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25Zm0 2.005a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25v1.125c0 .108.069.2.165.235h1.585a.25.25 0 0 0 .25-.25v-1.11Zm-15 1.11v-1.11a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1.125a.25.25 0 0 1-.164.235H2.75a.25.25 0 0 1-.25-.25Zm2-4.24v1.125a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25V11.01a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25Zm13-2.005V7.88a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25v1.125c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25ZM4.25 7.63a.25.25 0 0 1 .25.25v1.125a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25V7.88a.25.25 0 0 1 .25-.25h1.5Zm0-3.13a.25.25 0 0 1 .25.25v1.125a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25V4.75a.25.25 0 0 1 .25-.25h1.5Zm11.5 1.625a.25.25 0 0 1-.25-.25V4.75a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1.125a.25.25 0 0 1-.25.25h-1.5Zm-9 3.125a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clip-rule="evenodd" />
    </svg>
    &nbsp; 
    <details class="text-xs cursor-pointer">
      <summary></summary>
      <img class="rounded-t-lg" src={gifmovie} alt="" />
    </details>
  </span>
</div>




