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
    name: "EGDI_CSW_OrgProj",
    config: {
        query: "https://egdi.geology.cz/csw/?request=GetRecords&query=(subject%3D%27Geology%27+OR+Subject%3D%27Hydrogeology%27)&format=application/json&MaxRecords=10000&StartPosition={startPosition}&language=eng&ElemetnSetName=full"
    },

    // A collection to hold unique organizations derived from contacts
    // This mimics the OpenAIRE 'list' but is dynamically populated
    uniqueOrganizations: new Map(),

    taskCount: 0,

    /**
     * The main ETL function now focuses on extracting Projects (Records) and their associated Organizations (Contacts).
     * @param {function} orgFunction - The function to call for each processed Project.
     */
    processOrgsAndProjectsList: async function (orgFunction) {
        this.taskCount = 0;
        let startPosition = 1;
        let totalRecords = Infinity;
        let index = Ldc.progress = 0;
        Ldc.fileName = "Ldc_EGDI.txt";

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
                    Ldc.normalizeProj(project); // Assuming Ldc.normalizeProj exists for URI cleaning

                    // --- 2. EXTRACT RELATED ORGANIZATIONS (CONTACTS) ---
                    // Contacts can be at the Dataset level (pointOfContact) and/or Metadata level (contact)

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
                                Ldc.consoleOutput("....Skipped contact "+contact.organisationName+"- missing identifier. ");
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

    // NOTE: Augmentation functions are NOT included as the CSW doesn't offer a separate lookup API.

    /**
     * Processes the list of unique Organizations gathered during the Project processing.
     * This is the conceptual inverse of the OpenAIRE ETL where Orgs were primary.
     * @param {function} orgFunction - The function to call for each unique Organization.
     */
    processUniqueOrganizations: async function (orgFunction) {
        Ldc.consoleOutput("Processing unique organizations gathered from records...");
        let index = 0;
        for (let [id, org] of this.uniqueOrganizations) {
            index++;
            Ldc.progress = Math.floor(100 * index / this.uniqueOrganizations.size);
            // In a full implementation, you'd find all projects related to this org here.
            // For now, we just pass the gathered organization object.
            await orgFunction(org);
        }
        Ldc.progress = 100;
        Ldc.consoleOutput("Unique organization processing finished.");
    },

    /**
     * RDF writing function now handles both Organizations and Projects.
     */
    writeRdfText: async function (org, writerFunc) {
        // --- Write Project RDF ---
        // --- Write Organization RDF ---
        let item = `
<${org.identifier}> <http://purl.org/dc/terms/identifier> "${org.identifier}" .
<${org.identifier}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/s66#Organization> .
<${org.identifier}> <http://www.w3.org/2000/01/rdf-schema#label> "${Ldc.normalizeLiteral(org.name)}" .
<${org.identifier}> <http://xmlns.com/foaf/0.1/page> <${org.email}> .
`;
        writerFunc(item);

        for (let p of org.projects) {
            item = `    <${org.identifier}> <http://purl.org/dc/terms/relation> <https://proj.europe-geology.eu/${p.identifier}> .
`;
            writerFunc(item);

            if (p.exists)
                continue;
            p.exists = true;

            item = `    <https://proj.europe-geology.eu/${p.identifier}> <http://purl.org/dc/terms/description> "${Ldc.normalizeLiteral(p.description)}" .
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

    },
    /**
 * Helper to safely extract deep contact information from a CSW record.
 */
    getContactOrganization: function (contactInfo) {
        // Path: gmd:MD_Metadata -> gmd:identificationInfo -> gmd:MD_DataIdentification -> gmd:pointOfContact
        // Or gmd:MD_Metadata -> gmd:contact
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