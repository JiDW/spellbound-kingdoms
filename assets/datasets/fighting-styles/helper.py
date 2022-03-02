from importlib.resources import path
import json
import os 
from string import Template
from os import path

template = """
{
    "name": "$name",
    "identifier": "$identifier",
    "type": "fighting",
    "description": "",
    "requirements": [""],
    "info": [""],
    "grid": {"width": 5, "height": 5},
    "maneuvers": {
        "basic": [
           {
               "name": "Strike", 
               "rebalancing": true,
               "defense": [2],
               "attack": [{"die": "strength"}]
            },
            {
               "name": "Defend", 
               "rebalancing": true,
               "defense": ["quickness"],
               "attack": []
            },
            {
                "name": "Grab", 
                "rebalancing": true,
                "defense": [2],
                "attack": [{"die": "strength"}]
            },
            {
                "name": "Throw/Shoot", 
                "rebalancing": true,
                "defense": [],
                "attack": [{"die": "quickness"}]
            },
            {
               "name": "Trick/Misc.", 
               "rebalancing": true,
               "defense": [4],
               "attack": []
            }
        ],
        "style": [
            {   "name": "",
                "rebalancing": true,
                "must-rebalance": true,
                "mastery": true,
                "defense": [4],
                "attack": [
                    { "die": 4, "damage": {"body": 2} }
                ],
                "grid-position": {"x": 0, "y": 0},
                "short-description": "1",
                "description": ""
            }
        ]
    }
}
"""


dir_path = os.path.dirname(os.path.realpath(__file__))
file = open(dir_path + '/fighting-style-index.json')
index = json.load(file)
file.close()

for item in index:
    if path.exists(dir_path + index[item]):
        styleFile = open(dir_path + index[item])
        style = json.load(styleFile)
        styleFile.close()
        if len(style['maneuvers']['style']) > 1:
            continue
    print(index[item])

    os.remove(dir_path + index[item])

    replacements = {
        'name': item.replace('-', ' ').title(),
        'identifier': item,
    }
    src = Template(template=template)
    text = src.substitute(replacements)
    with open(dir_path + '/' + item + '.json', 'w') as f:
        f.write(text)

