import { allKeywords, kwFormat, atx, country, euroscivoc, ignoreKw } from '../lib/shared.svelte'
import { kwx } from '../kwx/kwx.js'

/*

Ldc object is responsible for extracting organization and project data from various sources, transforming it, and generating RDF (Resource Description Framework) text in the N-Triples format.

The primary goal is to convert source data (like from OpenAIRE) into a standardized set of linked data triples related to organizations and projects, primarily referencing entities within the europe-geology.eu domain and using specific vocabularies (e.g., http://data.europa.eu/s66#).

Key Functionality

    Data Aggregation and Transformation:

        The Ldc object acts as an orchestrator, allowing multiple data sources to register themselves using the addSource(source) method.

        It defines the required data structures (see below) for organizations and projects that all sources must adhere to.

        Sources must provide an async function processOrgsAndProjectsList(async orgFunction) method to iterate over their data.

    RDF Generation (createOrgsAndProjectsData):

        This is the core method. It accepts a writerFunc callback (e.g., to output the generated text to a console or buffer).

        It iterates through all registered data sources by calling processOrgsAndProjectsList.

        For each organization and its associated projects, it generates RDF triples (statements) that define their properties (country, name, URL, acronym, dates, cost, description, etc.).

        It filters projects that already exist (p=>!p.exists) before generating their triples.

    Identifier Normalization:

        normalizeOrg(org) and normalizeProj(p) methods create unique, standardized URIs (identifier properties) for organizations and projects. Organization URIs are often derived from their website URL, and project URIs from their acronym or ID.

    Keyword Extraction (getKeywords):

        It integrates with an external kwx (Keyword Extraction) library.

        It prepares a filtered list of keywords from allKeywords and then uses kwx.getKeywordList on the project's description to automatically identify and extract relevant keywords.

        Extracted keywords are added to the project's RDF using the http://purl.org/dc/terms/subject predicate.

    Utility Methods:

        normalizeLiteral(s): Cleans up string literals by replacing newlines, tabs, and carriage returns with spaces for safer inclusion in RDF.

        consoleOutput(text): Simple wrapper for console.log for output.

        progress and progressSource: Variables to track the data processing status.

In essence, the Ldc object is a framework for harvesting disparate organizational and project data and converting it into a unified, semantically rich Linked Data format for easier consumption and integration with other data sources.

function LdcConsumerSample() {    
    let ldcText = "";
    Ldc.consoleOutput("Starting LinkData import...\n");
    await Ldc.createOrgsAndProjectsData((text) => {
      ldcText = ldcText.concat(text);
    });
    // process ldcText...
}

Ldc can use one or more data sources (i.e. Ldc_OpenAIRE.js and others) must be objects keeping following pettern:
    1. provide organization result structure
        let org = {
            source: "OpenAIRE",
            id: org.id,
            country: organization.country.label,
            name: organization.legalname,
            shortName: organization.legalshortname,
            websiteurl: organization.websiteurl,
            projects: [...project],
            relations: [...organization]
        }
    2. provide project result structure 
        let project = {
            acronym: project.acronym,
            code: project.code,
            projectTitle: project.title,
            startDate: project.startDate,
            endDate: project.endDate,
            id: dri.objIdentifier;
            description: "...";
            totalCost: = "number";
            currency: project.currency;
            projectTitle: project.projectTitle;    
        }
    3. provide method
        async function processOrgsAndProjectsList(async orgFunction),  calling await orgFunction(organization) for each organization found (structures in 1. and 2.)

    4. register self using Ldc.addSource(source) method
*/

