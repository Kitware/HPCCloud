# HPCCloud urls

## Unauthenticated

- /         : Welcome page explaing what HPCCloud is and giving access to /login and /register
- /Login    : Login page
- /Register : SignIn page

## Authenticated

### Path /

List user projects with possible filter query like (filter=type:pyfr&txt=blabla)

### Path /New

Page for creating a new project.

### Path /Edit/:type/:projectId[/:simulationId]

Edit pages for project or simulation

### Path /View/:type/:projectId

List simulation associated to a given project. Possible filtering via query.

### Path /View/:type/:projectId/:simulationId/:currentStep

View a given simulation at its current step. If currentStep not provided, then
we assume currentStep=0 which could be an introduction page.

Additional 'heavy view' could be selected from the URL via query like the
following set of examples:

- /pyfr/2346efw45ytwef/drh5r6hwe345twre/3?view=MeshTagger
- /pyfr/2346efw45ytwef/drh5r6hwe345twre/3?view=Visualizer

### Path /Preferences

Should show the set of configurations we can perform such as:

- User
- Clusters
- AWS
- OpenStack

### Path /Preferences/:type

Type can be one of [ User, Clusters, AWS, OpenStack ].


### Path /Preferences/Clusters/:activeName/:activeProfile


## Sharing work and data

### Sharing a project

Sharing a project means that each simulation within that project is visible to
the set of users we shared with but those simulations can only be cloned.

Only owned simulation can be edited, ran, exported or visualized.

### Exporting data

A simulation can be exported which means exported the input desk with any other input data such as a mesh. This should allow the creation of a new project with a pre-filled simulation that could be re-run.

Exporting a simulation

- Project data ( such as a mesh )
- Input configuration ( such as mesh tagging and input deck )
- Results

