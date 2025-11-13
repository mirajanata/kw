<script>
  import { kwx } from "../kwx/kwx.js";
  import { Ldc } from "../ldc/Ldc.js";
  import { Ldc_EGDI } from "../ldc/Ldc_EGDI.js";
  import { Ldc_OpenAIRE } from "../ldc/Ldc_OpenAIRE.js";

  let textFile = null;
  let consoleOutput = "";
  let consoleData = "";
  let progress = "0%";
  let ldcFile = "ldc.txt";
  Ldc.consoleOutput = function (text) {
    console.log(text);
    consoleData += "\n" + text;
    consoleOutput = "<pre><code>" + consoleData + "</code></pre>";
    progress = Ldc.progress + "%";
  };
  function saveLdcFile(text) {
    console.log(
      "----------------------- saveLdcFile -------------------------------",
    );
    var data = new Blob([text], { type: "text/plain" });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  }

  async function getLdcData() {
    var ldcText = "";
    let link = document.getElementById("ldcDownloadlink");
    let button = document.getElementById("ldcCreate");
    let sourceIndex = document.getElementById("selLdcSource").selectedIndex;
    link.style.display = "none";
    consoleData = "";
    Ldc.progress = 0;
    button.disabled = true;
    const start = performance.now();
    Ldc.consoleOutput("Starting LinkData Import...\n");
    await Ldc.createOrgsAndProjectsData((text) => {
      if (ldcText.indexOf(text) < 0) ldcText = ldcText.concat(text);
      else text = text;
    }, sourceIndex);
    button.disabled = false;
    Ldc.consoleOutput(
      "Finished LinkData Import (" +
        (performance.now() - start) / 1000 +
        "s).\n",
    );
    ldcFile = Ldc.fileName;
    link.href = saveLdcFile(ldcText);
    link.style.display = "block";
  }
</script>

<div style="border: 0.5px solid grey; padding: 2px;">
  <h2
    class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
  >
    Link Data Retrieval
  </h2>
  <div class="flex justify-left">
    <select
      id="selLdcSource"
      class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium"
    >
      <option value="0">EGDI</option>
      <option value="1">Open AIRE</option>
    </select>
    <button
      type="button"
      id="ldcCreate"
      on:click={getLdcData}
      style="width:175px;padding: 5px;"
      class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
    >
      <span> Start </span>
    </button>
    <div class="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700 mt-2">
      <div
        class="bg-gradient-to-r to-emerald-600 from-sky-400 h-0.5 rounded-full"
        style="width: {progress}"
      ></div>
    </div>
    <div class="flex justify-end mb-1 ml-1">
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
        >{progress}</span
      >
    </div>
  </div>
  <div class="flex justify-left mb-1 ml-1">
    <a download="{ldcFile}" id="ldcDownloadlink" style="display: none;"
      >Download RDF data</a
    >
  </div>
</div>

<div
  style="max-height: 200px;overflow:auto;"
  contenteditable="true"
  bind:innerHTML={consoleOutput}
></div>
