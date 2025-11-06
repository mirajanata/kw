import { Ldc } from './Ldc.js';

/*
Ldc_OpenAIRE object is a specific data source for the main Ldc (Link Data Converter) framework. 
Its primary role is to extract organization and project data from the OpenAIRE API and transform it into the structured format required by the Ldc for subsequent RDF generation.

Core Components and Configuration

    Registration: The code concludes by registering itself with the main framework: Ldc.addSource(Ldc_OpenAIRE);.

    Source Name: It identifies itself as "OpenAIRE".

    Configuration (config): Defines the API endpoints and the list of organizations to process:

        org.query: The OpenAIRE API endpoint to fetch individual organization details by ID.

        org.augmentProjectsQuery: An API query to retrieve projects associated with an organization's acronym.

        org.list: A hardcoded list of specific organizations (with their OpenAIRE ID and name/acronym) that the script should process. This list includes many European geological surveys and research institutions (e.g., BGR, BRGM, GTK, NGU).

        project.query: The OpenAIRE API endpoint to fetch detailed information for a single project by its acronym.

Data Processing Flow (processOrgsAndProjectsList)

This is the required method for Ldc sources, responsible for fetching data and calling the orgFunction callback:

    Iterates Over Organizations: It loops through the hardcoded list in this.config.org.list.

    Fetch Organization Data: For each item, it calls the org.query API to retrieve the organization's full data (name, country, website, etc.). It skips any organization that does not have a websiteurl.

    Extract Initial Project Links: It parses the organization's response and extracts basic information (acronym, title, dates) for its related projects using links with the "projectOrganization" relation type.

    Project Deduplication: It uses an allProjects array to track projects already encountered and marks a project with project.exists = true if it's already been added, preventing duplicate RDF creation in the main Ldc process.

    Augment Project Data: It attempts to retrieve richer project metadata (description, total cost, currency, related organizations) by first calling augmentOrgProjectsData (using the organization's short name to query a list of projects) and, if that fails, calling augmentProjectData for each individual project.

    Normalize and Output: It calls the main Ldc.normalizeProj method to generate a project URI and then invokes the provided orgFunction(o) callback, passing the fully structured organization object to the main Ldc framework for RDF generation.

    Progress Tracking and Error Handling: It updates Ldc.progress based on the processed list length and includes basic try...catch blocks for API call errors.

Data Augmentation Methods

    augmentOrgProjectsData(org): Fetches a list of projects associated with the organization's acronym. It then iterates through the organization's projects, matches them to the results, and updates project details (ID, description, cost, relations) using the OpenAIRE response's metadata. It also collects related organization objects into org.relations.

    augmentProjectData(p): Used as a fallback. It queries the OpenAIRE API for a single project by its acronym to retrieve its full details and associated relations.

This module effectively integrates the OpenAIRE repository as a specific data source into a broader Linked Data generation pipeline.

Is there a specific organization from the hardcoded list you would like more detail on?

*/

