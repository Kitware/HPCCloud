import json
import os


project_schema_filepath = os.path.join(os.path.dirname(__file__),
                                       'project.json')
with open(project_schema_filepath) as fp:
    project = json.load(fp)
