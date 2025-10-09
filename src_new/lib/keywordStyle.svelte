<script>
    import { kwFormat } from './shared.svelte'   

</script>

<div class="m-6 flex">

  <div>
    <ul class="w-auto text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      <li class="w-full pl-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <input id="checked-checkbox" bind:checked={kwFormat.groupedOutput} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="checked-checkbox" class="mr-2 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">grouped keywords</label>
      </li>
      <li class="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <input id="label" bind:checked={kwFormat.labelOutput} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="label" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">keyword label</label>
      </li>
      <li class="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <input id="uri" bind:checked={kwFormat.uriOutput} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="uri" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">keyword ID</label>
      </li>
      <li class="w-full px-4 py-2 rounded-b-lg">
        <input id="path" bind:checked={kwFormat.pathOutput} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="path" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">incl. URI</label>
      </li>
    </ul>
  </div>

  <div class="ml-2">
    <ul class="w-auto text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      <li class="w-full pl-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <input id="detailed" bind:checked={kwFormat.detailed} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="detailed" class="mr-2 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">most detailed terms only</label>
      </li>
      <li class="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <input id="significant" bind:checked={kwFormat.significant} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="significant" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">significant terms only</label>
      </li>
      <li class="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <input id="specific" bind:checked={kwFormat.specific} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="specific" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">topics (EuroSciVoc)</label>
      </li>
      <li class="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <input id="geonames" bind:checked={kwFormat.geonames} type="checkbox" value="" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        <label for="geonames" class="w-full py-1 ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">country (GeoNames)</label>
      </li>
    </ul>
  </div>
</div>




