import json
import os


project_schema_filepath = os.path.join(
    os.path.dirname(__file__), 'project.json')
simulation_schema_filepath = os.path.join(
    os.path.dirname(__file__), 'simulation.json')
definitions_schema_filepath = os.path.join(
    os.path.dirname(__file__), 'definitions.json')

with open(project_schema_filepath) as fp:
    project = json.load(fp)

with open(simulation_schema_filepath) as fp:
    simulation = json.load(fp)

with open(definitions_schema_filepath) as fp:
    definitions = json.load(fp)
