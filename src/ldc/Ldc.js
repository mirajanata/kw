import { allKeywords, kwFormat, atx, country, euroscivoc, ignoreKw } from '../lib/shared.svelte'
import { kwx } from '../kwx/kwx.js'

export let Ldc={
    taskCount: 0,
    sources:[],

    addSource: function(s) {
        this.sources.push(s);
    },

    getKeywords: async function (modifiedContent){
        let filteredKeywords = await allKeywords.arr
          .filter(a => (a.newLabelArr.length < 5 && a.len < 40)); 

        if (kwFormat.significant){
              filteredKeywords = filteredKeywords.filter(a => ignoreKw.indexOf(`-${a.uri.split('/')[6]}-`) == -1);
        }  

        let r = await kwx.getKeywordList(
            modifiedContent, 
        {
            keywords: filteredKeywords,
            atx: atx,
            country: kwFormat.geonames ? country: null,
            euroscivoc: kwFormat.specific ? euroscivoc:null
        });
        return r;
    },

    getOrgsAndProjectsList: async function() {
        let result = [];
        this.taskCount = 0;
        let tasks = [];
        for (let source of this.sources) {
            this.taskCount++;
            let r = await source.getOrgsAndProjectsList();
            this.normalizeData(r);
            if (r) {
                result.push(...r);
            }
            this.taskCount--;
        }
        await Promise.all(tasks);
        this.taskCount = 0;
        return result;
    },

    normalizeOrg: function(org) {
        if (org.websiteurl) {
            let a = org.websiteurl.split(".");
            let n = a.length - 1;
            org.identifier = "https://org.europe-geology.eu/"+a[n-1]+"."+a[n];
        } else {
            org.identifier = "https://org.europe-geology.eu/"+org.id;
        }
        return org;
    },
    normalizeData: function(orgs) {
        for (let org of orgs) {
            this.normalizeOrg(org);

            for (let p of org.projects) {
                p.identifier = p.acronym ?
                    p.acronym
                    .normalize("NFD")                   // Unicode-Normalising
                    .replace(/[\u0300-\u036f]/g, "")    // Diakritika
                    .toLowerCase()
                    .replaceAll(/[^a-z0-9]/g, "-")      // only a-z and 0-9
                    .replaceAll(/-+/g, '-')             //multi – to a single -
                    :
                    (p.id?p.id: p.code);                        
            }
        }
    },

    getOrgsAndProjectsText: async function() {
        let orgs = await this.getOrgsAndProjectsList();
        let r = '';
        for (let org of orgs) {
            let item = 
`
<${org.identifier}> <http://data.europa.eu/s66#Country> "${org.country}" .
<${org.identifier}> <http://data.europa.eu/s66#shortForm> "${org.shortName}" .
<${org.identifier}> <http://purl.org/dc/terms/identifier> "${org.id}" .
<${org.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Organization> .
<${org.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${org.name}" .
<${org.identifier}> <http://xmlns.com/foaf/0.1/page> <${org.websiteurl}> .
`;
            r += item;
            for ( let p of org.projects) {
                item = 
`
<https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#endDate> "${p.endDate}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#hasTotalCost> "${p.totalCost}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#shortForm> "${p.acronym}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#startDate> "${p.startDate}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/description> "${p.description}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/identifier> "${p.id}" .
<https://proj.europe-geology.eu/${p.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Project> .
<https://proj.europe-geology.eu/${p.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${p.projectTitle}" .
`;              
                r += item;

                for ( let rel of p.relations) {
                    r +=
`<https://org.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/relation> <${rel.identifier}> .
`;                    
                }

                let kwList = await this.getKeywords(p.description);

                for ( let kw of kwList.summary ) {
                    r+= 
`<https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/subject> <${kw.uri}> .
`

                }
            }
        }
        return r;
    }

};