export let Ldc_OpenAIRE = {
    name: "OpenAIRE",
    config: {
        org: {
            query: "https://services.openaire.eu/search/v2/api/organizations/{id}?format=json",
            augmentProjectsQuery: "http://api.openaire.eu/search/projects?format=json&participantAcronyms={acronym}&size=10000",
            list: [
                { id: "pending_org_::92b9ac16907f563eeb6fac6ad667f46c", name: "ACRI-ST" },
                { id: "corda_____he::354d88daaa61069d72f4ed74a9809611", name: "IPMA" },
                { id: "corda_____he::b83ff746a8e20cd1d77d47a2b19cdc25", name: "LNEG" },
                { id: "openorgs____::096f5564d6578c0e64790464df04f85a", name: "NGU" },
                { id: "openorgs____::0db5677513f55ded00899607ef068369", name: "IGME" },
                { id: "openorgs____::20e491a3310e7146d52161c825a980ec", name: "TNO" },
                { id: "openorgs____::34f487f8789e751eeaf056562cd2cc78", name: "DECC" },
                { id: "openorgs____::3be28d4d4b28394067d17ab4eb7b4d31", name: "CGS" },
                { id: "openorgs____::455bc8700352c786cc184ec1e710266d", name: "GTK" },
                { id: "openorgs____::4a938c8654f07a11b402ee8feb7bf74d", name: "DDPS" },
                { id: "openorgs____::4acc31ee81ffa390134df4c0f46f34d2", name: "Office of the" },
                { id: "openorgs____::5537bade1bf6a3e6487074cef8022c20", name: "BGR" },
                { id: "openorgs____::668cc9e483096fa971a0f53e5f497f2e", name: "EPSRC" },
                { id: "openorgs____::6afe967b5fd02678f608aef189ed7f57", name: "SGU" },
                { id: "openorgs____::7813b3e5a42395b48581585e1e67359c", name: "IGR" },
                { id: "openorgs____::7b08393d24bb163bc4b5008322df6894", name: "CSIC" },
                { id: "openorgs____::875e8cb278a41cda0c2f7ae3e7d3c5b8", name: "Ministry of" },
                { id: "openorgs____::8b2d16927beb09f6f98a15ecfafaea11", name: "GBA" },
                { id: "openorgs____::8dcfe7d383ef6d39c4999361ed1c6b52", name: "VMM" },
                { id: "openorgs____::90362b98585c4e57e0c07f5d9c20bc51", name: "ISPRA" }, // invalid project JSON response on http://api.openaire.eu/search/projects?format=json&sortBy=projectstartdate,descending&participantAcronyms=ISPRA&size=10000
                { id: "openorgs____::a1696282264fea70be10efec71d3c94e", name: "LfU" },
                { id: "openorgs____::a4ad9718ad8491bf6eed2dde72e2f65a", name: "LBEG" },
                { id: "openorgs____::afb5319ae67bb90d5988db74d628f4e4", name: "BRGM" },
                { id: "openorgs____::b263d6408d90ae1bba9fde2ad5c5c1f7", name: "SGIDŠ" },
                { id: "openorgs____::dfea572a38ee453a668f524e15b2e3e5", name: "PIG" },
                { id: "openorgs____::e945f0c35e14acbebbc2a69fc8e79362", name: "Royal Belgian" },
                { id: "openorgs____::eb9855facc29d75a40dcd41f703e7365", name: "NERC" },
                { id: "openorgs____::ecb6cc3eb216b00cf5bb1939696e4341", name: "CGS" },
                { id: "openorgs____::fcb7fa27e27fd6ff96a4884bafe54b46", name: "ICGC" },
                { id: "openorgs____::fe8237f9fe46ccc75e27a3292550d1b8", name: "GEUS" },
                { id: "openorgs____::ffdc7846e674b5d31d7dbb1d8495294a", name: "EuroGeoSurveys" },
                { id: "pending_org_::05dc9f0a7b5756fb8a1563333d7d3d9b", name: "LANDESAMT FUR" },
                { id: "pending_org_::10948a96594723e0fc0bd478e83a8a28", name: "MINING AND" },   // internal error on project data http://api.openaire.eu/search/projects?format=json&sortBy=projectstartdate,descending&participantAcronyms=MINING%20AND%20GEOLOGICAL%20SURVEY%20OF%20HUNGARY&size=10000
                { id: "pending_org_::166febe221417408016c36ca7641c837", name: "GEOSPHERE AUSTRIA" },
                { id: "pending_org_::1b531bd8e7212739046356c2c6ef02d1", name: "MARCHE REGION" },
                { id: "pending_org_::20df58539a93edbe45a4227303c31bbf", name: "Regione Umbria" },
                { id: "pending_org_::22f2e061bf401925dc9d677c9c4b0d64", name: "UKRAINIAN" },
                { id: "pending_org_::25de1b449ea58110d1075bd72a7b78c6", name: "FEDERALNI ZAVOD" },
                { id: "pending_org_::30bdc0e7d7aec014d5d7b9e6638fdb98", name: "RT" },
                { id: "pending_org_::38146f81b234b63636f4d76be7d4dc9c", name: "" },
                { id: "pending_org_::410a734650c7452cc1dcdbb9eadd7bcb", name: "MINISTRY FOR" }, // internal error  http://api.openaire.eu/search/projects?format=json&sortBy=projectstartdate,descending&participantAcronyms=MINISTRY%20FOR%20TRANSPORT,%20INFRASTRUCTURE%20AND%20PUBLIC%20WORKS&size=10000
                { id: "pending_org_::455f1b94e66dc455afaa7c889a74682e", name: "IGMOF NASU" },
                { id: "pending_org_::4733356dce23a270c6e829233aea98c5", name: "ISOR" },
                { id: "pending_org_::55bd6a8345d1867316c3a084ec5ee33f", name: "GEOLOGICAL" },
                { id: "pending_org_::62990179efd7d5edcc919373355c0b9a", name: "GEOINFORM" },
                { id: "pending_org_::7299e9954e354a6a8587ba5be9392123", name: "IGME" },
                { id: "pending_org_::7e6b5433e9bfac340a339d44a6ed816f", name: "LGT" },
                { id: "pending_org_::7ea04bdc9841b3cc49e38b1ec139671b", name: "GeoZS" },
                { id: "pending_org_::8fbf8cfcca9ed31a3aace899375dd4dc", name: "LANDESAMT FUER" },
                { id: "pending_org_::9031b2fcca77eae7c5e5c9d364291b8b", name: "SHERBIMI" },
                { id: "pending_org_::957e901af947fa0f5133b6439a526681", name: "ASSR" },
                { id: "pending_org_::9f1aea15eaf2af894d8067e91a2d1075", name: "SUPERVISORY" },
                { id: "pending_org_::a07902ac63c949a517210b47fd1794b1", name: "MFGI" },
                { id: "pending_org_::aeb5d9f1fda024ad25bf6f105076fa75", name: "Eesti" },
                { id: "pending_org_::b42431a73f9172b2a65a8b7ab8730b43", name: "SERVICE" },
                { id: "pending_org_::bbb7439ad2ef9bd0235b5eab745e5f7f", name: "REGION AUTONOME" },
                { id: "pending_org_::c4870cc05885007a671ff9b9e59a01f6", name: "IGS" },
                { id: "pending_org_::caf8a5ed42cb950238582afa112682ea", name: "JARDFEINGI" },
                { id: "pending_org_::d24f722ace4d4a2ed47f67f39e10ff37", name: "VL O" },
                { id: "pending_org_::d51ff1cdbfe7f38fe26a5c943cff4776", name: "LVGMC" },
                { id: "pending_org_::d76968137762a7e761297a5434aa06cf", name: "LNEG" },
                { id: "pending_org_::de9e2b15918af3abbb58bc37915695ca", name: "MINISTRY FOR" },
                { id: "pending_org_::e87e2ff6f8871f1c03acac8076023247", name: "LANDESAMT FUER" },
                { id: "pending_org_::ee2ea7aa07172bed3464178737f857fe", name: "GEOLOGICAL SURVEY" },
                { id: "pending_org_::fabc5e50c333b787d9f7e5165ae11eb8", name: "ELLINIKI ARCHI" },
                { id: "pending_org_::ffcd01e878e779ee5fbd1371e44386e4", name: "AGENZIA REGIONALE" }
            ]
        },
        project: {
            query: "http://api.openaire.eu/search/projects?size=1&format=json&acronym={acronym}",
        }
    },

    processOrgsAndProjectsList: async function (orgFunction) {
        this.taskCount = 0;
        let tasks = [];
        let index = Ldc.progress = 0;
        let allProjects = [];
        for (let org of this.config.org.list) {
            this.taskCount++;
            // read org data
            try {
                let r = await fetch(this.config.org.query.replaceAll("{id}", org.id)).then(res => res.json());

                if (!(r.organization && r.organization.websiteurl)) // filter out orgs with empty wwebsite
                {
                    if (r.message)
                        Ldc.consoleOutput("ERROR: organization not found, " + r.message);
                    continue;
                }
                let o = {
                    source: "OpenAIRE",
                    id: org.id,
                    country: r.organization.country.label,
                    name: r.organization.legalname,
                    shortName: r.organization.legalshortname,
                    websiteurl: r.organization.websiteurl,
                    projects: [],
                    relations: []
                };
                if (!Ldc.normalizeOrg(o)) {
                    Ldc.consoleOutput("-------- Skipping organization: " + org.name + " - " + org.id + " (invalid website)");
                    continue;
                }

                Ldc.consoleOutput("-------- Processing organization: " + org.name + " - " + org.id);
                // read projects data
                for (let p of r.links.filter((l) => l.header && l.header.relationType == "projectOrganization")) {
                    if (p.acronym) {
                        let project = {
                            acronym: p.acronym,
                            code: p.code,
                            projectTitle: p.projectTitle,
                            startDate: p.startDate,
                            endDate: p.endDate
                        }
                        o.projects.push(project);
                        Ldc.normalizeProj(project);
                        if (allProjects.includes(project.identifier)) {
                            project.exists = true;
                            Ldc.consoleOutput("project " + project.identifier + ": already processed.")
                        } else {
                            allProjects.push(project.identifier);
                            Ldc.consoleOutput("project " + project.identifier + ": processing...")
                            project.exists = false;
                        }
                    }
                }
                // augment project data - either using org/projects query or using single project query calls
                if (!await this.augmentOrgProjectsData(o)) {
                    for (let p in o.projects.filter(p => !p.exists)) {
                        await this.augmentProjectData(p);
                    }
                }
                index++;
                Ldc.progress = Math.floor(100 * index / this.config.org.list.length);
                // call output
                await orgFunction(o);
                o.projects = null;
            }
            catch (error) {
                console.trace();
                Ldc.consoleOutput("ERROR reading organization data for " + org.name + " - " + org.id);
            }
            this.taskCount--;
        }
        Ldc.progress = 100;
        this.taskCount = 0;
    },

    augmentOrgProjectsData: async function (org) {
        let res = false;
        let r = await fetch(this.config.org.augmentProjectsQuery.replaceAll("{acronym}", org.shortName)).then(res => res.json());
        if (r.response.results) {
            let results = r.response.results.result || r.response.results.record;
            if (!results)
                throw new Error("augmentOrgProjectsData: invalid response.");
            if (!results.filter) {
                results = results.result;
                if (!results.filter) {
                    throw new Error("augmentOrgProjectsData: invalid response: " + results + ".");
                }
            }
            for (let p of org.projects) {
                let result = results.filter(m => {
                    let md = m.metadata || m.result[0].metadata;
                    md = md["oaf:entity"]["oaf:project"];
                    return md.acronym && md.acronym["$"] == p.acronym;
                });
                if (result && result.length == 1) {
                    res = true;
                    result = result[0];
                    let md = result.metadata || result.result[0].metadata;
                    let pd = md["oaf:entity"]["oaf:project"];
                    let hd = result.header || result.result[0].header;
                    p.id = hd["dri:objIdentifier"]["$"];
                    p.description = pd.summary ? pd.summary["$"] : "";
                    p.totalCost = pd.totalcost ? pd.totalcost["$"] : null;
                    p.currency = pd.currency;
                    p.projectTitle = pd.title ? pd.title["$"] : p.projectTitle;

                    p.relations = [];
                    for (let rel in pd.rels) {
                        let item = pd.rels[rel];
                        for (let r of ((item.constructor.name == "Array") ? item : [item])) {
                            let o = {
                                source: "OpenAIRE",
                                id: r.id,
                                country: r.country ? r.country["@classname"] : "",
                                name: r.legalname ? r.legalname["$"] : "",
                                shortName: r.legalshortname ? r.legalshortname["$"] : "",
                                websiteurl: r.websiteurl ? r.websiteurl["$"] : ""
                            };
                            if (!o.websiteurl) // filter out orgs without website
                                continue;
                            if (!Ldc.normalizeOrg(o)) {
                                Ldc.consoleOutput("-------- Invalid related organization website: " + o.websiteurl);
                                continue;
                            }
                            p.relations.push(o);
                            let ro = org.relations.find(m => m.name == o.name);
                            if (ro == null || ro.length < 1) {
                                org.relations.push(o);
                            }
                        }
                    }
                } else {
                    await this.augmentProjectData(p);
                }
            }
        }

        return res;
    },

    augmentProjectData: async function (p) {
        await fetch(this.config.project.query.replaceAll("{acronym}", p.acronym)).then(res => res.json()).then((r) => {
            let results = r.response.results.result || r.response.results.record;
            if (results) {
                if (results.result)
                    results = results.result;
                for (let result of results) {
                    let md = result.metadata || result.result[0].metadata;
                    let pd = md["oaf:entity"]["oaf:project"];
                    p.id = result.header["dri:objIdentifier"]["$"];
                    p.description = pd.summary ? pd.summary["$"] : "";
                    p.totalCost = pd.totalcost ? pd.totalcost["$"] : null;
                    p.currency = pd.currency;
                    p.projectTitle = pd.title ? pd.title["$"] : p.projectTitle;

                    p.relations = [];
                    for (let rel in pd.rels) {
                        let item = pd.rels[rel];
                        for (let r of ((item.constructor.name == "Array") ? item : [item])) {
                            let o = {
                                source: "OpenAIRE",
                                id: r.id,
                                country: r.country ? r.country["@classname"] : "",
                                name: r.legalname ? r.legalname["$"] : "",
                                shortName: r.legalshortname ? r.legalshortname["$"] : "",
                                websiteurl: r.websiteurl ? r.websiteurl["$"] : ""
                            };
                            if (!o.websiteurl) // filter out orgs without website
                                continue;
                            if (!Ldc.normalizeOrg(o)) {
                                Ldc.consoleOutput("-------- Invalid related organization website: " + o.websiteurl);
                                continue;
                            }
                            p.relations.push(o);
                        }
                    }

                }
            }
        });
    },
    taskCount: 0
};

Ldc.addSource(Ldc_OpenAIRE);