<script>
  import { kwx } from "../kwx/kwx.js";
  import { Ldc } from "../ldc/Ldc.js";
  import { OpenAIRE } from "../ldc/OpenAIRE.js";

  let textFile = null;
  function saveLdcFile(text) {
    console.log("----------------------- saveLdcFile -------------------------------");
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
    await Ldc.createOrgsAndProjectsData((text) => {
      ldcText = ldcText.concat(text);
    });

    let link = document.getElementById("ldcDownloadlink");
    link.href = saveLdcFile(ldcText);
    link.style.display = "block";
  }
</script>

<div class="flex justify-between">
    <button
      type="button"
      on:click={getLdcData}
      class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
    >
      <span
        class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0"
      >
        Retrieve Link Data (OpenAIRE)
      </span>
    </button>
    <a download="ldc.txt" id="ldcDownloadlink" style="display: none">Download</a
    >
</div>