export let Ldc = {
    taskCount: 0,
    sources: [],
    orgFunction: null,
    progress: 0,
    progressSource: "",
    consoleOutput: function (text) {
        console.log(text);
    },

    addSource: function (s) {
        this.sources.push(s);
    },

    createOrgsAndProjectsData: async function (writerFunc) {
        Ldc.progress = 0;
        let orgs = await this.processOrgsAndProjectsList(async (org) => {
            let item =
                `
<${org.identifier}> <http://data.europa.eu/s66#Country> "${org.country}" .
<${org.identifier}> <http://data.europa.eu/s66#shortForm> "${Ldc.normalizeLiteral(org.shortName)}" .
<${org.identifier}> <http://purl.org/dc/terms/identifier> "${org.id}" .
<${org.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Organization> .
<${org.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${Ldc.normalizeLiteral(org.name)}" .
<${org.identifier}> <http://xmlns.com/foaf/0.1/page> <${org.websiteurl}> .
`;
            writerFunc(item);

            for (let p of org.projects.filter(p=>!p.exists)) {
                item = `    <${org.identifier}> <http://purl.org/dc/terms/relation> <https://proj.europe-geology.eu/${p.identifier}> .
`;
                writerFunc(item);
                item = `    <https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#endDate> "${p.endDate}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#hasTotalCost> "${p.totalCost}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#shortForm> "${p.acronym}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://data.europa.eu/s66#startDate> "${p.startDate}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/description> "${Ldc.normalizeLiteral(p.description)}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/identifier> "${p.id}" .
    <https://proj.europe-geology.eu/${p.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Project> .
    <https://proj.europe-geology.eu/${p.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${Ldc.normalizeLiteral(p.projectTitle)}" .
`;
                writerFunc(item);

                if (p.relations) for (let rel of p.relations) {
                    item = `        <https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/relation> <${rel.identifier}> .
`;
                    writerFunc(item);
                }
                let kwList = await this.getKeywords(p.description);

                for (let kw of kwList.summary) {
                    item = `        <https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/subject> <${kw.uri}> .
`;
                    writerFunc(item);
                }
            }

        });

    },

    processOrgsAndProjectsList: async function (orgFunction) {
        let result = [];
        this.taskCount = 0;
        this.orgFunction = orgFunction;
        for (let source of this.sources) {
            this.taskCount++;
            Ldc.progressSource = source.name;
            await source.processOrgsAndProjectsList(this.callOrgFunction);
            this.taskCount--;
        }
        this.taskCount = 0;
        this.orgFunction = null;
        return result;
    },

    normalizeOrg: function (org) {
        if (org.websiteurl) {
            const url = new URL(org.websiteurl);
            let a = (url.hostname.replaceAll(" ", "")).split(".");
            let n = a.length - 1;
            org.identifier = "https://org.europe-geology.eu/" + (a[n - 1] + "-" + a[n]).replaceAll(".", "-");
        } else {
            org.identifier = "https://org.europe-geology.eu/" + org.id;
        }
        if (org.identifier=="https://org.europe-geology.eu/http:" || org.identifier=="https://org.europe-geology.eu/https:") {
            throw new Error("invalid org.identifier "+org.identifier);
        }
    },

    normalizeProj: function (p) {
        if (!p.identifier) {
            p.identifier = p.acronym ?
                p.acronym
                    .normalize("NFD")                   // Unicode-Normalising
                    .replace(/[\u0300-\u036f]/g, "")    // Diakritika
                    .toLowerCase()
                    .replaceAll(/[^a-z0-9]/g, "-")      // only a-z and 0-9
                    .replaceAll(/-+/g, '-')             //multi – to a single -
                :
                (p.id ? p.id : p.code);
        }
    },

    normalizeLiteral: function(s) {
        if (!s)
            return s;
        return s.replaceAll("\n", " ").replaceAll("\r", "").replaceAll("\t", " ");
    },

    callOrgFunction: async function (org) {
        // here this would be different object!
        Ldc.normalizeOrg(org);

        for (let p of org.projects) {
            Ldc.normalizeProj(p);
        }
        await Ldc.orgFunction(org);
    },

    filteredKeywords: null,
    getKeywords: async function (content) {
        if (!Ldc.filteredKeywords) {
            Ldc.filteredKeywords = await allKeywords.arr
                .filter(a => (a.newLabelArr.length < 5 && a.len < 40));

            if (kwFormat.significant) {
                Ldc.filteredKeywords = Ldc.filteredKeywords.filter(a => ignoreKw.indexOf(`-${a.uri.split('/')[6]}-`) == -1);
            }
        }

        let r = await kwx.getKeywordList(
            content,
            {
                keywords: Ldc.filteredKeywords,
                atx: atx,
                country: kwFormat.geonames ? country : null,
                euroscivoc: kwFormat.specific ? euroscivoc : null
            });
        return r;
    }

};