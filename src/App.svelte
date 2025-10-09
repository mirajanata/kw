<script>
// @ts-nocheck

  import "./app.css";
  import Grid from 'svelte-grid-responsive';
  import Title from './lib/title.svelte';
  import KeywordStyle from "./lib/keywordStyle.svelte";
  import Keyword from './lib/keyword.svelte';
  import Textarea from './lib/textarea.svelte';




</script>

<Grid container gutter={12}>
  <Grid xs={12} lg={8}><Title /></Grid>
  <Grid xs={12} lg={4}><KeywordStyle /></Grid>
  
  <Grid xs={12} lg={8}><Textarea /></Grid>
  <Grid xs={12} lg={4}><Keyword /></Grid>
</Grid> 

<!-- 
Component props:
Prop	    Default	Type	  Description

container	false	  bool	  Defines whether the grid is a container
gutter	  null	  number	Grid spacing in the container
columns	  12	    number	Setting columns count in the container
order	    null	  number	Order the columns
xs	      null	  number	Size in extra small screen
sm	      null	  number	Size in small screen
md	      null	  number	Size in medium screen
lg	      null	  number	Size in large screen
xl	      null	  number	Size in extra large screen
xsOffset	null	  number	Offset in extra small screen
smOffset	null	  number	Offset in small screen
mdOffset	null	  number	Offset in medium screen
lgOffset	null	  number	Offset in large screen
xlOffset	null	  number	Offset in extra large screen
 -->

 <footer class="">
  <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <div class="sm:flex sm:items-center sm:justify-between">
          <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© {new Date().getFullYear()} <a href="https://europe-geology.eu" class="hover:underline">EGDI</a> 
          </span>
          <div class="flex mt-4 sm:justify-center sm:mt-0">
              <a href="https://github.com/schmar00/kw-app" title="GitHub" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                  <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
                  </svg>
                  <span class="sr-only">GitHub account</span>
              </a>
              <a href="https://geusgitlab.geus.dk" title="GitLab GEUS" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                  <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <g>
                      <path fill-rule="evenodd" />
                      <path d="M5.868 2.75L8 10h8l2.132-7.25a.4.4 0 0 1 .765-.01l3.495 10.924a.5.5 0 0 1-.173.55L12 22 1.78 14.214a.5.5 0 0 1-.172-.55L5.103 2.74a.4.4 0 0 1 .765.009z"/>
                  </g>
                  </svg>
                  <span class="sr-only">GitLab GEUS</span>
              </a>
              <a href="https://geuscloud.geus.dk/index.php" title="NextCloud GEUS" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                  <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 193 166">
                    <g>
                      <path d="M63.9,93.9c6.5,16.9,18,27.3,36.3,27.3c18.3,0.1,29.7-10.3,36.4-27.1c5.9,9.9,14.1,15.3,25.5,13.6 c11.1-1.7,17.8-8.9,21-19.6c0,0.9,0.1,1.7,0.1,2.6c0,23.3,0,46.5,0,69.8c0,0.6,0,1.2,0,1.7c-0.3,4-0.8,4.4-4.8,4.4 c-52.3,0-104.7,0-157,0c-3.3,0-3.6-0.2-4.1-3.5c-0.1-0.7-0.1-1.5-0.1-2.2c0-23.6,0-47.2,0-70.8c0-0.7,0.1-1.3,0.2-2.1 c3.1,10.9,9.8,18.1,21.1,19.7C49.8,109.4,58,103.9,63.9,93.9z"/>
                      <path d="M183.2,78.5c-5.8-22.6-34.7-27.8-46.7-6.2c-6.6-16.6-18-27-36.3-26.9c-18.3,0-29.7,10.4-36.3,27.3 c-5.9-9.9-14-15.5-25.4-13.8c-11.3,1.6-18,8.8-21.1,20.3c-0.1-1-0.2-1.4-0.3-1.8c0-0.4,0-0.8,0-1.2c0-23.3,0-46.7,0-70 c0-0.3,0-0.7,0-1c0.2-4.5,0.8-5,5.2-5c52.2,0,104.3,0,156.5,0c3.4,0,3.8,0.3,4.3,3.6c0.1,0.8,0.1,1.7,0.1,2.5c0,23.3,0,46.5,0,69.8 C183.2,76.8,183.2,77.6,183.2,78.5z"/>
                      <path d="M100.3,59.7c13.1,0,23.3,10.2,23.3,23.5c0.1,13.3-10.1,23.6-23.4,23.7c-13,0-23.3-10.3-23.4-23.5 C76.8,70.1,87.1,59.7,100.3,59.7z"/>
                      <path d="M168.8,83.3c0,5.7-4.7,10.4-10.3,10.4c-5.6,0-10.2-4.8-10.2-10.5c0.1-5.6,4.6-10.2,10.1-10.2 C164,72.9,168.8,77.7,168.8,83.3z"/>
                      <path d="M31.4,83.2c0.1-5.7,4.8-10.3,10.4-10.3C47.4,73,52,77.8,51.9,83.5c-0.1,5.6-4.7,10.2-10.2,10.2 C36.1,93.7,31.4,88.9,31.4,83.2z"/>
                    </g>
                  </svg>
                  <span class="sr-only">NextCloud GEUS</span>
              </a>
              <a href="none" title="LinkedIn EGDI" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
                  <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 33 33">
                    <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z"></path>
                  </svg>
                  <span class="sr-only">LinkedIn</span>
              </a>
          </div>
      </div>
 </footer>