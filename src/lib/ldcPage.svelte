<script>
  import { kwx } from "../kwx/kwx.js";
  import { Ldc } from "../ldc/Ldc.js";
  import { Ldc_OpenAIRE } from "../ldc/Ldc_OpenAIRE.js";

  let textFile = null;
  let consoleOutput = "";
  let consoleData = "";
  let progress = "0%";
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
    link.style.display = "none";
    consoleData = "";
    Ldc.progress = 0;
    button.disabled = true;
    Ldc.consoleOutput("Starting LinkData Import...\n");
    await Ldc.createOrgsAndProjectsData((text) => {
      ldcText = ldcText.concat(text);
    });
    button.disabled = false;
    Ldc.progress = 0;
    Ldc.consoleOutput("Finished LinkData Import.\n");
    link.href = saveLdcFile(ldcText);
    link.style.display = "block";
  }
</script>

<div class="flex justify-left">
  <button
    type="button"
    id="ldcCreate"
    on:click={getLdcData} style="width:290px;"
    class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
  >
    <span
      class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0"
    >
      Retrieve Link Data
    </span>
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
  <a download="ldc.txt" id="ldcDownloadlink" style="display: none;">Download RDF data</a>
</div>

<div
  style="max-height: 200px;overflow:auto;"
  contenteditable="true"
  bind:innerHTML={consoleOutput}
></div>
