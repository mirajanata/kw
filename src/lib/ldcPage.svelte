<script>

  import { kwx } from '../kwx/kwx.js'
  import { Ldc } from '../ldc/Ldc.js';
  import { OpenAIRE } from '../ldc/OpenAIRE.js';

  let modifiedContent = '';

  async function getData() {
    const newWindow = window.open("", "ldc");
    newWindow.document.open();
    await Ldc.getOrgsAndProjectsText((text)=>{
        newWindow.document.write(text);
    });
  }

</script>

<div class="flex justify-between">
  <div class="">
      <button type="button" on:click={getData} class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          Get Project Data
        </span>
      </button>
  </div>
</div>

<div class="mt-4">
  <textarea bind:value={modifiedContent}
    id="message" rows="4" class="block p-2.5 min-h-96 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your text here..."></textarea>
</div>

