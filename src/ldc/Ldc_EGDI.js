/*
Ldc_EGDI a configuration Ldc famework source object for an Extract, Transform, Load (ETL) process designed to pull project and organization data from the European Geological Data Infrastructure (EGDI) Catalogue Service for the Web (CSW) .

Key Components & Workflow

    Configuration (config):

        Defines the base OGC CSW GetRecords query to the EGDI service (https://egdi.geology.cz/csw/).

        The query specifically requests records with Subject='Geology' or Subject='Hydrogeology'.

        It uses pagination via a {startPosition} placeholder for iterative fetching.

    Data Harvesting (processOrgsAndProjectsList):

        This is the main function that iteratively queries the EGDI CSW until all records (totalRecords) are retrieved.

        Extraction: For each record (Project), it extracts the title, ID, abstract, and contact information.

        Transformation/Aggregation: It extracts all contacts from a record and uses a normalized name (nname) to ensure only unique organizations are stored in the uniqueOrganizations map.

        Each unique organization object keeps a list (projects) of the projects it is associated with.

    Organization Processing (processUniqueOrganizations):

        After all projects are processed, this function iterates through the collected unique organizations and passes them to a provided callback function (orgFunction), likely for further processing or writing.

    RDF Output (writeRdfText):

        This function handles the writing of data into RDF format (N-Triples).

        It writes both the Organization details (using http://data.europa.eu/s66#Organization) and the Project details (using http://data.europa.eu/s66#Project).

*/

import { Ldc } from './Ldc.js';

export let Ldc_EGDI = {
    name: "EGDI",
    config: {
        query: "https://egdi.geology.cz/csw/?request=GetRecords&query=(subject%3D%27Geology%27+OR+Subject%3D%27Hydrogeology%27)&format=application/json&MaxRecords=10000&StartPosition={startPosition}&language=eng&ElemetnSetName=summary"
    },

    uniqueOrganizations: new Map(),

    taskCount: 0,

    /**
     * The main ETL function now focuses on extracting Projects (Records) and their associated Organizations (Contacts).
     * @param {function} orgFunction - The function to call for each processed Org.
     */
    processOrgsAndProjectsList: async function (orgFunction) {
        this.taskCount = 0;
        let startPosition = 1;
        let totalRecords = Infinity;
        let index = Ldc.progress = 0;
        Ldc.fileName = "Ldc_EGDI.txt";


        this.uniqueOrganizations.clear();

        Ldc.consoleOutput("Starting ETL for EGDI CSW (Organization/Project Structure)...");

        while (startPosition <= totalRecords) {
            let currentQuery = this.config.query.replaceAll("{startPosition}", startPosition);

            try {
                let r = await fetch(currentQuery).then(res => res.json());
                let records = r.records;

                totalRecords = r.matched;
                startPosition += records.length;

                for (let record of records) {
                    index++;
                    Ldc.progress = Math.floor(100 * index / totalRecords);
                    Ldc.consoleOutput("-------- Processing record: " + record.title + " - " + record.id);
                    let project = {
                        source: "EGDI_CSW",
                        id: record.id,
                        projectTitle: record.title,
                        description: record.abstract,
                        relations: [] // This will hold the organizations (contacts)
                    };

                    project.keywords = record.keywords;

                    Ldc.normalizeProj(project); // Assuming Ldc.normalizeProj exists for URI cleaning

                    let allContacts = record.contacts || [];

                    for (let contact of allContacts) {
                        let nname = contact.organisationName.toLowerCase().replaceAll(/[\s,]/g, '');
                        let org = this.uniqueOrganizations.get(nname);
                        if (!org) {
                            org = this.getContactOrganization(contact);

                            if (org && Ldc.normalizeOrg(org)) { // Assuming Ldc.normalizeOrg for validation/cleaning
                                this.uniqueOrganizations.set(nname, org);
                            }
                            else {
                                Ldc.consoleOutput("....Skipped contact " + contact.organisationName + "- missing identifier. ");
                                org = null;
                            }
                        }
                        if (org)
                            org.projects.push(project);
                    }
                }
            }
            catch (error) {
                console.trace();
                Ldc.consoleOutput(`ERROR reading data from CSW at StartPosition ${startPosition}: ${error.message}`);
                break;
            }
        }

        Ldc.progress = 100;
        this.taskCount = 0;

        await Ldc_EGDI.processUniqueOrganizations(orgFunction);

        Ldc.consoleOutput("EGDI CSW ETL finished. Extracted " + this.uniqueOrganizations.size + " unique organizations.");
    },

    processUniqueOrganizations: async function (orgFunction) {
        Ldc.consoleOutput("Processing unique organizations gathered from records...");
        let index = 0;
        for (let [id, org] of this.uniqueOrganizations) {
            index++;
            Ldc.progress = Math.floor(100 * index / this.uniqueOrganizations.size);

            await orgFunction(org);
        }
        Ldc.progress = 100;
        Ldc.consoleOutput("Unique organization processing finished.");
    },

    writeRdfText: async function (org, writerFunc) {
        Ldc.consoleOutput("Write organization " + org.name);
        let item = `
<${org.identifier}> <http://purl.org/dc/terms/identifier> "${org.identifier}" .
<${org.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Organization> .
<${org.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${Ldc.normalizeLiteral(org.name)}" .
<${org.identifier}> <http://xmlns.com/foaf/0.1/page> <${org.email}> .
`;
        writerFunc(item);

        for (let p of org.projects) {
            item = `    <${org.identifier}> <http://purl.org/dc/terms/relation> <https://metadata.europe-geology.eu/record/basic/${p.identifier}> .
`;
            writerFunc(item);

            if (p.exists)
                continue;
            p.exists = true;

            let freeKeywords = [], projKeywords = [];
            if (p.keywords) for (let rel of p.keywords) {
                if (rel.uri && rel.uri.indexOf("/keyword/") != -1) {
                    item = `        <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/subject> <${rel.uri}> .
`;
                    projKeywords.push(item);
                }
                else if (rel.uri && rel.uri.indexOf("/project/") != -1) {
                    item = `        <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/relation> <${rel.uri}> .
`;
                    projKeywords.push(item);
                } else if (rel.title) {
                    freeKeywords.push(rel.title);
                }
            }
            if (freeKeywords.length > 0) {
                p.description += " Keywords: " + freeKeywords.join(", ");
            }

            item = `    <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/description> "${Ldc.normalizeLiteral(p.description)}" .
    <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/identifier> "${p.id}" .
    <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://www.w3.org/ns/dcat#dataset> .
    <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${Ldc.normalizeLiteral(p.projectTitle)}" .
`;
            writerFunc(item);

            if (p.relations) for (let rel of p.relations) {
                item = `        <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/relation> <${rel.identifier}> .
`;
                writerFunc(item);
            }

            for (let rel of projKeywords) {
                writerFunc(rel);
            }

            let kwList = await this.getKeywords(p.description);
            for (let kw of kwList.summary) {
                item = `        <https://metadata.europe-geology.eu/record/basic/${p.identifier}> <http://purl.org/dc/terms/subject> <${kw.uri}> .
`;
                writerFunc(item);
            }
        }

    },

    getContactOrganization: function (contactInfo) {
        let orgName = contactInfo.organisationName;

        let orgId = contactInfo.email; // Simple base64 hash for a stable ID

        if (!(orgName && orgId)) return null;


        return {
            id: orgId,
            name: orgName,
            email: contactInfo.email,
            source: "EGDI_CSW",
            projects: []
        };
    }
};

Ldc.addSource(Ldc_EGDI);